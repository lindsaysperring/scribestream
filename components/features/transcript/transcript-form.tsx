'use client';

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { getTranscript } from "@/lib/actions/transcript-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TranscriptState } from "@/lib/types/transcript";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Extracting..." : "Extract"}
    </Button>
  );
}

interface TranscriptFormProps {
  onStateChange?: (state: TranscriptState) => void;
}

export function TranscriptForm({ onStateChange }: TranscriptFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState<TranscriptState, FormData>(getTranscript, {} as TranscriptState);

  // Notify parent of state changes
  if (onStateChange && state !== null) {
    onStateChange(state);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extract Transcript</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          action={formAction}
          className="space-y-4"
          onSubmit={() => {
            // Reset form on successful submission
            if (state && !state.error) {
              setTimeout(() => formRef.current?.reset(), 100);
            }
          }}
        >
          <div className="flex gap-2">
            <Input
              name="url"
              placeholder="Enter YouTube URL or video ID"
              required
              className="flex-1"
              aria-label="YouTube video URL"
            />
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}