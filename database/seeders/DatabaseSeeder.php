<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Splicewire\Beam\Accounts\Database\Seeders\DemoTeamSeeder;
use Splicewire\Beam\Accounts\Support\Demo;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // A non-staff demo user — sees the public/account realms, but NOT operator/OS (hard-gated).
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // A STAFF user — `is_staff` grants the staff bundle (author-ux/os.enter/app-operator) via the
        // DefaultEntitlementResolver, so /operator + /os resolve and the OS realm surfaces in the manifest.
        User::factory()->staff()->create([
            'name' => 'Staff User',
            'email' => 'staff@example.com',
        ]);

        // The OOTB beam-accounts demo team (owner/admin/member/solo) — the subjects the login page's
        // quick-login buttons enter via `account/login-as/{subject}` (Demo::keys()). Deterministic creds,
        // auto-skips in production. The seeder creates the demo USERS (all this app needs for login-as),
        // then assigns team ROLES — which needs the full beam-accounts permission estate this starter does
        // NOT adopt (register_auth_migrations=false). So rescue the role step: the users still land, and
        // the buttons work; role assignment is simply a no-op here.
        rescue(fn () => $this->call(DemoTeamSeeder::class), report: false);

        // Demo convenience: the demo OWNER doubles as staff so its quick-login reaches the staff-gated
        // /os + /operator too (a single-tenant demo's proprietor is also its operator).
        User::query()->where('email', Demo::email('owner'))->update(['is_staff' => true]);
    }
}
