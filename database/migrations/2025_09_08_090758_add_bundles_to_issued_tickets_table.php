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
            $table->string('bundle_reference', 36)->nullable()->after('client_id');
            $table->index('bundle_reference');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('issued_tickets', function (Blueprint $table) {
            $table->dropIndex(['bundle_reference']);
            $table->dropColumn('bundle_reference');
        });
    }
};
