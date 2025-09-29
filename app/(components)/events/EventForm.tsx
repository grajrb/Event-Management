"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import type { EventDraft } from "@/lib/types";

interface EventFormProps {
  onSubmit: (draft: EventDraft) => void;
  defaultValues?: Partial<EventDraft>;
  submitting?: boolean;
}

export function EventForm({ onSubmit, defaultValues, submitting }: EventFormProps) {
  const [title, setTitle] = React.useState(defaultValues?.title ?? "");
  const [description, setDescription] = React.useState(defaultValues?.description ?? "");
  const [location, setLocation] = React.useState(defaultValues?.location ?? "");
  const [category, setCategory] = React.useState(defaultValues?.category ?? "General");
  const [date, setDate] = React.useState<Date | undefined>(defaultValues?.date ?? undefined);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ title, description, location, category, date });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description <span className="text-muted-foreground text-xs font-normal" aria-hidden="true">(optional)</span></Label>
        <Input id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Short summary" aria-describedby="description-help" />
        <p id="description-help" className="text-xs text-muted-foreground">You can add details later.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" value={location} onChange={e => setLocation(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Date & Time</Label>
          <DatePicker value={date} onChange={setDate} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input id="category" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Webinar" />
      </div>
      <div className="pt-2">
        <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Create Event"}</Button>
      </div>
    </form>
  );
}
