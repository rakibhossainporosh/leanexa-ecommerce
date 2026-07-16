<?php

use App\Models\Currency;
use App\Models\CustomInvoice;
use App\Models\Customer;
use App\Models\Order;
use App\Models\User;
use Spatie\Permission\Models\Role;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    Role::findOrCreate('Admin', 'admin');
    Currency::create(['code' => 'BDT', 'symbol' => 'Tk', 'exchange_rate' => 1.0000, 'is_default' => true,  'is_active' => true]);
    Currency::create(['code' => 'USD', 'symbol' => '$',  'exchange_rate' => 0.0081, 'is_default' => false, 'is_active' => true]);
});

function reportAdmin(): User
{
    $u = User::factory()->create(['email_verified_at' => now()]);
    $u->assignRole('Admin');

    return $u;
}

function paidInvoice(float $amount, ?string $code, float $rate): CustomInvoice
{
    return CustomInvoice::create([
        'uuid' => (string) Str::uuid(),
        'customer_name' => 'Buyer',
        'customer_email' => 'buyer@example.com',
        'customer_phone' => '+8801712345678',
        'amount' => $amount,
        'amount_paid' => $amount,
        'status' => 'paid',
        'currency_code' => $code,
        'exchange_rate' => $rate,
    ]);
}

test('a USD invoice counts as its BDT value, not its face number', function () {
    // $1 at rate 0.0081 is ~123.46 BDT. The old code added a flat 1.
    paidInvoice(1.00, 'USD', 0.0081);

    actingAs(reportAdmin(), 'admin')->get('/admin/sales-report')
        ->assertOk()
        ->assertInertia(fn ($p) => $p->where('summary.total_revenue', fn ($v) => abs((float) $v - 123.46) < 0.01));
});

test('deleting a USD invoice removes its BDT value from revenue', function () {
    $order = Order::create([
        'customer_id' => Customer::factory()->create()->id,
        'order_number' => 'ORD-KEEP01', 'status' => 'processing', 'payment_status' => 'paid',
        'subtotal' => 1000, 'total_amount' => 1000, 'currency' => 'BDT', 'shipping_address' => 'Dhaka',
    ]);
    $invoice = paidInvoice(1.00, 'USD', 0.0081);

    $admin = reportAdmin();

    // 1000 order + ~123.46 invoice
    actingAs($admin, 'admin')->get('/admin/sales-report')
        ->assertInertia(fn ($p) => $p->where('summary.total_revenue', fn ($v) => abs((float) $v - 1123.46) < 0.01));

    $invoice->delete();

    // Must drop by ~123.46 (the real value), NOT by 1.
    actingAs($admin, 'admin')->get('/admin/sales-report')
        ->assertOk()
        ->assertInertia(fn ($p) => $p->where('summary.total_revenue', fn ($v) => (float) $v === 1000.0));

    expect($order->fresh())->not->toBeNull();
});

test('legacy invoices with no currency still count at face value', function () {
    // Older rows predate the currency columns: rate 1, code null.
    paidInvoice(5000.00, null, 1.0);

    actingAs(reportAdmin(), 'admin')->get('/admin/sales-report')
        ->assertOk()
        ->assertInertia(fn ($p) => $p->where('summary.total_revenue', fn ($v) => (float) $v === 5000.0));
});

test('recent transactions never mix a raw USD figure beside BDT orders', function () {
    paidInvoice(1.00, 'USD', 0.0081);

    actingAs(reportAdmin(), 'admin')->get('/admin/sales-report')
        ->assertOk()
        ->assertInertia(fn ($p) => $p->where('recent_transactions.0.amount', fn ($v) => abs((float) $v - 123.46) < 0.01));
});
