// Basic API client for backend integration with graceful fallback to local storage logic.
// Assumes backend base URL provided via NEXT_PUBLIC_API_BASE (e.g., http://localhost:8000/api)

import type { Event, EventDraft, Attendee } from './types';

const BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api';

interface ApiPaginationMeta { page: number; per_page: number; total: number; total_pages: number; }

export interface Paginated<T> { data: T[]; meta: ApiPaginationMeta; }

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let body: any = null;
    try { body = await res.json(); } catch { /* ignore */ }
    const error = new Error(body?.error || res.statusText);
    (error as any).status = res.status;
    (error as any).body = body;
    throw error;
  }
  return res.json();
}

export async function fetchEvents(tz?: string): Promise<Event[]> {
  try {
    const url = new URL(BASE + '/events');
    if (tz) url.searchParams.set('tz', tz);
    const res = await fetch(url.toString(), { cache: 'no-store' });
    const data = await json<{ data: any[] }>(res);
    return data.data.map(transformEventFromApi);
  } catch (e) {
    console.warn('Falling back to local events due to API error', e);
    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem('events-data:v1');
      if (raw) {
        try { return JSON.parse(raw); } catch { return []; }
      }
    }
    return [];
  }
}

export async function fetchEvent(id: string | number, tz?: string): Promise<Event | null> {
  try {
    const url = new URL(BASE + `/events/${id}`);
    if (tz) url.searchParams.set('tz', tz);
    const res = await fetch(url.toString(), { cache: 'no-store' });
    const data = await json<any>(res);
    return transformEventFromApi(data);
  } catch (e) {
    console.warn('fetchEvent failed', e);
    return null;
  }
}

export async function createEvent(draft: EventDraft, tz = 'Asia/Kolkata'): Promise<Event | null> {
  try {
    const payload = {
      name: draft.title || 'Untitled',
      location: draft.location || 'Online',
      start_time: (draft.start || new Date()).toISOString().replace('T', ' ').substring(0, 19),
      end_time: (draft.end || new Date(Date.now() + 60*60*1000)).toISOString().replace('T', ' ').substring(0, 19),
      max_capacity: draft.maxCapacity,
      timezone: tz,
    };
    const res = await fetch(BASE + '/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await json<any>(res);
    return transformEventFromApi(data);
  } catch (e) {
    console.warn('createEvent API failed, returning null', e);
    return null;
  }
}

export async function registerAttendee(eventId: string | number, name: string, email: string): Promise<Attendee | null> {
  try {
    const res = await fetch(`${BASE}/events/${eventId}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });
    const data = await json<any>(res);
    return { id: String(data.id), name: data.name };
  } catch (e) {
    console.warn('registerAttendee failed', e);
    return null;
  }
}

export async function fetchAttendees(eventId: string | number, page = 1, perPage = 20): Promise<Paginated<Attendee>> {
  try {
    const url = new URL(`${BASE}/events/${eventId}/attendees`);
    url.searchParams.set('page', String(page));
    url.searchParams.set('per_page', String(perPage));
    const res = await fetch(url.toString());
    const data = await json<{ data: any[]; meta: ApiPaginationMeta }>(res);
    return { data: data.data.map(a => ({ id: String(a.id), name: a.name })), meta: data.meta };
  } catch (e) {
    console.warn('fetchAttendees failed', e);
    return { data: [], meta: { page: 1, per_page: perPage, total: 0, total_pages: 0 } };
  }
}

function transformEventFromApi(e: any): Event {
  return {
    id: String(e.id),
    title: e.name,
    description: '',
    location: e.location || 'Online',
    start: e.start_time_utc,
    end: e.end_time_utc,
    date: e.start_time_utc,
    category: 'General',
    maxCapacity: e.max_capacity ?? undefined,
    attendees: [],
    createdAt: e.created_at || new Date().toISOString(),
    updatedAt: e.updated_at || new Date().toISOString(),
  };
}
