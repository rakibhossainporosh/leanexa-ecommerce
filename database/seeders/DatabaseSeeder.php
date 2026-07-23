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
        // Only the essentials for a clean client install: the roles the admin
        // account needs, and the admin user itself. Demo content seeders
        // (products, home sections, currencies/banners, test customer) are
        // intentionally not called — the client sets those up from the panel.
        $this->call([
            RolesAndPermissionsSeeder::class,
        ]);

        // Created without a factory: factories need Faker, which is a dev-only
        // dependency and is not installed on the production server (--no-dev).
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
        ]);
        $admin->forceFill(['email_verified_at' => now()])->save();
        $admin->assignRole('Admin');
    }
}
