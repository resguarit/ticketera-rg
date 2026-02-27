<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Enums\EmissionType;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('issued_tickets')
            ->whereNull('order_id')
            ->update([
                'emission_type' => EmissionType::INVITATION->value
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('issued_tickets')
            ->whereNull('order_id')
            ->update([
                'emission_type' => EmissionType::ONLINE->value
            ]);
    }
};
