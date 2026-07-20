<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Which footer column an in-footer page appears under: company, shop or information.
     */
    public function up(): void
    {
        Schema::table('custom_pages', function (Blueprint $table) {
            $table->string('footer_section')->default('company')->after('show_in_footer');
        });
    }

    public function down(): void
    {
        Schema::table('custom_pages', function (Blueprint $table) {
            $table->dropColumn('footer_section');
        });
    }
};
