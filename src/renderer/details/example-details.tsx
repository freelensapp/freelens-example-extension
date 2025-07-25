import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { ExamplePreferencesStore } from "../../common/store";
import { withErrorPage } from "../components/error-page";
import { Example } from "../k8s/example";
import styles from "./example-details.module.scss";
import stylesInline from "./example-details.module.scss?inline";

const {
  Component: { BadgeBoolean, DrawerItem, MarkdownViewer },
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
        <style>{stylesInline}</style>
        <div className={styles.exampleDetails}>
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
