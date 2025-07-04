import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { ExamplePreferencesStore } from "../../common/store";
import { Example } from "../k8s/example";
import { ErrorPage } from "../pages/error-page";
import { getBooleanClass, getBooleanText } from "../utils";
import styleInline from "./example-details.scss?inline";

const {
  Component: { Badge, DrawerItem, MarkdownViewer },
} = Renderer;

export interface ExampleDetailsProps extends Renderer.Component.KubeObjectDetailsProps<Example> {
  extension: Renderer.LensExtension;
}

export const ExampleDetails = observer((props: ExampleDetailsProps) => {
  const { object, extension } = props;
  try {
    const preferences = ExamplePreferencesStore.getInstance<ExamplePreferencesStore>();

    return (
      <>
        <style>{styleInline}</style>
        <div className="ExampleDetails">
          <DrawerItem name="Description">
            <MarkdownViewer markdown={object.spec.description ?? ""} />
          </DrawerItem>
          <DrawerItem name="Example checkbox">
            <Badge className={getBooleanClass(preferences.enabled)} label={getBooleanText(preferences.enabled)} />
          </DrawerItem>
        </div>
      </>
    );
  } catch (error) {
    return <ErrorPage error={error} extension={extension} />;
  }
});
