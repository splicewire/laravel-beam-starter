<?php

namespace Tests\Feature\Localization;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Route;
use Splicewire\Beam\Localization\LocaleScope;
use Splicewire\Beam\Localization\PseudoLocale;
use Tests\TestCase;

/**
 * localization 36, the ticket's done-when on a FRESH install of this starter (RefreshDatabase migrates this host's own
 * committed schema, add_preferred_locale_to_users_table included):
 * - a member who chooses the pseudo-locale sees marked text on the next page, and after signing in again;
 * - a notification another member's action sends them is marked;
 * - clearing returns them to automatic.
 */
class PersonLanguageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(ValidateCsrfToken::class);
        // The proof host opts into the pseudo-locale (ticket 20's explicit opt-in); nothing else about the starter's
        // language configuration changes. en-XA joins the supported list only because of this flag.
        config(['beam.localization.pseudo' => true]);
        // A line the request renders in its resolved language: a packaged key with shipped English, which the
        // pseudo-locale derives and marks.
        Route::middleware('web')->get('/__language-probe', fn () => __('beam-accounts::messages.invitation_action'));
    }

    private function choose(User $member, ?string $locale): void
    {
        $this->actingAs($member)
            ->patch(route('profile.update'), ['name' => $member->name, 'email' => $member->email, 'preferredLocale' => $locale])
            ->assertSessionHasNoErrors()
            ->assertRedirect();
    }

    public function test_a_member_who_chooses_the_pseudo_locale_reads_marked_text_next_page_and_after_signing_in_again(): void
    {
        $member = User::factory()->create();

        $this->choose($member, 'en-XA');
        $this->assertSame('en-XA', $member->fresh()->preferred_locale);

        $line = $this->actingAs($member)->get('/__language-probe')->getContent();
        $this->assertTrue(PseudoLocale::isMarked($line), 'the next page is marked: '.$line);
        $this->actingAs($member)->get(route('dashboard'))->assertOk()->assertSee('lang="en-XA"', false);

        // Sign out, then in again: the choice is the person's, stored centrally, not the session's.
        $this->post(route('logout'));
        $this->assertGuest();
        $this->post(route('login.store'), ['email' => $member->email, 'password' => 'password']);
        $this->assertAuthenticatedAs($member);
        $again = $this->get('/__language-probe')->getContent();
        $this->assertTrue(PseudoLocale::isMarked($again), 'still marked after signing in again: '.$again);
    }

    public function test_a_notification_another_members_action_sends_them_is_marked(): void
    {
        Notification::fake();
        $member = User::factory()->create();
        $this->choose($member, 'en-XA');
        $other = User::factory()->create();
        Route::middleware('web')->post('/__notify/{user}', function (User $user) {
            // Another member's action notifies this one; it is not the recipient's own request.
            $user->notify(new ResetPassword('token'));

            return 'sent';
        });

        $this->actingAs($other)->post('/__notify/'.$member->getKey())->assertOk();

        Notification::assertSentTo($member, ResetPassword::class, function (ResetPassword $mail, array $channels, object $notifiable, ?string $locale) {
            $subject = LocaleScope::run((string) $locale, fn () => $mail->toMail($notifiable)->subject);

            return $locale === 'en-XA' && PseudoLocale::isMarked((string) $subject);
        });
    }

    public function test_clearing_the_choice_returns_the_member_to_automatic(): void
    {
        $member = User::factory()->create();
        $this->choose($member, 'en-XA');
        $this->choose($member, null);

        $this->assertNull($member->fresh()->preferred_locale);
        $line = $this->actingAs($member)->get('/__language-probe')->getContent();
        $this->assertFalse(PseudoLocale::isMarked($line), 'automatic again: '.$line);
    }
}
