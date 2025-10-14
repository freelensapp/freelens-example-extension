import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import {
  Example_v1alpha1,
  type ExampleApi_v1alpha1,
  type ExampleStore_v1alpha1,
} from "../k8s/example/example-v1alpha1";
import styles from "./examples-page.module.scss";
import stylesInline from "./examples-page.module.scss?inline";

const {
  Component: { BadgeBoolean, KubeObjectAge, KubeObjectListLayout, LinkToNamespace, WithTooltip },
} = Renderer;

const KubeObject = Example_v1alpha1;
type KubeObject = Example_v1alpha1;
type KubeObjectApi = ExampleApi_v1alpha1;
type KubeObjectStore = ExampleStore_v1alpha1;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  active: (object: KubeObject) => String(KubeObject.getActive(object)),
  title: (object: KubeObject) => KubeObject.getTitle(object),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Active", sortBy: "active", className: styles.active },
  { title: "Title", sortBy: "title", className: styles.title },
  { title: "Age", sortBy: "age", className: styles.age },
];

export interface ExamplesPageProps_v1alpha1 {
  store: KubeObjectStore | null;
}

export const ExamplesPage_v1alpha1 = observer((props: ExamplesPageProps_v1alpha1) => {
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
          <BadgeBoolean value={KubeObject.getActive(object)} />,
          <WithTooltip>{KubeObject.getTitle(object) ?? "N/A"}</WithTooltip>,
          <KubeObjectAge object={object} key="age" />,
        ]}
      />
    </>
  ) : (
    <></>
  );
});
