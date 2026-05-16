import { describe, expect, it } from 'vitest';
import {
  isImageIdReference,
  isGeneratedImageId,
  resolveImageIds,
  normalizeGeneratedVideoRefs,
} from '@/lib/generation/media-resolver';
import type { JsonValue } from 'type-fest';

type Element = Record<string, JsonValue>;

function makeImageEl(id: string, src: string): Element {
  return { type: 'image', id, src, left: 0, top: 0, width: 100, height: 100 };
}

function makeVideoEl(id: string, src: string, mediaRef?: string): Element {
  const el: Element = { type: 'video', id, src, left: 0, top: 0, width: 320, height: 240 };
  if (mediaRef) el.mediaRef = mediaRef;
  return el;
}

describe('isImageIdReference', () => {
  it('detects standard image ID references', () => {
    expect(isImageIdReference('img_1')).toBe(true);
    expect(isImageIdReference('img_42')).toBe(true);
    expect(isImageIdReference('IMG_1')).toBe(true);
  });

  it('returns false for data URIs', () => {
    expect(isImageIdReference('data:image/png;base64,abc123')).toBe(false);
  });

  it('returns false for HTTP URLs', () => {
    expect(isImageIdReference('http://example.com/img.png')).toBe(false);
    expect(isImageIdReference('https://example.com/img.png')).toBe(false);
  });

  it('returns false for path-like values', () => {
    expect(isImageIdReference('/images/cat.png')).toBe(false);
  });

  it('returns false for empty or falsy values', () => {
    expect(isImageIdReference('')).toBe(false);
  });
});

describe('isGeneratedImageId', () => {
  it('detects generated image IDs', () => {
    expect(isGeneratedImageId('gen_img_abc123')).toBe(true);
    expect(isGeneratedImageId('gen_img_slide1-figure')).toBe(true);
  });

  it('detects generated video IDs', () => {
    expect(isGeneratedImageId('gen_vid_xyz')).toBe(true);
    expect(isGeneratedImageId('gen_vid_demo-1')).toBe(true);
  });

  it('returns false for non-generated IDs', () => {
    expect(isGeneratedImageId('img_1')).toBe(false);
    expect(isGeneratedImageId('https://example.com/img.png')).toBe(false);
    expect(isGeneratedImageId('')).toBe(false);
  });
});

describe('resolveImageIds', () => {
  it('resolves img_id references to base64 URLs', () => {
    const elements: Element[] = [makeImageEl('e1', 'img_1')];
    const mapping = { img_1: 'data:image/png;base64,AAAA' };

    const resolved = resolveImageIds(elements, mapping);
    expect(resolved[0].src).toBe('data:image/png;base64,AAAA');
  });

  it('removes element with unmapped image ID', () => {
    const elements: Element[] = [makeImageEl('e1', 'img_99')];
    const resolved = resolveImageIds(elements, {});

    expect(resolved).toHaveLength(0);
  });

  it('resolves generated image IDs via generatedMediaMapping', () => {
    const elements: Element[] = [makeImageEl('e1', 'gen_img_slide1')];
    const genMapping = { gen_img_slide1: 'https://cdn.example.com/img.png' };

    const resolved = resolveImageIds(elements, undefined, genMapping);
    expect(resolved[0].src).toBe('https://cdn.example.com/img.png');
  });

  it('keeps generated image placeholder if no mapping available', () => {
    const elements: Element[] = [makeImageEl('e1', 'gen_img_slide1')];

    const resolved = resolveImageIds(elements, {}, {});
    expect(resolved).toHaveLength(1);
    expect(resolved[0].src).toBe('gen_img_slide1');
  });

  it('removes image element with missing src', () => {
    const elements: Element[] = [{ type: 'image', id: 'bad', left: 0, top: 0 } as Element];
    const resolved = resolveImageIds(elements, {});

    expect(resolved).toHaveLength(0);
  });

  it('passes through non-image elements unchanged', () => {
    const elements: Element[] = [
      { type: 'text', id: 't1', content: 'hello', left: 10, top: 10 } as Element,
      { type: 'shape', id: 's1', fill: '#000', left: 20, top: 20 } as Element,
    ];

    const resolved = resolveImageIds(elements, {});
    expect(resolved).toHaveLength(2);
    expect(resolved[0].type).toBe('text');
    expect(resolved[1].type).toBe('shape');
  });
});

describe('normalizeGeneratedVideoRefs', () => {
  it('keeps video with direct non-generated src', () => {
    const elements: Element[] = [makeVideoEl('v1', 'https://cdn.example.com/video.mp4')];

    const normalized = normalizeGeneratedVideoRefs(elements, []);
    expect(normalized).toHaveLength(1);
    expect(normalized[0].src).toBe('https://cdn.example.com/video.mp4');
  });

  it('removes mediaRef from video with direct src', () => {
    const elements: Element[] = [makeVideoEl('v1', 'https://cdn.example.com/video.mp4', 'gen_vid_x')];

    const normalized = normalizeGeneratedVideoRefs(elements, []);
    expect(normalized).toHaveLength(1);
    expect('mediaRef' in (normalized[0] as Element)).toBe(false);
  });

  it('keeps video with valid mediaRef in outline', () => {
    const elements: Element[] = [makeVideoEl('v1', 'gen_vid_a', 'gen_vid_a')];
    const videoEntries = [{ type: 'video' as const, prompt: '', elementId: 'gen_vid_a' }];

    const normalized = normalizeGeneratedVideoRefs(elements, videoEntries);
    expect(normalized).toHaveLength(1);
    expect((normalized[0] as Element).mediaRef).toBe('gen_vid_a');
  });

  it('corrects single ref when only one video entry exists', () => {
    const elements: Element[] = [makeVideoEl('v1', 'gen_vid_wrong')];
    const videoEntries = [{ type: 'video' as const, prompt: '', elementId: 'gen_vid_correct' }];

    const normalized = normalizeGeneratedVideoRefs(elements, videoEntries);
    expect(normalized).toHaveLength(1);
    expect((normalized[0] as Element).mediaRef).toBe('gen_vid_correct');
  });

  it('corrects invalid generated video ref to the only valid ref', () => {
    const elements: Element[] = [makeVideoEl('v1', 'gen_vid_bad', 'gen_vid_bad')];
    const videoEntries = [{ type: 'video' as const, prompt: '', elementId: 'gen_vid_good' }];

    const normalized = normalizeGeneratedVideoRefs(elements, videoEntries);
    // onlyRef === 'gen_vid_good', so the invalid ref gets corrected
    expect(normalized).toHaveLength(1);
    expect((normalized[0] as Element).mediaRef).toBe('gen_vid_good');
  });

  it('removes element with invalid ref when multiple valid refs exist', () => {
    const elements: Element[] = [makeVideoEl('v1', 'gen_vid_bad', 'gen_vid_bad')];
    const videoEntries = [
      { type: 'video' as const, prompt: '', elementId: 'gen_vid_a' },
      { type: 'video' as const, prompt: '', elementId: 'gen_vid_b' },
    ];

    const normalized = normalizeGeneratedVideoRefs(elements, videoEntries);
    // Multiple valid refs → onlyRef is undefined → invalid ref is removed
    expect(normalized).toHaveLength(0);
  });

  it('passes through non-video elements unchanged', () => {
    const elements: Element[] = [{ type: 'text', id: 't1', content: 'notes' } as Element];

    const normalized = normalizeGeneratedVideoRefs(elements, []);
    expect(normalized).toHaveLength(1);
    expect(normalized[0].type).toBe('text');
  });
});
