"use client";
import * as React from "react";
import type { Attendee } from "@/lib/types";

interface AttendeeListProps {
  attendees: Attendee[];
  onRemove?: (id: string) => void;
}

export function AttendeeList({ attendees, onRemove }: AttendeeListProps) {
  if (attendees.length === 0) {
    return <div className="text-sm text-muted-foreground">No attendees yet.</div>;
  }
  return (
    <ul className="space-y-2">
      {attendees.map(a => (
        <li key={a.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
          <span className="truncate" title={a.name}>{a.name}</span>
          <button
            onClick={() => onRemove?.(a.id)}
            className="text-xs text-destructive hover:underline"
          >
            remove
          </button>
        </li>
      ))}
    </ul>
  );
}
