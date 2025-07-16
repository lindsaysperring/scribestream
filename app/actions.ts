'use server'

import { YoutubeTranscript } from 'youtube-transcript';

type TranscriptState = {
  transcript?: Array<{ text: string; duration: number; offset: number }>;
  error?: string;
} | null;

type SummaryResponse = {
  summary?: string;
  error?: string;
  progress?: {
    current: number;
    total: number;
  };
};

async function ollamaComplete(prompt: string): Promise<string> {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'granite3.1-dense',
      prompt: prompt,
      stream: false
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.response;
}

export async function generateSummary(text: string): Promise<SummaryResponse> {
  try {
    const maxChunkSize = 4000; // Adjust based on model's context window
    const chunks = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    let currentChunk = '';
    const processChunks: string[] = [];
    
    // Group sentences into chunks
    for (const sentence of chunks) {
      if ((currentChunk + sentence).length > maxChunkSize) {
        processChunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    }
    if (currentChunk) {
      processChunks.push(currentChunk.trim());
    }

    const summaries: string[] = [];
    for (let i = 0; i < processChunks.length; i++) {
      const prompt = `Please provide a concise summary of the following text in bullet points. Do not use numbered points:\n\n${processChunks[i]}`;
      const summary = await ollamaComplete(prompt);
      summaries.push(summary);
    }

    // If we have multiple summaries, generate a final summary
    // let finalSummary = summaries.join('\n\n');
    // if (summaries.length > 1) {
    //   const finalPrompt = `Please provide a coherent summary combining these summaries in bullet points:\n\n${finalSummary}`;
    //   finalSummary = await ollamaComplete(finalPrompt);
    // }

    return { summary: summaries.join('\n\n') };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

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
