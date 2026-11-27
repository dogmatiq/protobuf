# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog], and this project adheres to
[Semantic Versioning].

<!-- references -->

[keep a changelog]: https://keepachangelog.com/en/1.0.0/
[semantic versioning]: https://semver.org/spec/v2.0.0.html
[bc]: https://github.com/dogmatiq/.github/blob/main/VERSIONING.md#changelogs

## [0.13.0] - 2026-11-28

This release reworks `MetricsAPI`, which is at `v1alpha1`, and the application
description in `configpb`. Every engine and client that uses either one has to
change.

### Added

- Added the `HandlerEventStreamStaleness` metric to `MetricsAPI`, for the
  creation time of the oldest event on one event stream that a handler has yet
  to handle or skip.

### Changed

- **[BC]** `MetricsAPI` now sends each metric in a typed `Sample`. A `Sample`
  holds a `metric` oneof with a case for each metric. Each metric's message
  holds its value and a `subject`, which has one of six new subject types, such
  as `QueueSubject`. A `Sample` whose value is absent is a tombstone. The metric
  index, the opaque subject, the `Tombstone` message and the metrics that an
  engine defines for itself are removed.
- **[BC]** Each command or deadline that is waiting to be delivered is now
  counted in exactly one metric: ready or failing for a command, and scheduled,
  ready or failing for a deadline. The `Due` metrics are renamed to `Ready`, the
  `Pending` metrics are removed, and `QueueDeadlinesScheduled` and
  `HandlerDeadlinesScheduled` are new.
- **[BC]** The metrics that count a handler's commands, deadlines and events now
  count the messages of one message type, which the `message_type_id` of the
  metric's subject identifies. A client adds up a handler's samples of a metric
  to get the count for every type.
- **[BC]** `configpb` now identifies message types by ID. An `Application` lists
  each message type as a `MessageType`, and a `Handler` lists its routes, each
  as a `Route` with a `RouteType`. They replace `MessageUsage` and the
  `messages` maps that were keyed by Go type.

### Removed

- **[BC]** Removed the `AggregateInstancesInMemory` and
  `ProcessInstancesInMemory` metrics from `MetricsAPI`.
- **[BC]** Removed the four `ProjectionCompactions` metrics from `MetricsAPI`.
  Use `GetCompactions` on `ProjectionAPI`, or the `ProjectionCompactionEnded`
  messages that `EngineAPI.WatchEngine` sends, instead.

## [0.12.0] - 2026-11-24

### Added

- Added `WatchMetricsResponse.Tombstone`, which `WatchNodeMetrics` and
  `WatchClusterMetrics` send to report that the engine has stopped reporting one
  metric of one subject.

### Changed

- **[BC]** `WatchNodeMetrics` now sends a `Tombstone`, instead of a `Sample`
  with a value of zero, for the current counts of work that moves to another
  node. A `Sample` with a value of zero means that the engine still measures the
  subject.
- **[BC]** Renamed the `value` field of each metric message that reports a
  cumulative count to `cumulative_count`, and of each that reports a current
  count to `current_count`. `EventStreamLength.value` is now `watermark`, and
  `HandlerEventStreamLag.value` is now `gauge`. The field numbers and the wire
  format are unchanged.

## [0.11.0] - 2026-11-24

### Added

- Added `ProjectionCompactionStarted` and `ProjectionCompactionEnded` to the
  messages that `EngineAPI.WatchEngine` sends, which report the compactions that
  the engine starts and the outcome of each.
- Added `GetCompactions` to `ProjectionAPI`, which reports what the node that
  serves the call knows about the compactions of one projection handler.
- Added `ProjectionResetStarted` and `ProjectionResetEnded` to the messages that
  `EngineAPI.WatchEngine` sends, which report the reset operations that the
  engine starts and the outcome of each.
- Added `GetResets` to `ProjectionAPI`, which reports what the node that serves
  the call knows about the reset operations of one projection handler.

### Removed

- **[BC]** Removed the `ProjectionCompactionState` and `ProjectionResetState`
  metrics from `MetricsAPI`, along with `Interval`. Use `GetCompactions` and
  `GetResets` on `ProjectionAPI` instead.

## [0.10.0] - 2026-11-23

### Added

- Added `WatchNodeMetrics` to `MetricsAPI`, which reports metrics about the
  node that serves the call.
- Added `WatchClusterMetrics` to `MetricsAPI`, which reports the metrics that
  describe a whole cluster. Any node of the cluster can serve it.
- Added the `HandlerEventStreamLag` metric to `MetricsAPI`, for the number of
  events that a handler has yet to handle or skip on one event stream.

### Changed

