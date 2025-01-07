'use server'

import { YoutubeTranscript } from 'youtube-transcript';

type TranscriptState = {
  transcript?: Array<{ text: string; duration: number; offset: number }>;
  error?: string;
} | null;

export async function getTranscript(prevState: TranscriptState, formData: FormData) {
  const url = formData.get('url') as string;
  try {
    // Extract video ID from URL if needed
    const videoId = url.includes('youtube.com') || url.includes('youtu.be') 
      ? url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1] 
      : url;

    if (!videoId) {
      throw new Error('Invalid YouTube URL or video ID');
    }

    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    // Decode HTML entities in the transcript text
    const decodedTranscript = transcript.map(item => ({
      ...item,
      text: item.text.replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
    }));
    return { transcript: decodedTranscript };
  } catch (error) {
    return { error: (error as Error).message };
  }
}
