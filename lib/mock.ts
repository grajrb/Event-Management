import type { Event } from "@/lib/types";
import { addHours } from "date-fns";

function randomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2, 10);
}

export function seedEvents(): Event[] {
  const now = new Date();
  const launchStart = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 2);
  const meetupStart = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 5);
  return [
    {
      id: randomId(),
      title: "Product Launch Webinar",
      description: "Deep dive into our new feature set and live Q&A.",
      location: "Online",
      start: launchStart.toISOString(),
      end: addHours(launchStart, 2).toISOString(),
      date: launchStart.toISOString(), // legacy
      category: "Webinar",
      maxCapacity: 250,
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
      start: meetupStart.toISOString(),
      end: addHours(meetupStart, 3).toISOString(),
      date: meetupStart.toISOString(), // legacy
      category: "Meetup",
      maxCapacity: 80,
      attendees: [
        { id: randomId(), name: "Carol" }
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }
  ];
}
