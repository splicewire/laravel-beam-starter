<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

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
    }
}
