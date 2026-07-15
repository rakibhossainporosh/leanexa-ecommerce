<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use App\Models\Setting;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Repositories\Interfaces\CategoryRepositoryInterface::class,
            \App\Repositories\CategoryRepository::class
        );

        $this->app->bind(
            \App\Repositories\Interfaces\TagRepositoryInterface::class,
            \App\Repositories\TagRepository::class
        );

        $this->app->bind(
            \App\Repositories\Interfaces\ProductRepositoryInterface::class,
            \App\Repositories\ProductRepository::class
        );

        $this->app->bind(
            \App\Repositories\Interfaces\BrandRepositoryInterface::class,
            \App\Repositories\BrandRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureMail();

        // The login form promises "Remember me for 30 days" — Laravel's
        // default remember cookie lasts 400 days, so match the promise.
        \Illuminate\Support\Facades\Auth::guard('web')->setRememberDuration(60 * 24 * 30);
    }

    /**
     * Configure mail settings dynamically from general settings.
     */
    protected function configureMail(): void
    {
        try {
            $settings = Setting::general();
            // 1. Always define the mailers if they have credentials
            if (!empty($settings['smtp_email']) && !empty($settings['smtp_password'])) {
                config([
                    'mail.mailers.smtp.host' => 'smtp.gmail.com',
                    'mail.mailers.smtp.port' => 465,
                    'mail.mailers.smtp.encryption' => 'ssl',
                    'mail.mailers.smtp.scheme' => 'smtps',
                    'mail.mailers.smtp.username' => $settings['smtp_email'],
                    'mail.mailers.smtp.password' => $settings['smtp_password'],
                ]);
            }

            if (!empty($settings['official_smtp_email']) && !empty($settings['official_smtp_password'])) {
                config([
                    'mail.mailers.hostinger' => [
                        'transport' => 'smtp',
                        'host' => 'smtp.hostinger.com',
                        'port' => 465,
                        'encryption' => 'ssl',
                        'username' => $settings['official_smtp_email'],
                        'password' => $settings['official_smtp_password'],
                        'timeout' => null,
                        'local_domain' => env('MAIL_EHLO_DOMAIN'),
                    ],
                ]);
            }
            
            // 2. Set default mailer and global FROM address based on user selection
            $primary = $settings['primary_mailer'] ?? 'gmail';
            
            if ($primary === 'hostinger' && !empty($settings['official_smtp_email'])) {
                config([
                    'mail.default' => 'hostinger',
                    'mail.from.address' => $settings['official_smtp_email'],
                    'mail.from.name' => 'orders @leanexa.store',
                ]);
            } else if (!empty($settings['smtp_email'])) {
                config([
                    'mail.default' => 'smtp',
                    'mail.from.address' => $settings['smtp_email'],
                    'mail.from.name' => $settings['store_name'] ?? config('app.name'),
                ]);
            }
        } catch (\Exception $e) {
            // Settings table might not exist during early migrations
        }
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        Model::shouldBeStrict(! app()->isProduction());

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
