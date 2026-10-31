<div align="center">

# Dogma Protocol Buffers Schema

The Protocol Buffers and gRPC schema used by [Dogma] engines and their clients.

[![Documentation](https://img.shields.io/badge/go.dev-documentation-007d9c?&style=for-the-badge)](https://pkg.go.dev/github.com/dogmatiq/protobuf)
[![Latest Version](https://img.shields.io/github/tag/dogmatiq/protobuf.svg?&style=for-the-badge&label=semver)](https://github.com/dogmatiq/protobuf/releases)
[![Build Status](https://img.shields.io/github/actions/workflow/status/dogmatiq/protobuf/ci.yml?style=for-the-badge&branch=main)](https://github.com/dogmatiq/protobuf/actions/workflows/ci.yml)
[![Code Coverage](https://img.shields.io/codecov/c/github/dogmatiq/protobuf/main.svg?style=for-the-badge)](https://codecov.io/github/dogmatiq/protobuf)

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
| `identitypb`    | `dogma.protobuf.v1`      | `Identity`                                 |
| `envelopepb`    | `dogma.protobuf.v1`      | `Envelope`, `MultiEnvelope` and extensions |
| `messaginggrpc` | `dogma.messaging.v1`     | The event stream consumer API              |

## Message data

The engine treats `Message.data` as opaque. The message type, identified by
`Message.type_id`, determines how the data is decoded. Applications that
exchange messages between programs written in different languages must use an
encoding that every participating language can decode. We recommend Protocol
Buffers.

## TypeScript

The npm package is ESM only and requires Node.js 20 or later and TypeScript 5.7
or later. It uses [protobuf-es] as its runtime, which you must install
yourself:

```sh
npm install @dogmatiq/protobuf @bufbuild/protobuf
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

<!-- references -->

[connect-es]: https://github.com/connectrpc/connect-es
[dogma]: https://github.com/dogmatiq/dogma
[npm]: https://www.npmjs.com/package/@dogmatiq/protobuf
[protobuf-es]: https://github.com/bufbuild/protobuf-es
