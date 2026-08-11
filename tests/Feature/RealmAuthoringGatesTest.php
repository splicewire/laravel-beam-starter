<?php

namespace Tests\Feature;

use App\Beam\RealmRegistry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Ticket 02 (theme-entries-and-authoring): the `author-ux-{realm}` per-realm authoring gates, ported
 * from `rushing/audiostud`'s `AppServiceProvider::registerRealmAuthoringGates()`. Proves the same shape:
 * a per-realm ability for every {@see RealmRegistry::realms()} entry, backward-compatible with the flat
 * `author-ux` ability (a global holder authors every realm).
 */
class RealmAuthoringGatesTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_defines_an_author_ux_realm_ability_for_every_known_realm(): void
    {
        $staff = User::factory()->staff()->create();

        foreach (RealmRegistry::realms() as $realm) {
            $this->assertTrue($staff->can(RealmRegistry::authorAbility($realm)));
        }
    }

    public function test_author_ux_is_backward_compatible_a_holder_authors_every_realm(): void
    {
        $staff = User::factory()->staff()->create();

        $this->assertTrue($staff->can('author-ux'));
        $this->assertTrue($staff->can('author-ux-site'));
        $this->assertTrue($staff->can('author-ux-account'));
        $this->assertTrue($staff->can('author-ux-auth'));
        $this->assertTrue($staff->can('author-ux-operator'));
    }

    public function test_a_non_staff_user_is_denied_every_realm_authoring_ability(): void
    {
        $user = User::factory()->create();

        $this->assertFalse($user->can('author-ux'));

        foreach (RealmRegistry::realms() as $realm) {
            $this->assertFalse($user->can(RealmRegistry::authorAbility($realm)));
        }
    }
}
