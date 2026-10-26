# Changelog

Notable changes to Epixo. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Actions: give any button, card, icon, label, switch, checkbox, slider or dropdown a name under **Run code**, and the export calls your own function when it is tapped or changed. C exports declare `ui_action_<name>()` in `ui.h` with empty weak defaults, so the project builds before you write yours and a new export never overwrites it. MicroPython gets `ui.actions`, ESPHome gets one script per action, and LVGL XML registers each callback. Try it shows which action a tap runs.
- The export README now explains how to change widgets from firmware, with a starter function for every action.
- A new guide, Connecting your firmware.
- Social links for 31 platforms, added and removed from an iOS-style picker in Settings and shown with each platform's own mark.

### Changed
- One icon family across the website and the editor (Phosphor), with real brand marks for social links.
- The home page shows real LVGL renders, a Design Doctor list and the firmware code you write, in place of coloured icon cards.
- Scroll and entrance animations are shorter, and LVGL thumbnails you have already seen draw instantly.
- Maker cards no longer show empty slots for makers with fewer than three projects.
- The Activity rings template spaces its goals evenly on tall, narrow screens such as the T-Display-S3.

### Fixed
- The home and pricing pages no longer scroll sideways on phones.

## [0.7.0] - 2026-10-26

### Added
- Notifications for likes, comments, new followers, hire requests and remixes, with a bell in the header. Repeat likes and follows from the same person do not pile up.
- A Following feed in the community, showing new work from makers you follow.
- Save any project and find it again under Saved.
- Your projects as a grid of real LVGL thumbnails, with duplicate and delete.
- An account menu with quick links to projects, requests, saved, profile, AI connections and settings.
- Light, dark and automatic appearance across the whole site, shared with the editor.
- In Settings: download all your data, sign out of every device, and delete your account.

### Changed
- The whole website is redesigned: Apple system type, a calm grey palette with one blue, pill buttons, a glass navigation bar, grouped lists, segmented controls and much less text on every page.
- Profiles are centred like a contact card, with a soft colour wash in place of the dark banner.
- Comments read like a chat, with a composer that sends on Enter.
- Avatars without a photo get a gradient that stays the same for each maker everywhere.

### Security
- Sign-in links can no longer redirect to another site through paths like `/\example.com`.
- Requests with an `Origin: null` header are refused cleanly instead of failing.
- Reports must point at a real project and count once per person.
- Uploaded images are served with a sandboxing Content Security Policy.
- The site sends `object-src 'none'` and `X-Frame-Options: DENY`, and expired sessions are cleared at sign-in.

## [0.6.0] - 2026-10-26

### Added
- A redesigned editor that feels like a native app: the canvas fills the window under floating glass panels, with spring motion, sliding segmented controls, light and dark mode that follows your system, focus mode, zoom to the pointer, space-drag panning and pinch to zoom on touch screens.
- An Ask AI bar under the canvas. It edits the open screen or builds a new one while you watch, and every AI change is one undo step. Press / to use it.
- A welcome for first-time makers: pick a popular board, then start from an idea, a blank screen or a sentence for AI, followed by three short tips.
- Design from Claude, ChatGPT and other AI apps over MCP. Make a private link at /connect, add it as a connector, and changes appear in the open editor within seconds with a note saying who made them.
- A local MCP server in `apps/mcp` that needs no packages. It saves projects as files, serves the editor with a live two-way link, renders screens with real LVGL so the AI can see its work, and exports code to a folder.
- One set of AI tools in `core.js`, shared by the editor, the local server and the website, with tests.
- A Designing with AI guide in the docs.

### Changed
- Panels and thumbnails redraw much faster: rendered screens and template previews are cached.
- Pressing on the canvas ends typing in a field, so shortcuts like Delete and ⌘Z act on the design.
- Preview is now called Try it.

## [0.5.1] - 2026-10-16

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

[Unreleased]: https://github.com/NextBuilder/Epixo-Editor/compare/v0.7.0...HEAD
[0.7.0]: https://github.com/NextBuilder/Epixo-Editor/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/NextBuilder/Epixo-Editor/compare/v0.5.1...v0.6.0
[0.5.1]: https://github.com/NextBuilder/Epixo-Editor/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/NextBuilder/Epixo-Editor/releases/tag/v0.5.0
[0.4.0]: https://github.com/NextBuilder/Epixo-Editor/releases/tag/v0.4.0
[0.3.0]: https://github.com/NextBuilder/Epixo-Editor/releases/tag/v0.3.0
[0.2.0]: https://github.com/NextBuilder/Epixo-Editor/releases/tag/v0.2.0
