import { notFound } from "next/navigation";
import { seedEvents } from "@/lib/mock";
import { EventDetailClient } from "./EventDetailClient";

export default async function EventDetail({ params }: { params: { id: string } }) {
  const all = seedEvents();
  const event = all.find(e => e.id === params.id);
  if (!event) return notFound();
  return <EventDetailClient event={event} />;
}
