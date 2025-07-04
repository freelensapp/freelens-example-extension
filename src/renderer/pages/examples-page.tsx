import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { Example } from "../k8s/example";
import { getBooleanClass, getBooleanText } from "../utils";
import styleInline from "./examples-page.scss?inline";

const {
  Component: { Badge, KubeObjectAge, KubeObjectListLayout, WithTooltip },
  K8sApi: { namespacesApi },
  Navigation: { getDetailsUrl },
} = Renderer;

const {
  Util: { stopPropagation },
} = Common;

const KubeObject = Example;
type KubeObject = Example;

export const ExamplesPage = observer(() => {
  const store = KubeObject.getStore();
  if (!store) return <></>;
  return (
    <>
      <style>{styleInline}</style>
      <KubeObjectListLayout
        tableId={`${KubeObject.crd.singular}Table`}
        className={KubeObject.crd.plural}
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
          { title: "Name", className: "name", sortBy: "name" },
          { title: "Namespace", className: "namespace", sortBy: "namespace" },
          { title: "Active", className: "active", sortBy: "active" },
          { title: "Title", className: "title", sortBy: "title" },
          { title: "Age", className: "age", sortBy: "age" },
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
          <Badge className={getBooleanClass(object.spec.active)} label={getBooleanText(object.spec.active)} />,
          <WithTooltip>{object.spec.title}</WithTooltip>,
          <KubeObjectAge object={object} key="age" />,
        ]}
      />
    </>
  );
});
