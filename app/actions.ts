'use server'

import { Innertube } from 'youtubei.js';

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
      model: 'gemma3:4b',
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
    const maxChunkSize = 16000; // Adjust based on model's context window
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
    let totalTokens = 0;
    let totalTime = 0;
    for (let i = 0; i < processChunks.length; i++) {
      const prompt = `Summarise the following. No introduction. No explanation. No headings. No extra sentences. Just detailed bullet points from this text. Give up to 30 bullet points:\n\n${processChunks[i]}`;
      const tokenEstimate = prompt.split(/\s+/).length;
      const startTime = Date.now();
      const summary = await ollamaComplete(prompt);
      const endTime = Date.now();
      const elapsed = (endTime - startTime) / 1000; // seconds
      totalTokens += tokenEstimate;
      totalTime += elapsed;
      console.log(`Chunk ${i + 1}: ${tokenEstimate} tokens, ${elapsed.toFixed(2)}s, ${(tokenEstimate/elapsed).toFixed(2)} tokens/sec`);
      summaries.push(summary);
    }
    if (totalTime > 0) {
      console.log(`Total: ${totalTokens} tokens, ${totalTime.toFixed(2)}s, ${(totalTokens/totalTime).toFixed(2)} tokens/sec`);
    }

    // If we have multiple summaries, generate a final summary
    let finalSummary = summaries.join('\n\n');
    // if (summaries.length > 1) {
    //   const finalPrompt = `Combine and summarize the following multiple summaries into one detailed list of bullet points. Output only bullet points. No introduction. No explanation. No headings. No extra sentences. Limit to up to 30 bullet points total:\n\n${finalSummary}`;
    //   finalSummary = await ollamaComplete(finalPrompt);
    // }

    return { summary: finalSummary };
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

    const yt = await Innertube.create();
    const video = await yt.getInfo(videoId);
    const transcriptResponse = await video.getTranscript();
    const segments = transcriptResponse?.transcript?.content?.body?.initial_segments;
    if (!segments || !segments.length) {
      throw new Error('No transcript available for this video');
    }
    // Map transcript to expected format, filtering only segments with text, duration, and offset
    const transcript = segments
      .map(item => ({
      text: item.snippet.text,
      duration: parseInt(item.end_ms) - parseInt(item.start_ms),
      offset: parseInt(item.start_ms)
      }));
    // Decode HTML entities in the transcript text
    const decodedTranscript = transcript.map(item => ({
      ...item,
      text: typeof item.text === 'string'
      ? item.text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
      : ''
    }));
    return { transcript: decodedTranscript };
  } catch (error) {
    return { error: (error as Error).message };
  }
}
