import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { EventDraft } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2, 10)
}

export function createEventDraft(partial?: Partial<EventDraft>): EventDraft {
  return {
    title: "",
    description: "",
    location: "",
    date: undefined,
    category: "General",
    ...partial,
  }
}
