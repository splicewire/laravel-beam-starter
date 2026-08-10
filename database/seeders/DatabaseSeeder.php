<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
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

        // Run EVERY beam-* package's registered seeder from ONE command (the package-registered seed
        // manifest): beam-accounts contributes its DemoTeamSeeder (gated by beam.accounts.demo.seed_users →
        // on outside production), beam-ux its content-nav seeder, etc. This host no longer hand-calls any
        // package seeder by class — a new beam package's data lands automatically once it registers.
        //
        // The accounts DemoTeamSeeder creates the demo USERS (all this app needs for login-as via the
        // login page's quick-login buttons), then assigns team ROLES — which needs the full beam-accounts
        // permission estate this starter does NOT adopt (register_auth_migrations=false), so that step
        // throws here. splicewire:beam:seed tolerates a seeder throwing (reports + continues), so the users
        // still land and the buttons work; role assignment is simply a no-op in this starter.
        // (Invoked as an artisan COMMAND, not Seeder::call — the manifest, not this host, names the seeders.)
        $this->command->call('splicewire:beam:seed');

        // Demo convenience: the demo OWNER doubles as staff so its quick-login reaches the staff-gated
        // /os + /operator too (a single-tenant demo's proprietor is also its operator).
        User::query()->where('email', Demo::email('owner'))->update(['is_staff' => true]);
    }
}
