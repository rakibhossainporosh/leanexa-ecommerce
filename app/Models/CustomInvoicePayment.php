<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $transaction_id
 * @property string $amount
 * @property string $status
 * @property-read CustomInvoice $invoice
 */
class CustomInvoicePayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'custom_invoice_id',
        'transaction_id',
        'amount',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function invoice()
    {
        return $this->belongsTo(CustomInvoice::class, 'custom_invoice_id');
    }
}
