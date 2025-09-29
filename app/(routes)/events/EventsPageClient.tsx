"use client";
import * as React from "react";
import { EventsList } from "@/app/(components)/events/EventsList";
import { EventForm } from "@/app/(components)/events/EventForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { Event, EventDraft } from "@/lib/types";
import { makeId } from "@/lib/utils";

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
        const parsed: Event[] = JSON.parse(raw).map((e: any) => ({ ...e, date: e.date }));
        if (Array.isArray(parsed) && parsed.length) {
          setEvents(parsed);
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
    const newEvent: Event = {
      id: makeId(),
      title: draft.title ?? "Untitled",
      description: draft.description ?? "",
      location: draft.location ?? "Online",
      date: draft.date ?? new Date(),
      category: draft.category ?? "General",
      attendees: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
