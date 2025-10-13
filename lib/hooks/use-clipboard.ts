'use client';

import { useState } from 'react';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { toast } from 'sonner';

export function useClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      toast.success('Copied to clipboard!');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy');
    }
    return success;
  };

  return { copy, copied };
}