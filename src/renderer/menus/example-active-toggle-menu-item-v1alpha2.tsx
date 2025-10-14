import { Renderer } from "@freelensapp/extensions";
import { withErrorPage } from "../components/error-page";
import { Example_v1alpha2 } from "../k8s/example/example-v1alpha2";

const {
  Component: { MenuItem, Icon },
} = Renderer;

export interface ExampleActiveToggleMenuItemProps_v1alpha2
  extends Renderer.Component.KubeObjectMenuProps<Example_v1alpha2> {
  extension: Renderer.LensExtension;
}

export const ExampleActiveToggleMenuItem_v1alpha2 = (props: ExampleActiveToggleMenuItemProps_v1alpha2) =>
  withErrorPage(props, () => {
    const { object, toolbar } = props;

    if (!object) return <></>;

    const store = Example_v1alpha2.getStore<Example_v1alpha2>();

    const disable = async () => {
      await store.patch(
        object,
        {
          spec: {
            suspended: true,
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
            suspended: false,
          },
        },
        "merge",
      );
    };

    if (object.spec.suspended) {
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
  });
