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

  load({ path }: GeneratedFileData['entries'][number]): T {
    const maybe = require(path)?.default;
    if (maybe?.constructor !== this.supertype) {
      throw new Error(
        `lzld expected ${this.supertype.name} but got ${
          maybe?.constructor?.name ?? maybe ?? 'undefined'
        }`
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
