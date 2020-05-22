import { TranslatedYaml } from './types';
import YAML from 'yaml';
import { YAMLMap, Pair, Scalar } from 'yaml/types';
import { Type } from 'yaml/util';
import { writeFile } from 'fs-extra';

function formatComment(str: string) {
  return str
    .trim()
    .split('\n')
    .map((s: string) => ` ${s}`)
    .join('\n');
}
export default async function generateYaml(translations: TranslatedYaml[], filePath: string) {
  // convert to yaml and include the english comment
  const doc = new YAML.Document() as any;
  doc.contents = YAML.createNode({});
  translations.forEach((t) => {
    const key = new Scalar(t.fullSig);
    const value = new Scalar(t.value);
    const pair = new Pair(key, value);
    value.type = Type.BLOCK_LITERAL;
    pair.commentBefore = formatComment(t.defaultValue);
    pair.spaceBefore = true;
    doc.contents.add(pair);
  });
  await writeFile(filePath, doc.toString());
}
