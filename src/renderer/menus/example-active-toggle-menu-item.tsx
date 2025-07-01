import { Renderer } from "@freelensapp/extensions";
import { Example } from "../k8s/example";

const {
  Component: { MenuItem, Icon },
} = Renderer;

export interface ExampleActiveToggleMenuItemProps extends Renderer.Component.KubeObjectMenuProps<Example> {}

export function ExampleActiveToggleMenuItem(props: ExampleActiveToggleMenuItemProps) {
  const { object, toolbar } = props;

  if (!object) return <></>;

  const store = Example.getStore();

  const disable = async () => {
    await store.patch(object, [
      {
        op: "replace",
        path: "/spec/active",
        value: false,
      },
    ]);
  };

  const enable = async () => {
    await store.patch(object, [
      {
        op: "replace",
        path: "/spec/active",
        value: true,
      },
    ]);
  };

  if (object.spec.active === false) {
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
}
