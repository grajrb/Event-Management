"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AddAttendeeFormProps {
  onAdd: (name: string) => void;
  submitting?: boolean;
}

export function AddAttendeeForm({ onAdd, submitting }: AddAttendeeFormProps) {
  const [name, setName] = React.useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim());
    setName("");
  }
  return (
    <form onSubmit={submit} className="flex items-end gap-2">
      <div className="space-y-1 flex-1">
        <Label htmlFor="attendee-name" className="text-xs">Attendee Name</Label>
        <Input id="attendee-name" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" />
      </div>
      <Button type="submit" disabled={submitting || !name.trim()} size="sm">
        {submitting ? "Adding..." : "Add"}
      </Button>
    </form>
  );
}
