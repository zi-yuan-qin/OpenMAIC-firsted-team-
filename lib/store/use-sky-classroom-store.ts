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

type SetFn<T> = (partial: Partial<T> | ((state: T) => Partial<T>)) => void;

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

const createSolveSlice = (set: SetFn<SolveSlice>): SolveSlice => ({
  currentSolveState: null,
  solveHistory: [],
  isSolving: false,
  setSolveState: (state) => {
    log.debug('Solve state updated');
    set({ currentSolveState: state });
  },
  addToHistory: (state) => {
    log.debug('Added to solve history');
    set((s) => ({ solveHistory: [...s.solveHistory, state] }));
  },
  setSolving: (solving) => {
    log.debug('Solving state:', solving);
    set({ isSolving: solving });
  },
  clearSolveHistory: () => {
    log.debug('Solve history cleared');
    set({ solveHistory: [] });
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

const createSlidesSlice = (set: SetFn<SlidesSlice>): SlidesSlice => ({
  selectedAvatarId: 'professor',
  availableAvatars: [],
  currentSpeech: null,
  isGenerating: false,
  generationOptions: { topic: '', difficulty: 'senior' },
  setSelectedAvatar: (id) => {
    log.debug('Selected avatar:', id);
    set({ selectedAvatarId: id });
  },
  setAvatars: (avatars) => {
    log.debug('Avatars set:', avatars.length);
    set({ availableAvatars: avatars });
  },
  setCurrentSpeech: (speech) => {
    log.debug('Current speech set');
    set({ currentSpeech: speech });
  },
  setGenerating: (generating) => {
    log.debug('Generating:', generating);
    set({ isGenerating: generating });
  },
  setGenerationOptions: (options) => {
    log.debug('Generation options set');
    set({ generationOptions: options });
  },
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

const createMistakesSlice = (set: SetFn<MistakesSlice>): MistakesSlice => ({
  mistakes: [],
  knowledgeGraph: null,
  activeFilter: null,
  addMistake: (m) => {
    log.debug('Mistake added:', m.id);
    set((s) => ({ mistakes: [...s.mistakes, m] }));
  },
  markReviewed: (id) => {
    log.debug('Mistake reviewed:', id);
    set((s) => ({
      mistakes: s.mistakes.map((m) =>
        m.id === id
          ? { ...m, reviewed: true, reviewCount: (m.reviewCount ?? 0) + 1 }
          : m,
      ),
    }));
  },
  setFilter: (filter) => {
    log.debug('Filter set');
    set({ activeFilter: filter });
  },
  setKnowledgeGraph: (graph) => {
    log.debug('Knowledge graph set, nodes:', graph.nodes.length);
    set({ knowledgeGraph: graph });
  },
  deleteMistake: (id) => {
    log.debug('Mistake deleted:', id);
    set((s) => ({ mistakes: s.mistakes.filter((m) => m.id !== id) }));
  },
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

const createAssistantSlice = (set: SetFn<AssistantSlice>): AssistantSlice => ({
  isOpen: false,
  subject: '',
  style: 'detailed',
  difficulty: 'high-school',
  toggleOpen: () => {
    log.debug('Assistant toggled');
    set((s) => ({ isOpen: !s.isOpen }));
  },
  setSubject: (s) => {
    log.debug('Assistant subject:', s);
    set({ subject: s });
  },
  setStyle: (s) => {
    log.debug('Assistant style:', s);
    set({ style: s });
  },
  setDifficulty: (d) => {
    log.debug('Assistant difficulty:', d);
    set({ difficulty: d });
  },
});

// ── Combined Store ─────────────────────────────────────────────────

export type SkyClassroomStore = SolveSlice & SlidesSlice & MistakesSlice & AssistantSlice;

export const useSkyClassroomStore = create<SkyClassroomStore>()(
  persist(
    (set) => ({
      ...createSolveSlice(set),
      ...createSlidesSlice(set),
      ...createMistakesSlice(set),
      ...createAssistantSlice(set),
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
