# LZLD (Lazy Load)

> Code splitting, Lazy Loading, and [Active Code Generation](https://wiki.c2.com/?ActiveCodeGeneration) without transpilers for Typescript and NodeJS backends.

## What is this for?

1. **Lazy People** Generate always-in-sync boilerplate files to handle
   union types, HTTP routing, or factory functions.
1. **Monoliths** Code splitting and generation reduces the need for
   microservices or other architectures to improve performance.
1. **Documentation** Active Codegen allows metadata to be written on classes
   which can be used to generate always-in-sync docs.
1. **Serverless Apps** Cold starts and strange architecture requirements are some of
   the most common reasons for companies to avoid serverless. By only requiring
   the code that's needed when it's needed [Mono-Lambda][monolambda]
   architectures are possible which reduce both cost and cold start times
   regardless of how much code you shove in there.

## How?

1. **0 Dependencies** Uses simple `fs` and `require()` calls to generate
   metadata about each of your entrypoints.
1. **Not a framework** `lzld` can be used with any standard API framework and
   is mostly unopinionated
1. **Valid when compiled** Evaluates entrypoints immediately to ensure the
   correct types are exported from your handlers.
1. **Code Splitting** By creating metadata files about your entrypoints during
   development production apps boot instantly and only load code on demand.
1. **Active Code Generation** Generates code/configuration in local development
   that is always up to date with your code.
1. **True Lazy Loading** Uses generated, source controlled metadata instead of
   inspecting the filesystem at runtime.
1. **Class Static Properties as Metadata** Typescript still does not expose
   much metadata about types so using class static methods/properties are the
   simplest way to share metadata between compile time and runtime.

## How does it look?

At its most basic it's use is a call to `Entrypoint.init(Superclass,
{...options})` to generate (dev) or load (prod) the entrypoint metadata.

Afterwards calling `entrypoint.find((metadata) => boolean)` will load a
specific entrypoint using the metadata you generate in `init`.



### What about a whole app?

This sample shows how you _might_ structure your application to add lazyloading
to handlers.

Here is the file structure:
```
src/
  serve.ts
  users/
    api/
      GetUsers.handler.ts
      AddUser.handler.ts
  pdfs/
    api/
      GeneratePDF.handler.ts
  utils/
    APIHandler.ts
  metadata/
     handlers.generated.json
```

And here are some of the files:
<!-- tabs:start -->

## **serve.ts**

This file is the entrypoint to the application and is the only place `lzld`
needs to interact with.


```typescript
import { APIHandler } from './utils/APIHandler'

// This is the only file that needs to import lzld
import { Entrypoint } from 'lzld'

// By default code generation only happens when NODE_ENV === 'development'

// Types for the handler and metadata callback are infered by the passed
// APIHandler base class:          👇
const myHandlers = Entrypoint.init(APIHandler, {
  __filename,
  // The location that we store our generated metadata
  metadataFilepath: './metadata/handlers.generated.json',
  // Regex to match the files that export an APIHandler subclass
  match: /([a-zA-Z0-9]+).handler.ts$/,
  // The additional metadata that will be available in the metadata file and
  // the find function below. This must be JSON serializable.
  // The subclassed APIHandler
  //            👇    Regex result.
  //                  Capture group [1] has the name of the handler
  //                   👇
  getMetadata: (target, { result: [, name] }) => ({
    name,
    //  http is defined as a static variable APIHandler class
    //   You can add any variable or method to be overwritten by the subclass
    //            👇
    path: target.http.path,
    method: target.http.method,
  }),
});


export const serve = ({ path, method }): Promise<unknown> => {

  // Real express/serverless routing is omitted for brevity.
  const Handler = myHandlers.find((meta => meta.path == path && meta.method == method }))
  if(!Handler) {
    throw new Error('No handler for that path')
  }

  // NOTE: Using a DI container like tsyringe here would simplify providing
  // dependencies from other services
  const instance = new Handler()

  return await instance.handle()
}
```

## **handlers.generated.json**

This file is generated when `process.env.NODE_ENV === 'development'` by default.

```json
{
  "//": "This file is auto-generated in 'serve.ts'",
  "lzld": "generated",
  "entries": [
    {
      // What the entrypoint was exported as. This is a default export.
      "name": "default",
      // An importable path without `.js/.ts/.jsx/.tsx` to allow running in
      // built environment.
      "path": "./api/GetUser.handler",
      // The metadata you pass from the `getMetadata` parameter to `Entrypoint.init`
      "meta": {
        "name": "GetUser",
        "path": "/users/:id",
        "method": "get"
      }
    },
      // ...others
    {
      // This is a named export
      "name": "GeneratePDF",
      "path": "./api/GeneratePDF.handler",
      "meta": {
        "name": "GeneratePDF",
        "path": "/generate/pdf",
        "method": "post"
      }
    }
  ]
}
```

## **APIHandler.ts**

This is the base class that all the other entrypoints must extend. Only exports
that extend this class will be picked up by the entrypoint

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

## **GetUsers.ts**

`lzld` has no opinions about the code you write as long as at least one
`APIHandler` class is exported from a file matching the `match` regex.

As you can see we are extending a vanilla JS class and implementing our own
interfaces.


```typescript
import { APIHandler } from '../utils/APIHandler';

export default class GetUser extends APIHandler {
  static http = {
    path: '/users/:id',
    method: 'get',
  } as const;

  async handle(): Promise<unknown> {
    return { status: 'ok' };
  }
}
```


<!-- tabs:end -->

## Active code generation


Now that you have the entrypoint defined you can also generate supporting files
using template string literal syntax. Each interpolated variable can be a
function which will be provided all of the entrypoints when generated.

<!-- tabs:start -->

## **serve.ts**
```typescript
// Continued from above serve.ts file.

entrypoint.codegen('./allHandlers.ts')
`// This is a generated file. All of my exports will be rendered below

// Export/import helpers resolve to the correct export name and can be aliased
// to anything
${({entries}) => entries.map(({ exportStatement, meta }) => exportStatement(meta.name))}

// Any strings/logic can be used to generate this file but it should be the same in production/dev
`
```

## **allHandlers.ts (Generated)**

```typescript
// This is a generated file. All of my exports will be rendered below

// Export/import helpers resolve to the correct export name and can be aliased
// to anything
export { default as GetUser } from './GetUser.handler';
export { GeneratePDF } from './GeneratePDF.handler';

// Any strings/logic can be used to generate this file but it should be the same in production/dev
```

<!-- tabs:end -->


[monolambda]:https://docs.aws.amazon.com/lambda/latest/operatorguide/monolith.html
