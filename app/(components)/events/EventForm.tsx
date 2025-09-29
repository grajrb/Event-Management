"use client";
import * as React from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import type { EventDraft } from "@/lib/types";

interface EventFormProps {
  onSubmit: (draft: EventDraft) => void;
  defaultValues?: Partial<EventDraft>;
  submitting?: boolean;
}

const schema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  location: z.string().optional(),
  category: z.string().min(2, "Select a category"),
  date: z.date().optional(),
});

export function EventForm({ onSubmit, defaultValues, submitting }: EventFormProps) {
  const [title, setTitle] = React.useState(defaultValues?.title ?? "");
  const [description, setDescription] = React.useState(defaultValues?.description ?? "");
  const [location, setLocation] = React.useState(defaultValues?.location ?? "");
  const [category, setCategory] = React.useState(defaultValues?.category ?? "General");
  const [date, setDate] = React.useState<Date | undefined>(defaultValues?.date ?? undefined);

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ title, description, location, category, date });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    onSubmit({ title, description, location, category, date });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
  <Label htmlFor="title">Title</Label>
  <Input id="title" value={title} onChange={e => setTitle(e.target.value)} aria-invalid={!!errors.title} aria-describedby={errors.title ? 'title-error' : undefined} required />
  {errors.title && <p id="title-error" className="text-xs text-destructive mt-1">{errors.title}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description <span className="text-muted-foreground text-xs font-normal" aria-hidden="true">(optional)</span></Label>
        <Input id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Short summary" aria-describedby="description-help" />
        <p id="description-help" className="text-xs text-muted-foreground">You can add details later.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" value={location} onChange={e => setLocation(e.target.value)} aria-invalid={!!errors.location} aria-describedby={errors.location ? 'location-error' : undefined} />
          {errors.location && <p id="location-error" className="text-xs text-destructive mt-1">{errors.location}</p>}
        </div>
        <div className="space-y-2">
          <Label>Date & Time</Label>
          <DatePicker value={date} onChange={setDate} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="category" aria-label="Category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="General">General</SelectItem>
            <SelectItem value="Webinar">Webinar</SelectItem>
            <SelectItem value="Workshop">Workshop</SelectItem>
            <SelectItem value="Conference">Conference</SelectItem>
            <SelectItem value="Meetup">Meetup</SelectItem>
          </SelectContent>
        </Select>
        {errors.category && <p className="text-xs text-destructive mt-1">{errors.category}</p>}
      </div>
      <div className="pt-2">
        <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Create Event"}</Button>
      </div>
    </form>
  );
}
