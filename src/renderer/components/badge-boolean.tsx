import { Renderer } from "@freelensapp/extensions";
import style from "./badge-boolean.module.scss";
import styleInline from "./badge-boolean.module.scss?inline";

const {
  Component: { Badge },
} = Renderer;

export interface BadgeBooleanProps {
  value?: boolean;
}

export function getBooleanText(value?: boolean) {
  if (value === true) return "True";
  if (value === false) return "False";
  return "-";
}

export function getBooleanClass(value?: boolean) {
  if (value === true) return style.true;
  if (value === false) return style.false;
  return style.undefined;
}

export function BadgeBoolean({ value }: BadgeBooleanProps) {
  return (
    <>
      <style>{styleInline}</style>
      <Badge className={getBooleanClass(value)} label={getBooleanText(value)} />
    </>
  );
}
