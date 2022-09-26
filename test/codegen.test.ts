import { expect } from 'chai';
import { Entrypoint, GeneratedFileData } from '../src';
import { AbsolutePath } from '../src/Filepath';
import { makeInMemoryFiles } from '../src/Files';

const root = '/my-projects/project';
const filename = root + '/index.ts';
const metadata = '/my-projects/project/metadata.json';

const redPath = root + '/nested/path/to/red.ts';
const importableRedPath = root + '/nested/path/to/red';
const bluePath = root + '/different/path/to/blue.ts';
const importableBluePath = root + '/different/path/to/blue';

class BaseClass {
  static type: string;
}

class RedInstance extends BaseClass {
  static type = 'red';
}

class BlueInstance extends BaseClass {
  static type = 'blue';
}

const makeEntrypoint = () => {
  const [files, data] = makeInMemoryFiles({
    modules: {
      [redPath]: { RedInstance },
      [bluePath]: { default: BlueInstance },
      [importableRedPath]: { RedInstance },
      [importableBluePath]: { default: BlueInstance },
    },
    recurseResult: {
      [root]: [
        AbsolutePath.fromAbsolute(bluePath, 'file'),
        AbsolutePath.fromAbsolute(redPath, 'file'),
      ],
    },
  });

  const entry = Entrypoint.init(BaseClass, {
    __filename: filename,
    __private: { files },
    generate: true,
    match: /([a-z]+).ts$/,
    metadataFilepath: 'metadata.json',
    getMetadata: (target, { result: [, name] }) => ({
      name,
      type: target.type,
    }),
  });

  data.modules = {
    ...data.modules,
    [metadata]: JSON.parse(data.createdFiles[metadata]),
  };
  return [entry, data] as const;
};

describe('Codegen', () => {
  it('should not fail if generate is false on load', function () {
    const [entry, data] = makeEntrypoint();

    // eslint-disable-next-line prettier/prettier
    entry.codegen('../generated.kitchensink')
    `
# Import Statements
${({ entries }) =>
  entries.map(
    ({ meta: { name }, importStatement }) => `${importStatement(name)}`
  )}

# Export Statements
${({ entries }) =>
  entries.map(
    ({ meta: { name }, exportStatement }) => `${exportStatement(name)}`
  )}

# Metadata
${({ entries }) =>
  entries.map(({ meta }) => `type: ${meta.type} name: ${meta.name}`)}
    `;

    expect(
      data.createdFiles['/my-projects/generated.kitchensink']
    ).to.matchSnapshot();
  });
});
