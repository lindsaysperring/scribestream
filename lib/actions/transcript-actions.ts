'use server'

import { transcriptSchema } from '@/lib/validations/transcript-schema';
import { youtubeService } from '@/lib/services/youtube-service';
import { TranscriptState } from '@/lib/types/transcript';
import { handleError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';

export async function getTranscript(
  prevState: TranscriptState,
  formData: FormData
): Promise<TranscriptState> {
  try {
    // Validate input
    const parsed = transcriptSchema.safeParse({
      url: formData.get('url')
    });

    if (!parsed.success) {
      const errorMessage = parsed.error.issues[0].message;
      logger.warn('Transcript validation failed', { error: errorMessage });
      return { error: errorMessage };
    }

    // Fetch transcript
    const transcript = await youtubeService.getTranscript(parsed.data.url);
    logger.info('Transcript fetched successfully', { segmentCount: transcript.length });

    return { transcript };

  } catch (error) {
    const errorMessage = handleError(error);
    logger.error('Failed to get transcript', error);
    return { error: errorMessage };
  }
}