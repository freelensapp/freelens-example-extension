import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { withErrorPage } from "../components/error-page";
import { Example } from "../k8s/example";
import styles from "./examples-page.module.scss";
import stylesInline from "./examples-page.module.scss?inline";

const {
  Component: { BadgeBoolean, KubeObjectAge, KubeObjectListLayout, WithTooltip },
  K8sApi: { namespacesApi },
  Navigation: { getDetailsUrl },
} = Renderer;

const {
  Util: { stopPropagation },
} = Common;

const KubeObject = Example;
type KubeObject = Example;

export interface ExamplesPageProps {
  extension: Renderer.LensExtension;
}

export const ExamplesPage = observer((props: ExamplesPageProps) =>
  withErrorPage(props, () => {
    const store = KubeObject.getStore();
    return (
      <>
        <style>{stylesInline}</style>
        <KubeObjectListLayout
          tableId={`${KubeObject.crd.singular}Table`}
          className={styles.examplesPage}
          store={store}
          sortingCallbacks={{
            name: (object: KubeObject) => object.getName(),
            namespace: (object: KubeObject) => object.getNs(),
            active: (object: KubeObject) => String(object.spec.active ?? false),
            title: (object: KubeObject) => object.spec.title,
            age: (object: KubeObject) => object.getCreationTimestamp(),
          }}
          searchFilters={[(object: KubeObject) => object.getSearchFields()]}
          renderHeaderTitle={KubeObject.crd.title}
          renderTableHeader={[
            { title: "Name", sortBy: "name" },
            { title: "Namespace", sortBy: "namespace" },
            { title: "Active", sortBy: "active", className: styles.active },
            { title: "Title", sortBy: "title", className: styles.title },
            { title: "Age", sortBy: "age", className: styles.age },
          ]}
          renderTableContents={(object: KubeObject) => [
            <WithTooltip>{object.getName()}</WithTooltip>,
            <Link
              key="link"
              to={getDetailsUrl(namespacesApi.formatUrlForNotListing({ name: object.getNs() }))}
              onClick={stopPropagation}
            >
              <WithTooltip>{object.getNs()}</WithTooltip>
            </Link>,
            <BadgeBoolean value={object.spec.active} />,
            <WithTooltip>{object.spec.title}</WithTooltip>,
            <KubeObjectAge object={object} key="age" />,
          ]}
        />
      </>
    );
  }),
);
