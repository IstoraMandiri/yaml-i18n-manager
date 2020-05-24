import YAML from 'yaml';
import { resolve, relative } from 'path';
import { promises } from 'fs';
import { hash, K_SEP } from './utils';
const { readdir, readFile } = promises;

import type { ExistingYaml, Config, TranslatedYaml } from './types';

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

async function scanDir(opts: Config, dir?: string): Promise<ParsedFile[]> {
  const { contentDir, yamlDir } = opts;
  const target = dir || contentDir;
  const dirEntries = await readdir(target, { withFileTypes: true });
  const files = await Promise.all(
    dirEntries.map((entry): any => {
      const res = resolve(target, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === yamlDir) {
          return null;
        }
        return scanDir(opts, res);
      }
      if (entry.name.endsWith('.yaml') && !entry.name.includes('.collection.')) {
        return parseFile(contentDir, res);
      }
    }),
  );
  return Array.prototype.concat(...files.filter((i) => i));
}

function addSig(t: any): ExistingYaml {
  return { ...t, fullSig: `${t.path.split('.').slice(0, -2).join('.')}/${t.sig}` };
}

function flatten<T extends Record<string, any>>(
  object: T,
  path: string | null = null,
  separator = K_SEP,
): T {
  // TODO just return it if it's already flat...
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
      newPath = [path, k].filter(Boolean).join(separator);
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
          addSig({
            path,
            locale,
            sig,
            key: sig.split(K_SEP).slice(-1)[0],
            value: flat[sig],
            vHash: hash(flat[sig]),
          }),
        ],
        [],
      ),
    ];
  }, []);
}

async function parseKeyStore({ contentDir, yamlDir }: Config): Promise<ExistingYaml[]> {
  const targetDir = `${contentDir}/${yamlDir}`;
  const dirEntries = await readdir(targetDir, { withFileTypes: true });
  const files = await Promise.all(
    dirEntries.map(
      async (entry): Promise<any> => {
        if (entry.name !== 'config.yaml' && entry.name.endsWith('.yaml')) {
          const [locale] = entry.name.split('.');
          const data = await readFile(resolve(targetDir, entry.name), 'utf8');
          const yaml = await YAML.parse(data);
          return Object.keys(yaml).map((k) => {
            const value = yaml[k];
            const frags = k.split('/');
            const [sig] = frags.slice(-1);
            const [key] = sig.split(K_SEP).slice(-1);
            const path = `${frags.slice(0, -1).join('/')}.${locale}.yaml`;
            return addSig({
              path,
              locale,
              sig,
              key,
              value,
              vHash: hash(value),
            });
          });
        }
      },
    ),
  );
  return Array.prototype.concat(...files.filter((i) => i));
}

function dedupe(items: ExistingYaml[]) {
  return items.reduce(
    (a: any, t) =>
      a.find((t2: any) => t2.fullSig === t.fullSig && t2.locale === t.locale) ? a : [...a, t],
    [],
  );
}

export default async function read(config: Config): Promise<ExistingYaml[]> {
  const files = normalize(await scanDir(config));
  const keys = await parseKeyStore(config);
  return dedupe([...files, ...keys]);
}
