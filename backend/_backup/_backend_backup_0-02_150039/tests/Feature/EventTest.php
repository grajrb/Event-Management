<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Event;

class EventTest extends TestCase
{
    use RefreshDatabase;

    public function test_event_creation(): void
    {
        $res = $this->postJson('/api/events', [
            'name' => 'Sample',
            'location' => 'Online',
            'start_time' => now('Asia/Kolkata')->addDay()->toDateTimeString(),
            'end_time' => now('Asia/Kolkata')->addDay()->addHour()->toDateTimeString(),
            'max_capacity' => 10,
        ]);

        $res->assertCreated()->assertJsonStructure(['id','name','start_time_utc']);
    }
}
