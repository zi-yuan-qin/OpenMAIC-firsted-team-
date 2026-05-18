/**
 * GET/POST/PATCH/DELETE /api/sky/mistakes
 * Mistake book CRUD endpoint.
 */
import { apiSuccess, apiError, API_ERROR_CODES } from '@/lib/server/api-response';
import { createLogger } from '@/lib/logger';

const log = createLogger('API:SkyMistakes');

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const filter = url.searchParams.get('filter');

    // TODO: Implement via lib/mistakes/mistake-tracker.ts
    log.debug('Mistakes query, filter:', filter);

    return apiSuccess({ mistakes: [], total: 0 });
  } catch (err) {
    log.error('Mistakes GET error:', err);
    return apiError(API_ERROR_CODES.INTERNAL_ERROR, 500, '错题查询失败');
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // TODO: Implement via lib/mistakes/mistake-tracker.ts
    log.debug('Mistake record create request');

    return apiSuccess({ id: '', created: true });
  } catch (err) {
    log.error('Mistakes POST error:', err);
    return apiError(API_ERROR_CODES.INTERNAL_ERROR, 500, '错题记录失败');
  }
}

export async function PATCH(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    const body = await req.json();

    // TODO: Implement review marking
    log.debug('Mistake review request:', id);

    return apiSuccess({ reviewed: true });
  } catch (err) {
    log.error('Mistakes PATCH error:', err);
    return apiError(API_ERROR_CODES.INTERNAL_ERROR, 500, '标记复习失败');
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    // TODO: Implement mistake deletion
    log.debug('Mistake delete request:', id);

    return apiSuccess({ deleted: true });
  } catch (err) {
    log.error('Mistakes DELETE error:', err);
    return apiError(API_ERROR_CODES.INTERNAL_ERROR, 500, '删除错题失败');
  }
}
