"use client";
import * as React from "react";
import { EventsList } from "@/app/(components)/events/EventsList";
import { EventForm } from "@/app/(components)/events/EventForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { Event, EventDraft } from "@/lib/types";
import { addHours } from "date-fns";
import { fetchEvents as apiFetchEvents, createEvent as apiCreateEvent } from "@/lib/api";

// Simple curated timezone options (common examples). Backend expects IANA names.
const TIMEZONE_OPTIONS = [
  'UTC',
  'Asia/Kolkata',
  'America/New_York',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Singapore',
  'Australia/Sydney'
];

interface EventsPageClientProps {
  initialEvents: Event[];
}

export function EventsPageClient({ initialEvents }: EventsPageClientProps) {
  const [events, setEvents] = React.useState<Event[]>(initialEvents);
  const [open, setOpen] = React.useState(false);
  const [timezone, setTimezone] = React.useState<string>('Asia/Kolkata');
  const tzRef = React.useRef(timezone);

  // Hydrate: attempt backend fetch, fallback to localStorage legacy data
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const backend = await apiFetchEvents(tzRef.current);
      if (!cancelled && backend.length) {
        setEvents(backend);
        return;
      }
      // fallback legacy logic
      try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem('events-data:v1') : null;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const migrated: Event[] = parsed.map((e: any) => {
              let startIso = e.start;
              let endIso = e.end;
              if (!startIso || !endIso) {
                const legacyDate = e.date ? new Date(e.date) : new Date();
                const end = addHours(legacyDate, 1);
                startIso = legacyDate.toISOString();
                endIso = end.toISOString();
              }
              return {
                id: e.id || crypto.randomUUID(),
                title: e.title || "Untitled",
                description: e.description || "",
                location: e.location || "Online",
                start: startIso,
                end: endIso,
                date: e.date,
                category: e.category || "General",
                maxCapacity: typeof e.maxCapacity === 'number' ? e.maxCapacity : undefined,
                attendees: Array.isArray(e.attendees) ? e.attendees : [],
                createdAt: e.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              } as Event;
            });
            if (!cancelled) setEvents(migrated);
          }
        }
      } catch (e) {
        console.warn('Failed to load events fallback', e);
      }
    })();
    return () => { cancelled = true; };
  }, []); // initial hydration only

  // Refetch when timezone changes
  React.useEffect(() => {
    let cancelled = false;
    tzRef.current = timezone;
    (async () => {
      const backend = await apiFetchEvents(timezone);
      if (!cancelled && backend.length) {
        setEvents(backend);
      }
    })();
    return () => { cancelled = true; };
  }, [timezone]);

  // Persist when events change
  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('events-data:v1', JSON.stringify(events));
      }
    } catch (e) {
      console.warn('Failed to persist events', e);
    }
  }, [events]);

  async function addEvent(draft: EventDraft) {
    // Try backend first
  const created = await apiCreateEvent(draft, timezone);
    if (created) {
      setEvents(prev => [created, ...prev]);
      setOpen(false);
      return;
    }
    // fallback local create
    const now = new Date();
    const startDate = draft.start ?? draft.date ?? now;
    const endDate = draft.end && draft.start ? draft.end : addHours(startDate, 1);
    const local: Event = {
      id: crypto.randomUUID(),
      title: draft.title ?? 'Untitled',
      description: draft.description ?? '',
      location: draft.location ?? 'Online',
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      date: startDate,
      category: draft.category ?? 'General',
      maxCapacity: draft.maxCapacity,
      attendees: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    setEvents(prev => [local, ...prev]);
    setOpen(false);
  }

  function deleteEvent(id: string) {
    setEvents(prev => prev.filter(e => e.id !== id));
  }

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Events</h1>
          <div className="flex items-center gap-2">
            <label htmlFor="timezone" className="text-sm text-muted-foreground">Timezone</label>
            <select
              id="timezone"
              className="border rounded px-2 py-1 text-sm bg-background"
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
            >
              {TIMEZONE_OPTIONS.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>New Event</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Event</DialogTitle>
              <DialogDescription>Fill in details and save to add your event.</DialogDescription>
            </DialogHeader>
            <EventForm onSubmit={addEvent} />
          </DialogContent>
        </Dialog>
      </div>
      <EventsList events={events} onSelect={() => {}} onDelete={deleteEvent} />
    </main>
  );
}
