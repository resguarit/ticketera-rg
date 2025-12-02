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
        Schema::create('scan_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('issued_ticket_id')->nullable()->constrained('issued_tickets')->nullOnDelete();
            $table->foreignId('event_function_id')->constrained('event_functions'); 
            
            // dispositivo
            $table->string('device_uuid')->index();
            $table->string('device_name')->nullable();
            
            // escaneo
            $table->string('result');
            $table->string('scanned_code');
            
            // fechas
            $table->timestamp('scanned_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scan_logs');
    }
};
