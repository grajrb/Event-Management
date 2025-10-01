import { notFound } from "next/navigation";
import { EventDetailClient } from "./EventDetailClient";
import { fetchEvent } from "@/lib/api";

export default async function EventDetail({ params }: { params: { id: string } }) {
  // Attempt to fetch from backend; if fails, we can't statically seed here (could add fallback if needed)
  const event = await fetchEvent(params.id);
  if (!event) return notFound();
  return <EventDetailClient event={event} />;
}
