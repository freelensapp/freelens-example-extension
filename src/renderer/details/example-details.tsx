import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { Example } from "../k8s/example";
import styleInline from "./example-details.scss?inline";

const {
  Component: { DrawerItem, MarkdownViewer },
} = Renderer;

export interface ExampleDetailsProps extends Renderer.Component.KubeObjectDetailsProps<Example> {}

export const ExampleDetails = observer(({ object }: ExampleDetailsProps) => {
  return (
    <>
      <style>{styleInline}</style>
      <div className="ExampleDetails">
        <DrawerItem name="Description">
          <MarkdownViewer markdown={object.spec.description ?? ""} />
        </DrawerItem>
      </div>
    </>
  );
});
