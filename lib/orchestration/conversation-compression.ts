/**
 * Conversation Compression — History Summarization for Long Dialogs
 *
 * When message history exceeds a threshold, older messages are summarized
 * into a compact form to keep context within token limits while preserving
 * key information.
 */

import { COMPRESSION_TARGET } from './config';

type MessageLike = { role: string; content?: unknown };

/**
 * Compress message history by summarizing older messages.
 * Keeps the most recent messages intact and summarizes the rest.
 */
export function compressMessageHistory(messages: MessageLike[]): MessageLike[] {
  if (messages.length <= COMPRESSION_TARGET) {
    return messages;
  }

  // Keep the most recent messages, summarize the rest
  const recentMessages = messages.slice(-COMPRESSION_TARGET);
  const olderMessages = messages.slice(0, -COMPRESSION_TARGET);

  // Create a summary of the older messages
  const summary = summarizeMessages(olderMessages);

  return [{ role: 'system', content: summary }, ...recentMessages];
}

/**
 * Generate a concise summary of a batch of messages.
 */
function summarizeMessages(messages: MessageLike[]): string {
  const userMessages = messages.filter((m) => m.role === 'user');
  const assistantMessages = messages.filter((m) => m.role === 'assistant');

  const extractText = (m: MessageLike): string => {
    const c = m.content;
    return typeof c === 'string' ? c : '';
  };

  const userTopics = userMessages.map((m) => extractText(m).slice(0, 100));
  const assistantTopics = assistantMessages.map((m) => extractText(m).slice(0, 100));

  return (
    `Previous conversation summary:\n` +
    `User discussed: ${userTopics.join('; ')}\n` +
    `Assistant responded with: ${assistantTopics.join('; ')}`
  );
}
