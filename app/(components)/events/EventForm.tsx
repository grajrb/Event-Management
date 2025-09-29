"use client";
import * as React from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DateTimeRangePicker } from "@/components/ui/date-time-range-picker";
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
  start: z.date({ required_error: "Start required" }),
  end: z.date({ required_error: "End required" }),
  maxCapacity: z.number().int().positive().optional(),
}).refine(d => !d.start || !d.end || d.end >= d.start, {
  message: "End must be after start",
  path: ["end"],
});

export function EventForm({ onSubmit, defaultValues, submitting }: EventFormProps) {
  const [title, setTitle] = React.useState(defaultValues?.title ?? "");
  const [description, setDescription] = React.useState(defaultValues?.description ?? "");
  const [location, setLocation] = React.useState(defaultValues?.location ?? "");
  const [category, setCategory] = React.useState(defaultValues?.category ?? "General");
  const [start, setStart] = React.useState<Date | undefined>(defaultValues?.start ?? undefined);
  const [end, setEnd] = React.useState<Date | undefined>(defaultValues?.end ?? undefined);
  const [maxCapacity, setMaxCapacity] = React.useState<number | undefined>(defaultValues?.maxCapacity);

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  const parsed = schema.safeParse({ title, description, location, category, start, end, maxCapacity });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
  onSubmit({ title, description, location, category, start, end, maxCapacity });
  }

  function handleReset() {
    setTitle("");
    setDescription("");
    setLocation("");
    setCategory("General");
    setStart(undefined);
    setEnd(undefined);
    setMaxCapacity(undefined);
    setErrors({});
  }

  return (
    <div className="relative rounded-lg border bg-card text-card-foreground shadow-sm p-4 md:p-6 max-w-5xl">
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-12 items-start" onReset={e => { e.preventDefault(); handleReset(); }}>
      <div className="space-y-1 md:col-span-8">
  <Label htmlFor="title">Title</Label>
  <Input id="title" value={title} onChange={e => setTitle(e.target.value)} aria-invalid={!!errors.title} aria-describedby={errors.title ? 'title-error' : undefined} required />
  {errors.title && <p id="title-error" className="text-xs text-destructive mt-1">{errors.title}</p>}
      </div>
  <div className="space-y-1 md:col-span-4">
        <Label htmlFor="description">Description <span className="text-muted-foreground text-xs font-normal" aria-hidden="true">(optional)</span></Label>
        <Input id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Short summary" aria-describedby="description-help" />
        <p id="description-help" className="text-xs text-muted-foreground">You can add details later.</p>
      </div>
      <div className="space-y-1 md:col-span-12 md:col-start-1">
        <Label>Date & Time</Label>
        <div className="rounded-md border bg-background/60 backdrop-blur-sm p-2 max-w-sm">
          <DateTimeRangePicker
            inline
            compact
            hideTime
            mode="single-range"
            yearRange={{ from: new Date().getFullYear() - 1, to: new Date().getFullYear() + 2 }}
            start={start}
            end={end}
            className="shadow-sm"
            onChange={({ start: s, end: e }) => { setStart(s); setEnd(e); }}
          />
        </div>
        {(errors.start || errors.end) && <p className="text-xs text-destructive mt-1">{errors.start || errors.end}</p>}
      </div>
      <div className="space-y-1 md:col-span-4">
        <Label htmlFor="location">Location</Label>
        <Input id="location" value={location} onChange={e => setLocation(e.target.value)} aria-invalid={!!errors.location} aria-describedby={errors.location ? 'location-error' : undefined} />
        {errors.location && <p id="location-error" className="text-xs text-destructive mt-1">{errors.location}</p>}
      </div>
      <div className="space-y-1 md:col-span-4">
        <Label htmlFor="maxCapacity">Capacity <span className="text-muted-foreground text-[10px]" aria-hidden="true">(optional)</span></Label>
        <Input
          id="maxCapacity"
          type="number"
          inputMode="numeric"
          min={1}
          value={maxCapacity ?? ''}
          onChange={e => setMaxCapacity(e.target.value ? Number(e.target.value) : undefined)}
          aria-invalid={!!errors.maxCapacity}
          aria-describedby={errors.maxCapacity ? 'capacity-error' : undefined}
          placeholder="e.g. 100"
        />
        {errors.maxCapacity && <p id="capacity-error" className="text-xs text-destructive mt-1">{errors.maxCapacity}</p>}
      </div>
      <div className="space-y-1 md:col-span-4">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="category" aria-label="Category" className="h-9">
            <SelectValue placeholder="Select" />
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
      <div className="flex items-center flex-wrap gap-3 md:col-span-12 pt-1 border-t mt-2 pt-4">
        <Button type="submit" disabled={submitting} className="h-9 px-6 font-semibold tracking-tight shadow-sm data-[state=loading]:opacity-70">
          {submitting ? "Saving..." : "Create Event"}
        </Button>
        <Button type="reset" variant="outline" disabled={submitting} className="h-9 px-4">
          Reset
        </Button>
      </div>
    </form>
    </div>
  );
}
