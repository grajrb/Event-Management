export interface Attendee {
  id: string;
  name: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  // New: start/end times; keep legacy date for backward compatibility/migration
  start: string; // ISO string
  end: string;   // ISO string
  date?: Date | string; // deprecated
  category: string;
  maxCapacity?: number;
  attendees: Attendee[];
  createdAt: string;
  updatedAt: string;
}

export interface EventDraft {
  title?: string;
  description?: string;
  location?: string;
  start?: Date; // start date-time
  end?: Date;   // end date-time
  date?: Date;  // legacy single date
  category?: string;
  maxCapacity?: number;
}
