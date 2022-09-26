import path from 'path';
interface Data {
  absolute: string;
  type: 'file' | 'dir';
}

export class AbsolutePath {
  static fromAbsolute(absolute: string, type: 'file' | 'dir'): AbsolutePath {
    return new AbsolutePath({ absolute, type });
  }

  constructor(private data: Data) {}

  get absolute(): string {
    return this.data.absolute;
  }

  get completeFilename(): string {
    return path.basename(this.absolute);
  }

  getImportablePathTo(importTarget: AbsolutePath): string {
    return this.relativePathTo(importTarget.withoutImportableExtension);
  }

  get type(): 'file' | 'dir' {
    return this.data.type;
  }

  get dirname(): string {
    if (this.data.type === 'file') {
      return path.dirname(this.absolute);
    } else {
      return this.absolute;
    }
  }

  relativePathTo(target: AbsolutePath): string {
    const relative = path.relative(this.dirname, target.absolute);
    if (relative.startsWith('..')) {
      return relative;
    } else {
      return './' + relative;
    }
  }

  addRelative(relativePath: string, type: 'file' | 'dir'): AbsolutePath {
    return AbsolutePath.fromAbsolute(
      path.resolve(this.dirname, relativePath),
      type
    );
  }

  get withoutImportableExtension(): AbsolutePath {
    if (this.data.type === 'dir') {
      return this;
    }
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    const ext = extensions.find(ext => this.absolute.endsWith(ext));
    if (ext) {
      return AbsolutePath.fromAbsolute(
        this.absolute.slice(0, -ext.length),
        'file'
      );
    }
    return AbsolutePath.fromAbsolute(this.absolute, 'file');
  }
}
