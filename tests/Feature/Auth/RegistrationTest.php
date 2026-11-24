<?php

namespace Tests\Feature\Auth;

use App\Actions\Fortify\CreateNewUser as HostCreateNewUser;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use Mockery;
use Splicewire\Beam\Accounts\Enums\Role;
use Splicewire\Beam\Accounts\Fortify\CreateNewUser;
use Splicewire\Beam\Accounts\Models\Team;
use Splicewire\Beam\Agreements\AssentRecorder;
use Splicewire\Beam\Agreements\Data\OutstandingRequirementData;
use Splicewire\Beam\Agreements\RequirementAdmission;
use Splicewire\Beam\Agreements\RequirementDeclarations;
use Splicewire\Beam\Agreements\RequirementResolver;
use Splicewire\Beam\Agreements\Requires;
use Tests\TestCase;

/**
 * purchase-walkthrough BUY-05 (M10): with ACCOUNT_REGISTRATION=open, this starter's registration door is open, and a
 * registrant is created through beam-accounts' door-checked action, not a host copy.
 */
class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected ?string $accountRegistration = 'open';

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get(route('register'));

        $response->assertOk();
    }

    public function test_new_users_can_register()
    {
        $response = $this->post(route('register.store'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'passwordConfirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_open_registration_provisions_a_personal_team_for_the_new_user(): void
    {
        $this->post(route('register.store'), [
            'name' => 'Personal Team Registrant',
            'email' => 'personal-team@example.test',
            'password' => 'password',
            'passwordConfirmation' => 'password',
        ])->assertRedirect(route('dashboard', absolute: false));

        $user = User::query()->where('email', 'personal-team@example.test')->sole();
        $this->assertAuthenticatedAs($user);
        $this->assertDatabaseHas((new Team)->getTable(), [
            'user_id' => $user->getKey(),
            'personal_team' => true,
        ]);

        $team = Team::query()->where('user_id', $user->getKey())->where('personal_team', true)->sole();
        $this->assertSame(Role::Owner, $team->memberRole($user));
        $this->assertSame((string) $team->getKey(), (string) $user->fresh()->current_team_id);
    }

    public function test_a_registrant_is_created_through_the_door_checked_action()
    {
        $action = app(CreatesNewUsers::class);
        $this->assertSame(HostCreateNewUser::class, $action::class);
        $this->assertInstanceOf(CreateNewUser::class, $action);
        $this->assertSame(CreateNewUser::class, (new \ReflectionMethod($action, 'create'))->getDeclaringClass()->getName());
    }

    public function test_null_agreement_member_refuses_registration_before_creating_the_user(): void
    {
        $declarations = Mockery::mock(RequirementDeclarations::class);
        $declarations->shouldReceive('requirementsFor')
            ->once()
            ->with('auth.register')
            ->andReturn([new Requires('terms')]);
        $declarations->shouldReceive('declares')->andReturnFalse();
        app()->instance(RequirementDeclarations::class, $declarations);

        $resolver = Mockery::mock(RequirementResolver::class);
        $resolver->shouldReceive('outstanding')
            ->once()
            ->with(null, 'auth.register', null, [])
            ->andReturn([new OutstandingRequirementData(
                key: 'terms',
                version: 1,
                digest: 'frozen-digest',
                kind: 'contract',
                title: 'Terms',
                scope: 'party',
                subject: null,
                readUrl: '/agreements/terms',
                acceptOperation: null,
                member: 'agreementMember',
            )]);
        app()->instance(RequirementAdmission::class, new RequirementAdmission($resolver));

        $recorder = Mockery::mock(AssentRecorder::class);
        $recorder->shouldNotReceive('record');
        app()->instance(AssentRecorder::class, $recorder);

        $this->postJson(route('register.store'), [
            'name' => 'Terms Refusal',
            'email' => 'terms-refusal@example.test',
            'password' => 'password',
            'passwordConfirmation' => 'password',
            'agreementMember' => null,
        ])->assertStatus(428)
            ->assertJsonPath('requirements.0.key', 'terms');

        $this->assertDatabaseMissing('users', ['email' => 'terms-refusal@example.test']);
    }
}
