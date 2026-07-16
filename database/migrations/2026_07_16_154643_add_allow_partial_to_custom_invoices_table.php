<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * "Full Amount" and "Partial with no fixed figure" both left payable_amount
     * null, so the invoice could not tell them apart. This flag records whether
     * the customer is allowed to choose their own amount.
     */
    public function up(): void
    {
        Schema::table('custom_invoices', function (Blueprint $table) {
            $table->boolean('allow_partial')->default(false)->after('payable_amount');
        });

        // Preserve existing intent: any invoice that carried a payable_amount was
        // created as "Partial/Fixed", so mark those as allowing partial.
        DB::table('custom_invoices')->whereNotNull('payable_amount')->update(['allow_partial' => true]);
    }

    public function down(): void
    {
        Schema::table('custom_invoices', function (Blueprint $table) {
            $table->dropColumn('allow_partial');
        });
    }
};
