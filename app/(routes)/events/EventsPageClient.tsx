"use client";
import * as React from "react";
import { EventsList } from "@/app/(components)/events/EventsList";
import { EventForm } from "@/app/(components)/events/EventForm";
import { Button } from "@/components/ui/button";
import type { Event, EventDraft } from "@/lib/types";
import { makeId } from "@/lib/utils";

interface EventsPageClientProps {
  initialEvents: Event[];
}

export function EventsPageClient({ initialEvents }: EventsPageClientProps) {
  const [events, setEvents] = React.useState<Event[]>(initialEvents);
  const [showForm, setShowForm] = React.useState(false);

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
    setShowForm(false);
  }

  function deleteEvent(id: string) {
    setEvents(prev => prev.filter(e => e.id !== id));
  }

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Events</h1>
        <Button onClick={() => setShowForm(s => !s)} variant={showForm ? "outline" : "default"}>
          {showForm ? "Cancel" : "New Event"}
        </Button>
      </div>
      {showForm && (
        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-medium mb-4">Create Event</h2>
          <EventForm onSubmit={addEvent} />
        </div>
      )}
      <EventsList events={events} onSelect={() => {}} onDelete={deleteEvent} />
    </main>
  );
}
