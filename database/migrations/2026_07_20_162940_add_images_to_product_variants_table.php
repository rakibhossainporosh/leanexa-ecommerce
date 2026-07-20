<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A JSON array of every image for the variant, ordered. The existing
     * image_path column stays in sync with the first entry so cart/order
     * thumbnails and other single-image consumers keep working unchanged.
     */
    public function up(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->json('images')->nullable()->after('image_path');
        });
    }

    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn('images');
        });
    }
};
