/**
 * POST /api/sky/solve/recognize
 * Image recognition endpoint for problem solving.
 */
import { apiSuccess, apiError, API_ERROR_CODES } from '@/lib/server/api-response';
import { createLogger } from '@/lib/logger';

const log = createLogger('API:SkySolveRecognize');

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File | null;

    if (!image) {
      return apiError(
        API_ERROR_CODES.MISSING_REQUIRED_FIELD,
        400,
        'Missing required field: image',
      );
    }

    // TODO: Implement actual recognition via lib/recognition/image-recognizer.ts
    // For now, return placeholder response
    log.debug('Recognize request received for image:', image.name);

    return apiSuccess({
      text: '',
      latex: '',
      problemCount: 0,
      problems: [],
    });
  } catch (err) {
    log.error('Recognize API error:', err);
    return apiError(
      API_ERROR_CODES.INTERNAL_ERROR,
      500,
      '图片识别失败',
      err instanceof Error ? err.message : undefined,
    );
  }
}
