import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Decap CMS writes "" for cleared optional fields; treat those as missing.
const blankToUndefined = (value: unknown) => (value === '' || value === null ? undefined : value);
const optional = <T extends z.ZodType>(schema: T) => z.preprocess(blankToUndefined, schema.optional());

const iconNames = [
  'members',
  'mentors',
  'events',
  'pairs',
  'weeks',
  'founded',
  'mentorship',
  'workshops',
  'network',
  'trophy',
  'megaphone',
  'chat',
  'buddies',
] as const;

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      endDate: optional(z.coerce.date()),
      location: z.string(),
      description: z.string(),
      signupUrl: optional(z.url()),
      image: optional(image()),
      imageAlt: optional(z.string()),
      partner: optional(z.string()),
      featured: z.boolean().default(false),
      // Hide the date on the site (e.g. a recap whose exact date isn't confirmed).
      hideDate: z.boolean().default(false),
      // Drafts show in local preview only, never on the live site.
      draft: z.boolean().default(false),
    }),
});

const team = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/team' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      school: z.string(),
      bio: z.string(),
      photo: image(),
      linkedin: optional(z.url()),
      order: z.number(),
      founder: z.boolean().default(false),
    }),
});

const mentors = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/mentors' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      firm: z.string(),
      title: z.string(),
      photo: optional(image()),
      linkedin: optional(z.url()),
      order: z.number(),
      draft: z.boolean().default(false),
    }),
});

const resources = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/resources' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      url: z.url(),
      cta: z.string().default('Open resource'),
      thumbnail: optional(image()),
      thumbnailAlt: optional(z.string()),
      order: z.number(),
    }),
});

const alumniLogos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/alumni-logos' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      logo: image(),
      // Optical size tweak for logos that look too small/large next to the others (1 = default).
      scale: z.number().min(0.5).max(2).default(1),
      order: z.number(),
    }),
});

const programs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/programs' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    icon: optional(z.enum(iconNames)),
    flagship: z.boolean().default(false),
    highlights: z.array(z.string()).default([]),
    order: z.number(),
  }),
});

export const collections = { events, team, mentors, resources, alumniLogos, programs };
