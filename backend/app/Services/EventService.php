<?php

namespace App\Services;

use App\Models\Event;
use App\Models\Attendee;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Pagination\Paginator;
use Illuminate\Pagination\LengthAwarePaginator as PaginatorLengthAware;
use RuntimeException;

class EventService
{
    public function create(array $data): Event
    {
        // Expect start_time & end_time given in IST or specified tz, convert to UTC
        $tz = $data['timezone'] ?? 'Asia/Kolkata';
        $startUtc = Carbon::parse($data['start_time'], $tz)->clone()->utc();
        $endUtc = Carbon::parse($data['end_time'], $tz)->clone()->utc();
        if ($endUtc->lessThanOrEqualTo($startUtc)) {
            throw new RuntimeException('end_time must be after start_time');
        }

        return Event::create([
            'name' => $data['name'],
            'location' => $data['location'] ?? null,
            'start_time_utc' => $startUtc,
            'end_time_utc' => $endUtc,
            'max_capacity' => $data['max_capacity'] ?? null,
        ]);
    }

    public function listUpcoming(int $page = 1, int $perPage = 20): LengthAwarePaginator
    {
        return Event::query()
            ->where('end_time_utc', '>', Carbon::now('UTC'))
            ->orderBy('start_time_utc')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    public function register(Event $event, array $data): Attendee
    {
        return DB::transaction(function () use ($event, $data) {
            // Lock event row for capacity check
            $event = Event::where('id', $event->id)->lockForUpdate()->firstOrFail();
            if (!$event->hasCapacity()) {
                throw new RuntimeException('capacity_full');
            }
            $exists = $event->attendees()->whereRaw('LOWER(email) = ?', [strtolower($data['email'])])->exists();
            if ($exists) {
                throw new RuntimeException('duplicate_attendee');
            }
            return $event->attendees()->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'registered_at' => Carbon::now('UTC'),
            ]);
        });
    }

    public function attendees(Event $event, int $page = 1, int $perPage = 20): LengthAwarePaginator
    {
        return $event->attendees()->orderBy('registered_at')->paginate($perPage, ['*'], 'page', $page);
    }
}
