'use client';

import { useEffect, useState, useCallback, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { TranscriptForm } from '@/components/features/transcript/transcript-form';
import { TranscriptDisplay } from '@/components/features/transcript/transcript-display';
import { SummaryDisplay } from '@/components/features/summary/summary-display';
import { ErrorDisplay } from '@/components/shared/error-display';
import { FormSkeleton } from '@/components/shared/loading-skeleton';
import { TranscriptState, SummaryState } from '@/lib/types/transcript';
import { generateSummary } from '@/lib/actions/summary-actions';
import { getTranscript } from '@/lib/actions/transcript-actions';
import { toast } from 'sonner';
import { parseYouTubeUrl } from '@/lib/utils/url-parser';

const SEARCH_URL = 'url';

function TranscriptPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [transcriptState, setTranscriptState] = useState<TranscriptState>({});
  const [summaryState, setSummaryState] = useState<SummaryState>({});
  const [loading, setLoading] = useState(false);
  const [formUrl, setFormUrl] = useState(searchParams.get(SEARCH_URL) || '');

  // Track which video ID was last fetched to detect URL changes
  const lastFetchedVideoIdRef = useRef<string | null>(null);

  const url = searchParams.get(SEARCH_URL);

  // Sync form URL when search params change (browser back/forward)
  useEffect(() => {
    const nextUrl = searchParams.get(SEARCH_URL) || '';
    setFormUrl(nextUrl);
  }, [searchParams]);

  // Auto-extract when URL param appears or changes
  useEffect(() => {
    const target = searchParams.get(SEARCH_URL);
    if (!target || target.trim() === '') return;

    const videoId = parseYouTubeUrl(target);
    if (!videoId) return;

    // Only re-extract when the URL param actually changes
    if (lastFetchedVideoIdRef.current === videoId) return;
    lastFetchedVideoIdRef.current = videoId;

    (async () => {
      setSummaryState({});
      setTranscriptState({});
      setLoading(true);

      try {
        const formData = new FormData();
        formData.set('url', target);
        const result = await getTranscript({}, formData);
        if (result.error) {
          setTranscriptState({ error: result.error });
          toast.error(result.error);
        } else if (result.transcript) {
          setTranscriptState({ transcript: result.transcript });
          toast.success('Transcript extracted successfully!');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to extract transcript';
        setTranscriptState({ error: errorMessage });
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    })();
  }, [url]);

  const extract = useCallback(async (urlValue: string) => {
    const videoId = parseYouTubeUrl(urlValue);
    if (!videoId) {
      toast.error('Invalid YouTube URL or video ID');
      return;
    }
    setTranscriptState({});
    setSummaryState({});
    router.push(`?${SEARCH_URL}=${encodeURIComponent(urlValue)}`, { scroll: false });
    setLoading(true);
  }, [router]);

  const handleGenerateSummary = async () => {
    if (!transcriptState.transcript) return;

    const fullText = transcriptState.transcript.map(t => t.text).join('\n');
    setSummaryState({ loading: true });

    try {
      const result = await generateSummary(fullText);
      if (result.error) {
        setSummaryState({ error: result.error });
        toast.error(result.error);
      } else {
        setSummaryState({ summary: result.summary });
        toast.success('Summary generated successfully!');
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
          disabled={loading}
        />

        <div className="space-y-4">
          {transcriptState.error && <ErrorDisplay message={transcriptState.error} />}
          {loading && <FormSkeleton />}
          {!loading && transcriptState.transcript && (
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
