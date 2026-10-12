/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Runs inside a Freelens checkout, copied into `freelens/integration/__tests__/`
// by the integration tests workflow, and imports the helpers found there.
//
// One session per API version: the CRD of v1alpha1 serves v1alpha1 only, so the
// page falls back from v1alpha2 to the v1alpha1 list. The session sets up the
// cluster, starts its own app and tears both down; it does not depend on another
// test file having run.

import { describeIf } from "@freelensapp/test-utils";
import { afterAll, beforeAll, expect, it } from "vitest";
import {
  clusterReady,
  installExtension,
  openDetails,
  openKindCluster,
  openListPage,
  openRowMenu,
  setUpCluster,
  startApp,
  tearDownCluster,
  waitForMenuItem,
} from "./extension-helpers";

import type { Frame } from "playwright";

import type { AppSession } from "./extension-helpers";

const version = "v1alpha1";

describeIf(clusterReady())(`Example ${version} views`, () => {
  let session: AppSession | undefined;
  let frame: Frame;

  beforeAll(
    async () => {
      setUpCluster(version);
      session = await startApp();
      await installExtension(session);
      frame = await openKindCluster(session);
    },
    10 * 60 * 1000,
  );

  afterAll(
    async () => {
      let errors: string[] = [];

      try {
        // The app first: it watches the CRD, and would log errors for a CRD
        // deleted under it.
        errors = (await session?.close()) ?? [];
      } finally {
        tearDownCluster(version);
      }

      expect(errors).toEqual([]);
    },
    10 * 60 * 1000,
  );

  it("lists the test object", async () => {
    await openListPage(frame);
  });

  it(`shows the ${version} details of the test object`, async () => {
    const row = await openListPage(frame);

    expect(await openDetails(frame, row)).toBe(version);
  });

  it("shows the extension's menu item for the test object", async () => {
    const row = await openListPage(frame);
    const menu = await openRowMenu(frame, row);

    await waitForMenuItem(menu, "Suspend");
  });
});
