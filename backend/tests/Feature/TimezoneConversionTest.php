<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

class TimezoneConversionTest extends TestCase
{
    use RefreshDatabase;

    public function test_ist_input_stored_as_utc(): void
    {
        $startIst = Carbon::parse('2025-10-01 10:00:00', 'Asia/Kolkata');
        $endIst = $startIst->clone()->addHour();
        $payload = [
            'name' => 'TZ Event',
            'location' => 'Delhi',
            'start_time' => $startIst->toDateTimeString(),
            'end_time' => $endIst->toDateTimeString(),
            'timezone' => 'Asia/Kolkata'
        ];
        $res = $this->postJson('/api/events', $payload)->assertCreated();
        $data = $res->json();
        // Expect stored UTC to equal IST - 5h30m
        $startUtc = Carbon::parse($data['start_time_utc']);
        $this->assertTrue($startUtc->equalTo($startIst->clone()->utc()));
    }
}
