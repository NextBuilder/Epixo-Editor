# Changelog

Notable changes to Epixo. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Repository layout: `apps/web`, `apps/editor`, `runtime`, `engine`, `tests`.
- Unit tests that export every template on all 113 boards and check Design Doctor.
- GitHub Actions: CI, pixel verification on LVGL 8.4, 9.2, 9.4 and 9.6, CodeQL, dependency review and Dependabot.
- Design Doctor finds widgets or screens whose names would clash in generated code, with a one-click fix.
- Design Doctor warns when two pieces of text overlap.
- Published screens and profile photos can be stored in Cloudflare KV when R2 is not set up, with edge caching for fast loading.
- Every build is smoke-tested: CI starts the site and checks every page before anything ships.

### Fixed
- The Activity Rings template overlapped its text on round displays, and the Energy template did on very narrow screens. Both now lay out cleanly on all 113 boards in both orientations.
- Two widgets on one screen could get the same name (by renaming, pasting or AI), which broke the exported code. Names are now always kept unique.
- Screen names that differ only by symbols or letter case ("Home-1" and "home 1") no longer clash in generated code.

### Security
- The session cookie uses the `__Host-` prefix in production.
- The test sign-in is refused on HTTPS even if `DEV_LOGIN` is set.

## [0.5.0] - 2026-10-13

### Added
- iOS-style motion system: spring curves, page transitions, scroll reveals, sheets, like burst, counters, shimmer loading and a sliding navigation indicator. All of it turns off with Reduce Motion.

## [0.4.0] - 2026-10-13

### Added
- Maker profiles with headline, location, skills, 12 kinds of social links and a pinned project.
- "Available for work" with hire requests, an inbox and daily limits.
- Following makers, and a searchable makers directory.
- Profile photo uploads.

## [0.3.0] - 2026-10-09

### Added
- Community: publish projects with LVGL-rendered screens, likes, comments, reports and remix with credit.
- Accounts with GitHub and Google sign-in, saving to the cloud, dashboard and AI credits.
- Website pages: home, boards, templates, docs, pricing, privacy and terms.

## [0.2.0] - 2026-10-09

### Added
- Editor with LVGL 9.2 compiled to WebAssembly, 113 boards, 13 widgets and 8 templates.
- Exports: C for LVGL 8.4 and 9.x, LVGL XML, ESPHome YAML, MicroPython and PlatformIO board packs.
- Design Doctor, Live Mirror and AI design.
- Verification suite comparing every export pixel by pixel.

[Unreleased]: https://github.com/NextBuilder/Epixo-Editor/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/NextBuilder/Epixo-Editor/releases/tag/v0.5.0
[0.4.0]: https://github.com/NextBuilder/Epixo-Editor/releases/tag/v0.4.0
[0.3.0]: https://github.com/NextBuilder/Epixo-Editor/releases/tag/v0.3.0
[0.2.0]: https://github.com/NextBuilder/Epixo-Editor/releases/tag/v0.2.0
