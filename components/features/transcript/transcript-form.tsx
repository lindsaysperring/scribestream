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
  disabled?: boolean;
}

export function TranscriptForm({
  url,
  onUrlChange,
  onExtract,
  disabled,
}: TranscriptFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && onExtract) {
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
            />
            <SubmitButton disabled={disabled} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
