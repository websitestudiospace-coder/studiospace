# TODO

## `npm audit`: remaining findings are all inside Sanity's tooling (re-checked 2026-10-07)

`npm audit` reports 21 findings (11 high, 10 moderate; 19 with `--omit=dev`). They
come from five packages: braces, js-yaml, smol-toml, sprintf-js and uuid, pulled in
by the `sanity` CLI/codegen tooling (`@sanity/cli`, `@vercel/frameworks`,
`typeid-js`) and, for braces, also by `eslint-config-next`'s glob dependencies.
They're used by local `sanity dev` / `build` / `deploy` and lint commands, not by
the pages visitors load.

The only fix npm offers is `npm audit fix --force`, which would move `sanity` back
to 5.14.1 (a breaking major-version change), so this is deferred until the Studio
can be upgraded and properly re-tested. Re-run `npm audit fix` (without `--force`)
after future Sanity releases. It may clear these once Sanity updates its
dependencies.

(2026-10-07: `next` was bumped to 16.3.6 for GHSA-vcvr-r3jv-pc5j. A non-breaking
`npm audit fix` also updated sharp, dompurify, adm-zip, undici, brace-expansion
and source-map-js, and moved `sanity` / `@sanity/vision` from 6.15 to 6.18.)

## Sanity content needs a rebuild to appear

Pages are statically generated without `revalidate`, so projects and press mentions
added in `/studio` show up only after the next build/deploy. Either add
`export const revalidate = <seconds>` to `/`, `/projects`, `/projects/[slug]` and
`/media`, or set up a Sanity webhook that triggers a redeploy.
