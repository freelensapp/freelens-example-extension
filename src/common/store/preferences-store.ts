import { Common } from "@freelensapp/extensions";
import { makeObservable, observable } from "mobx";

export type ExamplePreferencesModel = {
  enabled: boolean;
};

export class ExamplePreferencesStore extends Common.Store.ExtensionStore<ExamplePreferencesModel> {
  @observable enabled = false;

  constructor() {
    super({
      configName: "example-preferences-store",
      defaults: {
        enabled: false,
      },
    });
    makeObservable(this);
  }

  fromStore({ enabled }: ExamplePreferencesModel): void {
    this.enabled = enabled;
  }

  toJSON(): ExamplePreferencesModel {
    return {
      enabled: this.enabled,
    };
  }
}
