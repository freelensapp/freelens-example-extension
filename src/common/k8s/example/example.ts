import { Main, Renderer } from "@freelensapp/extensions";
import { NamespacedObjectReference } from "./types";

export interface ExampleSpec {
  title?: string;
  description?: string;
  examples?: NamespacedObjectReference[];
}

export interface ExampleStatus {}

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

export function registerExample() {
  const exampleApi = new ExampleApi({ objectConstructor: Example });
  Main.K8sApi.apiManager.registerApi(exampleApi);
  const exampleStore = new ExampleStore(exampleApi);
  Main.K8sApi.apiManager.registerStore(exampleStore);
}

export const exampleObject = {
  kind: "Example",
  apiVersions: ["example.freelens.app/v1alpha1"],
};
