<?php
// filepath: database/migrations/2025_01_XX_000001_create_provincias_table.php

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
        Schema::create('provincias', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('code', 10)->nullable(); // Código de provincia (ej: BA, CABA, SF)
            $table->string('country', 50)->default('Argentina');
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['name', 'country']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('provincias');
    }
};
