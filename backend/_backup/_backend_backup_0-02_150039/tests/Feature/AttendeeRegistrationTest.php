<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Event;
use Carbon\Carbon;

class AttendeeRegistrationTest extends TestCase
{
    use RefreshDatabase;

    private function createEvent(int $capacity = 2): Event
    {
        $start = Carbon::now('Asia/Kolkata')->addDay();
        $end = $start->clone()->addHour();
        return Event::create([
            'name' => 'Cap Test',
            'location' => 'Online',
            'start_time_utc' => $start->clone()->utc(),
            'end_time_utc' => $end->clone()->utc(),
            'max_capacity' => $capacity,
        ]);
    }

    public function test_register_attendee_success(): void
    {
        $event = $this->createEvent();
        $res = $this->postJson("/api/events/{$event->id}/register", [
            'name' => 'Jane',
            'email' => 'jane@example.com'
        ]);
        $res->assertCreated()->assertJsonPath('email', 'jane@example.com');
    }

    public function test_duplicate_registration_conflict(): void
    {
        $event = $this->createEvent();
        $this->postJson("/api/events/{$event->id}/register", [ 'name' => 'Jane', 'email' => 'jane@example.com' ])->assertCreated();
        $this->postJson("/api/events/{$event->id}/register", [ 'name' => 'Jane 2', 'email' => 'JANE@example.com' ])->assertStatus(409)->assertJson(['error' => 'duplicate_attendee']);
    }

    public function test_capacity_full_conflict(): void
    {
        $event = $this->createEvent(1);
        $this->postJson("/api/events/{$event->id}/register", [ 'name' => 'Jane', 'email' => 'jane@example.com' ])->assertCreated();
        $this->postJson("/api/events/{$event->id}/register", [ 'name' => 'John', 'email' => 'john@example.com' ])->assertStatus(409)->assertJson(['error' => 'capacity_full']);
    }

    public function test_attendee_pagination(): void
    {
        $event = $this->createEvent(5);
        foreach (range(1,3) as $i) {
            $this->postJson("/api/events/{$event->id}/register", [ 'name' => "User $i", 'email' => "user$i@example.com" ])->assertCreated();
        }
        $res = $this->getJson("/api/events/{$event->id}/attendees?per_page=2&page=2");
        $res->assertOk()->assertJsonPath('meta.page', 2)->assertJsonPath('meta.per_page', 2);
    }
}
