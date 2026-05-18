/**
 * GET /api/sky/knowledge-graph
 * Knowledge graph endpoint.
 */
import { apiSuccess, apiError, API_ERROR_CODES } from '@/lib/server/api-response';
import { createLogger } from '@/lib/logger';

const log = createLogger('API:SkyKnowledgeGraph');

export async function GET(req: Request) {
  try {
    // TODO: Implement via lib/mistakes/knowledge-graph.ts
    log.debug('Knowledge graph request');

    return apiSuccess({
      nodes: [],
      edges: [],
      weakPoints: [],
    });
  } catch (err) {
    log.error('Knowledge graph API error:', err);
    return apiError(API_ERROR_CODES.INTERNAL_ERROR, 500, '知识图谱生成失败');
  }
}
