import { Renderer } from "@freelensapp/extensions";

import type { NamespacedObjectReference } from "./types";

export interface ExampleSpec {
  title?: string;
  active?: boolean;
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

  static readonly crd = {
    apiVersions: ["example.freelens.app/v1alpha1"],
    plural: "examples",
    singular: "example",
    shortNames: ["ex"],
    title: "Examples",
  };

  static getApi() {
    for (let apiVersion of Example.crd.apiVersions) {
      const api = Renderer.K8sApi.apiManager.getApiByKind(Example.kind, apiVersion);
      if (api) return api as ExampleApi;
    }
    throw new Error(`API for ${this.kind} is not registered. Extension won't work correctly`);
  }
  static getStore() {
    const api = Example.getApi();
    const store = Renderer.K8sApi.apiManager.getStore(api);
    if (store) return store as ExampleStore;
    throw new Error(`Store for ${this.kind} is not registered. Extension won't work correctly`);
  }
}

export class ExampleApi extends Renderer.K8sApi.KubeApi<Example> {}
export class ExampleStore extends Renderer.K8sApi.KubeObjectStore<Example, ExampleApi> {}
