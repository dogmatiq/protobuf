<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://dogmatiq.io/res/img/dynamic/repo/protobuf/banner/dark.svg">
  <img alt="Dogmatiq protobuf" src="https://dogmatiq.io/res/img/dynamic/repo/protobuf/banner/light.svg" height="44">
</picture>

The Protocol Buffers and gRPC schema used by [Dogma] engines and their clients.

[![API reference](https://dogmatiq.io/res/img/dynamic/repo/protobuf/badge/docs.svg)](https://pkg.go.dev/github.com/dogmatiq/protobuf)
[![Latest version](https://dogmatiq.io/res/img/dynamic/repo/protobuf/badge/semver.svg)](https://github.com/dogmatiq/protobuf/releases)
[![Build status](https://dogmatiq.io/res/img/dynamic/repo/protobuf/badge/build.svg)](https://github.com/dogmatiq/protobuf/actions/workflows/ci.yml)
[![Code coverage](https://dogmatiq.io/res/img/dynamic/repo/protobuf/badge/coverage.svg)](https://codecov.io/github/dogmatiq/protobuf)

</div>

This repository contains Dogma's schema — the `.proto` definitions for
envelopes, identities, UUIDs and the engine's messaging gRPC APIs. It is not a
Protocol Buffers implementation.

Each release publishes generated code for every supported language from a
single tag:

- Go — the `github.com/dogmatiq/protobuf` module
- TypeScript and JavaScript — the [`@dogmatiq/protobuf`][npm] npm package

Both include the `.proto` files at the same paths they have in this
repository, so that other schemas can import them, for example:

```proto
import "github.com/dogmatiq/protobuf/uuidpb/uuid.proto";
```

## Packages

| Package         | Protocol Buffers package | Contents                                   |
| --------------- | ------------------------ | ------------------------------------------ |
| `uuidpb`        | `dogma.protobuf.v1`      | `UUID`                                     |
| `configpb`      | `dogma.config.v1alpha1`  | `Application`, `Handler` (unstable)        |
| `identitypb`    | `dogma.protobuf.v1`      | `Identity`                                 |
| `envelopepb`    | `dogma.protobuf.v1`      | `Envelope`, `MultiEnvelope` and extensions |
| `messaginggrpc` | `dogma.messaging.v1`     | The event stream consumer API              |
| `metricsgrpc`   | `dogma.metrics.v1alpha1` | The metrics API (unstable)                 |
| `enginegrpc`    | `dogma.engine.v1alpha1`  | The engine and projection APIs (unstable)  |

## Message data

The engine treats `Message.data` as opaque. The message type, identified by
`Message.type_id`, determines how the data is decoded. Applications that
exchange messages between programs written in different languages must use an
encoding that every participating language can decode. We recommend Protocol
Buffers.

## TypeScript

The npm package is ESM-only. It uses [protobuf-es] as its runtime.

```sh
npm install @dogmatiq/protobuf
```

Each package has its own entry point:

```ts
import { getExtension } from "@dogmatiq/protobuf/envelopepb";
import { uuidToString } from "@dogmatiq/protobuf/uuidpb";
```

The package doesn't depend on any gRPC library. The generated service
descriptors work with any transport that supports protobuf-es, such as
[Connect-ES], whose gRPC transport is compatible with `grpc-go` clients and
servers.

`uint64` and `int64` fields, such as event stream offsets and the components of
a `UUID`, are represented as `bigint` values.

### Importing from your own schema

If your own `.proto` files import Dogma's, tell `protoc` where to find them, and
tell `protoc-gen-es` to import the generated code from this package:

```sh
protoc \
  --proto_path=. \
  --proto_path=github.com/dogmatiq/protobuf=node_modules/@dogmatiq/protobuf \
  --plugin=protoc-gen-es=node_modules/.bin/protoc-gen-es \
  --es_out=. \
  --es_opt=target=ts,import_extension=js \
  --es_opt=map_imports=github.com/dogmatiq/protobuf/:@dogmatiq/protobuf \
  your/schema.proto
```

The generated code then imports from paths such as
`@dogmatiq/protobuf/github.com/dogmatiq/protobuf/uuidpb/uuid_pb.js`, which the
package exports for this purpose.

<!-- references -->

[connect-es]: https://github.com/connectrpc/connect-es
[dogma]: https://github.com/dogmatiq/dogma
[npm]: https://www.npmjs.com/package/@dogmatiq/protobuf
[protobuf-es]: https://github.com/bufbuild/protobuf-es
