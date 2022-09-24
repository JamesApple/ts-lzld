import path from 'path';
import { ConstructorLike, MatchedPath, MetadataLike } from './types';

export interface EntrypointOptions<
  T extends ConstructorLike = ConstructorLike,
  M extends MetadataLike = MetadataLike
> {
  match: RegExp;
  getMetadata?: (target: T, match: MatchedPath) => M;
  /**
   * Allows changing the root where entrypoints will be loaded from.
   */
  searchPath?: string;
  metadataFilepath: string;
  /**
   * This should be the nodejs global __filename so that require
   * statements can be correctly resolved and generated.
   */
  __filename: string;

  generate?: boolean;
}

export interface CompleteEntrypointOptions {
  match: RegExp;
  getMetadata: (target: ConstructorLike, match: MatchedPath) => MetadataLike;

  sourceFilename: string;

  absoluteMetadataFilePath: string;
  localPathPrefix: string;
  absolutePathPrefix: string;

  generate: boolean;
}

export const completeOptions = (
  opts: EntrypointOptions<any, any>
): CompleteEntrypointOptions => {
  const dirname = path.dirname(opts.__filename);
  return {
    getMetadata: opts.getMetadata ?? (() => ({})),
    match: opts.match,
    sourceFilename: path.basename(opts.__filename),
    localPathPrefix: opts.searchPath ?? '.',
    absolutePathPrefix: path.resolve(dirname, opts.searchPath ?? ''),
    generate: opts.generate ?? process.env.NODE_ENV === 'development',
    absoluteMetadataFilePath: path.resolve(dirname, opts.metadataFilepath),
  };
};
