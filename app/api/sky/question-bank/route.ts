/**
 * GET/POST /api/sky/question-bank
 * Question bank query and auto-save endpoint.
 */
import { apiSuccess, apiError, API_ERROR_CODES } from '@/lib/server/api-response';
import { createLogger } from '@/lib/logger';

const log = createLogger('API:SkyQuestionBank');

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('query') || '';
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // TODO: Implement via lib/solve/question-bank.ts
    log.debug('Question bank query:', query);

    return apiSuccess({ questions: [], total: 0 });
  } catch (err) {
    log.error('Question bank GET error:', err);
    return apiError(API_ERROR_CODES.INTERNAL_ERROR, 500, '题库查询失败');
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // TODO: Implement auto-save via lib/solve/question-bank.ts
    log.debug('Question bank save request');

    return apiSuccess({ id: '', saved: true });
  } catch (err) {
    log.error('Question bank POST error:', err);
    return apiError(API_ERROR_CODES.INTERNAL_ERROR, 500, '题库保存失败');
  }
}
