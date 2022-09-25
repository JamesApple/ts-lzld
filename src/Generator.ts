import {
  ConstructorLike,
  Entry,
  GeneratedFileData,
  MatchedPath,
  MetadataLike,
} from './types';
import fs from 'fs';
import path from 'path';
import { CompleteEntrypointOptions } from './options';
import { resolveEntrypoint } from './helper';
import { AbsolutePath } from './Filepath';

export class Generator {
  constructor(
    private supertype: ConstructorLike,
    private opts: CompleteEntrypointOptions
  ) {}

  generate(): GeneratedFileData {
    const matches = this.getMatches();

    const entries: Entry<MetadataLike>[] = matches.map(match => {
      const relative = this.opts.searchPath.getImportablePathTo(match.path);
      const { name, entry } = resolveEntrypoint(this.supertype, match.path);
      return {
        name,
        path: relative,
        meta: this.opts.getMetadata(entry, match),
      };
    });

    const fileData: GeneratedFileData = {
      '//': `This file is auto-generated in '${this.opts.sourceFile.completeFilename}'`,
      lzld: 'generated',
      entries,
    };

    fs.writeFileSync(
      this.opts.metadataFile.absolute,
      JSON.stringify(fileData, null, 2)
    );
    return fileData;
  }

  private getMatches(): MatchedPath[] {
    const paths: MatchedPath[] = [];

    const collectPaths = (dir: string) => {
      fs.readdirSync(dir).forEach(file => {
        const nextPath = path.resolve(dir, file);
        const stat = fs.statSync(nextPath);

        if (stat.isDirectory()) return collectPaths(nextPath);
        if (!stat.isFile()) return;

        const match = this.opts.match.exec(nextPath);
        if (match) {
          paths.push({
            path: AbsolutePath.fromAbsolute(nextPath, 'file'),
            result: match,
          });
        }
      });
    };
    collectPaths(this.opts.searchPath.dirname);

    return paths;
  }
}
