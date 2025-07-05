import style from "./utils.module.scss";

export function getBooleanText(value?: boolean) {
  if (value === true) return "True";
  if (value === false) return "False";
  return "-";
}

export function getBooleanClass(value?: boolean) {
  if (value === true) return style.success;
  if (value === false) return style.error;
  return "info";
}
