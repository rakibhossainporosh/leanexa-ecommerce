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
        // First add the JSON column
        Schema::table('home_sections', function (Blueprint $table) {
            $table->json('category_ids')->nullable()->after('view_all_link');
        });

        // Alter product_source enum using DB statement to add 'category'
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE home_sections MODIFY COLUMN product_source ENUM('auto', 'manual', 'category') NOT NULL DEFAULT 'auto'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('home_sections', function (Blueprint $table) {
            $table->dropColumn('category_ids');
        });

        \Illuminate\Support\Facades\DB::statement("ALTER TABLE home_sections MODIFY COLUMN product_source ENUM('auto', 'manual') NOT NULL DEFAULT 'auto'");
    }
};
