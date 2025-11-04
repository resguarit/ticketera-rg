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
            $table->integer('cuotas')->default(1)->after('status');

            $table->foreignId('cuota_id')->nullable()->after('cuotas')
                  ->constrained('cuotas')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['cuota_id']);
            $table->dropColumn(['cuotas', 'cuota_id']);
        });
    }
};
