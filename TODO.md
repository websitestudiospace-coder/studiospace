# TODO

## `npm audit`: remaining findings are all inside Sanity's tooling (re-checked 2026-09-30)

`npm audit --omit=dev` still reports 16 findings (4 high, 12 moderate). They're all
pulled in by the `sanity` / `@sanity/vision` / `next-sanity` packages' CLI and build
tooling: adm-zip, js-yaml, smol-toml, uuid, and the undici copy under
`@module-federation`. They're used by local `sanity dev` / `build` / `deploy`
commands, not by the pages visitors load.

`npm audit fix --force` would move `sanity` to 5.14.1 (a breaking major-version
change), so this is deferred until the Studio can be upgraded and properly re-tested.

(nodemailer, the only direct runtime dependency that was flagged, was updated to
10.0.13 on 2026-09-30.)

## Sanity content needs a rebuild to appear

Pages are statically generated without `revalidate`, so projects and press mentions
added in `/studio` show up only after the next build/deploy. Either add
`export const revalidate = <seconds>` to `/`, `/projects`, `/projects/[slug]` and
`/media`, or set up a Sanity webhook that triggers a redeploy.
