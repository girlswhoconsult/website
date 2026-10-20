import { getCollection, type CollectionEntry } from 'astro:content';
import { z } from 'astro/zod';
import siteJson from '../content/site.json';
import statsJson from '../content/stats.json';

/* site.json and stats.json are edited through the CMS, so validate them at
   build time: a bad edit fails the build instead of shipping a broken page. */

const siteSchema = z.object({
  email: z.email(),
  linkedin: z.url(),
  instagram: z.url(),
  slack: z.url(),
  mentorSignupUrl: z.union([z.url(), z.literal('')]).default(''),
  boardApplication: z.object({
    // When false the board card says applications are closed instead of linking to the form.
    open: z.boolean().default(false),
    url: z.url(),
    showDeadlines: z.boolean().default(false),
    deadlines: z.array(z.object({ label: z.string(), date: z.string() })).default([]),
  }),
});

const statSchema = z.object({
  value: z.number(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  unit: z.string().optional(),
  label: z.string(),
  caption: z.string(),
  icon: z.string(),
  showInHero: z.boolean().default(false),
  // "year" shows the value as written (2020, not 2,020) and skips the count-up.
  kind: z.enum(['number', 'year']).default('number'),
});

const statsSchema = z.object({
  heading: z.string(),
  intro: z.string(),
  stats: z.array(statSchema),
});

export const site = siteSchema.parse(siteJson);
export const statsBlock = statsSchema.parse(statsJson);
export type Stat = z.infer<typeof statSchema>;

export const formatStat = (s: Pick<Stat, 'value' | 'kind'>) =>
  s.kind === 'year' ? String(s.value) : new Intl.NumberFormat('en-US').format(s.value);

/* Drafts are visible while editing locally (astro dev), never in a production build. */
const visible = <T extends { data: { draft?: boolean } }>(entry: T) => !(import.meta.env.PROD && entry.data.draft);

export const isDraft = (entry: { data: { draft?: boolean } }) => Boolean(entry.data.draft);

// Board members are mostly on the East Coast; show event times in Eastern Time.
export const EVENT_TIME_ZONE = 'America/New_York';

export async function getEvents() {
  const all = (await getCollection('events')).filter(visible);
  // "Now" is the build time. A scheduled daily rebuild keeps this fresh (see README).
  const now = Date.now();
  const endOf = (e: CollectionEntry<'events'>) => (e.data.endDate ?? e.data.date).getTime();
  const upcoming = all.filter((e) => endOf(e) >= now).sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
  const past = all.filter((e) => endOf(e) < now).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  return { upcoming, past };
}

export async function getMentors() {
  return (await getCollection('mentors')).filter(visible).sort((a, b) => a.data.order - b.data.order);
}

export async function getTeam() {
  const all = (await getCollection('team')).sort((a, b) => a.data.order - b.data.order);
  return { founders: all.filter((m) => m.data.founder), board: all.filter((m) => !m.data.founder) };
}

export async function getOrdered<C extends 'resources' | 'alumniLogos' | 'programs'>(name: C) {
  const entries = await getCollection(name);
  return entries.sort((a, b) => a.data.order - b.data.order) as CollectionEntry<C>[];
}

const dateFmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', { timeZone: EVENT_TIME_ZONE, ...opts });

export function eventDateParts(date: Date) {
  return {
    month: dateFmt({ month: 'short' }).format(date),
    day: dateFmt({ day: 'numeric' }).format(date),
    weekday: dateFmt({ weekday: 'long' }).format(date),
    full: dateFmt({ weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(date),
    monthYear: dateFmt({ month: 'long', year: 'numeric' }).format(date),
    time: dateFmt({ hour: 'numeric', minute: '2-digit' }).format(date),
  };
}

export function eventWhen(start: Date, end?: Date) {
  const s = eventDateParts(start);
  if (!end) return `${s.full}, ${s.time} ET`;
  const e = eventDateParts(end);
  const sameDay = s.full === e.full;
  return sameDay ? `${s.full}, ${s.time} to ${e.time} ET` : `${s.full} to ${e.full}`;
}

export const isVirtual = (location: string) => /^(virtual|online|zoom)$/i.test(location.trim());

export const mailto = (subject?: string) =>
  `mailto:${site.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
