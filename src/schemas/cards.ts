import { z } from 'zod';

export const SourceRefSchema = z.object({
  occurrenceId: z.string().min(1),
  yearKey: z.string().min(1),
  yearLabel: z.string().min(1),
  chapter: z.number().int().positive(),
  chapterLabel: z.string().min(1),
  isSupplemental: z.boolean(),
});

export const FactCardSchema = z.object({
  cardId: z.string().min(1),
  termId: z.string().min(1),
  termName: z.string().min(1),
  chapters: z.array(z.number().int().positive()).min(1),
  chapterLabels: z.array(z.string().min(1)).min(1),
  prompt: z.string().min(1),
  answer: z.string().min(1),
  detail: z.string(),
  tags: z.array(z.string()),
  sourceRefs: z.array(SourceRefSchema).min(1),
  isSupplementalOnly: z.boolean(),
});

export const FactCardsOutputSchema = z.object({
  generatedAt: z.string().min(1),
  cardCount: z.number().int().nonnegative(),
  cards: z.array(FactCardSchema),
});

export const SeedSourceRefSchema = z.object({
  occurrenceId: z.string().min(1),
  yearKey: z.string().min(1),
  yearLabel: z.string().min(1),
  chapter: z.number().int().positive(),
  chapterLabel: z.string().min(1),
  isSupplemental: z.boolean(),
});

export const SeedCardSchema = z.object({
  cardKey: z.string().min(1),
  prompt: z.string().min(1),
  answer: z.string().min(1),
  detail: z.string(),
  tags: z.array(z.string()),
  sourceRefs: z.array(SeedSourceRefSchema).min(1),
});

export const SeedFileSchema = z.object({
  termId: z.string().min(1),
  termName: z.string().min(1),
  cards: z.array(SeedCardSchema).min(1),
});

export type FactCardsOutput = z.infer<typeof FactCardsOutputSchema>;
export type SeedFile = z.infer<typeof SeedFileSchema>;
export type SeedCard = z.infer<typeof SeedCardSchema>;
