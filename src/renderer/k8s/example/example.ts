import { Renderer } from "@freelensapp/extensions";

import type { ExampleKubeObjectCRD, NamespacedObjectReference } from "../types";

export interface ExampleSpec {
  title?: string;
  active?: boolean;
  description?: string;
  examples?: NamespacedObjectReference[];
}

export type ExampleStatus = {};

export class Example extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  ExampleStatus,
  ExampleSpec
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
}

export class ExampleApi extends Renderer.K8sApi.KubeApi<Example> {}
export class ExampleStore extends Renderer.K8sApi.KubeObjectStore<Example, ExampleApi> {}
