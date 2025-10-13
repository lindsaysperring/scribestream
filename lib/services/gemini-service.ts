import { GoogleGenerativeAI } from '@google/generative-ai';
import { splitIntoSentences } from '@/lib/utils/text-processing';
import { SUMMARY_PROMPT, FINAL_SUMMARY_PROMPT, MAX_CHUNK_SIZE } from '@/lib/constants/prompts';
import { APIError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';
import { env } from '@/lib/env';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model;

  constructor() {
    const apiKey = env.GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    logger.info('Gemini service initialized');
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      logger.error('Failed to generate text with Gemini', error);
      throw new APIError('Failed to generate text', 'Gemini');
    }
  }

  async generateSummary(text: string): Promise<string> {
    try {
      const chunks = splitIntoSentences(text);
      let currentChunk = '';
      const processChunks: string[] = [];

      // Group sentences into chunks
      for (const sentence of chunks) {
        if ((currentChunk + sentence).length > MAX_CHUNK_SIZE) {
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
        const prompt = SUMMARY_PROMPT.replace('{text}', processChunks[i]);
        const tokenEstimate = prompt.split(/\s+/).length;
        const startTime = Date.now();
        const summary = await this.generateText(prompt);
        const endTime = Date.now();
        const elapsed = (endTime - startTime) / 1000; // seconds
        totalTokens += tokenEstimate;
        totalTime += elapsed;

        logger.debug(`Processed chunk ${i + 1}/${processChunks.length}`, {
          tokens: tokenEstimate,
          time: elapsed,
          tps: tokenEstimate / elapsed
        });

        summaries.push(summary);
      }

      if (totalTime > 0) {
        logger.info('Summary generation completed', {
          totalTokens,
          totalTime,
          avgTokensPerSecond: totalTokens / totalTime
        });
      }

      // If we have multiple summaries, generate a final summary
      let finalSummary = summaries.join('\n\n');
      if (summaries.length > 1) {
        const finalPrompt = FINAL_SUMMARY_PROMPT.replace('{summaries}', finalSummary);
        finalSummary = await this.generateText(finalPrompt);
      }

      return finalSummary;
    } catch (error) {
      logger.error('Failed to generate summary', error);
      if (error instanceof APIError) throw error;
      throw new APIError('Failed to generate summary', 'Gemini');
    }
  }
}

export const geminiService = new GeminiService();