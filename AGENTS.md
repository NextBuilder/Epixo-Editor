# Engineering rules

Guidance for anyone changing this codebase.

- Run `npm run check` before every commit. Run `tests/verify.sh` when `apps/editor/core.js`, `runtime/` or `tests/` change.
- `apps/editor/` has no build step and no framework. Keep it that way. Logic belongs in `core.js` with a test in `tests/unit/`.
- Never edit a migration that has shipped. Add a new numbered file in `apps/web/migrations/`.
- Never commit secrets or local settings files.
- Keep the security model intact: same-origin checks on every change, rate limits, Zod validation of every input, the Content Security Policy, hashed session tokens, and no test sign-in on HTTPS.
- All animation goes through `apps/web/src/app/motion.css` and must respect reduced motion.
- Interface text is plain, friendly English in sentence case, written for beginners.
- Code is simple and direct, with comments only where the code cannot speak for itself.
- Next.js 16.4 needs `@opennextjs/cloudflare` 1.20.13 or newer, so upgrade them together; CI smoke-tests every page.
- Images live in R2 when the `MEDIA` binding exists, otherwise in KV (`MEDIA_KV`). Always go through `src/lib/media.ts`.
- Every commit is authored and committed as `Kishan Pratap Singh <158418132+NextBuilder@users.noreply.github.com>`, with no co-author or session lines, pushed straight to `main`. Set this with `git config user.name` and `git config user.email` before the first commit.
