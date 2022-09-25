import { expect } from 'chai';
import { AbsolutePath } from '../src/Filepath';

it('provides a relative path to a file', function () {
  const base = AbsolutePath.fromAbsolute('/my/dir', 'dir');
  const file = AbsolutePath.fromAbsolute('/my/dir/file.ts', 'file');

  expect(base.relativePathTo(file)).to.equal('./file.ts');
});

it('provides a relative path to a directory', function () {
  const base = AbsolutePath.fromAbsolute('/my/dir', 'dir');
  const dir = AbsolutePath.fromAbsolute('/my/dir/subdir/nested', 'dir');

  expect(base.relativePathTo(dir)).to.equal('./subdir/nested');
});

it('provides a relative path to a file from a file', function () {
  const base = AbsolutePath.fromAbsolute('/my/dir/source.tsx', 'file');
  const dir = AbsolutePath.fromAbsolute('/my/dir/target.tsx', 'file');

  expect(base.relativePathTo(dir)).to.equal('./target.tsx');
});

it('provides a relative path to a file from a file', function () {
  const base = AbsolutePath.fromAbsolute('/my/dir/source.tsx', 'file');
  const dir = AbsolutePath.fromAbsolute('/my/dir/nested/target.tsx', 'file');

  expect(base.relativePathTo(dir)).to.equal('./nested/target.tsx');
});

it('provides a relative path to the same dir', function () {
  const base = AbsolutePath.fromAbsolute('/my/dir/source.tsx', 'file');
  const dir = AbsolutePath.fromAbsolute('/my/dir', 'dir');

  expect(base.relativePathTo(dir)).to.equal('./');
});

it('provides a relative path to the same dir', function () {
  const base = AbsolutePath.fromAbsolute('/my/dir', 'dir');
  const dir = AbsolutePath.fromAbsolute('/my/dir', 'dir');

  expect(base.relativePathTo(dir)).to.equal('./');
});

it('provides an importable path to a typescript module', () => {
  const base = AbsolutePath.fromAbsolute('/my/dir/here/source.ts', 'file');
  const file = AbsolutePath.fromAbsolute('/my/target.ts', 'file');

  expect(base.getImportablePathTo(file)).to.equal('../../target');
});
