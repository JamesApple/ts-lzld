import fs from 'fs';
import { AbsolutePath } from './Filepath';
import { ConstructorLike } from './types';

export interface ResolvedEntrypoint<T extends ConstructorLike> {
  name: string;
  entry: T;
}

export const resolveEntrypoint = <T extends ConstructorLike>(
  supertype: T,
  absolutePath: AbsolutePath
): ResolvedEntrypoint<T> => {
  const resolved = require(absolutePath.absolute);
  const exports = Object.entries(resolved);

  const entrypoint = exports.find(([, exported]) => {
    if (typeof exported !== 'function') return false;
    return exported.prototype instanceof supertype;
  });

  if (!entrypoint) {
    throw new Error(
      `lzld expected a ${supertype.name} to be exported from ${absolutePath.absolute} but found none`
    );
  }

  return {
    name: entrypoint[0],
    entry: entrypoint[1] as T,
  };
};

export const createFile = (filepath: AbsolutePath, content: string): void => {
  if (!fs.existsSync(filepath.dirname)) {
    fs.mkdirSync(filepath.dirname, { recursive: true });
  }
  fs.writeFileSync(filepath.absolute, content);
};
