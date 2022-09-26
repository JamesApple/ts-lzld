import { expect } from 'chai';
import { Entrypoint } from '../../src/Entrypoint';
import { APIHandler } from './APIHandler';

const createValidEntrypoint = (generate: boolean) =>
  Entrypoint.init(APIHandler, {
    __filename,
    metadataFilepath: './apihandler.generated.json',
    match: /([a-zA-Z0-9]+).handler.ts$/,
    generate,
    getMetadata: (target, { result: [, name] }) => ({
      name,
      path: target.http.path,
      method: target.http.method,
    }),
  });

describe('Example: a valid entrypoint configuration', () => {
  after(() => createValidEntrypoint(true));

  it('does not immediately load handlers', function () {
    createValidEntrypoint(false);
    expect(isInRequireCache('./api/GetUser.handler')).to.be.false;
  });

  it('loads handlers using require when they are accessed', function () {
    const entrypoint = createValidEntrypoint(false);
    const klass = entrypoint.find(({ name }) => name === 'GetUser');
    expect(klass).to.exist;
    expect(isInRequireCache('./api/GetUser.handler')).to.be.true;
  });

  it('does not throw if no handler is matched', function () {
    const entrypoint = createValidEntrypoint(false);

    const klass = entrypoint.find(() => false);
    expect(klass).to.not.exist;
  });
});

const isInRequireCache = (path: string): boolean => {
  const absolutePath = require.resolve(path);
  return !!require.cache[absolutePath];
};

describe('Codegen', function () {
  it('generates a valid index file for all handlers', function () {
    const entrypoint = createValidEntrypoint(true);

    entrypoint.codegen('./api/index.ts')`${({ entries }) =>
      entries.map(({ exportStatement, meta }) => exportStatement(meta.name))}`;
  });
});
