/**
 * POST /api/sky/solve/grade
 * Grading endpoint: compares user answer with correct answer.
 */
import { apiSuccess, apiError, API_ERROR_CODES } from '@/lib/server/api-response';
import { createLogger } from '@/lib/logger';

const log = createLogger('API:SkySolveGrade');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { problem, correctAnswer, userAnswer, stepByStep } = body;

    if (!problem || !correctAnswer || !userAnswer) {
      return apiError(
        API_ERROR_CODES.MISSING_REQUIRED_FIELD,
        400,
        'Missing required fields: problem, correctAnswer, userAnswer',
      );
    }

    // TODO: Implement actual grading via lib/solve/grader.ts
    log.debug('Grade request received');

    return apiSuccess({
      isCorrect: false,
      score: 0,
      correctAnswer,
      userAnswer,
      errorAnalysis: '批改引擎待实现',
      cause: 'concept-unclear',
      partialCredit: [],
    });
  } catch (err) {
    log.error('Grade API error:', err);
    return apiError(
      API_ERROR_CODES.INTERNAL_ERROR,
      500,
      '批改失败',
      err instanceof Error ? err.message : undefined,
    );
  }
}
