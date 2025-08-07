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
        Schema::create('ticket_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_function_id')->constrained('event_functions')->onDelete('cascade');
            $table->foreignId('sector_id')->constrained('sectors');
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->dateTime('sales_start_date');
            $table->dateTime('sales_end_date')->nullable();
            $table->integer('quantity');
            $table->integer('quantity_sold')->default(0);
            $table->boolean('is_hidden')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_types');
    }
};
