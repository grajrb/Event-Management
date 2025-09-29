"use client";
import * as React from "react";
import type { Event } from "@/lib/types";
import { AttendeeList } from "@/app/(components)/attendees/AttendeeList";
import { AddAttendeeForm } from "@/app/(components)/attendees/AddAttendeeForm";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface EventDetailClientProps {
  event: Event;
}

export function EventDetailClient({ event }: EventDetailClientProps) {
  const [attendees, setAttendees] = React.useState(event.attendees);

  function addAttendee(name: string) {
    setAttendees(prev => [...prev, { id: crypto.randomUUID(), name }]);
  }
  function removeAttendee(id: string) {
    setAttendees(prev => prev.filter(a => a.id !== id));
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
        <p className="text-sm text-muted-foreground">
          {format(new Date(event.date), "PPpp")} • {event.location} • {event.category}
        </p>
      </div>
      {event.description && <p className="text-sm text-muted-foreground whitespace-pre-line">{event.description}</p>}
      <section className="space-y-4">
        <h2 className="text-lg font-medium">Attendees ({attendees.length})</h2>
        <AddAttendeeForm onAdd={addAttendee} />
        <AttendeeList attendees={attendees} onRemove={removeAttendee} />
      </section>
      <div>
        <Button variant="outline" onClick={() => history.back()}>Back</Button>
      </div>
    </main>
  );
}
