"use client";
import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

interface DateTimeRangePickerProps {
  start?: Date;
  end?: Date;
  onChange?: (range: { start?: Date; end?: Date }) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function DateTimeRangePicker({ start, end, onChange, disabled, placeholder = "Select period" }: DateTimeRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [internal, setInternal] = React.useState<{ start?: Date; end?: Date }>({ start, end });

  React.useEffect(() => {
    setInternal({ start, end });
  }, [start, end]);

  const display = internal.start && internal.end
    ? `${format(internal.start, "PPp")} – ${format(internal.end, "PPp")}`
    : internal.start ? `${format(internal.start, "PPp")} – …` : placeholder;

  function setStart(d?: Date) {
    setInternal(prev => ({ start: d, end: prev.end }));
  }
  function setEnd(d?: Date) {
    setInternal(prev => ({ start: prev.start, end: d }));
  }
  function commit() {
    onChange?.(internal);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" disabled={disabled} className="w-full justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {display}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="mb-2 text-xs font-medium">Start Date</div>
              <Calendar
                mode="single"
                selected={internal.start}
                onSelect={setStart}
                initialFocus
              />
              <TimeFields label="Start Time" date={internal.start} onChange={d => setStart(d)} />
            </div>
            <div>
              <div className="mb-2 text-xs font-medium">End Date</div>
              <Calendar
                mode="single"
                selected={internal.end}
                onSelect={setEnd}
              />
              <TimeFields label="End Time" date={internal.end} onChange={d => setEnd(d)} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={commit} disabled={!internal.start || !internal.end}>Apply</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface TimeFieldsProps {
  label: string;
  date?: Date;
  onChange: (d?: Date) => void;
}

function TimeFields({ label, date, onChange }: TimeFieldsProps) {
  const hours = date ? date.getHours() : 0;
  const minutes = date ? date.getMinutes() : 0;

  function update(h: number, m: number) {
    if (!date) {
      const base = new Date();
      base.setHours(h, m, 0, 0);
      onChange(base);
    } else {
      const next = new Date(date);
      next.setHours(h, m, 0, 0);
      onChange(next);
    }
  }

  return (
    <div className="mt-2 space-y-1">
      <label className="flex items-center gap-1 text-xs font-medium"><Clock className="h-3 w-3" /> {label}</label>
      <div className="flex items-center gap-2">
        <select
          className="h-8 rounded-md border bg-transparent px-2 text-sm"
          value={hours}
          onChange={e => update(Number(e.target.value), minutes)}
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
          ))}
        </select>
        <span className="text-muted-foreground">:</span>
        <select
          className="h-8 rounded-md border bg-transparent px-2 text-sm"
          value={minutes}
          onChange={e => update(hours, Number(e.target.value))}
        >
          {Array.from({ length: 12 }).map((_, i) => {
            const val = i * 5;
            return <option key={val} value={val}>{val.toString().padStart(2, '0')}</option>;
          })}
        </select>
      </div>
    </div>
  );
}
