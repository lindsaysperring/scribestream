'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
        <form className="space-y-4" onSubmit={handleSubmit}>
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
            <Button type="submit" disabled={disabled}>
              {disabled ? "Extracting..." : "Extract"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
