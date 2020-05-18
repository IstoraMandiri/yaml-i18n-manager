import { createHash } from 'crypto';

export default function (str: string): string {
  return createHash('sha256').update(str, 'utf8').digest('base64').slice(0, 10);
}
