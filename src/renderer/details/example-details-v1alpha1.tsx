import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import { ExamplePreferencesStore } from "../../common/store";

import type { Example } from "../api/example/example-v1alpha1";

const { observer } = MobxReact;

const {
  Component: { BadgeBoolean, DrawerItem, MarkdownViewer },
} = Renderer;

export type ExampleDetailsProps = Renderer.Component.KubeObjectDetailsProps<Example>;

export const ExampleDetails = observer(({ object }: ExampleDetailsProps) => {
  const preferences = ExamplePreferencesStore.getInstance<ExamplePreferencesStore>();

  return (
    <>
      <DrawerItem name="Api Version">v1alpha1</DrawerItem>
      <DrawerItem name="Description">
        <MarkdownViewer markdown={object.spec.description ?? ""} />
      </DrawerItem>
      <DrawerItem name="Example checkbox">
        <BadgeBoolean value={preferences.enabled} />
      </DrawerItem>
    </>
  );
});
