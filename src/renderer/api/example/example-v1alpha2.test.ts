import { describe, expect, it } from "vitest";
import { Example } from "./example-v1alpha2";

// Example of testing a CRD KubeObject. Per the project conventions the model
// only exposes `static` helpers (instance methods are not available at runtime
// because the host passes plain object copies), so the helpers take the object
// as their first argument and read the typed `spec`/`status` directly.
//
// `@freelensapp/extensions` is stubbed for tests (see `test/freelens-extensions.ts`),
// which lets us construct a real `Example` instance from plain resource data.
describe("Example (v1alpha2)", () => {
  const buildExample = (spec: Example["spec"]) =>
    new Example({
      apiVersion: "example.freelens.app/v1alpha2",
      kind: "Example",
      metadata: {
        name: "demo",
        namespace: "default",
        selfLink: "/apis/example.freelens.app/v1alpha2/namespaces/default/examples/demo",
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

  describe("getSuspended", () => {
    it("returns true when the resource is suspended", () => {
      expect(Example.getSuspended(buildExample({ suspended: true }))).toBe(true);
    });

    it("returns false when the resource is not suspended", () => {
      expect(Example.getSuspended(buildExample({ suspended: false }))).toBe(false);
    });

    it("defaults to false when `suspended` is omitted", () => {
      expect(Example.getSuspended(buildExample({}))).toBe(false);
    });
  });
});
