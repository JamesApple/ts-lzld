import {
  ConstructorLike,
  Entry,
  GeneratedFileData,
  MatchedPath,
  MetadataLike,
} from './types';
import { CompleteEntrypointOptions } from './options';
import { resolveEntrypoint } from './helper';

export class Generator {
  constructor(
    private supertype: ConstructorLike,
    private opts: CompleteEntrypointOptions
  ) {}

  generate(): void {
    const { files } = this.opts;

    const entries = this.getEntries();

    const fileData: GeneratedFileData = {
      '//': `This file is auto-generated in '${this.opts.sourceFile.completeFilename}'`,
      lzld: 'generated',
      entries,
    };

    files.createFile(this.opts.metadataFile, JSON.stringify(fileData, null, 2));
  }

  private getEntries(): Entry<MetadataLike>[] {
    const { files, searchPath, getMetadata } = this.opts;
    const matches = this.getMatches();

    return matches.map(match => {
      const relative = searchPath.getImportablePathTo(match.path);
      const { name, entry } = resolveEntrypoint(
        this.supertype,
        match.path,
        files
      );
      return {
        name,
        path: relative,
        meta: getMetadata(entry, match),
      };
    });
  }

  private getMatches(): MatchedPath[] {
    const paths: MatchedPath[] = [];
    const { match: matcher, searchPath, files } = this.opts;

    files.recurseDirectory(searchPath, path => {
      if (path.type === 'file') {
        const relativePath = searchPath.relativePathTo(path);
        const result = matcher.exec(relativePath);

        if (result) {
          paths.push({ path, result });
        }
      }
    });

    return paths;
  }
}
