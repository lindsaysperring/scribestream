'use client';

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Extracting..." : "Extract"}
    </Button>
  );
}

interface TranscriptFormProps {
  url: string;
  onUrlChange: (url: string) => void;
  onExtract?: (url: string) => void;
  formAction?: (formData: FormData) => void;
  disabled?: boolean;
}

export function TranscriptForm({
  url,
  onUrlChange,
  onExtract,
  formAction,
  disabled,
}: TranscriptFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!formAction) {
      e.preventDefault();
      if (url.trim() && onExtract) {
        onExtract(url.trim());
      }
      return;
    }
    // Let the form submit naturally with the server action
    // Update URL in the callback
    if (onExtract) {
      onExtract(url.trim());
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extract Transcript</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          action={formAction}
          onSubmit={handleSubmit}
        >
          <div className="flex gap-2">
            <Input
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="Enter YouTube URL or video ID"
              required
              className="flex-1"
              aria-label="YouTube video URL"
              name="url"
            />
            <SubmitButton disabled={disabled} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