- **[BC]** Changed `supported_metrics` in `WatchMetricsResponse.Preamble` from
  a list of `SupportedMetric` messages to a list of strings. Each string is
  the value that was in `SupportedMetric.message_name`.
- **[BC]** Revisions in `WatchMetricsResponse.Sample` are now comparable only
  when they come from the same node.

### Removed

- **[BC]** Removed `WatchMetrics` from `MetricsAPI`, along with
  `WatchMetricsRequest`, `SupportedMetric` and `Reach`. Use `WatchNodeMetrics`
  and `WatchClusterMetrics` instead, which report the same metrics between
  them.
- **[BC]** Removed the `HandlerEventsPending` metric from `MetricsAPI`. Use
  `HandlerEventStreamLag` instead, which is per event stream and includes the
  events that the handler skips.

## [0.9.0] - 2026-11-22

### Added

- Added the `configpb` package, which describes an application and its handlers.
- Added the `metricsgrpc` package, which defines a service for reading engine
  metrics.
- Added the `enginegrpc` package, which defines a service that reports what an
  engine is and what it is doing, and a service that asks an engine to compact
  or reset the projections of its handlers.
- Added the optional `stream_length` field to `EventStreamSegment`, which tells
  a consumer where the end of the stream is, so that it can see how far behind
  it is.
- Added `ListEventStreams` to `EventStreamConsumerAPI`, which lists the event
  streams that a server offers and the length of each, without delivering any
  events.
- Added `ReadEventSegment` to `EventStreamConsumerAPI`, which returns the events
  in one range of a stream as a single segment. The end of the range is
  optional, and the server may return less than the whole range.

### Changed

- **[BC]** The minimum supported version of `@bufbuild/protobuf` is now v2.17.0.
- Documented that `WatchEvents` may send empty segments, with equal begin and
  end offsets, to tell the client that no new events have been appended to a
  stream.

## [0.8.0] - 2026-11-13

### Added

- Added Go `uuidpb.FromStd()` and `UUID.AsStd()` to convert between
  `*uuidpb.UUID` and `uuid.UUID` from Go's standard library.

### Changed

- **[BC]** The minimum supported Go version is now v1.27.
- Documented that `ReadEvents` returns `INVALID_ARGUMENT` for a missing or
  invalid stream ID.

## [0.7.0] - 2026-11-06

### Added

- Added Go `AsMultiEnvelopes()` and TypeScript `asMultiEnvelopes()` to group
  consecutive envelopes with equivalent headers into multi-envelopes while
  preserving message order.

### Changed

- **[BC]** TypeScript `getExtension()` and `getBaggage()` now throw when the
  requested value is absent. Use `tryGetExtension()` and `tryGetBaggage()`
  for the previous behavior of returning `undefined`. Both forms still throw
  when the selected value cannot be decoded.
- **[BC]** Changed `WatchEvents` to return `ABORTED` instead of
  `RESOURCE_EXHAUSTED` when a client cannot keep up, so that it can't be
  confused with `RESOURCE_EXHAUSTED` errors produced by gRPC itself or by
  proxies.

### Removed

- **[BC]** Removed `EventStreamConsumerTooSlow` and the Go helper
  `EventStreamConsumerTooSlowError()`. The `ABORTED` code alone identifies the
  error.
- **[BC]** Removed `UnrecognizedEventStream` and the Go helper
  `UnrecognizedEventStreamError()`. `ReadEvents` still returns `NOT_FOUND` for
  an unrecognized stream ID, without error details.

## [0.6.0] - 2026-11-06

### Added

- Restored `MultiEnvelope` and its Go and TypeScript batching, expansion and
  validation helpers.

### Changed

- **[BC]** Changed `EventStreamSegment.envelopes` to contain `MultiEnvelope`
  values again, preserving message order within and across multi-envelopes.

## [0.5.0] - 2026-11-06

### Added

- Added `MessageFilter` with explicit all-types and specific-types
  selections, and Go and TypeScript validation helpers.
- Added `EventStreamConsumerTooSlow` and the Go helper
  `EventStreamConsumerTooSlowError()` for `RESOURCE_EXHAUSTED` errors when a
  client cannot keep up and event stream delivery can no longer continue
  contiguously.

### Changed

- **[BC]** Changed `EventStreamSegment.envelopes` to contain individual
  `Envelope` values instead of `MultiEnvelope` values.
- **[BC]** Replaced `message_type_ids` in `WatchEventsRequest` and
  `ReadEventsRequest` with a required `filter`. Missing filters,
  filters with no selection, and empty specific-type selections are invalid
  and result in `INVALID_ARGUMENT` from either RPC.
- Clarified event matching, stream discovery and segment continuity requirements
  for `WatchEvents` and `ReadEvents`.
