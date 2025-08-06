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
        Schema::create('organizers', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('referring', 100)->nullable();
            $table->string('email', 150)->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('logo_url', 150)->nullable();
            $table->string('facebook_url', 150)->nullable();
            $table->string('instagram_url', 150)->nullable();
            $table->string('twitter_url', 150)->nullable();
            $table->string('tax', 50)->nullable();
            $table->string('decidir_public_key_prod')->nullable();
            $table->string('decidir_secret_key_prod')->nullable();
            $table->string('decidir_public_key_test')->nullable();
            $table->string('decidir_secret_key_test')->nullable();  
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organizers');
    }
};
