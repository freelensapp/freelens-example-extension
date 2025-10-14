import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import {
  Example_v1alpha2,
  type ExampleApi_v1alpha2,
  type ExampleStore_v1alpha2,
} from "../k8s/example/example-v1alpha2";
import styles from "./examples-page.module.scss";
import stylesInline from "./examples-page.module.scss?inline";

const {
  Component: { BadgeBoolean, KubeObjectAge, KubeObjectListLayout, LinkToNamespace, WithTooltip },
} = Renderer;

const KubeObject = Example_v1alpha2;
type KubeObject = Example_v1alpha2;
type KubeObjectApi = ExampleApi_v1alpha2;
type KubeObjectStore = ExampleStore_v1alpha2;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  resumed: (object: KubeObject) => String(!KubeObject.getSuspended(object)),
  title: (object: KubeObject) => KubeObject.getTitle(object),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Resumed", sortBy: "resumed", className: styles.resumed },
  { title: "Title", sortBy: "title", className: styles.title },
  { title: "Age", sortBy: "age", className: styles.age },
];

export interface ExamplesPageProps_v1alpha2 {
  store: KubeObjectStore | null;
}

export const ExamplesPage_v1alpha2 = observer((props: ExamplesPageProps_v1alpha2) => {
  const { store } = props;

  return store ? (
    <>
      <style>{stylesInline}</style>
      <KubeObjectListLayout<KubeObject, KubeObjectApi>
        tableId={`${KubeObject.crd.plural}Table`}
        className={styles.page}
        store={store}
        sortingCallbacks={sortingCallbacks}
        searchFilters={[(object: KubeObject) => object.getSearchFields()]}
        renderHeaderTitle={KubeObject.crd.title}
        renderTableHeader={renderTableHeader}
        renderTableContents={(object: KubeObject) => [
          <WithTooltip>{object.getName()}</WithTooltip>,
          <LinkToNamespace namespace={object.getNs()} />,
          <BadgeBoolean value={!KubeObject.getSuspended(object)} />,
          <WithTooltip>{KubeObject.getTitle(object) ?? "N/A"}</WithTooltip>,
          <KubeObjectAge object={object} key="age" />,
        ]}
      />
    </>
  ) : (
    <></>
  );
});
