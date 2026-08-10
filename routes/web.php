<?php

use App\Http\Controllers\SitemapResourceController;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Splicewire\Beam\Ux\Models\Sitemap;

Route::inertia('/', 'welcome')->name('home');

// OOTB front-end surface demos (frontend-surfaces wiring). The site-realm page renders the promoted
// <SiteLayout> chrome (public) AND — behind the author-ux seam — mounts the in-place visual editor
// (@/editor). The account-realm page renders the promoted <AccountShell> (authed).
Route::inertia('preview', 'site/home')->name('site.preview');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::inertia('account-home', 'account/home')->name('account.home');

    // The host-owned Frame resource edit page for the editable sitemap (kind A).
    // Frame ships only frame/manifest; the host binds each resource's edit route.
    Route::get('frame/resources/sitemap', SitemapResourceController::class)
        ->name('frame.resources.sitemap');

    // The OPERATOR front-end realm (frontend-surfaces.md). A thin stats roll-up landing framed by the
    // promoted @splicewire/beam-mainframe host; resource lists ride Frame's generic particle CRUD socket.
    // NOTE: production gates this on a staff/`entitlement:app-operator` ability. The starter's demo estate
    // does not seed operator abilities yet (owned by the substrate-provisioning path), so it is gated on
    // `auth,verified` only — swap in `can:entitlement:app-operator` once the ability is seeded.
    Route::get('operator', fn () => Inertia::render('operator/dashboard', [
        'staff' => fn () => ['name' => request()->user()->name, 'email' => request()->user()->email],
        'stats' => fn () => [
            'users' => User::count(),
            'sitemaps' => Sitemap::count(),
            'entries' => rescue(fn () => Sitemap::query()->withCount('entries')->get()->sum('entries_count'), 0, false),
        ],
    ]))->name('operator.home');

    // The OS-SHELL desktop (frontend-surfaces.md). The windowed realm composer. Route-gated on the
    // projected `os.enter` entitlement in production (`can:entitlement:os.enter`); the shell itself does
    // the fusion pivot off shared `can['os.enter']` (entitled → desktop, else app-first). Gated on
    // `auth,verified` here for the same demo-estate reason as /operator above.
    Route::inertia('os', 'os')->name('os.shell');
});

require __DIR__.'/settings.php';
