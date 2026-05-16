/**
 * API Infrastructure — Barrel Export
 *
 * Provides unified error handling, rate limiting, and OpenAPI documentation
 * for all API routes.
 */

// Error handling
export {
  ApiError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  handleApiError,
  withErrorHandler,
  validateBody,
  requireField,
} from './middleware/error-handler';

// Rate limiting
export {
  createRateLimiter,
  rateLimitResponse,
  addRateLimitHeaders,
  rateLimiters,
  getClientIp,
  type RateLimitConfig,
  type RateLimitResult,
} from './middleware/rate-limiter';

// OpenAPI
export {
  generateOpenApiSpec,
  registerOpenApiPath,
  getPathCount,
  type OpenApiPathDefinition,
} from './openapi/spec';
