'use client';

import { useEffect, useState, useCallback, Suspense, useRef, useActionState, startTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { TranscriptForm } from '@/components/features/transcript/transcript-form';
import { TranscriptDisplay } from '@/components/features/transcript/transcript-display';
import { SummaryDisplay } from '@/components/features/summary/summary-display';
import { ErrorDisplay } from '@/components/shared/error-display';
import { FormSkeleton } from '@/components/shared/loading-skeleton';
import { SummaryState } from '@/lib/types/transcript';
import { getTranscript } from '@/lib/actions/transcript-actions';
import { toast } from 'sonner';
import { parseYouTubeUrl } from '@/lib/utils/url-parser';

const SEARCH_URL = 'url';

function TranscriptPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [transcriptState, formAction, isPending] = useActionState(getTranscript, {});
  const [summaryState, setSummaryState] = useState<SummaryState>({});
  const [formUrl, setFormUrl] = useState(searchParams.get(SEARCH_URL) || '');

  // Track which video ID was last fetched to detect URL changes
  const lastFetchedVideoIdRef = useRef<string | null>(null);

  const url = searchParams.get(SEARCH_URL);

  // Sync form URL when search params change (browser back/forward)
  useEffect(() => {
    const nextUrl = searchParams.get(SEARCH_URL) || '';
    setFormUrl(nextUrl);
  }, [searchParams]);

  // Show toast on transcript state changes
  useEffect(() => {
    if (transcriptState.error) {
      toast.error(transcriptState.error);
    } else if (transcriptState.transcript) {
      toast.success('Transcript extracted successfully!');
    }
  }, [transcriptState]);

  // Auto-extract when URL param appears or changes
  useEffect(() => {
    const target = searchParams.get(SEARCH_URL);
    if (!target || target.trim() === '') return;

    const videoId = parseYouTubeUrl(target);
    if (!videoId) return;

    // Only re-extract when the URL param actually changes
    if (lastFetchedVideoIdRef.current === videoId) return;
    lastFetchedVideoIdRef.current = videoId;

    setSummaryState({});
    const formData = new FormData();
    formData.set('url', target);
    startTransition(() => {
      formAction(formData);
    });
  }, [url, formAction]);

  const extract = useCallback(async (urlValue: string) => {
    const videoId = parseYouTubeUrl(urlValue);
    if (!videoId) {
      toast.error('Invalid YouTube URL or video ID');
      return;
    }
    setSummaryState({});
    router.push(`?${SEARCH_URL}=${encodeURIComponent(urlValue)}`, { scroll: false });
  }, [router]);

  const handleGenerateSummary = async () => {
    if (!transcriptState.transcript) return;

    const fullText = transcriptState.transcript.map(t => t.text).join('\n');
    setSummaryState({ loading: true });

    try {
      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = JSON.parse(line.slice(6));

          if (data.error) {
            setSummaryState({ error: data.error });
            toast.error(data.error);
            return;
          }

          if (data.progress) {
            setSummaryState(prev => ({ ...prev, progress: data.progress }));
          }

          if (data.summary) {
            setSummaryState({ summary: data.summary });
            toast.success('Summary generated successfully!');
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate summary';
      setSummaryState({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      setSummaryState(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <main className="container mx-auto p-4 min-h-screen max-w-4xl">
      <div className="space-y-8 py-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">ScribeStream</h1>
          <p className="text-muted-foreground">
            Enter a YouTube URL or ID to extract its transcript and generate a summary
          </p>
        </div>

        <TranscriptForm
          url={formUrl}
          onUrlChange={setFormUrl}
          onExtract={extract}
          disabled={isPending}
        />

        <div className="space-y-4">
          {transcriptState.error && <ErrorDisplay message={transcriptState.error} />}
          {isPending && <FormSkeleton />}
          {!isPending && transcriptState.transcript && (
            <>
              <TranscriptDisplay transcript={transcriptState.transcript} />
              <SummaryDisplay
                summaryState={summaryState}
                onGenerateSummary={handleGenerateSummary}
              />
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function TranscriptPage() {
  return (
    <Suspense>
      <TranscriptPageContent />
    </Suspense>
  );
}
