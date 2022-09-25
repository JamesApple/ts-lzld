import path from 'path';
import { ConstructorLike, MatchedPath, MetadataLike } from './types';

export interface EntrypointOptions<
  T extends ConstructorLike = ConstructorLike,
  M extends MetadataLike = MetadataLike
> {
  /**
   * Which typescript files export an entrypoint.
   * @example
   * ```typescript
   * /([a-zA-Z0-9]+).handler.ts$/
   * ```
   */
  match: RegExp;
  /**
   * Metadata about the entrypoint that can be used to locate the correct
   * entrypoint.
   * @example
   * ```typescript
   * (handler, { result: [, name] }) => ({
   *   path: handler.http.path,
   *   method: handler.http.method,
   *   name,
   * })
   * ```
   */
  getMetadata?: (target: T, match: MatchedPath) => M;
  /**
   * Allows changing the root where entrypoints will be loaded from.
   * @default '.'
   */
  searchPath?: string;
  metadataFilepath: string;
  /**
   * This should be the nodejs global __filename so that require statements can
   * be correctly resolved and generated.
   *
   * Using anything other than `__filename` will result in incorrect behaviour.
   */
  __filename: string;

  /**
   * # Whether we should generate a metadata file for this entrypoint.
   *
   * This imports all the entrypoints and generates a metadata file using their
   * class names and the metadata returned by `getMetadata`.
   *
   * @default
   * ```typescript
   *   process.env.NODE_ENV === 'development'
   * ```
   */
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
