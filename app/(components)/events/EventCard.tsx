"use client";
import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { Event } from "@/lib/types";

interface EventCardProps {
  event: Event;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function EventCard({ event, onSelect, onDelete }: EventCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="truncate" title={event.title}>{event.title}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {(() => {
              const start = event.start ? new Date(event.start) : (event.date ? new Date(event.date) : new Date());
              const end = event.end ? new Date(event.end) : new Date(start.getTime() + 60 * 60 * 1000);
              const sameDay = start.toDateString() === end.toDateString();
              return sameDay
                ? `${format(start, 'PP p')} – ${format(end, 'p')}`
                : `${format(start, 'PP p')} → ${format(end, 'PP p')}`;
            })()}
          </span>
        </CardTitle>
        {event.description && (
          <CardDescription className="line-clamp-2">{event.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <div className="flex flex-wrap gap-2 text-muted-foreground">
          <span>{event.location}</span>
          <span>•</span>
          <span>{event.category}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {typeof event.maxCapacity === 'number'
            ? `${event.attendees.length}/${event.maxCapacity} attendee${event.attendees.length === 1 ? '' : 's'}`
            : `${event.attendees.length} attendee${event.attendees.length === 1 ? '' : 's'}`}
        </div>
      </CardContent>
      <CardFooter className="mt-auto flex items-center gap-2">
        <Button
          size="sm"
            variant="outline"
            aria-label={`View event ${event.title}`}
            onClick={() => onSelect?.(event.id)}
          >
            View
          </Button>
        <Button
          size="sm"
          variant="ghost"
          aria-label={`Delete event ${event.title}`}
          onClick={() => onDelete?.(event.id)}
          className="text-destructive hover:text-destructive"
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
