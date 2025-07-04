import { Common, Renderer } from "@freelensapp/extensions";

export class ExtensionKubeObject<
  Metadata extends Renderer.K8sApi.KubeObjectMetadata = Renderer.K8sApi.KubeObjectMetadata,
  Status = unknown,
  Spec = unknown,
> extends Renderer.K8sApi.KubeObject<Metadata, Status, Spec> {
  static readonly crd: ExtensionKubeObjectCRD;

  static getApi<Api extends Renderer.K8sApi.KubeApi>(): Api | undefined {
    if (this.kind) {
      for (let apiVersion of this.crd.apiVersions) {
        const api = Renderer.K8sApi.apiManager.getApiByKind(this.kind, apiVersion);
        if (api) return api as Api;
      }
    }
    Common.logger.error(`API for ${this.name} is not registered. Extension won't work correctly`);
    return;
  }

  static getStore<Store extends Renderer.K8sApi.KubeObjectStore<any, any, any>>(): Store | undefined {
    const api = this.getApi();
    if (api) {
      const store = Renderer.K8sApi.apiManager.getStore(api);
      if (store) return store as Store;
    }
    Common.logger.error(`Store for ${this.name} is not registered. Extension won't work correctly`);
    return;
  }
}

export interface ExtensionKubeObjectCRD {
  apiVersions: string[];
  plural: string;
  singular: string;
  shortNames: string[];
  title: string;
}

export interface NamespacedObjectReference {
  name: string;
  namespace?: string;
}
