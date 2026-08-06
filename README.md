# Laravel + React Starter Kit

## Introduction

Our React starter kit provides a robust, modern starting point for building Laravel applications with a React frontend using [Inertia](https://inertiajs.com).

Inertia allows you to build modern, single-page React applications using classic server-side routing and controllers. This lets you enjoy the frontend power of React combined with the incredible backend productivity of Laravel and lightning-fast Vite compilation.

This React starter kit utilizes React 19, TypeScript, Tailwind, and the [shadcn/ui](https://ui.shadcn.com) and [radix-ui](https://www.radix-ui.com) component libraries.

## Install (beam tier)

`composer setup` runs the beam tier installer — **`splicewire:beam:install`** — instead of a bare
`migrate`. The installer walks the `BeamInstallManifest` core-first (each beam-* package's publish tags),
then migrates once, so the beam stack lands in one command:

```bash
composer setup
# or, standalone, after key:generate:
php artisan splicewire:beam:install --no-interaction --force
```

**Prototyping ships in the bare install.** The starter requires
`splicewire/laravel-beam-ux-prototype`, so `splicewire:beam:install` also stamps the rushing-prototype
scaffold (`ui/src/_prototype/**` starter + `_chrome/nav.ts`) and the host-bound
`docs/agents/rushing-prototype.convention.template.md` — the package self-registers its step into
`BeamInstallManifest`. Confirm the wiring landed with `splicewire:beam:doctor` (the prototype audit
reports advisory), or drive the prototype tooling directly via
`php artisan splicewire:beam:ux:prototype:{install,doctor}`.

## Exposing a model in the admin — drop one annotated Data class

A model shows up in the Frame admin by dropping **one** `#[ParticleResource]`-annotated Data class into
`app/Data/`. That is the whole declaration — no second declaration, no `registerClass()` in a provider,
no handler-map entry. Beam's boot-time attributed discovery scans `app/Data` (config
`frame.discover_paths`), reflects the attribute into the admin manifest, and the resource appears at
`/frame/manifest` with its editor route wired.

The unified `#[ParticleResource]` carries the full manifest field set on the Data class itself — label,
model, nav placement (`group` / `section` / `navOrder` / `icon`), and route identity (`routeName`):

```php
#[ParticleResource(
    key: 'sitemap',
    model: SitemapRecord::class,
    label: 'Sitemap',           // a non-empty label marks the resource FRAMED (navigable + editable)
    group: 'Site',
    section: 'links',
    navOrder: 99,
    routeName: 'frame.resources.sitemap',
)]
class SitemapData extends Data { /* … Column-annotated fields … */ }
```

See `app/Data/SitemapData.php` for the worked example (the editable sitemap resource). Adding your own
resource is the same one-file move: annotate a Data class, drop it in `app/Data/`, done.

## Co-dev overlay (local package dev)

To develop against your local package checkouts in `~/Workspaces/laravel/packages/**` (symlinked into
`vendor/` — path repos win over the git `repositories` via `wikimedia/composer-merge-plugin`):

```bash
cp composer.local.json.off composer.local.json   # engage the overlay (gitignored active copy)
composer update                                   # resolve to local checkouts
php artisan splicewire:beam:install --no-interaction --force

rm composer.local.json && composer update         # reset to git-resolved
```

## Official Documentation

Documentation for all Laravel starter kits can be found on the [Laravel website](https://laravel.com/docs/starter-kits).

## Contributing

Thank you for considering contributing to our starter kit! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

All contributions to the Starter Kits from now on should be made through [Maestro](https://github.com/laravel/maestro).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## License

The Laravel + React starter kit is open-sourced software licensed under the MIT license.
