<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('subtotal', 10, 2)->default(0)->after('total_amount');
            $table->decimal('discount_amount', 10, 2)->default(0)->after('subtotal');
            $table->decimal('shipping_amount', 10, 2)->default(0)->after('discount_amount');
            $table->decimal('tax_amount', 10, 2)->default(0)->after('shipping_amount');
            $table->foreignId('coupon_id')->nullable()->after('tax_amount')->constrained()->nullOnDelete();
            $table->boolean('coupon_applied')->default(false)->after('coupon_id');
            $table->string('currency', 10)->default('BDT')->after('coupon_applied');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('coupon_id');
            $table->dropColumn([
                'subtotal', 'discount_amount', 'shipping_amount',
                'tax_amount', 'coupon_applied', 'currency',
            ]);
        });
    }
};
