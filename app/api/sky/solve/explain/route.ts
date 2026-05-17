/**
 * POST /api/sky/solve/explain
 * Solve + generate four-part output endpoint.
 */
import { apiSuccess, apiError, API_ERROR_CODES } from '@/lib/server/api-response';
import { createLogger } from '@/lib/logger';

const log = createLogger('API:SkySolveExplain');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { problem, agentId, useHighPrecision, outputFormat } = body;

    if (!problem) {
      return apiError(
        API_ERROR_CODES.MISSING_REQUIRED_FIELD,
        400,
        'Missing required field: problem',
      );
    }

    // TODO: Implement via lib/solve/solve-graph.ts
    log.debug('Explain request received');

    return apiSuccess({
      answer: '',
      steps: [],
      knowledgePoints: [],
      similarQuestions: [],
      fromQuestionBank: false,
      solvingTime: 0,
      agentsUsed: [],
    });
  } catch (err) {
    log.error('Explain API error:', err);
    return apiError(
      API_ERROR_CODES.INTERNAL_ERROR,
      500,
      '解题失败',
      err instanceof Error ? err.message : undefined,
    );
  }
}
