import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { ExamplePreferencesStore } from "../../common/store";
import { BadgeBoolean } from "../components/badge-boolean";
import { withErrorPage } from "../components/error-page";
import { Example } from "../k8s/example";
import style from "./example-details.module.scss";
import styleInline from "./example-details.module.scss?inline";

const {
  Component: { DrawerItem, MarkdownViewer },
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
            <BadgeBoolean value={preferences.enabled} />
          </DrawerItem>
        </div>
      </>
    );
  }),
);
