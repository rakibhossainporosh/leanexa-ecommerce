<?php

use App\Models\Coupon;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    Role::findOrCreate('Admin', 'admin');
});

function adminUser(): User
{
    $u = User::factory()->create(['email_verified_at' => now()]);
    $u->assignRole('Admin');

    return $u;
}

function makeOrder(array $attrs = []): Order
{
    $order = Order::create(array_merge([
        'customer_id' => Customer::factory()->create()->id,
        'order_number' => 'ORD-'.strtoupper(uniqid()),
        'status' => 'processing',
        'payment_status' => 'paid',
        'subtotal' => 1000,
        'total_amount' => 1000,
        'currency' => 'BDT',
        'shipping_address' => 'Dhaka',
    ], $attrs));

    OrderItem::create([
        'order_id' => $order->id,
        'product_id' => Product::factory()->create()->id,
        'product_name' => 'Test item',
        'quantity' => 1,
        'price' => 1000,
    ]);

    return $order;
}

test('admin can delete an order and its items go with it', function () {
    $order = makeOrder();
    $itemId = $order->items()->first()->id;

    actingAs(adminUser(), 'admin')
        ->delete("/admin/orders/{$order->id}")
        ->assertRedirect();

    expect(Order::find($order->id))->toBeNull();
    // cascadeOnDelete should have taken the items too — no orphans left behind.
    expect(OrderItem::find($itemId))->toBeNull();
});

test('deleting an order does not break the sales report', function () {
    $keep = makeOrder(['total_amount' => 500]);
    $drop = makeOrder(['total_amount' => 1000]);

    $admin = adminUser();

    // Revenue before: both paid orders counted.
    actingAs($admin, 'admin')->get('/admin/sales-report')
        ->assertOk()
        ->assertInertia(fn ($p) => $p->where('summary.total_revenue', fn ($v) => (float) $v === 1500.0));

    actingAs($admin, 'admin')->delete("/admin/orders/{$drop->id}")->assertRedirect();

    // The report must still load, and drop the deleted order's revenue.
    actingAs($admin, 'admin')->get('/admin/sales-report')
        ->assertOk()
        ->assertInertia(fn ($p) => $p
            ->where('summary.total_revenue', fn ($v) => (float) $v === 500.0)
            ->where('summary.total_orders', 1)
        );

    expect(Order::find($keep->id))->not->toBeNull();
});

test('deleting a paid order hands its coupon use back', function () {
    $coupon = Coupon::create([
        'code' => 'SAVE10', 'type' => 'percentage', 'value' => 10,
        'uses' => 1, 'is_active' => true,
    ]);

    $order = makeOrder(['coupon_id' => $coupon->id, 'coupon_applied' => true]);

    actingAs(adminUser(), 'admin')->delete("/admin/orders/{$order->id}")->assertRedirect();

    // Otherwise a limited-use coupon stays consumed by an order that is gone.
    expect($coupon->fresh()->uses)->toBe(0);
});

test('deleting an order removes notifications that would 404', function () {
    $order = makeOrder();
    $admin = adminUser();

    $admin->notify(new App\Notifications\NewOrderPlaced($order));
    expect($admin->notifications()->count())->toBe(1);

    actingAs($admin, 'admin')->delete("/admin/orders/{$order->id}")->assertRedirect();

    // The admin bell links to /admin/orders/{id}; a stale one would 404.
    expect($admin->fresh()->notifications()->count())->toBe(0);
});
