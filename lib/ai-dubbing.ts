import { generateText, Output } from 'ai';
import { z } from 'zod';

// Schema for Ukrainian dubbing information
const DubbingInfoSchema = z.object({
  hasUkrainianDubbing: z.boolean(),
  titleUk: z.string().nullable(),
  studio: z.string().nullable(),
  quality: z.string().nullable(),
  hasSubtitles: z.boolean().nullable(),
  voiceActors: z.string().nullable(),
  confidence: z.number(),
  notes: z.string().nullable(),
});

export type DubbingInfo = z.infer<typeof DubbingInfoSchema>;

// Known Ukrainian dubbing studios for context
const UKRAINIAN_STUDIOS = [
  '1+1 Studios', 'ICTV', 'Новий канал', 'СТБ', 'Інтер',
  'Так Треба Продакшн', 'Le Doyen', 'Postmodern', 'Омікрон',
  'Dubox', 'НЛО TV', 'Megogo', 'Netflix Ukraine',
  'Disney+', 'Amazon Prime Video', 'Apple TV+',
];

// AI-powered search for Ukrainian dubbing information
export async function searchDubbingWithAI(
  movieTitle: string,
  movieTitleEn: string,
  year: number
): Promise<DubbingInfo | null> {
  try {
    const result = await generateText({
      model: 'openai/gpt-4o-mini',
      output: Output.object({ schema: DubbingInfoSchema }),
      system: `You are an expert on Ukrainian movie dubbing and localization. You have comprehensive knowledge about:
- Ukrainian dubbing studios: ${UKRAINIAN_STUDIOS.join(', ')}
- Movies that have been dubbed in Ukrainian
- Voice actors in Ukrainian dubbing industry
- Quality standards (SD, HD, Full HD, 4K)

Analyze the given movie and determine if it has Ukrainian dubbing available.
Be conservative - only say hasUkrainianDubbing: true if you are confident the movie has official Ukrainian dubbing.
Popular Hollywood blockbusters, Disney/Pixar animations, and major Netflix/streaming releases often have Ukrainian dubbing.
Older or obscure films are less likely to have Ukrainian dubbing.`,
      prompt: `Check if this movie has Ukrainian dubbing:
Movie Title: "${movieTitle}"
Original Title: "${movieTitleEn}"
Year: ${year}

Provide information about Ukrainian dubbing availability, studio, quality, and voice actors if known.
If unsure, set hasUkrainianDubbing to false and confidence to a low value.`,
    });

    if (result.value && typeof result.value === 'object') {
      return result.value as DubbingInfo;
    }
    return null;
  } catch (error) {
    console.error('AI dubbing search error:', error);
    return null;
  }
}

// Batch process movies to find Ukrainian dubbing
export async function batchSearchDubbing(
  movies: Array<{ tmdbId: number; title: string; titleEn: string; year: number }>
): Promise<Map<number, DubbingInfo>> {
  const results = new Map<number, DubbingInfo>();
  
  // Process in batches of 5 to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < movies.length; i += batchSize) {
    const batch = movies.slice(i, i + batchSize);
    
    const batchResults = await Promise.allSettled(
      batch.map(async (movie) => {
        const info = await searchDubbingWithAI(movie.title, movie.titleEn, movie.year);
        return { tmdbId: movie.tmdbId, info };
      })
    );
    
    for (const result of batchResults) {
      if (result.status === 'fulfilled' && result.value.info) {
        results.set(result.value.tmdbId, result.value.info);
      }
    }
    
    // Small delay between batches
    if (i + batchSize < movies.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results;
}
