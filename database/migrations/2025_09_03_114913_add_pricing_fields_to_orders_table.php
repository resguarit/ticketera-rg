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
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('subtotal', 10, 2)->after('total_amount')->default(0);
            $table->decimal('discount', 5, 2)->after('subtotal')->default(0)->comment('Discount percentage');
            $table->foreignId('discount_code_id')->nullable()->after('total_amount')->constrained('discount_codes')->onDelete('set null');
            $table->decimal('tax', 5, 2)->after('discount')->default(0)->comment('Tax percentage for service fee');
            $table->decimal('service_fee', 10, 2)->after('tax')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['subtotal', 'discount', 'discount_code_id', 'tax', 'service_fee']);
        });
    }
};
