<?php

use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Browser suites mounted from installed capability packages
|--------------------------------------------------------------------------
|
| ticket 13 (browser-journeys): a Pest 4 host discovers and runs the browser
| suites shipped by the installed splicewire/* packages through one static
| glob. The host binds its own TestCase plus Pest's Browsable mixin here --
| the plugin's auto-binding is rooted at the project root and misses the
| vendored realpaths -- so `pest --testsuite=Browser` boots the app and drives
| the browser for every matched package suite. The starter's own host-context
| flows live in the separate HostBrowser suite (tests/Browser, bound below);
| it is the family's maintained reference consumer.
|
*/

pest()->extend(TestCase::class)
    ->use(Pest\Browser\Browsable::class)
    ->in('../vendor/splicewire/*/tests/Browser');

/*
|--------------------------------------------------------------------------
| The starter's own host-context flows (HostBrowser suite)
|--------------------------------------------------------------------------
|
| frame-foundation 92: tests/Browser holds the flows that prove this host's own
| record contexts drawn, run explicitly with `--testsuite=HostBrowser`. The
| vendor binding above does not reach this directory, so it binds its own
| TestCase, Browsable and the reset trait the flow() helper requires.
|
*/

pest()->extend(TestCase::class)
    ->use(Pest\Browser\Browsable::class, Illuminate\Foundation\Testing\RefreshDatabase::class)
    ->in('Browser');
