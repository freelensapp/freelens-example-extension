import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { ExamplePreferencesStore } from "../../common/store";
import { withErrorPage } from "../components/error-page";
import { Example } from "../k8s/example";
import { getBooleanClass, getBooleanText } from "../utils";
import style from "./example-details.module.scss";
import styleInline from "./example-details.module.scss?inline";

const {
  Component: { Badge, DrawerItem, MarkdownViewer },
} = Renderer;

export interface ExampleDetailsProps extends Renderer.Component.KubeObjectDetailsProps<Example> {
  extension: Renderer.LensExtension;
}

export const ExampleDetails = observer((props: ExampleDetailsProps) =>
  withErrorPage(props, () => {
    const { object } = props;
    const preferences = ExamplePreferencesStore.getInstance<ExamplePreferencesStore>();

    return (
      <>
        <style>{styleInline}</style>
        <div className={style.exampleDetails}>
          <DrawerItem name="Description">
            <MarkdownViewer markdown={object.spec.description ?? ""} />
          </DrawerItem>
          <DrawerItem name="Example checkbox">
            <Badge className={getBooleanClass(preferences.enabled)} label={getBooleanText(preferences.enabled)} />
          </DrawerItem>
        </div>
      </>
    );
  }),
);
