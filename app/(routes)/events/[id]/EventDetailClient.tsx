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
  const [refreshKey, setRefreshKey] = React.useState(0);
  const start = new Date(event.start);
  const end = new Date(event.end);
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
        <p className="text-sm text-muted-foreground">
          {format(start, "PPpp")} - {format(end, "PPpp")} • {event.location} • {event.category}
        </p>
      </div>
      {event.description && <p className="text-sm text-muted-foreground whitespace-pre-line">{event.description}</p>}
      <section className="space-y-4">
        <h2 className="text-lg font-medium">Attendees</h2>
        <AddAttendeeForm eventId={event.id} onAdded={() => setRefreshKey(k => k + 1)} />
        <AttendeeList eventId={event.id} refreshKey={refreshKey} />
      </section>
      <div>
        <Button variant="outline" onClick={() => history.back()}>Back</Button>
      </div>
    </main>
  );
}
