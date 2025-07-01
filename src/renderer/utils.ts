export function getBooleanText(value?: boolean) {
  if (value === true) return "True";
  if (value === false) return "False";
  return "-";
}

export function getBooleanClass(value?: boolean) {
  if (value === true) return "success";
  if (value === false) return "error";
  return "info";
}
