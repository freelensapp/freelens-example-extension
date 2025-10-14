import { Renderer } from "@freelensapp/extensions";

import type { ExampleKubeObjectCRD, NamespacedObjectReference } from "../types";

export interface ExampleSpec_v1alpha1 {
  title?: string;
  active?: boolean;
  description?: string;
  examples?: NamespacedObjectReference[];
}

export type ExampleStatus_v1alpha1 = {};

export class Example_v1alpha1 extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  ExampleStatus_v1alpha1,
  ExampleSpec_v1alpha1
> {
  static readonly kind = "Example";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/example.freelens.app/v1alpha1/examples";

  static readonly crd: ExampleKubeObjectCRD = {
    apiVersions: ["example.freelens.app/v1alpha1"],
    plural: "examples",
    singular: "example",
    shortNames: ["ex"],
    title: "Examples",
  };

  static getActive(object: Example_v1alpha1): boolean {
    return object.spec.active ?? false;
  }

  static getTitle(object: Example_v1alpha1): string | undefined {
    return object.spec.title;
  }
}

export class ExampleApi_v1alpha1 extends Renderer.K8sApi.KubeApi<Example_v1alpha1> {}
export class ExampleStore_v1alpha1 extends Renderer.K8sApi.KubeObjectStore<Example_v1alpha1, ExampleApi_v1alpha1> {}
