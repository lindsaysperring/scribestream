export function parseYouTubeUrl(urlOrId: string): string | null {
  if (!urlOrId) return null;

  // If it's already a video ID (11 characters)
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) {
    return urlOrId;
  }

  // Extract from various YouTube URL formats
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^"&?/\s]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^"&?/\s]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^"&?/\s]{11})/
  ];

  for (const pattern of patterns) {
    const match = urlOrId.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

export function isValidYouTubeUrl(urlOrId: string): boolean {
  return parseYouTubeUrl(urlOrId) !== null;
}