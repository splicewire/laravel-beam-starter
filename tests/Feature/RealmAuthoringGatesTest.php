<?php

namespace Tests\Feature;

use App\Beam\RealmRegistry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Rushing\PermissionCascade\Contracts\AccessGrant;
use Splicewire\Beam\Accounts\Enums\Role;
use Splicewire\Beam\Accounts\Models\Membership;
use Splicewire\Beam\Accounts\Models\Team;
use Splicewire\Beam\Accounts\Sharing\AccessGrants;
use Splicewire\Beam\Ux\Models\BeamUxEntry;
use Tests\TestCase;

/**
 * Ticket 02 (theme-entries-and-authoring): the `author-ux-{realm}` per-realm authoring gates, ported
 * from `rushing/audiostud`'s `AppServiceProvider::registerRealmAuthoringGates()`. Proves the same shape:
 * a per-realm ability for every {@see RealmRegistry::realms()} entry, backward-compatible with the flat
 * `author-ux` ability (a global holder authors every realm).
 *
 * theme-entries-and-authoring: `author-ux`/`author-ux-{realm}` resolve through the realm-grant cascade
 * (an Owner/Admin of a Team holding `manage` on a realm's root entry, {@see grantRealmReach()}) — no
 * more `is_staff` boolean anywhere in this repo's Gate surface.
 */
class RealmAuthoringGatesTest extends TestCase
{
    use RefreshDatabase;

    /** @param list<string> $realms */
    private function grantRealmReach(User $user, array $realms): void
    {
        $team = Team::create(['user_id' => $user->id, 'name' => 'A Team', 'personal_team' => false]);
        Membership::create(['team_id' => $team->id, 'user_id' => $user->id, 'role' => Role::Owner->value]);
        $grants = app(AccessGrants::class);

        foreach ($realms as $realm) {
            $grants->share(BeamUxEntry::rootFor($realm), $team, AccessGrant::ABILITY_MANAGE);
        }
    }

    public function test_it_defines_an_author_ux_realm_ability_for_every_known_realm(): void
    {
        $staff = User::factory()->create();
        $this->grantRealmReach($staff, RealmRegistry::realms());
        $staff = $staff->fresh();

        foreach (RealmRegistry::realms() as $realm) {
            $this->assertTrue($staff->can(RealmRegistry::authorAbility($realm)));
        }
    }

    public function test_author_ux_is_backward_compatible_a_holder_authors_every_realm(): void
    {
        $staff = User::factory()->create();
        $this->grantRealmReach($staff, RealmRegistry::realms());
        $staff = $staff->fresh();

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
