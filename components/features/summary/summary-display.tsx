'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';
import { useClipboard } from "@/lib/hooks/use-clipboard";
import { useDownload } from "@/lib/hooks/use-download";
import { SummaryState } from "@/lib/types/transcript";

const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0 text-foreground">
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-xl font-semibold mb-3 mt-5 text-foreground">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-lg font-medium mb-2 mt-4 text-foreground">
      {children}
    </h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-4 leading-relaxed text-muted-foreground">
      {children}
    </p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-4 ml-6 list-disc space-y-1 text-foreground">
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-4 ml-6 list-decimal space-y-1 text-foreground">
      {children}
    </ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="leading-relaxed">
      {children}
    </li>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-4 border-primary pl-4 mb-4 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">
      {children}
    </code>
  ),
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="bg-muted p-4 rounded-lg mb-4 overflow-x-auto text-sm font-mono text-foreground">
      {children}
    </pre>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-foreground">
      {children}
    </strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="italic text-muted-foreground">
      {children}
    </em>
  ),
};

interface SummaryDisplayProps {
  summaryState: SummaryState;
  onGenerateSummary: () => void;
}

export function SummaryDisplay({ summaryState, onGenerateSummary }: SummaryDisplayProps) {
  const { summary, error, loading, progress } = summaryState;
  const { copy } = useClipboard();
  const { download } = useDownload();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4">
        <div className="text-red-600 text-sm">
          Error generating summary: {error}
        </div>
        <Button
          onClick={onGenerateSummary}
          disabled={loading}
          variant="secondary"
          size="sm"
          aria-label="Generate summary"
        >
          {loading ? "Generating..." : "Try Again"}
        </Button>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-2">
        {loading && progress && (
          <div className="text-sm text-muted-foreground">
            Processing chunk {progress.current} of {progress.total}...
          </div>
        )}
        <Button
          onClick={onGenerateSummary}
          disabled={loading}
          variant="secondary"
          size="sm"
          aria-label="Generate summary"
        >
          {loading ? "Generating..." : "Generate Summary"}
        </Button>
      </div>
    );
  }

  const handleCopySummary = () => {
    copy(summary);
  };

  const handleDownloadSummary = () => {
    download(summary, 'summary.txt');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Summary</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopySummary}
              aria-label="Copy summary to clipboard"
            >
              Copy Summary
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadSummary}
              aria-label="Download summary"
            >
              Download Summary
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[800px] overflow-y-auto">
        <ReactMarkdown components={markdownComponents}>
          {summary}
        </ReactMarkdown>
      </CardContent>
    </Card>
  );
}