- Changed `WatchEvents` to return `RESOURCE_EXHAUSTED` with an attached
  `EventStreamConsumerTooSlow` detail when a client cannot keep up and delivery
  can no longer continue contiguously.

### Removed

- **[BC]** Removed `MultiEnvelope` and its Go and TypeScript batching,
  expansion and validation helpers. Use individual `Envelope` values instead.

### Fixed

- Fixed TypeScript `validateUUID()` accepting negative or overflowing UUID
  components when their version and variant bits were otherwise valid.

## [0.4.1] - 2026-11-04

### Added

- Added the TypeScript package to the public npm registry as
  `@dogmatiq/protobuf`.

## [0.4.0] - 2026-11-04

### Changed

- **[BC]** An empty `message_type_ids` in `WatchEventsRequest` and
  `ReadEventsRequest` now matches every event, instead of matching none.

## [0.3.0] - 2026-11-04

### Added

- Added `EventStreamConsumerAPI.WatchEvents`, a server-streaming method that
  delivers events of the requested message types as they are appended to any
  stream, for as long as the call is open. The first segment received for a
  stream tells the client that the stream exists and where the feed begins.
- Added `EventStreamConsumerAPI.ReadEvents`, which delivers the events of the
  requested message types from a single stream, from a given offset to the end
  of the stream, then closes.
- Added `EventStreamSegment`, the output of both methods. It describes the
  half-open range `[begin_offset, end_offset)` of one stream and carries the
  matching events within it.

### Removed

- **[BC]** Removed `EventStreamConsumerAPI.ListEventStreams`,
  `ListEventStreamsRequest`, `ListEventStreamsResponse` and `EventStream`.
  Streams are discovered from the segments delivered by `WatchEvents`.
- **[BC]** Removed `EventStreamConsumerAPI.ConsumeEvents`,
  `ConsumeEventsRequest` and `ConsumeEventsResponse` in favor of `ReadEvents`.
  The server no longer closes a call when it believes it cannot produce new
  events of the requested types; `ReadEvents` closes when it reaches the end
  of the stream.

## [0.2.0] - 2026-11-02

### Added

- Added `Header.Validate()`, `Body.Validate()` and `Message.Validate()` to the
  Go `envelopepb` package.
- Added `validateHeader()`, `validateBody()` and `validateMessage()` to the
  TypeScript `envelopepb` package.

### Changed

- **[BC]** `envelopepb.SetExtension()` and `SetBaggage()` now accept any value
  with the relevant getter and setter methods, such as a `*Header` or `*Body`,
  and accept the value to set as a `proto.Message`. They are no longer generic,
  so calls that specify type arguments explicitly must remove them.
- `setExtension()` and `setBaggage()` in the TypeScript `envelopepb` package now
  accept a `Header` or a `Body`.

### Fixed

- `envelopepb.SetExtension()` and `SetBaggage()` now panic if the value is a nil
  pointer, as well as when it is `nil`.

## [0.1.0] - 2026-11-02

- Initial release.

<!-- references -->

[unreleased]: https://github.com/dogmatiq/protobuf
[unreleased]: https://github.com/dogmatiq/protobuf
[0.1.0]: https://github.com/dogmatiq/protobuf/releases/tag/v0.1.0
[0.2.0]: https://github.com/dogmatiq/protobuf/releases/tag/v0.2.0
[0.3.0]: https://github.com/dogmatiq/protobuf/releases/tag/v0.3.0
[0.4.0]: https://github.com/dogmatiq/protobuf/releases/tag/v0.4.0
[0.4.1]: https://github.com/dogmatiq/protobuf/releases/tag/v0.4.1
[0.5.0]: https://github.com/dogmatiq/protobuf/releases/tag/v0.5.0
[0.6.0]: https://github.com/dogmatiq/protobuf/releases/tag/v0.6.0
[0.7.0]: https://github.com/dogmatiq/protobuf/releases/tag/v0.7.0
[0.8.0]: https://github.com/dogmatiq/protobuf/releases/tag/v0.8.0
[0.9.0]: https://github.com/dogmatiq/protobuf/releases/tag/v0.9.0
[0.10.0]: https://github.com/dogmatiq/protobuf/releases/tag/v0.10.0
[0.11.0]: https://github.com/dogmatiq/protobuf/releases/tag/v0.11.0
[0.12.0]: https://github.com/dogmatiq/protobuf/releases/tag/v0.12.0
[0.13.0]: https://github.com/dogmatiq/protobuf/releases/tag/v0.13.0

<!-- version template
## [0.0.1] - YYYY-MM-DD

### Added
### Changed
### Deprecated
### Removed
### Fixed
### Security
-->
