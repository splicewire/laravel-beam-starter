<?php

namespace Tests\Feature;

use Illuminate\Foundation\Auth\User;
use Splicewire\Beam\Analytics\Contracts\AnalyticsDestinations;
use Splicewire\Beam\Analytics\Destinations\DestinationLinks;
use Splicewire\Beam\Analytics\Destinations\NoDestinations;
use Splicewire\Beam\Analytics\Scope\AnalyticsScope;
use Tests\TestCase;

/**
 * analytics-area 18 (root's ruling, 2026-11-13): this host has neither a site editor nor a Site settings page, so it binds
 * NOTHING to the analytics destination port, and no destination link draws here. The package's default, NoDestinations, stays
 * bound. This test pins that: a host binding added here without the pages behind it would draw links to nowhere.
 */
class AnalyticsDestinationsTest extends TestCase
{
    /** @return list<string> every destination the analytics package names */
    private function names(): array
    {
        return [AnalyticsDestinations::SITE_EDITOR, AnalyticsDestinations::SITE_SETTINGS, AnalyticsDestinations::TRAFFIC_SOURCES];
    }

    public function test_the_host_binds_nothing_so_the_package_default_stays(): void
    {
        $this->assertInstanceOf(NoDestinations::class, app(AnalyticsDestinations::class));
    }

    public function test_no_destination_answers_and_no_link_draws_in_either_scope(): void
    {
        $this->actingAs((new User)->forceFill(['id' => 1]));
        $port = app(AnalyticsDestinations::class);
        $links = app(DestinationLinks::class);

        foreach ([AnalyticsScope::install(), AnalyticsScope::tenant('acme')] as $scope) {
            foreach ($this->names() as $name) {
                $this->assertNull($port->destination($name, $scope), "{$name} answers nothing");
                $this->assertNull($links->href($name, $scope), "{$name} draws no link");
            }
        }
    }
}
