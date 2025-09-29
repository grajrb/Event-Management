<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('location')->nullable();
            $table->timestampTz('start_time_utc');
            $table->timestampTz('end_time_utc');
            $table->unsignedInteger('max_capacity')->nullable();
            $table->timestamps();
            $table->index('start_time_utc');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
