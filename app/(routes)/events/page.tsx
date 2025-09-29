import { seedEvents } from "@/lib/mock";
import { EventsPageClient } from "./EventsPageClient";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  // In a real app you'd fetch from DB here.
  const initialEvents = seedEvents();
  return <EventsPageClient initialEvents={initialEvents} />;
}
