'use client';

import { useState, Suspense } from 'react';
import { TranscriptForm } from '@/components/features/transcript/transcript-form';
import { TranscriptDisplay } from '@/components/features/transcript/transcript-display';
import { SummaryDisplay } from '@/components/features/summary/summary-display';
import { ErrorDisplay } from '@/components/shared/error-display';
import { FormSkeleton } from '@/components/shared/loading-skeleton';
import { TranscriptState, SummaryState } from '@/lib/types/transcript';
import { generateSummary } from '@/lib/actions/summary-actions';
import { toast } from 'sonner';

export default function TranscriptPage() {
  const [transcriptState, setTranscriptState] = useState<TranscriptState>({});
  const [summaryState, setSummaryState] = useState<SummaryState>({});

  const handleStateChange = (state: TranscriptState) => {
    setTranscriptState((prev) => {
      if (state?.transcript) {
        const prevT = prev?.transcript;
        const newT = state.transcript;
        const isDifferent =
          !prevT ||
          prevT.length !== newT.length ||
          prevT[0]?.text !== newT[0]?.text ||
          prevT[prevT.length - 1]?.text !== newT[newT.length - 1]?.text;

        if (isDifferent) {
          setSummaryState({});
        }
      }

      return state;
    });
  };

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

        <Suspense fallback={<FormSkeleton />}>
          <TranscriptForm onStateChange={handleStateChange} />
        </Suspense>

        <div className="space-y-4">
          {transcriptState.error && <ErrorDisplay message={transcriptState.error} />}
          {transcriptState.transcript && (
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