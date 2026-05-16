import { describe, expect, it } from 'vitest';
import {
  scoreSlideContent,
  scoreQuizContent,
  scoreInteractiveContent,
  scorePBLContent,
  scoreContent,
  isAcceptable,
} from '@/lib/generation/quality-scorer';
import type {
  GeneratedSlideContent,
  GeneratedQuizContent,
  GeneratedInteractiveContent,
  GeneratedPBLContent,
} from '@/lib/types/generation';

describe('scoreSlideContent', () => {
  it('scores a well-formed slide highly', () => {
    const content: GeneratedSlideContent = {
      elements: [
        { id: 't1', type: 'text', left: 80, top: 50, width: 840, height: 80, content: 'Title' },
        { id: 's1', type: 'shape', left: 100, top: 150, width: 200, height: 200, fill: '#5b9bd5' },
        { id: 'img1', type: 'image', left: 400, top: 150, width: 300, height: 200, src: 'img_1' },
      ] as GeneratedSlideContent['elements'],
      background: { color: '#ffffff' },
      remark: 'This slide introduces the topic with a diagram and supporting image.',
    };

    const score = scoreSlideContent(content);

    expect(score.overall).toBeGreaterThan(0.6);
    expect(score.completeness).toBeGreaterThan(0.7);
    expect(score.elementDiversity).toBeGreaterThan(0);
    expect(score.issues).toHaveLength(0);
  });

  it('flags empty elements', () => {
    const content: GeneratedSlideContent = {
      elements: [],
      background: { color: '#fff' },
      remark: 'Some remark text for the slide content',
    };

    const score = scoreSlideContent(content);
    expect(score.issues).toContain('No slide elements generated');
    expect(score.completeness).toBeLessThan(1);
  });

  it('flags missing or short remark', () => {
    const content: GeneratedSlideContent = {
      elements: [{ id: 't1', type: 'text', left: 80, top: 50, width: 840, height: 80, content: 'Hi' }] as GeneratedSlideContent['elements'],
      background: { color: '#fff' },
      remark: '',
    };

    const score = scoreSlideContent(content);
    expect(score.warnings).toContain('Remark is missing or too short');
  });

  it('flags off-canvas elements', () => {
    const content: GeneratedSlideContent = {
      elements: [
        { id: 't1', type: 'text', left: -200, top: 50, width: 100, height: 50, content: 'Off' },
        { id: 't2', type: 'text', left: 1200, top: 50, width: 100, height: 50, content: 'Far' },
      ] as GeneratedSlideContent['elements'],
      background: { color: '#fff' },
      remark: 'Off-canvas test slide content for verification',
    };

    const score = scoreSlideContent(content);
    expect(score.coherence).toBeLessThan(0.8);
    expect(score.issues.some((i) => i.includes('off-canvas'))).toBe(true);
  });

  it('flags elements with nearly identical positions as overlapping', () => {
    const elements: GeneratedSlideContent['elements'] = [];
    for (let i = 0; i < 4; i++) {
      elements.push({ id: `e${i}`, type: 'text', left: 100, top: 100, width: 50, height: 50, content: `Item ${i}` } as GeneratedSlideContent['elements'][0]);
    }

    const content: GeneratedSlideContent = {
      elements,
      background: { color: '#fff' },
      remark: 'Overlapping elements test slide content here',
    };

    const score = scoreSlideContent(content);
    // 4 elements at same position → C(4,2) = 6 overlapping pairs
    expect(score.coherence).toBeLessThan(0.8);
    expect(score.issues.some((i) => i.includes('identical positions'))).toBe(true);
  });
});

describe('scoreQuizContent', () => {
  it('scores a well-formed quiz highly', () => {
    const content: GeneratedQuizContent = {
      questions: [
        {
          id: 'q1',
          question: 'What is 2+2?',
          type: 'single',
          options: ['3', '4', '5', '6'],
          answer: ['4'],
          difficulty: 'easy',
          explanation: 'Basic arithmetic',
        },
        {
          id: 'q2',
          question: 'Which are prime?',
          type: 'multiple',
          options: ['2', '3', '4', '5'],
          answer: ['2', '3', '5'],
          difficulty: 'medium',
          explanation: 'Prime numbers',
        },
      ],
    };

    const score = scoreQuizContent(content);
    expect(score.overall).toBeGreaterThan(0.6);
    expect(score.completeness).toBe(1);
    expect(score.issues).toHaveLength(0);
  });

  it('flags empty questions', () => {
    const content: GeneratedQuizContent = { questions: [] };
    const score = scoreQuizContent(content);

    expect(score.completeness).toBe(0);
    expect(score.issues).toContain('No quiz questions generated');
  });

  it('flags questions with too few options', () => {
    const content: GeneratedQuizContent = {
      questions: [
        {
          id: 'q1',
          question: 'True or false?',
          type: 'single',
          options: ['True'],
          answer: ['True'],
          difficulty: 'easy',
          explanation: '',
        },
      ],
    };

    const score = scoreQuizContent(content);
    expect(score.coherence).toBeLessThan(0.9);
    expect(score.issues.some((i) => i.includes('fewer than 2 options'))).toBe(true);
  });

  it('flags missing answers', () => {
    const content: GeneratedQuizContent = {
      questions: [
        {
          id: 'q1',
          question: 'Test question with no answer',
          type: 'text',
          options: ['a', 'b'],
          answer: [],
          difficulty: 'easy',
          explanation: '',
        },
      ],
    };

    const score = scoreQuizContent(content);
    expect(score.coherence).toBeLessThan(0.9);
    expect(score.issues.some((i) => i.includes('missing correct answer'))).toBe(true);
  });
});

