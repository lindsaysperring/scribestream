import { Innertube } from 'youtubei.js';
import { TranscriptSegment } from '@/lib/types/transcript';
import { parseYouTubeUrl } from '@/lib/utils/url-parser';
import { decodeHtmlEntities } from '@/lib/utils/text-processing';
import { APIError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

interface CaptionTrack {
  language_code: string;
  kind?: string;
  base_url?: string;
}

export class YouTubeService {
  private yt: Innertube | null = null;

  async initialize() {
    if (!this.yt) {
      try {
        this.yt = await Innertube.create({
          generate_session_locally: true
        });
        logger.info('YouTube service initialized');
      } catch (error) {
        logger.error('Failed to initialize YouTube service', error);
        throw new APIError('Failed to initialize YouTube service', 'YouTube');
      }
    }
  }

  private isRateLimitError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes('automated queries') ||
        message.includes('too many requests') ||
        message.includes('rate limit') ||
        message.includes('status 429') ||
        message.includes('status 400')
      );
    }
    return false;
  }

  private async withRetry<T>(operation: () => Promise<T>, context: string): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt < MAX_RETRIES && this.isRateLimitError(error)) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          logger.warn(`Rate limited on ${context}, retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  }

  async getTranscript(urlOrId: string): Promise<TranscriptSegment[]> {
    await this.initialize();

    const videoId = parseYouTubeUrl(urlOrId);
    if (!videoId) {
      throw new APIError('Invalid YouTube URL or video ID', 'YouTube');
    }

    try {
      const info = await this.withRetry(
        () => this.yt!.getInfo(videoId),
        `getInfo(${videoId})`
      );

      const captionTracks = info.captions?.caption_tracks;
      if (!captionTracks || captionTracks.length === 0) {
        throw new APIError('No caption tracks found for this video', 'YouTube');
      }

      const englishTrack =
        captionTracks.find((t: CaptionTrack) => t.language_code === 'en' && t.kind !== 'asr') ||
        captionTracks.find((t: CaptionTrack) => t.language_code?.startsWith('en')) ||
        captionTracks[0];

      if (!englishTrack?.base_url) {
        throw new APIError('No valid caption track URL found', 'YouTube');
      }

      const xml = await this.withRetry(
        () => this.fetchTimedTextXml(englishTrack.base_url),
        'fetchTimedTextXml'
      );

      const segments = this.parseTimedTextXml(xml);

      if (!segments || segments.length === 0) {
        throw new APIError('Failed to parse any transcript segments from XML', 'YouTube');
      }

      logger.info(`Retrieved transcript for video ${videoId}`, {
        segmentCount: segments.length
      });

      return segments.map(s => ({
        text: decodeHtmlEntities(s.text),
        duration: s.duration,
        offset: s.offset
      }));
    } catch (error) {
      logger.error(`Failed to get transcript for video ${videoId}`, error);
      if (error instanceof APIError) throw error;

      if (this.isRateLimitError(error)) {
        throw new APIError('YouTube rate limit exceeded. Please try again later.', 'YouTube');
      }

      throw new APIError('Failed to fetch transcript', 'YouTube');
    }
  }

  private async fetchTimedTextXml(url: string): Promise<string> {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new APIError(`Failed to fetch timed text XML (status ${res.status})`, 'YouTube');
      }
      return await res.text();
    } catch (err) {
      logger.error('Error fetching timedtext XML', err);
      if (err instanceof APIError) throw err;
      throw new APIError('Failed to fetch timed text XML', 'YouTube');
    }
  }

  private parseTimedTextXml(xml: string): { text: string; offset: number; duration: number }[] {
    const segments: { text: string; offset: number; duration: number }[] = [];

    // Match <text start="..." dur="...">...</text>
    const re = /<text\b([^>]*)>([\s\S]*?)<\/text>/gim;
    const attrRe = /([a-zA-Z_:]+)\s*=\s*"([^"]*)"/g;
    let match: RegExpExecArray | null = null;

    const rawSegments: { start?: number; dur?: number; text: string }[] = [];

    while ((match = re.exec(xml)) !== null) {
      const attrStr = match[1];
      const inner = match[2] || '';
      let attrMatch: RegExpExecArray | null;
      const attrs: Record<string, string> = {};
      while ((attrMatch = attrRe.exec(attrStr)) !== null) {
        attrs[attrMatch[1]] = attrMatch[2];
      }

      const start = attrs.start ? parseFloat(attrs.start) : attrs.t ? parseFloat(attrs.t) : undefined;
      const dur = attrs.dur ? parseFloat(attrs.dur) : undefined;
      let text = inner.replace(/<br\s*\/?\s*>/gi, '\n').replace(/\s+$/,'');
      // strip any remaining tags
      text = text.replace(/<[^>]+>/g, '');

      rawSegments.push({ start, dur, text });
    }

    for (let i = 0; i < rawSegments.length; i++) {
      const cur = rawSegments[i];
      if (cur.start == null) continue;
      const next = rawSegments[i + 1];
      const startMs = Math.round(cur.start * 1000);
      let durMs = cur.dur != null ? Math.round(cur.dur * 1000) : next && next.start != null ? Math.round((next.start - cur.start) * 1000) : 0;
      if (durMs < 0) durMs = 0;
      segments.push({ text: cur.text || '', offset: startMs, duration: durMs });
    }

    return segments;
  }
}

let _youtubeService: YouTubeService | null = null;

export function getYouTubeService(): YouTubeService {
  if (!_youtubeService) {
    _youtubeService = new YouTubeService();
  }
  return _youtubeService;
}