import { Innertube } from 'youtubei.js';
import { TranscriptSegment } from '@/lib/types/transcript';
import { parseYouTubeUrl } from '@/lib/utils/url-parser';
import { decodeHtmlEntities } from '@/lib/utils/text-processing';
import { APIError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';

export class YouTubeService {
  private yt: Innertube | null = null;

  async initialize() {
    if (!this.yt) {
      try {
        this.yt = await Innertube.create();
        logger.info('YouTube service initialized');
      } catch (error) {
        logger.error('Failed to initialize YouTube service', error);
        throw new APIError('Failed to initialize YouTube service', 'YouTube');
      }
    }
  }

  async getTranscript(urlOrId: string): Promise<TranscriptSegment[]> {
    await this.initialize();

    const videoId = parseYouTubeUrl(urlOrId);
    if (!videoId) {
      throw new APIError('Invalid YouTube URL or video ID', 'YouTube');
    }

    try {
      const video = await this.yt!.getInfo(videoId);
      const transcriptResponse = await video.getTranscript();
      const segments = transcriptResponse?.transcript?.content?.body?.initial_segments;

      if (!segments || !segments.length) {
        throw new APIError('No transcript available for this video', 'YouTube');
      }

      logger.info(`Retrieved transcript for video ${videoId}`, {
        segmentCount: segments.length
      });

      return segments.map(item => ({
        text: decodeHtmlEntities(item.snippet?.text || ''),
        duration: parseInt(item.end_ms) - parseInt(item.start_ms),
        offset: parseInt(item.start_ms)
      }));
    } catch (error) {
      logger.error(`Failed to get transcript for video ${videoId}`, error);
      if (error instanceof APIError) throw error;
      throw new APIError('Failed to fetch transcript', 'YouTube');
    }
  }
}

export const youtubeService = new YouTubeService();