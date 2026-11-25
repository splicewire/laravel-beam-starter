<?php

use App\Models\SitemapRecord;
use App\Models\User;
use Rushing\PermissionCascade\Contracts\AccessGrant;
use Splicewire\Beam\Accounts\Sharing\AccessGrants;
use Splicewire\Beam\Accounts\Teams\TeamProvisioner;
use Splicewire\Beam\Ux\Models\BeamUxEntry;
use Tests\Fixtures\HostContext\HostContextFlows;
use Tests\Fixtures\HostContext\HostContextProvider;

use function Splicewire\Beam\Testing\flow;

/*
 * frame-foundation 92, box 4: a host's own record-grain context, drawn. One resource binds its widget in `card` and
 * draws it; the other is unbound there and draws its `list-item` widget along the host's edge. The HostBrowser suite
 * (tests/Pest.php) binds TestCase, Browsable and RefreshDatabase. No baseline is committed (browser-journeys 14/17).
 */

beforeEach(function () {
    // The page's entry is built apart from the app's (tests/Browser/host-context/vite.config.ts). A suite that has not
    // built it skips here and says why; the run that builds it draws the page.
    if (! is_file(public_path('build-host-context/manifest.json'))) {
        $this->markTestSkipped('build the host-context entry first: vite build --config tests/Browser/host-context/vite.config.ts');
    }

    app()->register(HostContextProvider::class);
});

it('draws a host context widget, and the fallback where it is unbound', function (string $role) {
    $flow = flow(HostContextFlows::KEY, role: $role);

    $user = User::factory()->create();
    // Provisioned as the flow's owner: the page reads SitemapRecord rows, whose cascade policy admits only a role
    // the provisioner wrote permission rows for.
    $team = app(TeamProvisioner::class)->personalTeamFor($user);
    app(AccessGrants::class)->share(BeamUxEntry::rootFor('operator'), $team, AccessGrant::ABILITY_MANAGE);

    // Both resources read the starter's sitemap rows, so one row draws once in each.
    SitemapRecord::create(['schema_ref' => 'host-context', 'payload' => ['label' => 'Ada', 'href' => '/ada']]);

    $this->actingAs($user->fresh());

    // Land on the app's health route, then navigate to the page: the starter's `/` is beam-ux's public entry, which
    // 404s with no published entry.
    visit('/up')
        ->navigate(route(HostContextProvider::ROUTE))
        ->assertSee('host-card drawn')
        ->assertSee('host-list-item drawn')
        ->assertNoConsoleLogs()
        ->screenshot(filename: $flow->name());
})->with(HostContextFlows::flow(HostContextFlows::KEY)->roles)->group('browser');
