<?php

namespace Tests\Fixtures\HostContext;

use Illuminate\Routing\RouteCollection;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Rushing\Popcorn\Registries\Registrant;
use Schemastud\Frame\Registry\ContextGrain;
use Schemastud\Frame\Registry\WidgetContext;
use Schemastud\Frame\Registry\WidgetContextRegistry;
use Splicewire\Beam\Flows\FlowCatalog;
use Splicewire\Beam\Particle\ParticleResourceRegistry;

/**
 * A host's own render context, end to end, in tests only (frame-foundation 92, story 50). Nothing in app/ changes.
 *
 * It registers a record-grain context `card` that falls back to `list-item`, as this host, from boot() (the
 * registry's own rule: never register()). It also registers two resources that declare in it, the test page
 * that draws them, and that page's flow.
 *
 * The kit half lives in tests/Browser/host-context/: the page's entry hands the same context to beam-inertia's
 * `frameKit` bindings. This provider is registered by the tests that use it, never by the app.
 */
class HostContextProvider extends ServiceProvider
{
    public const CONTEXT = 'card';

    public const REGISTRANT = 'laravel-beam-starter/tests';

    public const ROUTE = 'testing.host-context';

    public function boot(): void
    {
        app(WidgetContextRegistry::class)->register(
            new WidgetContext(self::CONTEXT, ContextGrain::Record, fallback: ['list-item']),
            by: self::REGISTRANT,
        );

        $resources = app(ParticleResourceRegistry::class);
        $resources->registerClass(CardBoundData::class);
        $resources->registerClass(CardFallbackData::class);

        Registrant::scoped(self::REGISTRANT, fn () => app(FlowCatalog::class)->declare(HostContextFlows::class));

        // The page's own root view loads the test entry (tests/Browser/host-context), never the app's.
        View::addNamespace('host-context', __DIR__.'/views');

        $page = Route::middleware(['web', 'auth'])
            ->get('/testing/host-context', function () {
                Inertia::setRootView('host-context::app');

                return Inertia::render('testing/host-context', [
                    'context' => self::CONTEXT,
                    'resources' => [CardBoundData::KEY, CardFallbackData::KEY],
                ]);
            })
            ->name(self::ROUTE);

        // Registered after the app booted (the tests register this provider), so it lands behind the starter's
        // `Route::beamUxSite()` `{path}` catch-all, which takes every unreserved URL and 404s it (routes/web.php,
        // "LAST, and that is load-bearing"). Laravel matches in registration order, so the page goes first in a
        // fresh collection; adding it there also indexes its name, so route(self::ROUTE) resolves.
        $router = app('router');
        $ordered = new RouteCollection;
        $ordered->add($page);
        foreach ($router->getRoutes()->getRoutes() as $route) {
            if ($route !== $page) {
                $ordered->add($route);
            }
        }
        $router->setRoutes($ordered);
    }
}
