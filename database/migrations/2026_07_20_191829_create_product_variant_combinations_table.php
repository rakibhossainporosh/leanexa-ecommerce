<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Valid size x color combinations with their own stock. A product with any
     * combination rows uses the matrix: only the listed size/colour pairs exist
     * and stock is tracked per pair. Products without rows keep the legacy
     * independent size/colour behaviour.
     */
    public function up(): void
    {
        Schema::create('product_variant_combinations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('size_variant_id')->constrained('product_variants')->cascadeOnDelete();
            $table->foreignId('color_variant_id')->constrained('product_variants')->cascadeOnDelete();
            $table->unsignedInteger('stock')->default(0);
            $table->timestamps();

            $table->unique(['size_variant_id', 'color_variant_id'], 'pvc_size_color_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variant_combinations');
    }
};
