import { NextRequest, NextResponse } from 'next/server';

interface Attendee { id: number; name: string; email: string; event_id: number }
const attendees: Attendee[] = [];

// reuse events from parent via globalThis (since separate module scope)
const globalAny: any = globalThis as any;
if (!globalAny.__EVENTS_MEM__) {
  globalAny.__EVENTS_MEM__ = { events: [], nextId: 1 };
}

function findEvent(id: number) {
  return globalAny.__EVENTS_MEM__.events.find((e: any) => e.id === id);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const eventId = parseInt(params.id, 10);
  const event = findEvent(eventId);
  if (!event) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const body = await req.json();
  const email = (body.email || '').toLowerCase();
  const name = body.name || 'Anonymous';
  if (!email) return NextResponse.json({ error: 'email_required' }, { status: 422 });

  // duplicate check
  if (attendees.some(a => a.event_id === eventId && a.email === email)) {
    return NextResponse.json({ error: 'duplicate_attendee' }, { status: 409 });
  }

  if (event.max_capacity && attendees.filter(a => a.event_id === eventId).length >= event.max_capacity) {
    return NextResponse.json({ error: 'capacity_full' }, { status: 409 });
  }

  const att: Attendee = { id: attendees.length + 1, name, email, event_id: eventId };
  attendees.push(att);
  return NextResponse.json(att, { status: 201 });
}
