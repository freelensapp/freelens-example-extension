/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// One session per API version: the CRD of v1alpha1 serves v1alpha1 only, so the
// page falls back from v1alpha2 to the v1alpha1 list. The session disconnects
// the kind cluster, sets up the CRD, connects the cluster again, so that the app
// reads the CRD anew, and leaves the cluster disconnected; it does not depend on
// another test file having run.

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  appReady,
  connectApp,
  disconnectKindCluster,
  installExtension,
  openDetails,
  openKindCluster,
  openListPage,
  openRowMenu,
  setUpCluster,
  tearDownCluster,
  waitForMenuItem,
} from "./extension-helpers";

import type { Frame } from "playwright";

import type { AppSession } from "./extension-helpers";

const version = "v1alpha1";

describe.skipIf(!(await appReady({ cluster: true })))(`Example ${version} views`, () => {
  let session: AppSession | undefined;
  let frame: Frame;

  beforeAll(
    async () => {
      session = await connectApp();
      await disconnectKindCluster(session);
      setUpCluster(version);
      await installExtension(session);
      frame = await openKindCluster(session);
    },
    10 * 60 * 1000,
  );

  afterAll(
    async () => {
      let errors: string[] = [];

      try {
        // The cluster first: the app watches the CRD, and would log errors for
        // a CRD deleted under it.
        if (session) {
          await disconnectKindCluster(session);
        }

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
