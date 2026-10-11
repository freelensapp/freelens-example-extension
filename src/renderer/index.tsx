/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Renderer } from "@freelensapp/extensions";
import { ExamplePreferencesStore } from "../common/store";
import { Example as ExampleV1alpha1 } from "./api/example/example-v1alpha1";
import { Example as ExampleV1alpha2 } from "./api/example/example-v1alpha2";
import { createAvailableVersionPage } from "./components/available-version";
import {
  withDetailsErrorBoundary,
  withMenuItemErrorBoundary,
  withPageErrorBoundary,
} from "./components/error-boundary";
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

// Every page, details panel and menu item renders inside an error boundary, so that an error it throws stays in its
// place: the host has none around the details drawer or a menu item, and its boundary around the cluster frame would
// replace the whole cluster view. Each registration field is mapped through its wrapper, so an entry added to it is
// wrapped too.
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

  kubeObjectDetailItems: Renderer.LensExtension["kubeObjectDetailItems"] = [
    Renderer.K8sApi.detailsFor(ExampleV1alpha1, {
      priority: 10,
      Details: ExampleDetailsV1alpha1,
    }),
    Renderer.K8sApi.detailsFor(ExampleV1alpha2, {
      priority: 10,
      Details: ExampleDetailsV1alpha2,
    }),
  ].map((registration) => withDetailsErrorBoundary(this, registration));

  clusterPages: Renderer.LensExtension["clusterPages"] = [
    {
      id: "example",
      components: {
        Page: () => <ExamplesPage extension={this} />,
      },
    },
  ].map((registration) => withPageErrorBoundary(this, registration));

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

  customResources = [ExampleV1alpha1, ExampleV1alpha2];

  kubeObjectMenuItems: Renderer.LensExtension["kubeObjectMenuItems"] = [
    Renderer.K8sApi.menuItemFor(ExampleV1alpha1, {
      MenuItem: ExampleActiveToggleMenuItem_v1alpha1,
    }),
    Renderer.K8sApi.menuItemFor(ExampleV1alpha2, {
      MenuItem: ExampleActiveToggleMenuItem_v1alpha2,
    }),
  ].map((registration) => withMenuItemErrorBoundary(this, registration));
}
