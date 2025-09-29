export interface Attendee {
  id: string;
  name: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: Date | string; // allow string for serialized data
  category: string;
  attendees: Attendee[];
  createdAt: string;
  updatedAt: string;
}

export interface EventDraft {
  title?: string;
  description?: string;
  location?: string;
  date?: Date;
  category?: string;
}
