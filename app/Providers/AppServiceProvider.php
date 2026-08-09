<?php

namespace App\Providers;

use App\Data\SitemapData;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind the host account-shell provider over beam-accounts' NullAccountShellProvider default,
        // so the packaged <AccountShell> renders real (neutral demo) plan/profile data OOTB.
        $this->app->bind(
            \Splicewire\Beam\Accounts\Contracts\AccountShellProvider::class,
            \App\Account\StarterAccountShell::class,
        );
    }

    /**
     * Bootstrap any application services.
     *
     * NOTE: the sitemap resource is NOT registered here. It is declared entirely by the single
     * `#[ParticleResource]` on {@see SitemapData}, which beam's attributed discovery
     * reflects into the admin manifest at boot (config `frame.discover_paths` points the scan at
     * `app/Data`). Dropping one annotated Data class IS the wiring — no provider line, no second
     * declaration, no handler-map entry.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->registerSharedMigrations();
    }

    /**
     * Register the beam "shared" migrations directory with the default migrator.
     *
     * OOTB-wiring note (frontend-surfaces): beam-ux (and the wider beam estate) publish their
     * `beam_ux_entries` / `sitemaps` / particle migrations as PUBLISH-ONLY stubs into
     * `database/migrations/shared/` — a subdirectory the stock Laravel migrator does NOT scan.
     * In a tenant host, `splicewire/laravel-beam-tenancy` registers this path in both the central
     * and per-tenant passes. This starter is single-tenant (no beam-tenancy), so nothing registers
     * it and `php artisan migrate` silently skips the beam substrate. Registering it here makes the
     * published beam tables migrate on a plain `migrate`.
     */
    protected function registerSharedMigrations(): void
    {
        $shared = database_path('migrations/shared');

        if (is_dir($shared)) {
            $this->loadMigrationsFrom($shared);
        }
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
