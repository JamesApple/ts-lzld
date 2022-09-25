import { AbsolutePath } from './Filepath';

export type ConstructorLike = new (...args: any[]) => any;
export type MetadataLike = Record<string, unknown>;
export type LoadableMetadata<
  T extends ConstructorLike,
  M extends MetadataLike
> = M & {
  load: () => T;
};

export type Entry<M extends MetadataLike> = {
  name: string;
  path: string;
  meta: M;
};

export interface GeneratedFileData<M extends MetadataLike = MetadataLike> {
  '//': string;
  lzld: string;
  entries: Entry<M>[];
}

export interface MatchedPath {
  result: RegExpExecArray;
  path: AbsolutePath;
}
