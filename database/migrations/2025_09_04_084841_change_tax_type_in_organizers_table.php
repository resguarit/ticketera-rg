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
        Schema::table('organizers', function (Blueprint $table) {
            // Cambia el tipo de la columna a decimal para almacenar porcentajes con precisión.
            $table->decimal('tax', 5, 2)->default(0)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('organizers', function (Blueprint $table) {
            // Revierte el cambio. Asume que el tipo original era un entero.
            // Ajusta 'integer' si el tipo original era otro (ej. float).
            $table->integer('tax')->default(0)->change();
        });
    }
};
