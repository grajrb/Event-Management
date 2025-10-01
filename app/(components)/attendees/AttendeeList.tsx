"use client";
import * as React from 'react';
import type { Attendee } from '@/lib/types';
import { fetchAttendees } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface AttendeeListProps {
  eventId: string | number;
  refreshKey?: number; // change this to force refetch (e.g., after registration)
}

export function AttendeeList({ eventId, refreshKey }: AttendeeListProps) {
  const [attendees, setAttendees] = React.useState<Attendee[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [loading, setLoading] = React.useState(false);

  async function load(p = page) {
    setLoading(true);
    const res = await fetchAttendees(eventId, p, 20);
    setAttendees(res.data);
    setTotalPages(res.meta.total_pages || 1);
    setLoading(false);
  }

  React.useEffect(() => { load(1); /* reset to first page on refreshKey change */ }, [refreshKey]);
  React.useEffect(() => { load(page); }, [page]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Attendees</h3>
        {loading && <span className="text-xs text-muted-foreground">Loading...</span>}
      </div>
      {attendees.length === 0 && !loading && (
        <p className="text-sm text-muted-foreground">No attendees yet.</p>
      )}
      <ul className="list-disc pl-5 space-y-1">
        {attendees.map(a => (
          <li key={a.id} className="text-sm">{a.name}</li>
        ))}
      </ul>
      {totalPages > 1 && (
        <div className="flex gap-2 items-center">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p-1))}>Prev</Button>
          <span className="text-xs">Page {page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))}>Next</Button>
        </div>
      )}
    </div>
  );
}
