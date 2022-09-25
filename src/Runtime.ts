import { ResolvedEntrypoint, resolveEntrypoint } from './helper';
import { CompleteEntrypointOptions } from './options';
import {
  ConstructorLike,
  Entry,
  GeneratedFileData,
  MetadataLike,
} from './types';

export class Runtime<T extends ConstructorLike, M extends MetadataLike> {
  constructor(private supertype: T, public opts: CompleteEntrypointOptions) {}

  get entries(): Entry<M>[] {
    return this.config.entries as Entry<M>[];
  }

  load({
    path: relativePath,
  }: GeneratedFileData['entries'][number]): ResolvedEntrypoint<T> {
    const target = this.opts.searchPath.addRelative(relativePath, 'file');
    return resolveEntrypoint(this.supertype, target);
  }

  private get config(): GeneratedFileData {
    const config = require(this.opts.metadataFile.absolute);
    if (config?.lzld == null) {
      throw new Error(
        `lzld: invalid metadata file referenced at ${this.opts.metadataFile.absolute} from ${this.opts.sourceFile.absolute}`
      );
    }
    return config;
  }
}
