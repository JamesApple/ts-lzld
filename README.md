# LZLD (Lazy Load)

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

> Lazy loading application entrypoints for serverless and monolith applications

## Install

```bash
npm install lzld
```

## Usage

1. Define a base class for the entrypoint type you want to lazy load. This
   might be an HTTPAPI handler, gRPC service or SQS event handler.

```typescript
export class APIHandler {
  static http: {
    path: string;
    method: 'post' | 'get' | 'put' | 'delete';
  };

  handle(): Promise<unknown> {
    throw new Error('Not implemented');
  }
}
```

2. Implement your entrypoint in a directory that you will match
   using a regular expression. The handler must be the default
   export of the file.

```typescript
export default class GetUsers extends APIHandler {
  static http = { path: '/users/:userId', method: 'post' }

  async handle() { /* implement */ }
}
```

3. Define an entrypoint set in your application.

```typescript
const apiHandlers = Entrypoint.init(APIHandler, {
  __filename,
  match: /([a-zA-Z0-9]+).handler.ts$/,
  metadataFilepath: './apihandler.generated.json',
  getMetadata: (target) => ({
    path: target.http.path,
    method: target.http.method,
  }),
});
```

4. Use `Entrypoint#find` to lazy load your handler class lazily

```typescript
const Handler = apiHandlers.find(({path, method}) => /* routing logic */)
```


[build-img]:https://github.com/jamesapple/ts-lzld/actions/workflows/release.yml/badge.svg
[build-url]:https://github.com/jamesapple/ts-lzld/actions/workflows/release.yml
[downloads-img]:https://img.shields.io/npm/dt/lzld
[downloads-url]:https://www.npmtrends.com/lzld
[npm-img]:https://img.shields.io/npm/v/lzld
[npm-url]:https://www.npmjs.com/package/lzld
[issues-img]:https://img.shields.io/github/issues/jamesapple/ts-lzld
[issues-url]:https://github.com/jamesapple/ts-lzld/issues
[semantic-release-img]:https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]:https://github.com/semantic-release/semantic-release
[commitizen-img]:https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]:http://commitizen.github.io/cz-cli/
