export type ConstructorLike = new (...args: any[]) => any;
export type MetadataLike = Record<string, unknown>;

export type Entry<M extends MetadataLike> = {
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
  absolutePath: string;
  relativePath: string;
}
