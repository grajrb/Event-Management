import type { Event } from "@/lib/types";

function randomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2, 10);
}

export function seedEvents(): Event[] {
  const now = new Date();
  return [
    {
      id: randomId(),
      title: "Product Launch Webinar",
      description: "Deep dive into our new feature set and live Q&A.",
      location: "Online",
      date: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 2).toISOString(),
      category: "Webinar",
      attendees: [
        { id: randomId(), name: "Alice" },
        { id: randomId(), name: "Bob" }
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: randomId(),
      title: "Community Meetup",
      description: "Networking and lightning talks.",
      location: "San Francisco",
      date: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 5).toISOString(),
      category: "Meetup",
      attendees: [
        { id: randomId(), name: "Carol" }
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }
  ];
}
