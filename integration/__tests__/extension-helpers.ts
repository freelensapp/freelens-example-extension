/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// The code the integration test sessions share. Copied with them into
// `freelens/integration/__tests__/` by the integration tests workflow, and
// imports the helpers found there. Its name does not match `*.tests.ts`, so
// Freelens's Vitest does not collect it as a test file.

import { spawnSync } from "node:child_process";
import * as path from "node:path";
import { kindReady } from "../helpers/kind";
import * as utils from "../helpers/utils";

import type { ConsoleMessage, ElectronApplication, Frame, Locator, Page } from "playwright";

export const extensionName = "@freelensapp/example-extension";

// The kind cluster the sessions run against, as in Freelens's cluster tests.
export const kindClusterName = process.env.TEST_KIND_CLUSTER_NAME || "kind";

// The namespace of the test objects, created by the fixtures.
const testNamespace = "integration-tests";

// The CRD of every API version of the extension's kind.
const crdName = "examples.example.freelens.app";

// The link inside the sidebar item of the extension's cluster page: the
// `clusterPageMenus` id, after the package name with `@` dropped and `/` turned
// into `--` (`getExtensionId` in Freelens's `lens-extension.ts`). Only the link
// navigates.
const pageLinkTestId = `link-for-sidebar-item-${extensionName.replace("@", "").replace("/", "--")}-example`;

// The name of the test object in `examples/<version>/test`.
const testObjectName = "test";

const viewTimeout = { timeout: 60 * 1000 };

/**
 * An app started by `startApp`, with the errors that either process logs.
 */
export interface AppSession {
  app: ElectronApplication;
  window: Page;
  /** The errors logged so far. */
  errors(): string[];
  /** Closes the app and stops collecting errors; returns every error logged. */
  close(): Promise<string[]>;
}

/**
 * Collects the errors of the renderer's console and of the output of the test
 * process, which carries the output of the app.
 */
