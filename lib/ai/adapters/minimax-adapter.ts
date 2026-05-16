/**
 * MiniMax Adapter — Anthropic-Compatible URL Normalization
 *
 * MiniMax requires the `/anthropic/v1` suffix on its base URL.
 * This adapter ensures correct path construction regardless of
 * what the user enters (e.g., just the domain, or `/anthropic`).
 */

import type { ProviderId } from '@/lib/types/provider';

/**
 * Normalize MiniMax base URL to always end with `/anthropic/v1`.
 * Returns the original value unchanged for non-MiniMax providers.
 */
export function normalizeMiniMaxBaseUrl(
  providerId: ProviderId,
  baseUrl: string | undefined,
): string | undefined {
  if (providerId !== 'minimax' || !baseUrl) {
    return baseUrl;
  }

  const trimmed = baseUrl.replace(/\/$/, '');
  if (trimmed.endsWith('/anthropic/v1')) {
    return trimmed;
  }
  if (trimmed.endsWith('/anthropic')) {
    return `${trimmed}/v1`;
  }
  return `${trimmed}/anthropic/v1`;
}
