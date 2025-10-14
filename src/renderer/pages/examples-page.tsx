import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { maybe } from "../../common/utils";
import { withErrorPage } from "../components/error-page";
import { Example_v1alpha1 } from "../k8s/example/example-v1alpha1";
import { Example_v1alpha2 } from "../k8s/example/example-v1alpha2";
import { ExamplesPage_v1alpha1 } from "./examples-page-v1alpha1";
import { ExamplesPage_v1alpha2 } from "./examples-page-v1alpha2";

export interface ExamplesPageProps {
  extension: Renderer.LensExtension;
}

export const ExamplesPage = observer((props: ExamplesPageProps) =>
  withErrorPage(props, () => {
    const store_v1alpha1 = maybe(() => Example_v1alpha1.getStore<Example_v1alpha1>());
    const store_v1alpha2 = maybe(() => Example_v1alpha2.getStore<Example_v1alpha2>());
    if (!store_v1alpha1 && !store_v1alpha2) {
      throw new Error("There is no CRD installed for Examples objects.");
    }
    return (
      <>
        <ExamplesPage_v1alpha1 store={store_v1alpha1} />
        <ExamplesPage_v1alpha2 store={store_v1alpha2} />
      </>
    );
  }),
);
