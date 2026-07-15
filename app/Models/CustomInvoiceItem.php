<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomInvoiceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'custom_invoice_id',
        'product_id',
        'name',
        'quantity',
        'price',
        'discount',
        'total',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function invoice()
    {
        return $this->belongsTo(CustomInvoice::class, 'custom_invoice_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
