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

    /**
     * @OA\Post(
     *   path="/api/events",
     *   summary="Create an event",
     *   tags={"Events"},
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(required={"name","start_time","end_time"},
     *       @OA\Property(property="name", type="string", example="Tech Meetup"),
     *       @OA\Property(property="location", type="string", example="Online"),
     *       @OA\Property(property="start_time", type="string", format="date-time", example="2025-10-01 18:00:00"),
     *       @OA\Property(property="end_time", type="string", format="date-time", example="2025-10-01 19:00:00"),
     *       @OA\Property(property="max_capacity", type="integer", example=100),
     *       @OA\Property(property="timezone", type="string", example="Asia/Kolkata")
     *     )
     *   ),
     *   @OA\Response(
     *     response=201,
     *     description="Created",
     *     @OA\JsonContent(ref="#/components/schemas/Event")
     *   ),
     *   @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(StoreEventRequest $request): JsonResponse
    {
        $event = $this->service->create($request->validated());
        return response()->json($this->transformEvent($event), 201);
    }

    /**
     * @OA\Get(
     *   path="/api/events",
     *   summary="List upcoming events",
     *   tags={"Events"},
     *   @OA\Parameter(name="page", in="query", required=false, @OA\Schema(type="integer", minimum=1)),
     *   @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", minimum=1, maximum=100)),
     *   @OA\Parameter(name="tz", in="query", required=false, description="Timezone identifier for localized fields", @OA\Schema(type="string")),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Event")),
     *       @OA\Property(property="meta", type="object",
     *         @OA\Property(property="page", type="integer"),
     *         @OA\Property(property="per_page", type="integer"),
     *         @OA\Property(property="total", type="integer"),
     *         @OA\Property(property="total_pages", type="integer")
     *       )
     *     )
     *   )
     * )
     */
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

    /**
     * @OA\Post(
     *   path="/api/events/{event}/register",
     *   summary="Register attendee for event",
     *   tags={"Attendees"},
     *   @OA\Parameter(name="event", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\RequestBody(required=true, @OA\JsonContent(required={"name","email"},
     *     @OA\Property(property="name", type="string", example="Jane Doe"),
     *     @OA\Property(property="email", type="string", format="email", example="jane@example.com")
     *   )),
     *   @OA\Response(response=201, description="Created", @OA\JsonContent(ref="#/components/schemas/Attendee")),
     *   @OA\Response(response=404, description="Event not found"),
     *   @OA\Response(response=409, description="Duplicate or capacity full",
     *     @OA\JsonContent(@OA\Property(property="error", type="string", example="capacity_full"))
     *   )
     * )
     */
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

    /**
     * @OA\Get(
     *   path="/api/events/{event}/attendees",
     *   summary="List attendees for event",
     *   tags={"Attendees"},
     *   @OA\Parameter(name="event", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Parameter(name="page", in="query", required=false, @OA\Schema(type="integer", minimum=1)),
     *   @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", minimum=1, maximum=100)),
     *   @OA\Response(response=200, description="OK",
     *     @OA\JsonContent(
     *       @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Attendee")),
     *       @OA\Property(property="meta", type="object",
     *         @OA\Property(property="page", type="integer"),
     *         @OA\Property(property="per_page", type="integer"),
     *         @OA\Property(property="total", type="integer"),
     *         @OA\Property(property="total_pages", type="integer")
     *       )
     *     )
     *   ),
     *   @OA\Response(response=404, description="Event not found")
     * )
     */
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

/**
 * @OA\Schema(
 *   schema="Event",
 *   @OA\Property(property="id", type="integer", example=1),
 *   @OA\Property(property="name", type="string", example="Tech Meetup"),
 *   @OA\Property(property="location", type="string", example="Online"),
 *   @OA\Property(property="start_time_utc", type="string", format="date-time"),
 *   @OA\Property(property="end_time_utc", type="string", format="date-time"),
 *   @OA\Property(property="max_capacity", type="integer", nullable=true, example=150),
 *   @OA\Property(property="remaining_capacity", type="integer", nullable=true, example=120),
 *   @OA\Property(property="created_at", type="string", format="date-time"),
 *   @OA\Property(property="updated_at", type="string", format="date-time"),
 *   @OA\Property(property="start_time_local", type="string", format="date-time", nullable=true),
 *   @OA\Property(property="end_time_local", type="string", format="date-time", nullable=true)
 * )
 *
 * @OA\Schema(
 *   schema="Attendee",
 *   @OA\Property(property="id", type="integer", example=10),
 *   @OA\Property(property="event_id", type="integer", example=1),
 *   @OA\Property(property="name", type="string", example="Jane Doe"),
 *   @OA\Property(property="email", type="string", format="email", example="jane@example.com"),
 *   @OA\Property(property="registered_at", type="string", format="date-time")
 * )
 */
