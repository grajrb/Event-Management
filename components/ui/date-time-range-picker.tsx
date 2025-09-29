"use client";
import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format, startOfDay, endOfDay, addDays } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateTimeRangePickerProps {
  start?: Date;
  end?: Date;
  onChange?: (range: { start?: Date; end?: Date }) => void;
  disabled?: boolean;
  placeholder?: string;
  inline?: boolean;      // render always visible (no popover)
  compact?: boolean;     // smaller calendar sizing
  hideTime?: boolean;    // optionally hide time selectors
  mode?: 'dual' | 'single-range'; // dual calendars vs. single calendar range select
  quickRanges?: boolean; // show quick range shortcuts
  yearRange?: { from: number; to: number }; // dropdown year range
  className?: string;    // custom wrapper class
}

export function DateTimeRangePicker({ start, end, onChange, disabled, placeholder = "Select period", inline = false, compact = false, hideTime = false, mode = 'dual', quickRanges = false, yearRange, className }: DateTimeRangePickerProps) {
  const [open, setOpen] = React.useState(false); // unused when inline
  const [internal, setInternal] = React.useState<{ start?: Date; end?: Date }>({ start, end });
  const [tempRange, setTempRange] = React.useState<{ from?: Date; to?: Date }>({ from: start, to: end });

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

  const calendarClassNamesCompact = compact ? {
    head_cell: "text-muted-foreground rounded-md w-7 font-normal text-[0.65rem]",
    cell: "h-7 w-7 text-center text-[0.65rem] p-0 relative",
    day: "h-7 w-7 p-0 font-normal aria-selected:opacity-100 text-[0.65rem]",
  } : {};

  const calendarPropsCommon = { mode: 'single' as const };

  function applyQuick(startDate: Date, endDate: Date) {
    setInternal({ start: startDate, end: endDate });
    setTempRange({ from: startDate, to: endDate });
    onChange?.({ start: startDate, end: endDate });
  }

  function upcomingWeekend(): { start: Date; end: Date } {
    const today = new Date();
    const day = today.getDay(); // 0 Sun - 6 Sat
    let satOffset = (6 - day + 7) % 7; // days until Saturday
    let sunOffset = satOffset + 1;
    // If already Saturday(6) or Sunday(0) show current weekend
    if (day === 6) { // Saturday
      satOffset = 0; sunOffset = 1;
    } else if (day === 0) { // Sunday -> next week
      satOffset = 6; sunOffset = 7;
    }
    const sat = startOfDay(addDays(today, satOffset));
    const sun = endOfDay(addDays(today, sunOffset));
    return { start: sat, end: sun };
  }

  const QuickRanges = quickRanges ? (
    <div className="flex flex-wrap gap-1 mb-2">
      <button type="button" className="px-2 py-1 text-xs border rounded-md hover:bg-accent" onClick={() => {
        const d = new Date(); applyQuick(startOfDay(d), endOfDay(d));
      }}>Today</button>
      <button type="button" className="px-2 py-1 text-xs border rounded-md hover:bg-accent" onClick={() => {
        const d = addDays(new Date(),1); applyQuick(startOfDay(d), endOfDay(d));
      }}>Tomorrow</button>
      <button type="button" className="px-2 py-1 text-xs border rounded-md hover:bg-accent" onClick={() => {
        const d = new Date(); applyQuick(startOfDay(d), endOfDay(addDays(d,6))); 
      }}>Next 7 Days</button>
      <button type="button" className="px-2 py-1 text-xs border rounded-md hover:bg-accent" onClick={() => {
        const w = upcomingWeekend(); applyQuick(w.start, w.end);
      }}>Weekend</button>
    </div>
  ) : null;

  if (inline) {
    if (mode === 'single-range') {
      const yearProps = yearRange ? { captionLayout: 'dropdown' as const, fromYear: yearRange.from, toYear: yearRange.to } : {};
      return (
        <div className={cn(
          "border rounded-md bg-background flex flex-col",
          compact ? "p-2" : "p-4",
          // width constraints so it doesn't overflow parent form
          compact ? "w-full max-w-[300px]" : "w-full max-w-[340px]",
          className
        )}> 
          {QuickRanges}
          <Calendar
            mode="range"
            numberOfMonths={1}
            hideNavigation
            selected={tempRange.from ? { from: tempRange.from, to: tempRange.to } : undefined}
            onSelect={(r: any) => {
              if (!r) {
                setTempRange({ from: undefined, to: undefined });
                return;
              }
              setTempRange({ from: r.from, to: r.to });
              if (r.from && r.to) {
                setInternal({ start: r.from, end: r.to });
                onChange?.({ start: r.from, end: r.to });
              }
            }}
            className={compact ? "p-0" : undefined}
            classNames={calendarClassNamesCompact}
            {...yearProps}
          />
          {!hideTime && (
            <div className={cn("mt-3 grid gap-3", compact ? "grid-cols-2" : "grid-cols-2")}> 
              <TimeFields compact={compact} label="Start" date={internal.start} onChange={d => setInternal(prev => { const endVal = prev.end; return { start: d, end: endVal }; })} />
              <TimeFields compact={compact} label="End" date={internal.end} onChange={d => setInternal(prev => ({ start: prev.start, end: d }))} />
            </div>
          )}
          <div className="flex justify-end gap-2 mt-3">
            <Button
              size={compact ? 'xs' as any : 'sm'}
              variant="secondary"
              onClick={() => {
                setTempRange({ from: undefined, to: undefined });
                setInternal({ start: undefined, end: undefined });
                onChange?.({ start: undefined, end: undefined });
              }}
            >{compact ? 'Reset' : 'Reset'}</Button>
            <Button size={compact ? 'xs' as any : 'sm'} onClick={() => { if (internal.start && internal.end) onChange?.(internal); }} disabled={!internal.start || !internal.end}>{compact ? 'OK' : 'Apply'}</Button>
          </div>
        </div>
      );
    }
    return (
      <div className={cn(
        "border rounded-md bg-background flex flex-col",
        compact ? "p-2" : "p-4",
        compact ? "w-full max-w-[540px]" : "w-full max-w-[640px]",
        className
      )}> 
        <div className={cn("grid gap-4", hideTime ? "grid-cols-2" : "grid-cols-2")}>
          <div>
            <div className="mb-2 text-xs font-medium">Start</div>
            <Calendar
              {...calendarPropsCommon}
              selected={internal.start}
              onSelect={setStart}
              className={compact ? "p-0" : undefined}
              classNames={calendarClassNamesCompact}
            />
            {!hideTime && <TimeFields compact={compact} label="Start Time" date={internal.start} onChange={d => setStart(d)} />}
          </div>
          <div>
            <div className="mb-2 text-xs font-medium">End</div>
            <Calendar
              {...calendarPropsCommon}
              selected={internal.end}
              onSelect={setEnd}
              className={compact ? "p-0" : undefined}
              classNames={calendarClassNamesCompact}
            />
            {!hideTime && <TimeFields compact={compact} label="End Time" date={internal.end} onChange={d => setEnd(d)} />}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-3">
          <Button
            size={compact ? 'xs' as any : 'sm'}
            variant="secondary"
            onClick={() => {
              setInternal({ start: undefined, end: undefined });
              onChange?.({ start: undefined, end: undefined });
            }}
          >{compact ? 'Reset' : 'Reset'}</Button>
          <Button size={compact ? 'xs' as any : 'sm'} onClick={commit} disabled={!internal.start || !internal.end}>{compact ? 'OK' : 'Apply'}</Button>
        </div>
      </div>
    );
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
              {!hideTime && <TimeFields label="Start Time" date={internal.start} onChange={d => setStart(d)} />}
            </div>
            <div>
              <div className="mb-2 text-xs font-medium">End Date</div>
              <Calendar
                mode="single"
                selected={internal.end}
                onSelect={setEnd}
              />
              {!hideTime && <TimeFields label="End Time" date={internal.end} onChange={d => setEnd(d)} />}
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
  compact?: boolean;
}

function TimeFields({ label, date, onChange, compact }: TimeFieldsProps) {
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

  const selectBase = compact ? "h-7 text-[0.65rem] px-1" : "h-8 text-sm px-2";
  return (
    <div className="mt-2 space-y-1">
      <label className="flex items-center gap-1 text-xs font-medium"><Clock className={compact ? "h-3 w-3" : "h-3 w-3"} /> {label}</label>
      <div className="flex items-center gap-2">
        <select
          className={"rounded-md border bg-transparent " + selectBase}
          value={hours}
          onChange={e => update(Number(e.target.value), minutes)}
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
          ))}
        </select>
        <span className="text-muted-foreground">:</span>
        <select
          className={"rounded-md border bg-transparent " + selectBase}
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
