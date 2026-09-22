# TODO

## `npm audit` — 15 vulnerabilities in Sanity CLI tooling (deferred 2026-09-22)

`npm audit` shows 15 vulnerabilities, all in Sanity's CLI/build tooling
(adm-zip, js-yaml, smol-toml, uuid via `@sanity/cli`). Fixing requires
`npm audit fix --force`, which bumps `sanity` to `5.14.1` — a breaking
change. Deferred as of 2026-09-22 since none of these ship in the
visitor-facing bundle (they're Node-only CLI dependencies used by local
`sanity dev`/`build`/`deploy` commands, not the Studio UI actually
rendered to visitors at `/studio`). Revisit and upgrade+retest the Sanity
CMS integration when there's time to properly verify Studio still works
after the bump.