describe('scoreInteractiveContent', () => {
  it('scores well-formed interactive content highly', () => {
    const content: GeneratedInteractiveContent = {
      html: '<!DOCTYPE html><html><head></head><body><div id="app">Simulation widget with interactive controls and detailed content</div></body></html>',
      widgetType: 'simulation',
      widgetConfig: { variables: [] },
      teacherActions: [{ action: 'explain', timing: 'start' }],
    };

    const score = scoreInteractiveContent(content);
    expect(score.overall).toBeGreaterThan(0.5);
    expect(score.completeness).toBeGreaterThan(0.7);
  });

  it('flags minimal or missing HTML', () => {
    const content: GeneratedInteractiveContent = {
      html: '<p>short</p>',
      widgetType: 'game',
      widgetConfig: {},
      teacherActions: [],
    };

    const score = scoreInteractiveContent(content);
    expect(score.completeness).toBeLessThan(0.7);
    expect(score.issues.some((i) => i.includes('minimal HTML'))).toBe(true);
  });

  it('flags missing widget config', () => {
    const content: GeneratedInteractiveContent = {
      html: '<!DOCTYPE html><html><head></head><body>Long enough content for the interactive widget test validation</body></html>',
    };
    // @ts-expect-error — deliberately missing fields
    const score = scoreInteractiveContent(content);

    expect(score.warnings.some((w) => w.includes('widgetType'))).toBe(true);
    expect(score.warnings.some((w) => w.includes('widgetConfig'))).toBe(true);
  });
});

describe('scorePBLContent', () => {
  it('scores well-formed PBL content highly', () => {
    const content: GeneratedPBLContent = {
      projectConfig: {
        projectInfo: { title: 'Build a Bridge', description: 'Engineering challenge' },
        agents: [
          { id: 'a1', name: 'Engineer', role: 'specialist', persona: 'Structural expert' },
          { id: 'a2', name: 'PM', role: 'coordinator', persona: 'Project lead' },
        ] as GeneratedPBLContent['projectConfig']['agents'],
        issueboard: { columns: [] } as GeneratedPBLContent['projectConfig']['issueboard'],
      },
    };

    const score = scorePBLContent(content);
    expect(score.completeness).toBeGreaterThan(0.5);
    expect(score.issues).toHaveLength(0);
  });

  it('flags missing projectConfig entirely', () => {
    const content = {} as GeneratedPBLContent;
    const score = scorePBLContent(content);

    expect(score.completeness).toBe(0);
    expect(score.issues).toContain('No projectConfig in PBL content');
  });

  it('flags missing agents', () => {
    const content: GeneratedPBLContent = {
      projectConfig: {
        projectInfo: { title: 'Solo Project', description: '' },
        agents: [],
      },
    } as unknown as GeneratedPBLContent;

    const score = scorePBLContent(content);
    expect(score.issues.some((i) => i.includes('no agents'))).toBe(true);
  });
});

describe('scoreContent (dispatcher)', () => {
  it('routes to slide scorer for slide type', () => {
    const content: GeneratedSlideContent = {
      elements: [],
      background: { color: '#fff' },
      remark: 'Test remark text',
    };
    const score = scoreContent({ type: 'slide', content });
    expect(score.issues).toContain('No slide elements generated');
  });

  it('routes to quiz scorer for quiz type', () => {
    const content: GeneratedQuizContent = { questions: [] };
    const score = scoreContent({ type: 'quiz', content });
    expect(score.completeness).toBe(0);
  });
});

describe('isAcceptable', () => {
  it('accepts scores above threshold', () => {
    const score = {
      overall: 0.8,
      completeness: 0.9,
      coherence: 0.7,
      elementDiversity: 0.5,
      issues: [],
      warnings: [],
    };
    expect(isAcceptable(score)).toBe(true);
  });

  it('rejects scores below default threshold (0.4)', () => {
    const score = {
      overall: 0.3,
      completeness: 0.2,
      coherence: 0.5,
      elementDiversity: 0.1,
      issues: ['major issues'],
      warnings: [],
    };
    expect(isAcceptable(score)).toBe(false);
  });

  it('respects custom threshold', () => {
    const score = {
      overall: 0.5,
      completeness: 0.5,
      coherence: 0.5,
      elementDiversity: 0.5,
      issues: [],
      warnings: [],
    };
    expect(isAcceptable(score, 0.6)).toBe(false);
    expect(isAcceptable(score, 0.4)).toBe(true);
  });

  it('rejects when completeness is below threshold even if overall is OK', () => {
    const score = {
      overall: 0.7,
      completeness: 0.1,
      coherence: 0.9,
      elementDiversity: 0.9,
      issues: [],
      warnings: [],
    };
    expect(isAcceptable(score)).toBe(false);
  });
});
