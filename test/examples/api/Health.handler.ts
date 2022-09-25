import { APIHandler } from '../APIHandler';

export default class Health extends APIHandler {
  static http = {
    path: '/health',
    method: 'get',
  } as const;

  async handle(): Promise<unknown> {
    return { status: 'ok' };
  }
}
