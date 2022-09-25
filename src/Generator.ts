import { ConstructorLike, GeneratedFileData, MatchedPath } from './types';
import fs from 'fs';
import path from 'path';
import { version } from '../package.json';
import { CompleteEntrypointOptions } from './options';
import { resolveEntrypoint } from './helper';

export class Generator {
  constructor(
    private supertype: ConstructorLike,
    private opts: CompleteEntrypointOptions
  ) {}

  generate(): GeneratedFileData {
    const matches = this.getMatches();

    const entries = matches.map(match => {
      return {
        path: match.relativePath,
        meta: this.opts.getMetadata(
          resolveEntrypoint(this.supertype, match.absolutePath),
          match
        ),
      };
    });

    const fileData: GeneratedFileData = {
      '//': `This file is auto-generated in '${this.opts.sourceFilename}'`,
      lzld: version,
      entries,
    };

    fs.writeFileSync(
      this.opts.absoluteMetadataFilePath,
      JSON.stringify(fileData, null, 2)
    );
    return fileData;
  }

  getMatches(): MatchedPath[] {
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
            absolutePath: nextPath,
            result: match,
            relativePath: this.getRelativePathToHandler(nextPath),
          });
        }
      });
    };
    collectPaths(this.opts.absolutePathPrefix);

    return paths;
  }

  private getRelativePathToHandler(absolute: string) {
    const filepath = absolute.replace(this.opts.absolutePathPrefix + '/', '');

    const dirname = path.dirname(filepath);
    const filename = path.parse(filepath).name;

    return path.join(dirname, filename);
  }
}
