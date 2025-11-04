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
        Schema::table('cuotas', function (Blueprint $table) {
            $table->boolean('habilitada')->default(true)->after('cantidad_cuotas');
            $table->string('banco')->nullable()->after('habilitada');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cuotas', function (Blueprint $table) {
            $table->dropColumn('habilitada');
            $table->dropColumn('banco');
        });
    }
};
