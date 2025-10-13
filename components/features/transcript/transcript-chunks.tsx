'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClipboard } from "@/lib/hooks/use-clipboard";

interface TranscriptChunksProps {
  chunks: string[];
}

export function TranscriptChunks({ chunks }: TranscriptChunksProps) {
  const { copy } = useClipboard();

  const handleCopyChunk = (chunk: string) => {
    copy(chunk);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>4K Token Chunks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {chunks.map((chunk, index) => (
          <div key={`chunk-${index}-${chunk.length}`} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Chunk {index + 1}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyChunk(chunk)}
                aria-label={`Copy chunk ${index + 1}`}
              >
                Copy Chunk
              </Button>
            </div>
            <div className="relative">
              <div className="max-h-[100px] overflow-y-auto rounded-md border bg-muted p-2">
                <pre className="text-xs">{chunk}</pre>
              </div>
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                {chunk.length} characters
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}