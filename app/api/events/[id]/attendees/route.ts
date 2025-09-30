import { NextRequest, NextResponse } from 'next/server';

interface Attendee { id: number; name: string; email: string; event_id: number }
const globalAny: any = globalThis as any;
if (!globalAny.__EVENTS_MEM__) {
  globalAny.__EVENTS_MEM__ = { events: [], nextId: 1 };
}
const attendees: Attendee[] = globalAny.__EVENTS_ATTENDEES__ || (globalAny.__EVENTS_ATTENDEES__ = []);

function paginate<T>(items: T[], page: number, perPage: number) {
  const start = (page - 1) * perPage;
  const data = items.slice(start, start + perPage);
  return {
    data,
    meta: {
      page,
      per_page: perPage,
      total: items.length,
      total_pages: Math.ceil(items.length / perPage) || 1,
    }
  };
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const eventId = parseInt(params.id, 10);
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('per_page') || '20', 10);
  const filtered = attendees.filter(a => a.event_id === eventId).map(a => ({ id: a.id, name: a.name }));
  return NextResponse.json(paginate(filtered, page, perPage));
}
