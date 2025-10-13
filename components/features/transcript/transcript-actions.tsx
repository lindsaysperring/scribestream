'use client';

import { Button } from "@/components/ui/button";

interface TranscriptActionsProps {
  onCopyAll: () => void;
  onDownload: () => void;
}

export function TranscriptActions({ onCopyAll, onDownload }: TranscriptActionsProps) {
  return (
    <div className="flex gap-2 items-center">
      <Button
        variant="secondary"
        size="sm"
        onClick={onCopyAll}
        aria-label="Copy transcript to clipboard"
      >
        Copy All
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onDownload}
        aria-label="Download transcript"
      >
        Download
      </Button>
    </div>
  );
}