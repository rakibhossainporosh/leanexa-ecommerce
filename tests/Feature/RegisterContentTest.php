<?php

use App\Models\Setting;

use function Pest\Laravel\get;

test('the register page uses admin-edited content', function () {
    Setting::set('page_settings', array_merge(Setting::pageDefaults(), [
        'register_heading' => 'Join Elevate & Next',
        'register_subtitle' => 'Shop faster with an account.',
        'register_benefits' => ['Free returns', 'Order tracking'],
    ]));

    $resp = get('/register')->assertOk();
    $content = $resp->viewData('page')['props']['content'];

    expect($content['heading'])->toBe('Join Elevate & Next');
    expect($content['subtitle'])->toBe('Shop faster with an account.');
    expect($content['benefits'])->toBe(['Free returns', 'Order tracking']);
});

test('the register page falls back to defaults when nothing is set', function () {
    $resp = get('/register')->assertOk();
    $content = $resp->viewData('page')['props']['content'];

    expect($content['heading'])->toBe('Create your account.');
    expect($content['benefits'])->toContain('Exclusive member pricing');
});

test('admin can save register page content', function () {
    $admin = App\Models\User::factory()->create(['email_verified_at' => now()]);
    Spatie\Permission\Models\Role::findOrCreate('Admin', 'admin');
    $admin->assignRole('Admin');

    $this->actingAs($admin, 'admin')->put('/admin/page-settings', [
        'register_heading' => 'New Heading',
        'register_subtitle' => 'New subtitle',
        'register_benefits' => ['One', 'Two', 'Three'],
        'faq' => [],
    ])->assertRedirect();

    expect(Setting::pages()['register_heading'])->toBe('New Heading');
    expect(Setting::pages()['register_benefits'])->toBe(['One', 'Two', 'Three']);
});
