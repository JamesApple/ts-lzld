import { AbsolutePath } from './Filepath';
import { CompleteEntrypointOptions } from './options';
import { Runtime } from './Runtime';
import { ConstructorLike, MetadataLike } from './types';

export class Codegen<T extends ConstructorLike, M extends MetadataLike> {
  constructor(
    private filepath: AbsolutePath,
    private opts: CompleteEntrypointOptions,
    private runtime: Runtime<T, M>
  ) {}

  template: TemplaterFunction<T, M> = (fragments, ...funcs) => {
    if (!this.shouldGenerate) {
      return;
    }

    const makeImportFn = (name: string, path: string) => (importAs: string) => {
      if (name === 'default') {
        return `import ${importAs} from '${path}';`;
      }
      if (importAs === name) {
        return `import { ${name} } from '${path}';`;
      }
      return `import { ${name} as ${importAs} } from '${path}';`;
    };

    const exportFn = (name: string, path: string) => (importAs: string) => {
      if (importAs === name) {
        return `export { ${name} } from '${path}';`;
      }
      return `export { ${name} as ${importAs} } from '${path}';`;
    };

    const entries: EntrypointInfo<T, M>[] = this.runtime.entries.map(e => {
      const absoluteEntryPath = this.runtime.opts.searchPath.addRelative(
        e.path,
        'file'
      );
      const importablePath =
        this.filepath.getImportablePathTo(absoluteEntryPath);

      return {
        entry: this.runtime.load(e).entry,
        importablePath,
        exportedAs: e.name,
        meta: e.meta,
        importStatement: makeImportFn(e.name, importablePath),
        exportStatement: exportFn(e.name, importablePath),
      };
    });

    const data = fragments.reduce(
      (current, fragment, index) =>
        `${current}${this.resolveTemplateString(
          funcs[index - 1],
          entries
        )}${fragment}`,
      ''
    );

    this.opts.files.createFile(this.filepath, data);
  };

  private resolveTemplateString(
    func: GenerateFunction<T, M> | undefined,
    entries: EntrypointInfo<T, M>[]
  ) {
    if (func == null) {
      return '';
    }
    if (typeof func === 'string') {
      return func;
    }
    const result = func({ entries });
    if (Array.isArray(result)) {
      return result.join('\n');
    }
    return result;
  }

  private get shouldGenerate() {
    return this.runtime.opts.generate;
  }
}

interface EntrypointInfo<T extends ConstructorLike, M extends MetadataLike> {
  entry: T;
  meta: M;
  exportedAs: string;
  importablePath: string;
  importStatement: (as: string) => string;
  exportStatement: (as: string) => string;
}

interface GenerateArgs<T extends ConstructorLike, M extends MetadataLike> {
  entries: EntrypointInfo<T, M>[];
}

type GenerateFunction<T extends ConstructorLike, M extends MetadataLike> =
  | ((args: GenerateArgs<T, M>) => string | string[])
  | string;

export interface TemplaterFunction<
  T extends ConstructorLike,
  M extends MetadataLike
> {
  (
    fragments: TemplateStringsArray,
    ...generateFunctions: GenerateFunction<T, M>[]
  ): void;
}
