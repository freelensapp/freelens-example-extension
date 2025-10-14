/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Renderer } from "@freelensapp/extensions";
import { ExamplePreferencesStore } from "../common/store";
import { ExampleDetails_v1alpha1 } from "./details/example-details-v1alpha1";
import { ExampleDetails_v1alpha2 } from "./details/example-details-v1alpha2";
import { ExampleIcon } from "./icons";
import { Example_v1alpha1 } from "./k8s/example/example-v1alpha1";
import { Example_v1alpha2 } from "./k8s/example/example-v1alpha2";
import {
  ExampleActiveToggleMenuItem_v1alpha1,
  type ExampleActiveToggleMenuItemProps_v1alpha1,
} from "./menus/example-active-toggle-menu-item-v1alpha1";
import {
  ExampleActiveToggleMenuItem_v1alpha2,
  type ExampleActiveToggleMenuItemProps_v1alpha2,
} from "./menus/example-active-toggle-menu-item-v1alpha2";
import { ExamplesPage } from "./pages/examples-page";
import { ExamplePreferenceHint, ExamplePreferenceInput } from "./preferences/example-preference";

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
      kind: Example_v1alpha1.kind,
      apiVersions: Example_v1alpha1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => (
          <ExampleDetails_v1alpha1 {...props} extension={this} />
        ),
      },
    },
    {
      kind: Example_v1alpha2.kind,
      apiVersions: Example_v1alpha2.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => (
          <ExampleDetails_v1alpha2 {...props} extension={this} />
        ),
      },
    },
  ];

  clusterPages = [
    {
      id: Example_v1alpha1.crd.plural,
      components: {
        Page: () => <ExamplesPage extension={this} />,
      },
    },
  ];

  clusterPageMenus = [
    {
      id: Example_v1alpha1.crd.plural,
      title: Example_v1alpha1.crd.title,
      target: { pageId: Example_v1alpha1.crd.plural },
      components: {
        Icon: ExampleIcon,
      },
    },
  ];

  kubeObjectMenuItems = [
    {
      kind: Example_v1alpha1.kind,
      apiVersions: Example_v1alpha1.crd.apiVersions,
      components: {
        MenuItem: (props: ExampleActiveToggleMenuItemProps_v1alpha1) => (
          <ExampleActiveToggleMenuItem_v1alpha1 {...props} extension={this} />
        ),
      },
    },
    {
      kind: Example_v1alpha2.kind,
      apiVersions: Example_v1alpha2.crd.apiVersions,
      components: {
        MenuItem: (props: ExampleActiveToggleMenuItemProps_v1alpha2) => (
          <ExampleActiveToggleMenuItem_v1alpha2 {...props} extension={this} />
        ),
      },
    },
  ];
}
