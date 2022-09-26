# LZLD _(Pronounced 'lazy load')_

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

> 0 Dependency code splitting, lazy loading, and [active code generation](https://wiki.c2.com/?ActiveCodeGeneration) without transpilers for Typescript and NodeJS backends.

## [Read the Docs](https://jamesapple.github.io/ts-lzld/)


## Install

```bash
npm install lzld
```

## TLDR;

### Lazy Loading (for an HTTP API)

1. Define a base class all your entrypoints will extend (Plain Old Javascript Class)

```typescript
export class APIHandler {
  static http: {
    method: 'POST' | 'PUT' | 'GET'
    path: string
  }

  async handle(): Promise<unknown> {
    throw new Error('Not implemented')
  }
}
```

2. Define an entrypoint with that base class
```typescript
const myHandlers = Entrypoint.init(APIHandler, {
  __filename,
  metadataFilepath: './metadata/handlers.generated.json',
  match: /([a-zA-Z0-9]+).handler.ts$/,
  getMetadata: (target, { result: [, name] }) => ({
    name,
    path: target.http.path,
    method: target.http.method,
  }),
});
```

3. Write a bunch of handlers in any nested path like
   `./features/api/users/GetUser.handler.ts` that implement your base class

4. Lazy load a handler with express routing or anything that returns a boolean
```typescript
const Handler = myHandlers.find(({ path }) => matchPath(path, somePassedPath))
```

### Code Generation

Generate some random `.yaml` file for serverless/ansible/etc with template
   literal syntax
```typescript
myHandlers.codegen('./all_routes.yaml')
`routes:
${({entries}) => entries.map(({ meta }) => `${meta.name}: '${meta.method} ${method.path}'`)}
`
```

Generates `./all_routes.yaml`:

```yaml
routes:
  GetUsers: 'GET /users/:userId'
  GeneratePDF: 'POST /pdf/generate'

...
```

## [Read the Docs](https://jamesapple.github.io/ts-lzld/)

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

