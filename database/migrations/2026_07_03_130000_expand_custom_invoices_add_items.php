<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('custom_invoices', function (Blueprint $table) {
            $table->string('customer_phone')->nullable()->after('customer_email');
            $table->string('customer_address')->nullable()->after('customer_phone');
            $table->text('note')->nullable()->after('customer_address');
            $table->decimal('subtotal', 10, 2)->default(0)->after('description');
            $table->decimal('discount', 10, 2)->default(0)->after('subtotal');

            // Description is no longer required now that line items exist.
            $table->string('description')->nullable()->change();
        });

        Schema::create('custom_invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('custom_invoice_id')->constrained('custom_invoices')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('name');
            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('price', 10, 2)->default(0);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('total', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('custom_invoice_items');

        Schema::table('custom_invoices', function (Blueprint $table) {
            $table->dropColumn(['customer_phone', 'customer_address', 'note', 'subtotal', 'discount']);
        });
    }
};