function collectErrors() {
  const errorLogs: string[] = [];
  const processErrorLogs: string[] = [];
  const outputErrorPattern = /\[out\]\s*error:/i;
  const ansiEscapePattern = /\u001b\[[0-9;]*m/g;
  let processOutputBuffer = "";

  const collectOutputErrors = (chunk: string | Uint8Array) => {
    const text = typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8");
    processOutputBuffer += text;

    // Keep buffer bounded while preserving enough tail to match split patterns across chunks.
    if (processOutputBuffer.length > 200_000) {
      processOutputBuffer = processOutputBuffer.slice(-20_000);
    }

    const normalizedOutput = processOutputBuffer.replaceAll(ansiEscapePattern, "");

    if (outputErrorPattern.test(normalizedOutput)) {
      processErrorLogs.push(normalizedOutput.trim());
      processOutputBuffer = "";
    }
  };

  const logger = (msg: ConsoleMessage) => {
    const text = msg.text();
    const normalizedText = text.replaceAll(ansiEscapePattern, "");

    console.log(text);

    // Some app logs are emitted as "log" messages, so inspect both console type and message content.
    if (msg.type() === "error" || outputErrorPattern.test(normalizedText)) {
      errorLogs.push(`[${msg.type()}] ${normalizedText}`);
    }
  };

  const originalStdoutWrite = process.stdout.write.bind(process.stdout);
  const originalStderrWrite = process.stderr.write.bind(process.stderr);

  process.stdout.write = ((chunk, encoding, cb) => {
    collectOutputErrors(chunk);

    return originalStdoutWrite(chunk, encoding as never, cb as never);
  }) as typeof process.stdout.write;

  process.stderr.write = ((chunk, encoding, cb) => {
    collectOutputErrors(chunk);

    return originalStderrWrite(chunk, encoding as never, cb as never);
  }) as typeof process.stderr.write;

  return {
    logger,
    errors: () => [...errorLogs, ...processErrorLogs],
    stop: () => {
      process.stdout.write = originalStdoutWrite;
      process.stderr.write = originalStderrWrite;
    },
  };
}

/**
 * Starts the app, with a fresh `FREELENS_INTEGRATION_TESTING_DIR`, and collects
 * the errors either process logs until it is closed.
 */
export async function startApp(): Promise<AppSession> {
  const collector = collectErrors();
  let started: Awaited<ReturnType<typeof utils.start>> | undefined;

  try {
    started = await utils.start();
    started.window.on("console", collector.logger);
    console.log("await utils.clickWelcomeButton");
    await utils.clickWelcomeButton(started.window);
  } catch (error) {
    await started?.cleanup();
    collector.stop();
    throw error;
  }

  const { app, window, cleanup } = started;

  return {
    app,
    window,
    errors: collector.errors,
    close: async () => {
      // Keep listeners active through cleanup to catch late shutdown errors in CI logs.
      await cleanup();
      window.off("console", collector.logger);
      collector.stop();

      return collector.errors();
    },
  };
}

async function clickApplicationMenuItem(app: ElectronApplication, parentId: string, id: string) {
  await app.evaluate(
    async ({ app }, { parentId, id }) => {
      await app.applicationMenu?.getMenuItemById(parentId)?.submenu?.getMenuItemById(id)?.click();
    },
    { parentId, id },
  );
}

/**
 * Installs the extension from the Extensions page and waits until it is
 * enabled.
 */
export async function installExtension({ app, window }: AppSession) {
  // Navigate to extensions page
  console.log("navigate to extensions");
  await clickApplicationMenuItem(app, process.platform === "darwin" ? "mac" : "file", "navigate-to-extensions");

  // Trigger extension install: the packed tarball from the workflow, or the
  // published package when the test runs without one.
  console.log("await textbox.fill");
  await window
    .getByPlaceholder("Name, URL, or path to a package or directory")
    .fill(process.env.EXTENSION_PATH || extensionName);
  console.log("await install button click");
  await window.getByRole("button", { name: "Install", exact: true }).click();

  // Expect extension to be listed in installed list and enabled. The status
  // column reads "Incompatible" if the host refuses `engines.freelens`.
  console.log("await extensions table row");
  const row = window.getByTestId("extensions-table").locator("tbody tr", { hasText: extensionName });
  await row.locator("td").nth(2).getByText("Enabled", { exact: true }).waitFor();

  // Dismiss any notifications so a notification still in its enter animation
  // does not intercept pointer events on the elements behind it.
  console.log("dismiss notifications");
  const notificationCloseSelector =
    'i[data-testid*="close-notification-for-notification_"], div[class*="close-button-module__closeButton--"][aria-label="Close"]';
  for (let attempt = 0; attempt < 10; attempt++) {
    const closeButtons = await window.$$(notificationCloseSelector);
    if (closeButtons.length === 0) break;
    for (const closeButton of closeButtons) {
      await closeButton.click({ force: true }).catch(() => {});
    }
    await window.waitForTimeout(200);
  }
}

/**
 * Opens the kind cluster from the catalog, selects the namespace of the test
 * objects, and returns the cluster's frame, where the extension's pages, details
 * and menus render.
 */
export async function openKindCluster({ app, window }: AppSession): Promise<Frame> {
  console.log("navigate to catalog");
  await clickApplicationMenuItem(app, "view", "navigate-to-catalog");
  console.log(`open kind-${kindClusterName}`);

  const frame = await utils.launchKindClusterFromCatalog(kindClusterName, window);

  await selectTestNamespace(frame);

  return frame;
}

/**
 * Selects the namespace of the test objects in the namespace filter of the
 * extension's page, which its `KubeObjectListLayout` renders for a namespaced
 * resource. A new cluster shows only `default`, and the selection holds for
 * every namespaced list of the cluster. The session opens no page of the host,
 * whose requests can log errors of their own: the Pods page asks for pod
 * metrics, and kind has no metrics server.
 */
async function selectTestNamespace(frame: Frame) {
  console.log(`select namespace ${testNamespace}`);
  await frame.waitForSelector(`[data-testid="${pageLinkTestId}"]`, viewTimeout);
  await utils.clickSidebarItem(frame, pageLinkTestId);

  const namespaceSelect = await frame.waitForSelector(".NamespaceSelect", viewTimeout);

  await namespaceSelect.click();
  await namespaceSelect.type(testNamespace);
  await namespaceSelect.press("Enter");
  await namespaceSelect.click();

  await frame
    .locator(".NamespaceSelect")
    .getByText(`Namespace: ${testNamespace}`, { exact: true })
    .waitFor(viewTimeout);
}

/**
 * Runs kubectl against the kind cluster, never the current context, and fails
 * with its stderr when it exits non-zero.
 */
function kubectl(...args: string[]): string {
  const argv = ["--context", `kind-${kindClusterName}`, ...args];
  const command = `kubectl ${argv.join(" ")}`;

  console.log(command);

  const { error, status, signal, stdout, stderr } = spawnSync("kubectl", argv, {
    encoding: "utf8",
    timeout: 5 * 60 * 1000,
  });

  if (error) {
    throw new Error(`${command} failed: ${error.message}`);
  }

  if (status !== 0) {
    throw new Error(`${command} exited with ${status ?? signal}: ${stderr.trim()}`);
  }

  if (stdout.trim()) {
    console.log(stdout.trim());
  }

  return stdout;
}

/**
 * A path in the checkout of the extension, which `EXTENSION_DIR` names: the
 * tests run inside a Freelens checkout.
 */
function fromExtensionDir(...segments: string[]) {
  const extensionDir = process.env.EXTENSION_DIR;

  if (!extensionDir) {
    throw new Error("EXTENSION_DIR is not set");
  }

  return path.join(extensionDir, ...segments);
}

/**
 * Whether a session can run: `EXTENSION_DIR` is set and the kind cluster is
 * reachable. Outside CI a session skips with a warning otherwise; in CI the run
 * fails, so that a mistake in the workflow does not turn into a silent skip.
 */
export function clusterReady(): boolean {
  let reason: string | undefined;

  if (!process.env.EXTENSION_DIR) {
    reason = "EXTENSION_DIR is not set";
  } else if (!kindReady(kindClusterName, testNamespace)) {
    reason = `the kind cluster ${kindClusterName} is not running`;
  } else if (spawnSync("kubectl", ["--context", `kind-${kindClusterName}`, "get", "--raw", "/readyz"]).status !== 0) {
    reason = `the kind cluster ${kindClusterName} is not reachable`;
  }

  if (!reason) {
    return true;
  }

  if (process.env.CI) {
    throw new Error(`Cannot run the cluster tests: ${reason}`);
  }

  console.warn(`Skipping the cluster tests: ${reason}`);

  return false;
}

/**
 * Removes what an earlier run left, then applies the CRD of the API version
 * and, once it is established, the test objects.
 */
export function setUpCluster(version: string) {
  kubectl("delete", "namespace", testNamespace, "--ignore-not-found", "--wait");
  kubectl("delete", "crd", crdName, "--ignore-not-found", "--wait");

  kubectl("apply", "-k", fromExtensionDir("examples", version, "crds"));
  kubectl("wait", "--for=condition=Established", `crd/${crdName}`, "--timeout=120s");
  kubectl("apply", "-k", fromExtensionDir("integration", "fixtures", version));
}

/**
 * Deletes the test objects and the CRD of the API version.
 */
export function tearDownCluster(version: string) {
  try {
    kubectl("delete", "-k", fromExtensionDir("integration", "fixtures", version), "--ignore-not-found", "--wait");
  } finally {
    kubectl("delete", "-k", fromExtensionDir("examples", version, "crds"), "--ignore-not-found", "--wait");
  }
}

/**
 * Closes the details drawer if it is open: a click on a row toggles it.
 */
async function closeDetails(frame: Frame) {
  const details = frame.locator(".KubeObjectDetails");

  if (await details.isVisible()) {
    await frame.locator("body").press("Escape");
    await details.waitFor({ state: "hidden", ...viewTimeout });
  }
}

/**
 * Opens the extension's page from the sidebar and returns the table row of the
 * test object.
 */
export async function openListPage(frame: Frame): Promise<Locator> {
  await frame.waitForSelector(`[data-testid="${pageLinkTestId}"]`, viewTimeout);
  await utils.clickSidebarItem(frame, pageLinkTestId);
  await closeDetails(frame);

  const row = frame
    .locator(".TableRow")
    .filter({ has: frame.locator(".TableCell").getByText(testObjectName, { exact: true }) });

  await row.waitFor(viewTimeout);

  return row;
}

/**
 * Opens the details of the row's object and returns the value of the details
 * panel's `Api Version` item, after checking that the extension's error
 * boundary rendered no error page in the drawer.
 */
export async function openDetails(frame: Frame, row: Locator): Promise<string | null> {
  await row.getByText(testObjectName, { exact: true }).click();

  const details = frame.locator(".KubeObjectDetails");
  const apiVersion = details
    .locator(".DrawerItem")
    .filter({ has: frame.locator(".name").getByText("Api Version", { exact: true }) })
    .locator(".value");

  await apiVersion.waitFor(viewTimeout);

  // The class of `ErrorPage`, as CSS modules name it in the bundle.
  const errorPages = await details.locator('[class*="_errorPage_"]').count();

  if (errorPages > 0) {
    throw new Error(`The details drawer shows ${errorPages} error page(s) of the extension`);
  }

  return apiVersion.textContent();
}

/**
 * Opens the context menu of the row and returns the menu, which the host
 * renders outside the row.
 */
export async function openRowMenu(frame: Frame, row: Locator): Promise<Locator> {
  const trigger = row.locator('.TableCell.menu [data-testid^="icon-for-menu-actions-for-kube-object-menu-for-"]');
  const triggerTestId = await trigger.getAttribute("data-testid", viewTimeout);

  if (!triggerTestId) {
    throw new Error("The row has no menu");
  }

  await trigger.click();

  const menu = frame.getByTestId(triggerTestId.replace(/^icon-for-/, ""));

  await menu.waitFor(viewTimeout);

  return menu;
}

/**
 * Waits for the item of the menu with the title.
 */
export async function waitForMenuItem(menu: Locator, title: string) {
  await menu.locator(".MenuItem .title").getByText(title, { exact: true }).waitFor(viewTimeout);
}
