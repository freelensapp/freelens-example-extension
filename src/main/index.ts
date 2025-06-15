import { Main } from "@freelensapp/extensions";
import { registerExample } from "../common/k8s/example/example";
import { ExamplePreferencesStore } from "../common/store";

export default class ExampleMain extends Main.LensExtension {
  async onActivate() {
    registerExample();
    await ExamplePreferencesStore.createInstance().loadExtension(this);
  }
}
