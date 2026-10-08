import { observable, reaction, runInAction } from "mobx";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExamplePreferencesStore } from "./preferences-store";

import type { ExamplePreferencesModel } from "./preferences-store";

// Vitest runs the development build of mobx, which throws when a class puts
// `@observable` on a plain field instead of an `accessor`. A store that does is
// already rejected when this file imports it. The production build, which the
// host may run, accepts the class and leaves the field unobservable, so the
// preference would never be saved.

beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ExamplePreferencesStore", () => {
  it("runs on the development build of mobx, which rejects @observable on a plain field", () => {
    expect(() => {
      class LegacyStore {
        @observable enabled = false;
      }
      return LegacyStore;
    }).toThrow("Please use `@observable accessor enabled`");
  });

  it("starts disabled", () => {
    expect(new ExamplePreferencesStore().toJSON()).toEqual({ enabled: false });
  });

  it("changes toJSON() when enabled changes, as the host's reaction needs to save it", () => {
    const store = new ExamplePreferencesStore();
    const saved: ExamplePreferencesModel[] = [];
    const dispose = reaction(
      () => store.toJSON(),
      (model) => saved.push(model),
    );

    try {
      runInAction(() => {
        store.enabled = true;
      });
      runInAction(() => {
        store.enabled = true;
      });
      runInAction(() => {
        store.fromStore({ enabled: false });
      });
    } finally {
      dispose();
    }

    expect(saved).toEqual([{ enabled: true }, { enabled: false }]);
  });
});
