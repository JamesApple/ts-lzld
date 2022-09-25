import path from 'path';
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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

    const maybe = require(absolutePath)?.default;
    if (!(maybe?.prototype instanceof this.supertype)) {
      throw new Error(
        `lzld expected ${this.supertype.name} but got ${maybe ?? 'undefined'}`
      );
    }
    return maybe as T;
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
