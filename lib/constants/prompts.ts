export const SUMMARY_PROMPT = `Please summarize the following text using precise and concise language. Use headers and bulleted lists in the summary, to make it scannable. Maintain the meaning and factual accuracy:

{text}`;

export const FINAL_SUMMARY_PROMPT = `Please combine and summarize the following multiple summaries into one cohesive summary using precise and concise language. Use headers and bulleted lists to make it scannable. Maintain the meaning and factual accuracy:

{summaries}`;

export const MAX_CHUNK_SIZE = 128000; // Adjust based on model's context window