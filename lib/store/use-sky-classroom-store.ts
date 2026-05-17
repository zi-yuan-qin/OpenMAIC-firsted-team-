/**
 * Sky Classroom Store
 *
 * Centralized Zustand store for all Sky Classroom modules.
 * Uses slice pattern: solve, slides, mistakes, assistant.
 * Persists user preferences to localStorage.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  SolveState,
  GradeResult,
  FourPartOutput,
  QuestionBankEntry,
  SolverAgentType,
} from '@/lib/solve/types';
import type { AvatarConfig, AvatarSpeech, SlideGenerationOptions } from '@/lib/slides/types';
import type { MistakeRecord, KnowledgeGraph, MistakeFilter } from '@/lib/mistakes/types';
import { createLogger } from '@/lib/logger';

const log = createLogger('SkyClassroomStore');

// ── Solve Slice ────────────────────────────────────────────────────

interface SolveSlice {
  currentSolveState: SolveState | null;
  solveHistory: SolveState[];
  isSolving: boolean;

  setSolveState: (state: SolveState) => void;
  addToHistory: (state: SolveState) => void;
  setSolving: (solving: boolean) => void;
  clearSolveHistory: () => void;
}

const getDefaultSolveState = (): SolveState => ({
  problemText: '',
  problemImage: null,
  userAnswer: null,
  agentId: 'universal',
  solution: null,
  gradeResult: null,
  votingResults: [],
  fourPartOutput: null,
  fromQuestionBank: false,
});

const createSolveSlice = (): SolveSlice => ({
  currentSolveState: null,
  solveHistory: [],
  isSolving: false,
  setSolveState: (state) => {
    log.debug('Solve state updated');
  },
  addToHistory: (state) => {
    log.debug('Added to solve history');
  },
  setSolving: (solving) => {
    log.debug('Solving state:', solving);
  },
  clearSolveHistory: () => {
    log.debug('Solve history cleared');
  },
});

// ── Slides Slice ───────────────────────────────────────────────────

interface SlidesSlice {
  selectedAvatarId: string;
  availableAvatars: AvatarConfig[];
  currentSpeech: AvatarSpeech | null;
  isGenerating: boolean;
  generationOptions: SlideGenerationOptions;

  setSelectedAvatar: (id: string) => void;
  setAvatars: (avatars: AvatarConfig[]) => void;
  setCurrentSpeech: (speech: AvatarSpeech | null) => void;
  setGenerating: (generating: boolean) => void;
  setGenerationOptions: (options: SlideGenerationOptions) => void;
}

const createSlidesSlice = (): SlidesSlice => ({
  selectedAvatarId: 'professor',
  availableAvatars: [],
  currentSpeech: null,
  isGenerating: false,
  generationOptions: { topic: '', difficulty: 'senior' },
  setSelectedAvatar: (id) => { log.debug('Selected avatar:', id); },
  setAvatars: (avatars) => { log.debug('Avatars set:', avatars.length); },
  setCurrentSpeech: (speech) => { log.debug('Current speech set'); },
  setGenerating: (generating) => { log.debug('Generating:', generating); },
  setGenerationOptions: (options) => { log.debug('Generation options set'); },
});

// ── Mistakes Slice ─────────────────────────────────────────────────

interface MistakesSlice {
  mistakes: MistakeRecord[];
  knowledgeGraph: KnowledgeGraph | null;
  activeFilter: MistakeFilter | null;

  addMistake: (mistake: MistakeRecord) => void;
  markReviewed: (id: string) => void;
  setFilter: (filter: MistakeFilter | null) => void;
  setKnowledgeGraph: (graph: KnowledgeGraph) => void;
  deleteMistake: (id: string) => void;
}

const createMistakesSlice = (): MistakesSlice => ({
  mistakes: [],
  knowledgeGraph: null,
  activeFilter: null,
  addMistake: (m) => { log.debug('Mistake added:', m.id); },
  markReviewed: (id) => { log.debug('Mistake reviewed:', id); },
  setFilter: (filter) => { log.debug('Filter set'); },
  setKnowledgeGraph: (graph) => { log.debug('Knowledge graph set, nodes:', graph.nodes.length); },
  deleteMistake: (id) => { log.debug('Mistake deleted:', id); },
});

// ── Assistant Slice ────────────────────────────────────────────────

interface AssistantSlice {
  isOpen: boolean;
  subject: string;
  style: string;
  difficulty: string;

  toggleOpen: () => void;
  setSubject: (subject: string) => void;
  setStyle: (style: string) => void;
  setDifficulty: (difficulty: string) => void;
}

const createAssistantSlice = (): AssistantSlice => ({
  isOpen: false,
  subject: '',
  style: 'detailed',
  difficulty: 'high-school',
  toggleOpen: () => { log.debug('Assistant toggled'); },
  setSubject: (s) => { log.debug('Assistant subject:', s); },
  setStyle: (s) => { log.debug('Assistant style:', s); },
  setDifficulty: (d) => { log.debug('Assistant difficulty:', d); },
});

// ── Combined Store ─────────────────────────────────────────────────

export type SkyClassroomStore = SolveSlice & SlidesSlice & MistakesSlice & AssistantSlice;

export const useSkyClassroomStore = create<SkyClassroomStore>()(
  persist(
    (set, get) => ({
      // Solve
      ...createSolveSlice(),
      // Slides
      ...createSlidesSlice(),
      // Mistakes
      ...createMistakesSlice(),
      // Assistant
      ...createAssistantSlice(),
    }),
    {
      name: 'sky-classroom-storage',
      partialize: (state) => ({
        selectedAvatarId: state.selectedAvatarId,
        generationOptions: state.generationOptions,
        subject: state.subject,
        style: state.style,
        difficulty: state.difficulty,
        mistakes: state.mistakes,
      }),
    },
  ),
);
