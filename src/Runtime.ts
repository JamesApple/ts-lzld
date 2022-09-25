import path from 'path';
import { resolveEntrypoint } from './helper';
import { CompleteEntrypointOptions } from './options';
import {
  ConstructorLike,
  Entry,
  GeneratedFileData,
  MetadataLike,
} from './types';

export class Runtime<T extends ConstructorLike, M extends MetadataLike> {
  constructor(private supertype: T, private opts: CompleteEntrypointOptions) {}

  get entries(): Entry<M>[] {
    return this.config.entries as Entry<M>[];
  }

  load({ path: relativePath }: GeneratedFileData['entries'][number]): T {
    const absolutePath = path.resolve(
      this.opts.absolutePathPrefix,
      relativePath
    );

    return resolveEntrypoint(this.supertype, absolutePath);
  }

  get config(): GeneratedFileData {
    const config = require(this.opts.absoluteMetadataFilePath);
    if (config?.lzld == null) {
      throw new Error(
        `Invalid configuration file at ${this.opts.absoluteMetadataFilePath}`
      );
    }
    return config;
  }
}
