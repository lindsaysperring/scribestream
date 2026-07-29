import { z } from 'zod';
import { isValidYouTubeUrl } from '@/lib/utils/url-parser';

export const transcriptSchema = z.object({
  url: z.string().min(1, 'URL is required').refine(
    (url) => isValidYouTubeUrl(url),
    'Invalid YouTube URL or video ID'
  ),
});

export const summarySchema = z.object({
  text: z.string().min(10, 'Text too short to summarize').max(100000, 'Text too long'),
});