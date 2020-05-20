import YAML from 'yaml';
import { resolve, dirname } from 'path';
import { promises } from 'fs';

import type { TranslatedYaml } from './types';

const { readFile, mkdir, writeFile } = promises;

function hoistKey(obj: any) {
  const { key, ...rest } = obj;
  return key === undefined ? rest : { key, ...rest };
}
function getUnique(o: any, n: any) {
  const keys = Object.keys(o).concat(Object.keys(n));
  return Array.from(new Set(keys));
}

function inflate(key: string, val: any, obj: any): any {
  const [frag, ...rest] = key.split('.');
  if (frag.startsWith('[') && frag.endsWith(']')) {
    const [_i, subKey] = frag.slice(1, -1).split(':');
    const i = parseInt(_i);
    const arr = obj || [];
    arr[i] = hoistKey({
      ...inflate(rest.join('.'), val, arr[i]),
      key: subKey,
    });
    // Object.keys(obj)
    return arr;
  }
  if (rest.length === 0) {
    return hoistKey({
      ...obj,
      [key]: val,
    });
  } else if (key) {
    return hoistKey({
      ...obj,
      [frag]: inflate(rest.join('.'), val, obj[frag]),
    });
  }
}

function getStructure(yamls: TranslatedYaml[]) {
  return yamls.reduce(
    (o: any, t) => ({ ...o, [t.path]: inflate(t.sig, t.update || t.value, o[t.path]) }),
    {},
  );
}

// old, new
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
    const res = n.map((item) => {
      if (!item.key) {
        return item;
      }
      const match = o.find(({ key }) => key === item.key);
      return merge(match, item);
    });
    // add old items to the end
    o.forEach((item) => {
      if (!res.find(({ key }) => key === item.key)) {
        res.push(item);
      }
    });
    return res;
  }
  // if it's an object...
  const res: { [key: string]: any } = { ...n };
  getUnique(o, n).forEach((key) => {
    res[key] = merge(o[key], n[key]);
  });
  return hoistKey(res);
}

async function writeYaml(contentDir: string, file: string, values: any) {
  // check if the file open
  const path = resolve(contentDir, file);
  const dir = dirname(path);
  let data = values;
  // merge with existing values if they exist
  try {
    const fileContent = await readFile(path, 'utf8');
    const existingData = await YAML.parse(fileContent);
    data = merge(existingData, data);
  } catch (e) {
    // do nothing
  }
  // write the file
  const newData = await YAML.stringify(data);
  await mkdir(dir, { recursive: true });
  await writeFile(path, newData);
}

export default async function write(yamls: TranslatedYaml[], contentDir: string) {
  const structure = getStructure(yamls);
  await Promise.all(
    Object.keys(structure).map((key) => writeYaml(contentDir, key, structure[key])),
  );
}
