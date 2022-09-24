import { Entrypoint } from '../../src/Entrypoint';
import { APIHandler } from './APIHandler';

const entry = Entrypoint.init(APIHandler, {
  __filename,
  metadataFilepath: './apihandler.generated.json',
  match: /([a-zA-Z0-9]+).handler.ts$/,
  generate: true,
  getMetadata: (target, { result: [, name] }) => ({
    name,
    path: target.http.path,
    method: target.http.method,
  }),
});

const klass = entry.find(({ name }) => name === 'GetUser');

console.log(klass);
