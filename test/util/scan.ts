import { resolve, relative } from 'path';
import { promises } from 'fs';
const { readdir, readFile } = promises;

export default async function scan(root: string, dir?: string): Promise<any[]> {
  const target = dir || root;
  const dirEntries = await readdir(target, { withFileTypes: true });
  const files = await Promise.all(
    dirEntries.map(async (entry) => {
      const res = resolve(target, entry.name);
      return entry.isDirectory()
        ? scan(root, res)
        : { fileName: relative(process.env.PWD, res), content: await readFile(res, 'utf8') };
    }),
  );
  return Array.prototype.concat(...files);
}
