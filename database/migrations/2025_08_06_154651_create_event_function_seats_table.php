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
        Schema::create('event_function_seats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_function_id')->constrained('event_functions')->onDelete('cascade');
            $table->foreignId('seat_id')->constrained('seats')->onDelete('cascade');
            $table->foreignId('issued_ticket_id')->nullable()->constrained('issued_tickets')->onDelete('cascade');
            $table->string('status', 50);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['event_function_id', 'seat_id'], 'unique_event_function_seat');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_function_seats');
    }
};
