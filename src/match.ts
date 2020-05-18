import { normalizeSig } from './utils';

export default function match(yamls: ExistingYaml[]): ExistingYaml[] {
  return yamls.map((dYaml) => {
    const matches = yamls.reduce((o, tYaml) => {
      if (tYaml.locale == dYaml.locale || normalizeSig(tYaml) !== normalizeSig(dYaml)) {
        return o;
      }
      return { [tYaml.locale]: tYaml };
    }, {});
    return { ...dYaml, matches };
  });
}
