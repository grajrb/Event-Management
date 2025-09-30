import { NextRequest, NextResponse } from 'next/server';

// In-memory store as placeholder when real backend not running
let _events: any[] = [];
let _nextId = 1;

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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('per_page') || '50', 10);
  return NextResponse.json(paginate(_events, page, perPage));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const now = new Date();
    const evt = {
      id: _nextId++,
      name: body.name || 'Untitled',
      location: body.location || 'Online',
      start_time_utc: body.start_time ? new Date(body.start_time.replace(' ', 'T') + 'Z').toISOString() : now.toISOString(),
      end_time_utc: body.end_time ? new Date(body.end_time.replace(' ', 'T') + 'Z').toISOString() : new Date(now.getTime() + 3600000).toISOString(),
      max_capacity: body.max_capacity ?? null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };
    _events.push(evt);
    return NextResponse.json(evt, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: 'invalid_payload', message: e?.message }, { status: 400 });
  }
}
