<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EventController;

Route::prefix('events')->group(function () {
    Route::post('/', [EventController::class, 'store']);
    Route::get('/', [EventController::class, 'index']);
    Route::post('{event}/register', [EventController::class, 'register']);
    Route::get('{event}/attendees', [EventController::class, 'attendees']);
});
