export function normalizeSig({ path, sig }: ExistingYaml | TranslatedYaml) {
  const nPath = path.split('.').slice(0, -2).join('.');
  return `${nPath}:${sig.replace(/\[.*?\:/g, '[')}`;
}

export function replaceLocaleInPath(path: string, posftFix: string) {
  return `${path.split('.').slice(0, -2).join('.')}.${posftFix}`;
}
