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
        Schema::table('issued_tickets', function (Blueprint $table) {
            // Primero eliminar el índice único existente
            $table->dropUnique(['unique_code']);
        });

        Schema::table('issued_tickets', function (Blueprint $table) {
            // Cambiar unique_code de char(32) a varchar(50)
            $table->string('unique_code', 50)->change();
        });

        Schema::table('issued_tickets', function (Blueprint $table) {
            // Volver a crear el índice único
            $table->unique('unique_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('issued_tickets', function (Blueprint $table) {
            // Eliminar el índice único
            $table->dropUnique(['unique_code']);
        });

        Schema::table('issued_tickets', function (Blueprint $table) {
            // Revertir a la longitud original
            $table->char('unique_code', 32)->change();
        });

        Schema::table('issued_tickets', function (Blueprint $table) {
            // Recrear el índice único
            $table->unique('unique_code');
        });
    }
};
