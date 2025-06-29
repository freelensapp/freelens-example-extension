import { Renderer } from "@freelensapp/extensions";
import type { NamespacedObjectReference } from "./types";

export interface ExampleSpec {
  title?: string;
  description?: string;
  examples?: NamespacedObjectReference[];
}

export type ExampleStatus = {};

export class Example extends Renderer.K8sApi.KubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  ExampleStatus,
  ExampleSpec
> {
  static readonly kind = "Example";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/example.freelens.app/v1alpha1/examples";
}

export class ExampleApi extends Renderer.K8sApi.KubeApi<Example> {}
export class ExampleStore extends Renderer.K8sApi.KubeObjectStore<Example, ExampleApi> {}

export const exampleObject = {
  kind: "Example",
  apiVersions: ["example.freelens.app/v1alpha1"],
};
