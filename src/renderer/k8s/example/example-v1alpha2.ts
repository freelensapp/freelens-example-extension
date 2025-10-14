import { Renderer } from "@freelensapp/extensions";

import type { ExampleKubeObjectCRD, NamespacedObjectReference } from "../types";

export interface ExampleSpec_v1alpha2 {
  title?: string;
  suspended?: boolean;
  description?: string;
  examples?: NamespacedObjectReference[];
}

export type ExampleStatus_v1alpha2 = {};

export class Example_v1alpha2 extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  ExampleStatus_v1alpha2,
  ExampleSpec_v1alpha2
> {
  static readonly kind = "Example";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/example.freelens.app/v1alpha2/examples";

  static readonly crd: ExampleKubeObjectCRD = {
    apiVersions: ["example.freelens.app/v1alpha2"],
    plural: "examples",
    singular: "example",
    shortNames: ["ex"],
    title: "Examples",
  };

  static getSuspended(object: Example_v1alpha2): boolean {
    return object.spec.suspended ?? false;
  }

  static getTitle(object: Example_v1alpha2): string | undefined {
    return object.spec.title;
  }
}

export class ExampleApi_v1alpha2 extends Renderer.K8sApi.KubeApi<Example_v1alpha2> {}
export class ExampleStore_v1alpha2 extends Renderer.K8sApi.KubeObjectStore<Example_v1alpha2, ExampleApi_v1alpha2> {}
