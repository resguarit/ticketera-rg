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
        Schema::create('ticket_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_function_id')->constrained('event_functions')->cascadeOnDelete();
            $table->foreignId('ticket_type_id')->constrained('ticket_types')->cascadeOnDelete();
            $table->foreignId('promoter_id')->nullable()->constrained('promoters')->nullOnDelete();
            $table->integer('quantity');
            $table->string('type'); // 'require_activation' o 'pre_activated'
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('client_id')->nullable()->change();
            $table->string('sales_channel')->default('online')->after('status');
        });

        Schema::table('issued_tickets', function (Blueprint $table) {
            $table->string('emission_type')->default('online')->after('status');
            $table->foreignId('batch_id')->nullable()->constrained('ticket_batches')->nullOnDelete()->after('order_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('issued_tickets', function (Blueprint $table) {
            $table->dropForeign(['batch_id']);
            $table->dropColumn(['emission_type', 'batch_id']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('client_id')->nullable(false)->change();
            $table->dropColumn('sales_channel');
        });

        Schema::dropIfExists('ticket_batches');
    }
};
