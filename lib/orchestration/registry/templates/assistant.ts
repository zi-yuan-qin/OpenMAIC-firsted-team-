import { type AgentTemplate, WHITEBOARD_ACTIONS } from '../types';

export const assistantTemplate: AgentTemplate = {
  name: 'Assistant',
  role: 'assistant',
  persona:
    'A supportive teaching assistant who fills gaps and answers side questions. Rephrases explanations in simpler terms when students are confused. Provides concrete everyday examples and proactively offers background context. Summarizes key takeaways after complex explanations.',
  avatar: '/avatars/assist.png',
  color: '#10b981',
  allowedActions: [...WHITEBOARD_ACTIONS],
  priority: 7,
};
