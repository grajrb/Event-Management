"use client";
import * as React from "react";
// Card view kept separately; this list now renders a table for dense overview.
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";
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
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[160px]">Title</TableHead>
            <TableHead className="min-w-[180px]">Schedule</TableHead>
            <TableHead className="min-w-[120px] hidden md:table-cell">Location</TableHead>
            <TableHead className="min-w-[100px] hidden lg:table-cell">Category</TableHead>
            <TableHead className="w-[110px] text-center">Attendees</TableHead>
            <TableHead className="w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map(evt => {
            const start = evt.start ? new Date(evt.start) : (evt.date ? new Date(evt.date) : new Date());
            const end = evt.end ? new Date(evt.end) : new Date(start.getTime() + 60 * 60 * 1000);
            const sameDay = start.toDateString() === end.toDateString();
            const range = sameDay
              ? `${format(start, 'PP p')} – ${format(end, 'p')}`
              : `${format(start, 'PP p')} → ${format(end, 'PP p')}`;
            const capacityInfo = typeof evt.maxCapacity === 'number'
              ? `${evt.attendees.length}/${evt.maxCapacity}`
              : `${evt.attendees.length}`;
            return (
              <TableRow key={evt.id}>
                <TableCell className="font-medium truncate" title={evt.title}>{evt.title}</TableCell>
                <TableCell className="whitespace-nowrap" title={range}>{range}</TableCell>
                <TableCell className="hidden md:table-cell truncate" title={evt.location}>{evt.location}</TableCell>
                <TableCell className="hidden lg:table-cell">{evt.category}</TableCell>
                <TableCell className="text-center" title={capacityInfo}>{capacityInfo}</TableCell>
                <TableCell className="flex gap-2">
                  <Link href={`/events/${evt.id}`} legacyBehavior>
                    <a>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </a>
                  </Link>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete?.(evt.id)}>Del</Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
