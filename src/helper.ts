import { AbsolutePath } from './Filepath';
import { Files } from './Files';
import { ConstructorLike } from './types';

export interface ResolvedEntrypoint<T extends ConstructorLike> {
  name: string;
  entry: T;
}

export const resolveEntrypoint = <T extends ConstructorLike>(
  supertype: T,
  absolutePath: AbsolutePath,
  files: Files
): ResolvedEntrypoint<T> => {
  const resolved = files.require(absolutePath);
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
