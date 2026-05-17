/**
 * POST /api/sky/assistant
 * AI assistant chat endpoint.
 */
import { apiSuccess, apiError, API_ERROR_CODES } from '@/lib/server/api-response';
import { createLogger } from '@/lib/logger';

const log = createLogger('API:SkyAssistant');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, config } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return apiError(
        API_ERROR_CODES.MISSING_REQUIRED_FIELD,
        400,
        'Missing required field: messages',
      );
    }

    // TODO: Implement via existing lib/orchestration/registry/ with solver templates
    log.debug('Assistant chat request');

    return apiSuccess({ reply: '', conversationId: '' });
  } catch (err) {
    log.error('Assistant API error:', err);
    return apiError(
      API_ERROR_CODES.INTERNAL_ERROR,
      500,
      'AI 助手响应失败',
      err instanceof Error ? err.message : undefined,
    );
  }
}
