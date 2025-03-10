'use client';

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { getTranscript } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type TranscriptResponse = {
  text: string;
  duration: number;
  offset: number;
};

type TranscriptState = {
  transcript?: TranscriptResponse[];
  error?: string;
} | null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Extracting..." : "Extract"}
    </Button>
  );
}

export default function Home() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState<TranscriptState, FormData>(getTranscript, null);

  useEffect(() => {
    if (state && !state.error) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <main className="container mx-auto p-4 min-h-screen max-w-4xl">
      <div className="space-y-8 py-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">YouTube Transcript Extractor</h1>
          <p className="text-muted-foreground">
            Enter a YouTube URL or video ID to get its transcript
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Extract Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <form ref={formRef} action={formAction} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  name="url"
                  placeholder="Enter YouTube URL or video ID"
                  required
                  className="flex-1"
                />
                <SubmitButton />
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {state?.error && <ErrorDisplay message={state.error} />}
          {state?.transcript && <TranscriptDisplay transcript={state.transcript} />}
        </div>
      </div>
    </main>
  );
}

function TranscriptDisplay({ transcript }: { transcript: TranscriptResponse[] }) {
  const fullText = transcript.map(item => item.text).join('\n');

  const splitIntoChunks = (text: string, maxLength: number = 4000): string[] => {
    const chunks: string[] = [];
    let currentChunk = '';

    const words = text.split(/(\s+)/);
    
    for (const word of words) {
      if ((currentChunk + word).length <= maxLength) {
        currentChunk += word;
      } else {
        chunks.push(currentChunk.trim());
        currentChunk = word;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  };

  const chunks = splitIntoChunks(fullText);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const copyChunk = async (chunk: string) => {
    try {
      await navigator.clipboard.writeText(chunk);
    } catch (err) {
      console.error('Failed to copy chunk:', err);
    }
  };

  const downloadTranscript = () => {
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcript.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Full Transcript</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                Copy All
              </Button>
              <Button variant="outline" size="sm" onClick={downloadTranscript}>
                Download
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-[300px] overflow-y-auto space-y-2">
          {transcript.map((item, index) => (
            <p key={index} className="text-sm">
              {item.text}
            </p>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4K Character Chunks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {chunks.map((chunk, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Chunk {index + 1}</span>
                <Button variant="outline" size="sm" onClick={() => copyChunk(chunk)}>
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
    </div>
  );
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
