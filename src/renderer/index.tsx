/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Renderer } from "@freelensapp/extensions";
import { ExamplePreferencesStore } from "../common/store";
import { ExampleDetails } from "./details/example-details";
import { ExampleIcon } from "./icons";
import { ExamplesPage } from "./pages";
import { ExamplePreferenceHint, ExamplePreferenceInput } from "./preferences";

import type { Example } from "./k8s/example";

export default class ExampleRenderer extends Renderer.LensExtension {
  async onActivate() {
    await ExamplePreferencesStore.getInstanceOrCreate().loadExtension(this);
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
      kind: "Example",
      apiVersions: ["example.freelens.app/v1alpha1"],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Example>) => <ExampleDetails {...props} />,
      },
    },
  ];

  clusterPages = [
    {
      id: "examples-page",
      components: {
        Page: () => <ExamplesPage />,
      },
    },
  ];

  clusterPageMenus = [
    {
      id: "example",
      title: "Example",
      target: { pageId: "examples-page" },
      components: {
        Icon: ExampleIcon,
      },
    },
  ];
}
