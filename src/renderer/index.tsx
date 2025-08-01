/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Renderer } from "@freelensapp/extensions";
import { ExamplePreferencesStore } from "../common/store";
import { ExampleDetails } from "./details/example-details";
import { ExampleIcon } from "./icons";
import { Example } from "./k8s/example";
import { ExampleActiveToggleMenuItem, type ExampleActiveToggleMenuItemProps } from "./menus";
import { ExamplesPage } from "./pages";
import { ExamplePreferenceHint, ExamplePreferenceInput } from "./preferences";

export default class ExampleRenderer extends Renderer.LensExtension {
  async onActivate() {
    ExamplePreferencesStore.getInstanceOrCreate().loadExtension(this);
  }

  appPreferences = [
    {
      title: "Example Preferences",
      components: {
        Input: () => <ExamplePreferenceInput />,
        Hint: () => <ExamplePreferenceHint />,
      },
    },
  ];

  kubeObjectDetailItems = [
    {
      kind: Example.kind,
      apiVersions: Example.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => (
          <ExampleDetails {...props} extension={this} />
        ),
      },
    },
  ];

  clusterPages = [
    {
      id: Example.crd.plural,
      components: {
        Page: () => <ExamplesPage extension={this} />,
      },
    },
  ];

  clusterPageMenus = [
    {
      id: Example.crd.plural,
      title: Example.crd.title,
      target: { pageId: Example.crd.plural },
      components: {
        Icon: ExampleIcon,
      },
    },
  ];

  kubeObjectMenuItems = [
    {
      kind: Example.kind,
      apiVersions: Example.crd.apiVersions,
      components: {
        MenuItem: (props: ExampleActiveToggleMenuItemProps) => (
          <ExampleActiveToggleMenuItem {...props} extension={this} />
        ),
      },
    },
  ];
}
