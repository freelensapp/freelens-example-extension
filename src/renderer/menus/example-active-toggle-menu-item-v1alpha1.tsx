import { Common, Renderer } from "@freelensapp/extensions";
import { Example } from "../api/example/example-v1alpha1";

const {
  Component: { MenuItem, Icon },
} = Renderer;

export type ExampleActiveToggleMenuItemProps = Common.Types.KubeObjectMenuItemProps<Example>;

export const ExampleActiveToggleMenuItem = ({ object, toolbar }: ExampleActiveToggleMenuItemProps) => {
  if (!object) return <></>;

  const store = Example.getStore<Example>();

  const disable = async () => {
    await store.patch(
      object,
      {
        spec: {
          active: false,
        },
      },
      "merge",
    );
  };

  const enable = async () => {
    await store.patch(
      object,
      {
        spec: {
          active: true,
        },
      },
      "merge",
    );
  };

  if (!object.spec.active) {
    return (
      <MenuItem onClick={enable}>
        <Icon material="play_circle_outline" interactive={toolbar} title="Resume" />
        <span className="title">Resume</span>
      </MenuItem>
    );
  } else {
    return (
      <MenuItem onClick={disable}>
        <Icon material="pause_circle_filled" interactive={toolbar} title="Suspend" />
        <span className="title">Suspend</span>
      </MenuItem>
    );
  }
};
