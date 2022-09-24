export class APIHandler {
  static http: {
    path: string;
    method: 'post' | 'get' | 'put' | 'delete';
  };

  handle(): Promise<unknown> {
    throw new Error('Not implemented');
  }
}
