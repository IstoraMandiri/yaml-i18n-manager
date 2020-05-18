import YAML from 'yaml';

import { resolve, dirname } from 'path';
import { promises } from 'fs';
import { replaceLocaleInPath } from './utils';

const { readFile, mkdir, writeFile } = promises;

function inflate(key: string, val: any, obj: any): any {
  const [frag, ...rest] = key.split('.');
  if (frag.startsWith('[') && frag.endsWith(']')) {
    const [_i, subKey] = frag.slice(1, -1).split(':');
    const i = parseInt(_i);
    const arr = obj || [];
    arr[i] = {
      ...inflate(rest.join('.'), val, arr[i]),
      key: subKey,
    };
    // Object.keys(obj)
    return arr;
  }
  if (rest.length === 0) {
    return {
      ...obj,
      [key]: val,
    };
  }
  if (key)
    return {
      ...obj,
      [frag]: inflate(rest.join('.'), val, obj[frag]),
    };
}

function getStructure(yamls: TranslatedYaml[]) {
  return yamls.reduce(
    (o: any, t) => ({ ...o, [t.path]: inflate(t.sig, t.update || t.value, o[t.path]) }),
    {},
  );
}

function merge(o: any, n: any): any {
  if (o === undefined) {
    return n;
  }
  if (n === undefined) {
    return o;
  }
  if (['string', 'boolean', 'number'].indexOf(typeof n) >= 0) {
    return n;
  }
  if (n instanceof Date) {
    return n;
  }
  // use `key` in arrays to match
  if (Array.isArray(n)) {
    if (!Array.isArray(o)) {
      return n;
    }
    return o.map((item) => {
      if (!item.key) {
        return item;
      }
      const match = n.find(({ key }) => key === item.key);
      return merge(item, match);
    });
  }
  // if it's an object...
  const res: { [key: string]: any } = { ...n };
  Object.keys(o).forEach((key) => {
    res[key] = merge(o[key], n[key]);
  });
  return res;
}

async function writeYaml(target: string, file: string, values: any) {
  // check if the file open
  const path = resolve(target, file);
  const dir = dirname(path);
  let data = values;
  // merge with existing values if they exist
  try {
    const fileContent = await readFile(path, 'utf8');
    const existingData = await YAML.parse(fileContent);
    data = merge(existingData, data);
    console.log({ existingData, data, values });
  } catch (e) {
    // do nothing
  }
  // write the file
  const newData = await YAML.stringify(data);
  await mkdir(dir, { recursive: true });
  await writeFile(path, newData);
}

export default async function write(yamls: TranslatedYaml[], target: string) {
  const structure = getStructure(yamls);
  await Promise.all(Object.keys(structure).map((key) => writeYaml(target, key, structure[key])));
}
