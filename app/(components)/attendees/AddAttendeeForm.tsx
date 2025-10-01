"use client";
import * as React from 'react';
import { registerAttendee } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface AddAttendeeFormProps {
  eventId: string | number;
  onAdded?: () => void; // notify parent to refresh list
}

export function AddAttendeeForm({ eventId, onAdded }: AddAttendeeFormProps) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    const attendee = await registerAttendee(eventId, name, email);
    if (!attendee) {
      setError('Failed to register attendee');
    } else {
      setName('');
      setEmail('');
      setSuccess(true);
      onAdded?.();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="space-y-1">
        <label className="block text-xs font-medium">Name</label>
        <input
          required
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full rounded border bg-background px-2 py-1 text-sm"
          placeholder="Jane Doe"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium">Email</label>
        <input
          required
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full rounded border bg-background px-2 py-1 text-sm"
          placeholder="jane@example.com"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {success && <p className="text-xs text-green-600">Registered!</p>}
      <Button type="submit" size="sm" disabled={loading}>{loading ? 'Saving...' : 'Add Attendee'}</Button>
    </form>
  );
}