<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('home_sections', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->enum('type', ['trending', 'deal', 'featured', 'custom'])->index();
            // auto  -> products resolved from product flags by `type`
            // manual-> products come from the home_section_products mapping
            $table->enum('product_source', ['auto', 'manual'])->default('auto');
            $table->enum('display_style', ['grid', 'carousel', 'list'])->default('grid');
            $table->unsignedSmallInteger('product_limit')->default(8);
            $table->string('view_all_link')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('home_sections');
    }
};
