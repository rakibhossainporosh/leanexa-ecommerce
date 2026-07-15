<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // create permissions
        Permission::create(['name' => 'manage categories', 'guard_name' => 'admin']);
        Permission::create(['name' => 'manage products', 'guard_name' => 'admin']);
        Permission::create(['name' => 'manage orders', 'guard_name' => 'admin']);
        Permission::create(['name' => 'manage customers', 'guard_name' => 'admin']);
        Permission::create(['name' => 'manage settings', 'guard_name' => 'admin']);

        // create roles and assign created permissions
        $adminRole = Role::create(['name' => 'Admin', 'guard_name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all());


    }
}
