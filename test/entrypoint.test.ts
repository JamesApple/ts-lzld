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

class BaseClass {
  static type: string;
}

class RedInstance extends BaseClass {
  static type = 'red';
}

class BlueInstance extends BaseClass {
  static type = 'blue';
}

describe('Entrypoint', () => {
  it('should not fail if generate is false on load', async function () {
    const [files] = makeInMemoryFiles({});

    const entry = Entrypoint.init(BaseClass, {
      __filename: filename,
      __private: { files },
      generate: false,
      match: /correct.ts$/,
      metadataFilepath: 'metadata.json',
    });
  });

  it('should fail if attempting to read metadata and it is invalid', async function () {
    const [files] = makeInMemoryFiles({
      modules: {
        [metadata]: {},
      },
    });

    const entry = Entrypoint.init(BaseClass, {
      __filename: filename,
      __private: { files },
      generate: false,
      match: /correct.ts$/,
      metadataFilepath: 'metadata.json',
    });

    expect(() => entry.find(() => true)).to.throw(
      `lzld: invalid metadata file referenced at ${metadata} from ${filename}`
    );
  });

  let generated: GeneratedFileData;
  it('should generate the metadata file', async function () {
    const [files, data] = makeInMemoryFiles({
      modules: {
        [redPath]: { redInstance: RedInstance },
        [bluePath]: { default: BlueInstance },
      },
      recurseResult: {
        [root]: [
          AbsolutePath.fromAbsolute(redPath, 'file'),
          AbsolutePath.fromAbsolute(bluePath, 'file'),
        ],
      },
    });

    Entrypoint.init(BaseClass, {
      generate: true,
      __filename: filename,
      __private: { files },
      match: /\/([a-zA-Z0-9]+).ts$/,
      metadataFilepath: 'metadata.json',
      getMetadata: (target, { result: [, name] }) => ({
        name,
        type: target.type,
      }),
    });

    expect(data.createdFiles[metadata]).to.exist;
    generated = JSON.parse(data.createdFiles[metadata]);
    expect(generated).to.matchSnapshot();
  });

  it('should succeed in loading a module', async function () {
    const [files] = makeInMemoryFiles({
      modules: {
        [importableRedPath]: { redInstance: RedInstance },
        [metadata]: generated,
      },
    });

    const entry = Entrypoint.init(BaseClass, {
      __filename: filename,
      __private: { files },
      generate: false,
      match: /correct.ts$/,
      metadataFilepath: 'metadata.json',
      getMetadata: (target, { result: [, name] }) => ({
        name,
        type: target.type,
      }),
    });

    const Instance = entry.find(({ type }) => type === 'red');
    expect(Instance).to.equal(RedInstance);

    // Missing entry
    expect(() => entry.find(({ type }) => type === 'blue')).to.throw(
      'No module for /my-projects/project/different/path/to/blue'
    );
  });
});
