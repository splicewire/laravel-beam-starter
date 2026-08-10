> You are in **splicewire/laravel-beam-starter** — the Laravel + React starter kit for scaffolding new beam-tier applications.

A Laravel starter kit (Inertia + React 19 + TypeScript + Tailwind + shadcn/ui) that scaffolds new
applications on the `splicewire/laravel-beam` stack, installed via the beam-tier installer
(`composer setup` → `splicewire:beam:install`).

## Vendored family-package conventions

Any repo that vendors another family repo's code (composer `vendor/<vendor>/<pkg>/`, npm
`node_modules/<vendor>/<pkg>/`) checks that vendored repo's own `AGENTS.md` for conventions it
ships with itself before editing through into it.
