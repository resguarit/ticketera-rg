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
        Schema::create('settlements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_function_id')->constrained()->cascadeOnDelete();

            $table->dateTime('transfer_date');

            $table->integer('quantity');
            $table->decimal('amount_unit_gross', 15, 2);
            $table->decimal('amount_total_gross', 15, 2);
            $table->decimal('amount_unit_net', 15, 2);
            $table->decimal('amount_total_net', 15, 2);

            $table->decimal('discounts', 15, 2)->default(0);
            $table->string('discount_observation')->nullable();

            $table->decimal('total_transfer', 15, 2);

            $table->string('attachment_path')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settlements');
    }
};
