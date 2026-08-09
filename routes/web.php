<?php

use App\Http\Controllers\SitemapResourceController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

// OOTB front-end surface demos (frontend-surfaces wiring). The site-realm page renders the promoted
// <SiteLayout> chrome (public); the account-realm page renders the promoted <AccountShell> (authed).
Route::inertia('preview', 'site/home')->name('site.preview');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::inertia('account-home', 'account/home')->name('account.home');

    // The host-owned Frame resource edit page for the editable sitemap (kind A).
    // Frame ships only frame/manifest; the host binds each resource's edit route.
    Route::get('frame/resources/sitemap', SitemapResourceController::class)
        ->name('frame.resources.sitemap');
});

require __DIR__.'/settings.php';
