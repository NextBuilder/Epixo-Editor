# Contributing

Thank you for helping make Epixo better.

## Ways to help

| You want to | Do this |
|---|---|
| Report a bug | Open a [bug report](https://github.com/NextBuilder/Epixo-Editor/issues/new?template=bug_report.yml). A project file or a screenshot helps a lot. |
| Request a board | Use the [board request](https://github.com/NextBuilder/Epixo-Editor/issues/new?template=board_request.yml) form with a link to its product page. |
| Suggest a feature | Open a [feature request](https://github.com/NextBuilder/Epixo-Editor/issues/new?template=feature_request.yml) that describes what you are trying to build. |
| Report a security problem | Follow the [security policy](SECURITY.md). Never use a public issue. |

## Code contributions

Epixo is developed by Next Builder and is not open source (see [LICENSE](LICENSE)). Pull requests are welcome when they fix a reported issue. Please open or comment on the issue first so we can agree on the approach.

Every pull request runs the full test suite, a build of the site and security scanning, and is reviewed by a maintainer. By opening a pull request you agree that your contribution may be used and distributed as part of Epixo under its current or any future licence.

### Running the checks

| Command | What it checks |
|---|---|
| `npm run check` | Unit tests for the editor core, the AI tools and the MCP server, and the website type check |
| `tests/verify.sh v8.4.0 v9.2.2 v9.4.0 v9.6.0` | Builds every test project with real LVGL and compares the exported C pixel for pixel with the editor |
| `npm --prefix apps/web run smoke` | Opens every page of a local build (`npm --prefix apps/web run cf:build`, then `npx opennextjs-cloudflare preview`) |
| `npm run e2e` | Drives the website and the editor in a real browser as a maker and a client: settings, social links, likes, comments, notifications, hiring, new widgets, actions, pictures, Try it and export. Needs Playwright and a local build with test sign-in |

## Code of conduct

Be kind. See the [code of conduct](CODE_OF_CONDUCT.md).
