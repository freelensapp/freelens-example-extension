import { describe, expect, it } from "vitest";
import { Example } from "./example-v1alpha1";

// Same CRD as `example-v1alpha2` but an older API version: `v1alpha1` exposes a
// `getActive` helper instead of `getSuspended`. Testing both versions shows how
// to cover multiple API versions of the same KubeObject.
//
// `@freelensapp/extensions` is stubbed for tests (see `test/freelens-extensions.ts`),
// which lets us construct a real `Example` instance from plain resource data.
describe("Example (v1alpha1)", () => {
  const buildExample = (spec: Example["spec"]) =>
    new Example({
      apiVersion: "example.freelens.app/v1alpha1",
      kind: "Example",
      metadata: {
        name: "demo",
        namespace: "default",
        selfLink: "/apis/example.freelens.app/v1alpha1/namespaces/default/examples/demo",
      },
      spec,
    });

  describe("getTitle", () => {
    it("returns the title from the spec", () => {
      expect(Example.getTitle(buildExample({ title: "Demo" }))).toBe("Demo");
    });

    it("returns undefined when the title is not set", () => {
      expect(Example.getTitle(buildExample({}))).toBeUndefined();
    });
  });

  describe("getActive", () => {
    it("returns true when the resource is active", () => {
      expect(Example.getActive(buildExample({ active: true }))).toBe(true);
    });

    it("returns false when the resource is not active", () => {
      expect(Example.getActive(buildExample({ active: false }))).toBe(false);
    });

    it("defaults to false when `active` is omitted", () => {
      expect(Example.getActive(buildExample({}))).toBe(false);
    });
  });
});
