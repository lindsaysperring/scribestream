'use client';

import { downloadText } from '@/lib/utils/download';
import { toast } from 'sonner';

export function useDownload() {
  const download = (content: string, filename: string) => {
    try {
      downloadText(content, filename);
      toast.success('Download started!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download');
    }
  };

  return { download };
}