/**
 * Orchestration Configuration Constants
 *
 * Centralizes all hardcoded values (turn limits, preview lengths,
 * canvas dimensions, etc.) so they can be tuned without code changes.
 */

/** Maximum number of turns in a single orchestration session. */
export const DEFAULT_MAX_TURNS = 50;

/** Maximum number of agents that can participate in a discussion. */
export const MAX_AGENTS = 20;

/** Maximum length of content preview stored in agent response summary. */
export const CONTENT_PREVIEW_MAX_LENGTH = 300;

/** Default canvas dimensions (16:9 aspect ratio). */
export const CANVAS_DIMENSIONS = {
  width: 1000,
  height: 562,
} as const;

/** Maximum whiteboard elements allowed per scene. */
export const MAX_WHITEBOARD_ELEMENTS = 50;

/** Maximum actions an agent can emit per turn. */
export const MAX_ACTIONS_PER_TURN = 30;

/** Message length threshold for triggering conversation compression. */
export const COMPRESSION_MESSAGE_THRESHOLD = 20;

/** Target message count after compression. */
export const COMPRESSION_TARGET = 5;

/** Agent memory retention: number of recent turns to keep in short-term memory. */
export const AGENT_MEMORY_TURNS = 3;

/** Default timeout for LLM generation in milliseconds. */
export const LLM_GENERATION_TIMEOUT_MS = 60_000;

/** Default timeout for director decision in milliseconds. */
export const DIRECTOR_DECISION_TIMEOUT_MS = 15_000;

/** Fallback prompt when message history is empty. */
export const EMPTY_HISTORY_PROMPT = 'Please begin.';

/** Fallback prompt when agent's own message is last in history. */
export const AGENT_TURN_PROMPT = "It's your turn to speak. Respond from your perspective.";
