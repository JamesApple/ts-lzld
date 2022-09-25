import { ConstructorLike } from './types';

export const resolveEntrypoint = <T extends ConstructorLike>(
  supertype: T,
  absolutePath: string
): T => {
  const resolved = require(absolutePath);
  const exports = Object.values(resolved);

  const entrypoint = exports.find((exported): exported is T => {
    if (typeof exported !== 'function') return false;
    return exported.prototype instanceof supertype;
  });

  if (!entrypoint) {
    throw new Error(
      `lzld expected a ${supertype.name} to be exported from ${absolutePath} but found none`
    );
  }

  return entrypoint;
};
