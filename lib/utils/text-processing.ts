export function splitIntoChunks(text: string, maxLength: number = 16000): string[] {
  const chunks: string[] = [];
  let currentChunk = '';
  const words = text.split(/(\s+)/);

  for (const word of words) {
    if ((currentChunk + word).length <= maxLength) {
      currentChunk += word;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = word;
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

export function splitIntoSentences(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+/g) || [text];
}

export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

export function estimateTokens(text: string): number {
  return text.split(/\s+/).length;
}