import { APIHandler } from '../APIHandler';

export default class GetUser extends APIHandler {
  static http = {
    path: '/users/:id',
    method: 'get',
  } as const;

  async handle(): Promise<unknown> {
    return { status: 'ok' };
  }
}
