import { Generator } from './Generator';
import { completeOptions, EntrypointOptions } from './options';
import { Runtime } from './Runtime';
import { ConstructorLike, MetadataLike } from './types';

export class Entrypoint<T extends ConstructorLike, M extends MetadataLike> {
  static init: Init = (supertype, args) => {
    const options = completeOptions(args);
    if (options.generate) {
      const generator = new Generator(supertype, options);
      generator.generate();
    }
    return new Entrypoint(new Runtime(supertype, options));
  };

  private constructor(private runtime: Runtime<T, M>) {}

  find(matcher: (meta: M) => boolean): T | undefined {
    const entry = this.runtime.entries.find(entry => matcher(entry.meta));
    if (entry) {
      return this.runtime.load(entry);
    }
  }
}

interface Init {
  <T extends ConstructorLike, M extends MetadataLike>(
    supertype: T,
    opts: EntrypointOptions<T, M>
  ): Entrypoint<T, M>;
}
