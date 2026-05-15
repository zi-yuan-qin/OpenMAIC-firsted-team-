/**
 * Graph Definition — Pure Declarative Graph Structure
 *
 * Defines the LangGraph StateGraph topology without embedding
 * node logic. Node implementations are imported separately.
 */

import { StateGraph, START, END } from '@langchain/langgraph';

import { OrchestratorState } from './state-manager';
import { directorNode, directorCondition } from './director-node';
import { agentGenerateNode } from './agent-node';

/**
 * Create the orchestration LangGraph StateGraph.
 *
 * Topology:
 *   START → director ──(end)──→ END
 *              │
 *              └─(next)→ agent_generate ──→ director (loop)
 */
export function createOrchestrationGraph() {
  const graph = new StateGraph(OrchestratorState)
    .addNode('director', directorNode)
    .addNode('agent_generate', agentGenerateNode)
    .addEdge(START, 'director')
    .addConditionalEdges('director', directorCondition, {
      agent_generate: 'agent_generate',
      [END]: END,
    })
    .addEdge('agent_generate', 'director');

  return graph.compile();
}
