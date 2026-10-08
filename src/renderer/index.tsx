/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Renderer } from "@freelensapp/extensions";
import { ExamplePreferencesStore } from "../common/store";
import { Example as ExampleV1alpha1 } from "./api/example/example-v1alpha1";
import { Example as ExampleV1alpha2 } from "./api/example/example-v1alpha2";
import { createAvailableVersionPage } from "./components/available-version";
import { ExampleDetails as ExampleDetailsV1alpha1 } from "./details/example-details-v1alpha1";
import { ExampleDetails as ExampleDetailsV1alpha2 } from "./details/example-details-v1alpha2";
import { ExampleIcon } from "./icons";
import { ExampleActiveToggleMenuItem as ExampleActiveToggleMenuItem_v1alpha1 } from "./menus/example-active-toggle-menu-item-v1alpha1";
import { ExampleActiveToggleMenuItem as ExampleActiveToggleMenuItem_v1alpha2 } from "./menus/example-active-toggle-menu-item-v1alpha2";
import { ExamplesPage as ExamplesPageV1alpha1 } from "./pages/examples-page-v1alpha1";
import { ExamplesPage as ExamplesPageV1alpha2 } from "./pages/examples-page-v1alpha2";
import { ExamplePreferenceHint, ExamplePreferenceInput } from "./preferences/example-preference";

const ExamplesPage = createAvailableVersionPage("Examples", [
  { kubeObjectClass: ExampleV1alpha2, PageComponent: ExamplesPageV1alpha2, version: "v1alpha2" },
  { kubeObjectClass: ExampleV1alpha1, PageComponent: ExamplesPageV1alpha1, version: "v1alpha1" },
]);

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
      kind: ExampleV1alpha1.kind,
      apiVersions: ExampleV1alpha1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<ExampleV1alpha1>) => (
          <ExampleDetailsV1alpha1 {...props} extension={this} />
        ),
      },
    },
    {
      kind: ExampleV1alpha2.kind,
      apiVersions: ExampleV1alpha2.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<ExampleV1alpha2>) => (
          <ExampleDetailsV1alpha2 {...props} extension={this} />
        ),
      },
    },
  ];

  clusterPages = [
    {
      id: "example",
      components: {
        Page: () => <ExamplesPage extension={this} />,
      },
    },
  ];

  clusterPageMenus = [
    {
      id: "example",
      title: ExampleV1alpha1.crd.title,
      target: { pageId: "example" },
      components: {
        Icon: ExampleIcon,
      },
    },
  ];

  kubeObjectMenuItems = [
    {
      kind: ExampleV1alpha1.kind,
      apiVersions: ExampleV1alpha1.crd.apiVersions,
      components: {
        MenuItem: (props: Renderer.Component.KubeObjectMenuProps<ExampleV1alpha1>) => (
          <ExampleActiveToggleMenuItem_v1alpha1 {...props} extension={this} />
        ),
      },
    },
    {
      kind: ExampleV1alpha2.kind,
      apiVersions: ExampleV1alpha2.crd.apiVersions,
      components: {
        MenuItem: (props: Renderer.Component.KubeObjectMenuProps<ExampleV1alpha2>) => (
          <ExampleActiveToggleMenuItem_v1alpha2 {...props} extension={this} />
        ),
      },
    },
  ];
}
