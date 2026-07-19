<?php

use App\Models\Setting;

use function Pest\Laravel\get;

test('the login page uses admin-edited content', function () {
    Setting::set('page_settings', array_merge(Setting::pageDefaults(), [
        'login_heading' => 'Good to see you again',
        'login_subtitle' => 'Sign in to continue.',
        'login_benefits' => ['Fast checkout', 'Saved carts'],
    ]));

    $resp = get('/login')->assertOk();
    $content = $resp->viewData('page')['props']['content'];

    expect($content['heading'])->toBe('Good to see you again');
    expect($content['subtitle'])->toBe('Sign in to continue.');
    expect($content['benefits'])->toBe(['Fast checkout', 'Saved carts']);
});

test('the login page falls back to defaults when nothing is set', function () {
    $resp = get('/login')->assertOk();
    $content = $resp->viewData('page')['props']['content'];

    expect($content['heading'])->toBe('Welcome back to your store.');
    expect($content['benefits'])->toContain('Secure, encrypted checkout');
});
