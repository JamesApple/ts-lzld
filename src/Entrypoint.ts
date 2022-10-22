import { Codegen, TemplaterFunction } from './Codegen';
import { Generator } from './Generator';
import {
  CompleteEntrypointOptions,
  completeOptions,
  EntrypointOptions,
} from './options';
import { Runtime } from './Runtime';
import { ConstructorLike, LoadableMetadata, MetadataLike } from './types';

export class Entrypoint<T extends ConstructorLike, M extends MetadataLike> {
  static init: Init = (supertype, args) => {
    const options = completeOptions(args);

    if (options.generate) {
      const generator = new Generator(supertype, options);
      generator.generate();
    }

    return new Entrypoint(options, new Runtime(supertype, options));
  };

  private constructor(
    private opts: CompleteEntrypointOptions,
    private runtime: Runtime<T, M>
  ) {}

  findAll(matcher: (meta: M) => boolean): T[] {
    return this.runtime.entries
      .filter(entry => matcher(entry.meta))
      .map(entry => this.runtime.load(entry).entry);
  }

  find(matcher: (meta: M) => boolean): T | undefined {
    const entry = this.runtime.entries.find(entry => matcher(entry.meta));
    if (entry) {
      return this.runtime.load(entry).entry;
    }
  }

  get all(): LoadableMetadata<T, M>[] {
    return this.runtime.entries.map(e => {
      return { ...e.meta, load: () => this.runtime.load(e).entry };
    });
  }

  codegen(filepath: string): TemplaterFunction<T, M> {
    return new Codegen(
      this.opts.sourceFile.addRelative(filepath, 'file'),
      this.opts,
      this.runtime
    ).template;
  }
}

interface Init {
  <T extends ConstructorLike, M extends MetadataLike>(
    supertype: T,
    opts: EntrypointOptions<T, M>
  ): Entrypoint<T, M>;
}
