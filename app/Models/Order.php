<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $order_number
 * @property string $status
 * @property string $payment_status
 * @property string $total_amount
 * @property string|null $currency
 * @property int|null $coupon_id
 * @property bool $coupon_applied
 * @property-read Customer|null $customer
 * @property-read \Illuminate\Database\Eloquent\Collection<int, OrderItem> $items
 */
class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id', 'order_number', 'status', 'payment_status',
        'total_amount', 'subtotal', 'discount_amount', 'shipping_amount',
        'tax_amount', 'coupon_id', 'coupon_applied', 'currency',
        'shipping_address', 'billing_address', 'notes',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'shipping_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'coupon_applied' => 'boolean',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }
}
