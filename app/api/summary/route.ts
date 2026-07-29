import { NextRequest } from 'next/server';
import { summarySchema } from '@/lib/validations/transcript-schema';
import { getGeminiService } from '@/lib/services/gemini-service';
import { handleError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const body = await request.json();
        const parsed = summarySchema.safeParse({ text: body.text });

        if (!parsed.success) {
          const errorMessage = parsed.error.issues[0].message;
          send({ error: errorMessage });
          controller.close();
          return;
        }

        const summary = await getGeminiService().generateSummary(
          parsed.data.text,
          (current, total) => {
            send({ progress: { current, total } });
          }
        );

        send({ summary });
        controller.close();
      } catch (error) {
        const errorMessage = handleError(error);
        logger.error('Failed to generate summary', error);
        send({ error: errorMessage });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
