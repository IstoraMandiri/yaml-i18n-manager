import YAML from 'yaml';
import { resolve, relative } from 'path';
import { promises } from 'fs';
import { hash, K_SEP } from './utils';
const { readdir, readFile } = promises;

import type { ExistingYaml } from './types';

interface ParsedFile {
  absolutePath: string;
  relativePath: string;
  yaml: any[];
}

async function parseFile(targetDir: string, absolutePath: string): Promise<ParsedFile> {
  const data = await readFile(absolutePath, 'utf8');
  const yaml = await YAML.parse(data);
  return {
    absolutePath,
    relativePath: relative(targetDir, absolutePath),
    yaml,
  };
}

async function getFiles(root: string, dir?: string): Promise<ParsedFile[]> {
  const target = dir || root;
  const dirEntries = await readdir(target, { withFileTypes: true });
  const files = await Promise.all(
    dirEntries.map((entry): any => {
      const res = resolve(target, entry.name);
      if (entry.isDirectory()) {
        return getFiles(root, res);
      }
      if (entry.name.endsWith('.yaml') && !entry.name.includes('.collection.')) {
        return parseFile(root, res);
      }
    }),
  );
  return Array.prototype.concat(...files.filter((i) => i));
}

function flatten<T extends Record<string, any>>(
  object: T,
  path: string | null = null,
  separator = '__',
): T {
  return Object.keys(object).reduce((acc: T, key: string): T => {
    // always ignore `key` key
    // ignore non-strings
    if (key === 'key') {
      return acc;
    }
    let newPath = [path, key].filter(Boolean).join(separator);
    const i = key;
    const k = object?.[key].key;
    if (k) {
      newPath = [path, `[${i}:${k}]`].filter(Boolean).join(separator);
    }
    return typeof object?.[key] === 'object'
      ? { ...acc, ...flatten(object[key], newPath, separator) }
      : // filter non-strings
      typeof object[key] !== 'string'
      ? acc
      : { ...acc, [newPath]: object[key] };
  }, {} as T);
}

function normalize(files: ParsedFile[]): ExistingYaml[] {
  return files.reduce((a1, { yaml, relativePath: path }): any => {
    const [locale] = path.split('.').slice(-2);
    const flat = flatten(yaml) as { [k: string]: any };
    return [
      ...a1,
      ...Object.keys(flat).reduce(
        (a2, sig): any => [
          ...a2,
          {
            path,
            locale,
            sig,
            key: sig.split(K_SEP).slice(-1)[0],
            value: flat[sig],
            vHash: hash(flat[sig]),
          },
        ],
        [],
      ),
    ];
  }, []);
}

export default async function read(targetDir: string) {
  const files = await getFiles(targetDir);
  return normalize(files);
}
