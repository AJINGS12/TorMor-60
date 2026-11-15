// Dates are ISO calendar strings (YYYY-MM-DD) so they stay serialisable and
// compare correctly with plain string comparison. Arithmetic is done in UTC.

export type ISODate = string

const DAY_MS = 86_400_000

/** Local calendar date of `date` as YYYY-MM-DD. */
export function toISODate(date: Date): ISODate {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parse(iso: ISODate): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

function format(date: Date): ISODate {
  return date.toISOString().slice(0, 10)
}

export function addDays(iso: ISODate, days: number): ISODate {
  return format(new Date(parse(iso).getTime() + days * DAY_MS))
}

/** Adds calendar months, clamping to the last day of the target month. */
export function addMonths(iso: ISODate, months: number): ISODate {
  const d = parse(iso)
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1))
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate()
  target.setUTCDate(Math.min(d.getUTCDate(), lastDay))
  return format(target)
}

/** Whole days from `a` to `b` (positive when b is later). */
export function diffDays(a: ISODate, b: ISODate): number {
  return Math.round((parse(b).getTime() - parse(a).getTime()) / DAY_MS)
}
