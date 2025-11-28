<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('ticket_types', function (Blueprint $table) {
            $table->string('stage_group')->nullable()->after('name');
            $table->integer('stage_order')->nullable()->after('stage_group');
            
            // Índice para búsquedas eficientes
            $table->index(['event_function_id', 'stage_group', 'stage_order']);
        });

        // Migrar datos existentes basados en el patrón de nombre
        $this->migrateExistingStages();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ticket_types', function (Blueprint $table) {
            $table->dropIndex(['event_function_id', 'stage_group', 'stage_order']);
            $table->dropColumn(['stage_group', 'stage_order']);
        });
    }

    private function migrateExistingStages(): void
    {
        $ticketTypes = DB::table('ticket_types')->get();

        foreach ($ticketTypes as $ticketType) {
            // Detectar patrón "[Grupo] [Número]"
            if (preg_match('/^(.+)\s+(\d+)$/', $ticketType->name, $matches)) {
                DB::table('ticket_types')
                    ->where('id', $ticketType->id)
                    ->update([
                        'stage_group' => trim($matches[1]),
                        'stage_order' => (int) $matches[2],
                    ]);
            }
        }
    }
};
