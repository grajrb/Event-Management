"use client";
import * as React from "react";
import { EventCard } from "./EventCard";
import type { Event } from "@/lib/types";

interface EventsListProps {
  events: Event[];
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  emptyState?: React.ReactNode;
}

export function EventsList({ events, onSelect, onDelete, emptyState }: EventsListProps) {
  if (events.length === 0) {
    return (
      <div className="text-sm text-muted-foreground border rounded-md p-6 text-center">
        {emptyState ?? "No events yet."}
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {events.map(evt => (
        <EventCard key={evt.id} event={evt} onSelect={onSelect} onDelete={onDelete} />
      ))}
    </div>
  );
}
