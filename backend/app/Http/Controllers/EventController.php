<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\RegisterAttendeeRequest;
use App\Models\Event;
use App\Services\EventService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class EventController extends Controller
{
    public function __construct(private EventService $service) {}

    public function store(StoreEventRequest $request): JsonResponse
    {
        $event = $this->service->create($request->validated());
        return response()->json($this->transformEvent($event), 201);
    }

    public function index(Request $request): JsonResponse
    {
        $page = (int) $request->query('page', 1);
        $per = (int) $request->query('per_page', 20);
        $tz = $request->query('tz');
        $paginator = $this->service->listUpcoming($page, $per);
        return response()->json([
            'data' => $paginator->getCollection()->map(fn ($e) => $this->transformEvent($e, $tz))->all(),
            'meta' => [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'total_pages' => $paginator->lastPage(),
            ]
        ]);
    }

    public function register(RegisterAttendeeRequest $request, Event $event): JsonResponse
    {
        try {
            $attendee = $this->service->register($event, $request->validated());
            return response()->json([
                'id' => $attendee->id,
                'event_id' => $attendee->event_id,
                'name' => $attendee->name,
                'email' => $attendee->email,
                'registered_at' => $attendee->registered_at->toIso8601ZuluString(),
            ], 201);
        } catch (RuntimeException $e) {
            $code = $e->getMessage();
            return response()->json(['error' => $code], $code === 'capacity_full' || $code === 'duplicate_attendee' ? 409 : 400);
        }
    }

    public function attendees(Request $request, Event $event): JsonResponse
    {
        $page = (int) $request->query('page', 1);
        $per = (int) $request->query('per_page', 20);
        $paginator = $this->service->attendees($event, $page, $per);
        return response()->json([
            'data' => $paginator->getCollection()->map(fn ($a) => [
                'id' => $a->id,
                'name' => $a->name,
                'email' => $a->email,
                'registered_at' => $a->registered_at->toIso8601ZuluString(),
            ])->all(),
            'meta' => [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'total_pages' => $paginator->lastPage(),
            ]
        ]);
    }

    private function transformEvent(Event $event, ?string $targetTz = null): array
    {
        $startUtc = $event->start_time_utc->copy();
        $endUtc = $event->end_time_utc->copy();
        $out = [
            'id' => $event->id,
            'name' => $event->name,
            'location' => $event->location,
            'start_time_utc' => $startUtc->toIso8601ZuluString(),
            'end_time_utc' => $endUtc->toIso8601ZuluString(),
            'max_capacity' => $event->max_capacity,
            'remaining_capacity' => $event->remainingCapacity(),
            'created_at' => $event->created_at?->toIso8601ZuluString(),
            'updated_at' => $event->updated_at?->toIso8601ZuluString(),
        ];
        if ($targetTz) {
            $out['start_time_local'] = $startUtc->clone()->setTimezone($targetTz)->toIso8601String();
            $out['end_time_local'] = $endUtc->clone()->setTimezone($targetTz)->toIso8601String();
        }
        return $out;
    }
}
