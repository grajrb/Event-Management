"use client";
import * as React from "react";
import { EventsList } from "@/app/(components)/events/EventsList";
import { EventForm } from "@/app/(components)/events/EventForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { Event, EventDraft } from "@/lib/types";
import { makeId } from "@/lib/utils";
import { addHours } from "date-fns";

interface EventsPageClientProps {
  initialEvents: Event[];
}

export function EventsPageClient({ initialEvents }: EventsPageClientProps) {
  const [events, setEvents] = React.useState<Event[]>(initialEvents);
  const [open, setOpen] = React.useState(false);

  // Hydrate from localStorage once on mount
  React.useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('events-data:v1') : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const migrated: Event[] = parsed.map((e: any) => {
            // Migration: if start/end missing, derive from legacy date
            let startIso = e.start;
            let endIso = e.end;
            if (!startIso || !endIso) {
              const legacyDate = e.date ? new Date(e.date) : new Date();
              const end = addHours(legacyDate, 1);
              startIso = legacyDate.toISOString();
              endIso = end.toISOString();
            }
            return {
              id: e.id || makeId(),
              title: e.title || "Untitled",
              description: e.description || "",
              location: e.location || "Online",
              start: startIso,
              end: endIso,
              date: e.date, // keep legacy field if present
              category: e.category || "General",
              maxCapacity: typeof e.maxCapacity === 'number' ? e.maxCapacity : undefined,
              attendees: Array.isArray(e.attendees) ? e.attendees : [],
              createdAt: e.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as Event;
          });
          setEvents(migrated);
        }
      }
    } catch (e) {
      console.warn('Failed to load events from storage', e);
    }
  }, []);

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

  function addEvent(draft: EventDraft) {
    const now = new Date();
    const startDate = draft.start ?? draft.date ?? now;
    const endDate = draft.end && draft.start ? draft.end : addHours(startDate, 1);

    const newEvent: Event = {
      id: makeId(),
      title: draft.title ?? "Untitled",
      description: draft.description ?? "",
      location: draft.location ?? "Online",
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      date: startDate, // keep legacy for now
      category: draft.category ?? "General",
      maxCapacity: draft.maxCapacity,
      attendees: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    setEvents(prev => [newEvent, ...prev]);
    setOpen(false);
  }

  function deleteEvent(id: string) {
    setEvents(prev => prev.filter(e => e.id !== id));
  }

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Events</h1>
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
