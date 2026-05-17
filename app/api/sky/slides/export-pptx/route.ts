/**
 * POST /api/sky/slides/export-pptx
 * Export slides as PPTX.
 */
import { apiSuccess, apiError, API_ERROR_CODES } from '@/lib/server/api-response';
import { createLogger } from '@/lib/logger';

const log = createLogger('API:SkyExportPptx');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, includeSlides, includeSpeakerNotes } = body;

    if (!title) {
      return apiError(
        API_ERROR_CODES.MISSING_REQUIRED_FIELD,
        400,
        'Missing required field: title',
      );
    }

    // TODO: Implement via lib/export/course-exporter.ts
    log.debug('PPTX export request:', title);

    return apiSuccess({ fileUrl: '', fileName: `${title}.pptx` });
  } catch (err) {
    log.error('PPTX export API error:', err);
    return apiError(
      API_ERROR_CODES.INTERNAL_ERROR,
      500,
      'PPTX 导出失败',
      err instanceof Error ? err.message : undefined,
    );
  }
}
