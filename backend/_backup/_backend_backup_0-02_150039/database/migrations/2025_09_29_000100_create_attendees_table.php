<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('attendees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('email');
            $table->timestampTz('registered_at');
            $table->timestamps();
            $table->unique(['event_id', 'email']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendees');
    }
};
