import { z } from 'zod';

export const transcriptSchema = z.object({
  url: z.string().min(1, 'URL is required').refine(
    (url) => {
      // Basic URL validation - more thorough validation in the service
      return url.includes('youtube.com') || url.includes('youtu.be') || /^[a-zA-Z0-9_-]{11}$/.test(url);
    },
    'Invalid YouTube URL or video ID'
  ),
});

export const summarySchema = z.object({
  text: z.string().min(10, 'Text too short to summarize').max(100000, 'Text too long'),
});