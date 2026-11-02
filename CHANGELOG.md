# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog], and this project adheres to
[Semantic Versioning].

<!-- references -->

[keep a changelog]: https://keepachangelog.com/en/1.0.0/
[semantic versioning]: https://semver.org/spec/v2.0.0.html
[bc]: https://github.com/dogmatiq/.github/blob/main/VERSIONING.md#changelogs

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
[0.1.0]: https://github.com/dogmatiq/protobuf/releases/tag/v0.1.0
[0.2.0]: https://github.com/dogmatiq/protobuf/releases/tag/v0.2.0

<!-- version template
## [0.0.1] - YYYY-MM-DD

### Added
### Changed
### Deprecated
### Removed
### Fixed
### Security
-->
