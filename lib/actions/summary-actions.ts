'use server'

import { summarySchema } from '@/lib/validations/transcript-schema';
import { geminiService } from '@/lib/services/gemini-service';
import { SummaryResponse } from '@/lib/types/transcript';
import { handleError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';

export async function generateSummary(text: string): Promise<SummaryResponse> {
  try {
    // Validate input
    const parsed = summarySchema.safeParse({ text });
    if (!parsed.success) {
      const errorMessage = parsed.error.issues[0].message;
      logger.warn('Summary validation failed', { error: errorMessage });
      return { error: errorMessage };
    }

    // Generate summary
    const summary = await geminiService.generateSummary(text);
    logger.info('Summary generated successfully');

    return { summary };

  } catch (error) {
    const errorMessage = handleError(error);
    logger.error('Failed to generate summary', error);
    return { error: errorMessage };
  }
}