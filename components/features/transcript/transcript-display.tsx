'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TranscriptSegment } from "@/lib/types/transcript";
import { useClipboard } from "@/lib/hooks/use-clipboard";
import { useDownload } from "@/lib/hooks/use-download";
import { splitIntoChunks } from "@/lib/utils/text-processing";
import { TranscriptActions } from "./transcript-actions";
import { TranscriptChunks } from "./transcript-chunks";

interface TranscriptDisplayProps {
  transcript: TranscriptSegment[];
}

export function TranscriptDisplay({ transcript }: TranscriptDisplayProps) {
  const { copy } = useClipboard();
  const { download } = useDownload();

  const fullText = useMemo(
    () => transcript.map(item => item.text).join('\n'),
    [transcript]
  );

  const chunks = useMemo(
    () => splitIntoChunks(fullText),
    [fullText]
  );

  const handleCopyAll = () => {
    copy(fullText);
  };

  const handleDownload = () => {
    download(fullText, 'transcript.txt');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Full Transcript</span>
            <TranscriptActions
              onCopyAll={handleCopyAll}
              onDownload={handleDownload}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-[300px] overflow-y-auto space-y-2">
          {transcript.map((item, index) => (
            <p key={`${item.offset}-${item.duration}-${index}`} className="text-sm">
              {item.text}
            </p>
          ))}
        </CardContent>
      </Card>

      <TranscriptChunks chunks={chunks} />
    </div>
  );
}