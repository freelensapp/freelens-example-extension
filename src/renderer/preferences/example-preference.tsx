import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { ExamplePreferencesStore } from "../../common/store";

const {
  Component: { Checkbox },
} = Renderer;

@observer
export class ExamplePreferenceInput extends React.Component {
  render() {
    return (
      <Checkbox
        label="Example checkbox"
        value={ExamplePreferencesStore.getInstance().enabled}
        onChange={(v) => {
          ExamplePreferencesStore.getInstance().enabled = v;
        }}
      />
    );
  }
}

export class ExamplePreferenceHint extends React.Component {
  render() {
    return <span>This is an example of an preference for extensions.</span>;
  }
}
