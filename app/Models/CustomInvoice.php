<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CustomInvoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'customer_name',
        'customer_email',
        'customer_phone',
        'customer_address',
        'note',
        'description',
        'subtotal',
        'discount',
        'amount',
        'amount_paid',
        'payable_amount',
        'allow_partial',
        'status',
        'transaction_id',
        'currency_code',
        'exchange_rate',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'payable_amount' => 'decimal:2',
        'allow_partial' => 'boolean',
        'exchange_rate' => 'decimal:4',
    ];

    /**
     * Get the due amount (amount - amount_paid)
     */
    public function getDueAmountAttribute(): float
    {
        return max(0, (float) $this->amount - (float) $this->amount_paid);
    }

    /**
     * Get the effective payable amount right now.
     */
    public function getEffectivePayableAmountAttribute(): float
    {
        if ($this->payable_amount && $this->payable_amount > 0) {
            $remainingPayable = (float) $this->payable_amount - (float) $this->amount_paid;
            if ($remainingPayable > 0) {
                return $remainingPayable;
            }
        }
        return $this->due_amount;
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function (CustomInvoice $invoice) {
            if (empty($invoice->uuid)) {
                $invoice->uuid = (string) Str::uuid();
            }
        });
    }

    public function items()
    {
        return $this->hasMany(CustomInvoiceItem::class);
    }

    public function payments()
    {
        return $this->hasMany(CustomInvoicePayment::class);
    }
}
