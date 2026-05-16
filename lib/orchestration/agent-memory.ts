/**
 * Agent Memory — Cross-Turn Context Retention
 *
 * Agents can remember key information from recent turns to maintain
 * coherent multi-turn conversations. Short-term memory tracks the
 * last N turns' content and actions.
 */

import type { AgentTurnSummary } from './types';
import { AGENT_MEMORY_TURNS } from './config';

export interface AgentMemory {
  /** Summaries of recent turns by this agent */
  recentTurns: Array<{
    contentPreview: string;
    actionNames: string[];
  }>;
  /** Running list of key facts mentioned by this agent */
  keyFacts: string[];
}

/**
 * Extract agent memory from the agent response history.
 * Keeps only the most recent turns for the specified agent.
 */
export function getAgentMemory(agentResponses: AgentTurnSummary[], agentId: string): AgentMemory {
  const agentTurns = agentResponses.filter((r) => r.agentId === agentId);
  const recentTurns = agentTurns.slice(-AGENT_MEMORY_TURNS).map((turn) => ({
    contentPreview: turn.contentPreview,
    actionNames: turn.whiteboardActions?.map((a) => a.actionName) ?? [],
  }));

  // Extract key facts from content previews (simple heuristic: first sentence)
  const keyFacts = agentTurns
    .map((turn) => turn.contentPreview.split(/[.!?]/)[0]?.trim())
    .filter(Boolean)
    .slice(-AGENT_MEMORY_TURNS);

  return { recentTurns, keyFacts };
}

/**
 * Format agent memory as a text block for inclusion in the system prompt.
 */
export function formatAgentMemory(memory: AgentMemory): string {
  if (memory.recentTurns.length === 0) return '';

  const lines = ['\nYour recent activity:'];
  for (const turn of memory.recentTurns) {
    lines.push(`- Said: "${turn.contentPreview}"`);
    if (turn.actionNames.length > 0) {
      lines.push(`  Actions: ${turn.actionNames.join(', ')}`);
    }
  }

  if (memory.keyFacts.length > 0) {
    lines.push('\nKey points you made:');
    for (const fact of memory.keyFacts) {
      lines.push(`- ${fact}`);
    }
  }

  return lines.join('\n');
}
