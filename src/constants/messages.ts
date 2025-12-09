/**
 * Centralized messages for validation, errors, and responses
 * Single source of truth for all user-facing strings
 */

// ============================================================================
// VALIDATION MESSAGES
// ============================================================================
export const VALIDATION = {
  // Content validation
  CONTENT_ID_REQUIRED: 'contentId is required',
  CONTENT_ID_TOO_LONG: 'contentId too long',

  // Pagination validation
  PAGE_MIN: 'page must be at least 1',
  LIMIT_RANGE: 'limit must be between 1 and 100',

  // Model validation
  GENRE_REQUIRED: 'At least one genre is required',
  ACTOR_REQUIRED: 'At least one actor is required',
  EPISODE_REQUIRED: 'At least one episode is required',

  // Cursor validation
  INVALID_CURSOR: 'Invalid cursor',
  INVALID_CURSOR_FORMAT: 'Invalid cursor format',
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================
export const ERRORS = {
  // Authentication errors
  UNAUTHORIZED: 'Unauthorized',
  MISSING_USER_ID_HEADER: 'Missing or invalid x-user-id header',
  INVALID_USER_ID_FORMAT: 'Invalid user ID format',

  // Generic errors
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  NOT_FOUND: 'Not found',
  BAD_REQUEST: 'Bad request',

  // Resource errors
  RESOURCE_NOT_FOUND: 'Resource not found',
  RESOURCE_ALREADY_EXISTS: 'Resource already exists',
  ITEM_ALREADY_IN_LIST: 'Item already exists in list',
  ITEM_NOT_IN_LIST: 'Item not in list',
  MOVIE_NOT_FOUND: 'Movie not found',
  TV_SHOW_NOT_FOUND: 'TV Show not found',

  // ID errors
  INVALID_ID_FORMAT: 'Invalid ID format',
  INVALID_ID_DETAILS: 'The provided ID is not a valid format',

  // Rate limiting
  TOO_MANY_REQUESTS: 'Too many requests',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later.',
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================
export const SUCCESS = {
  ITEM_REMOVED: 'Item removed from list',
} as const;

// ============================================================================
// DYNAMIC MESSAGE GENERATORS
// ============================================================================
export const ROUTE_NOT_FOUND = (method: string, path: string): string =>
  `Route ${method} ${path} not found`;

// ============================================================================
// DEFAULT EXPORT
// ============================================================================
export default {
  VALIDATION,
  ERRORS,
  SUCCESS,
  ROUTE_NOT_FOUND,
};
