<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Models\Cart;
use App\Models\Setting;
use App\Mail\AbandonedCartReminder;
use Illuminate\Support\Facades\Mail;

#[Signature('cart:check-abandoned')]
#[Description('Check for abandoned carts and send reminder emails')]
class CheckAbandonedCarts extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $settings = Setting::general();
        
        if (!($settings['abandoned_cart_enabled'] ?? false)) {
            $this->info('Abandoned cart emails are disabled in settings.');
            return;
        }

        $timeoutHours = (int) ($settings['abandoned_cart_timeout_hours'] ?? 24);

        $carts = Cart::with(['items.product', 'customer'])
            ->whereHas('items')
            ->whereNull('abandoned_email_sent_at')
            ->where('updated_at', '<', now()->subHours($timeoutHours))
            ->where(function ($query) {
                $query->whereNotNull('customer_id')
                      ->orWhereNotNull('guest_email');
            })
            ->get();

        if ($carts->isEmpty()) {
            $this->info('No new abandoned carts found.');
            return;
        }

        $discountType = $settings['abandoned_cart_discount_type'] ?? 'none';
        $discountValue = (float) ($settings['abandoned_cart_discount_value'] ?? 0);
        
        $discountMessage = null;
        if ($discountType === 'percentage' && $discountValue > 0) {
            $discountMessage = "Use this code at checkout to get {$discountValue}% off your order!";
        } elseif ($discountType === 'fixed' && $discountValue > 0) {
            $discountMessage = "Use this code at checkout to get ৳{$discountValue} off your order!";
        }

        $count = 0;
        foreach ($carts as $cart) {
            $email = $cart->customer ? $cart->customer->email : $cart->guest_email;
            
            if ($email) {
                try {
                    Mail::to($email)->send(new AbandonedCartReminder($cart, $settings, $discountMessage));
                    $cart->update(['abandoned_email_sent_at' => now()]);
                    $count++;
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error("Failed to send abandoned cart email to {$email}: " . $e->getMessage());
                }
            }
        }

        $this->info("Sent {$count} abandoned cart reminder emails.");
    }
}
