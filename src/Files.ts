import fs from 'fs';
import { AbsolutePath } from './Filepath';

export interface Files {
  createFile(filepath: AbsolutePath, content: string): void;
  recurseDirectory(
    filepath: AbsolutePath,
    callback: (path: AbsolutePath) => unknown
  ): void;

  require(path: AbsolutePath): any;
}

export class NodeFiles implements Files {
  require(path: AbsolutePath): any {
    return require(path.absolute);
  }

  createFile(filepath: AbsolutePath, content: string): void {
    if (filepath.type !== 'file') {
      throw new Error(
        'Cannot create a file to a directory path ' + filepath.absolute
      );
    }

    if (!fs.existsSync(filepath.dirname)) {
      fs.mkdirSync(filepath.dirname, { recursive: true });
    }
    if (fs.existsSync(filepath.absolute)) {
      if (fs.readFileSync(filepath.absolute, 'utf8') === content) {
        return;
      }
    }

    fs.writeFileSync(filepath.absolute, content, {
      encoding: 'utf8',
    });
  }

  recurseDirectory(
    filepath: AbsolutePath,
    callback: (path: AbsolutePath) => unknown
  ): void {
    if (filepath.type !== 'dir') {
      throw new Error(
        'Cannot recurse a directory from a file path' + filepath.absolute
      );
    }

    fs.readdirSync(filepath.absolute).forEach(relativePath => {
      const { absolute } = filepath.addRelative(relativePath, 'file');

      const stat = fs.statSync(absolute);

      if (stat.isDirectory()) {
        this.recurseDirectory(
          AbsolutePath.fromAbsolute(absolute, 'dir'),
          callback
        );
      }

      if (stat.isFile()) {
        callback(AbsolutePath.fromAbsolute(absolute, 'file'));
      }
    });
  }
}

interface Data {
  // eslint-disable-next-line @typescript-eslint/ban-types
  modules: { [filepath: string]: Object };
  createdFiles: { [filepath: string]: string };
  recurseResult: { [filepath: string]: AbsolutePath[] };
}

export const makeInMemoryFiles = (args: Partial<Data>): [Files, Data] => {
  const data: Data = {
    modules: {},
    createdFiles: {},
    recurseResult: {},
    ...args,
  };

  const files: Files = {
    createFile(filepath: AbsolutePath, content: string): void {
      data.createdFiles[filepath.absolute] = content;
    },
    recurseDirectory(
      filepath: AbsolutePath,
      callback: (path: AbsolutePath) => unknown
    ): void {
      if (!data.recurseResult[filepath.absolute]) {
        throw new Error(`No recurse result for ${filepath.absolute}`);
      }

      data.recurseResult[filepath.absolute].forEach(callback);
    },
    require(path: AbsolutePath): any {
      if (!data.modules[path.absolute]) {
        throw new Error(`No module for ${path.absolute}`);
      }
      return data.modules[path.absolute];
    },
  };

  return [files, data];
};
