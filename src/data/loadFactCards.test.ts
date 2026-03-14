import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadFactCards } from './loadFactCards';

const validOutput = {
  generatedAt: '2026-03-14T00:00:00.000Z',
  cardCount: 1,
  cards: [
    {
      cardId: '0001-f001',
      termId: '0001',
      termName: '標準貫入試験',
      chapters: [3],
      chapterLabels: ['第3章'],
      prompt: '標準貫入試験で採取される試料は乱した試料か。',
      answer: '乱した試料',
      detail: '補足説明',
      tags: ['原位置試験'],
      sourceRefs: [
        {
          occurrenceId: '4-03-038',
          yearKey: 'R4',
          yearLabel: '令和4年度',
          chapter: 3,
          chapterLabel: '第3章',
          isSupplemental: false,
        },
      ],
      isSupplementalOnly: false,
    },
  ],
};

describe('loadFactCards', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('正常なJSONをパースしてFactCard[]を返すこと', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(validOutput),
    } as unknown as Response);

    const cards = await loadFactCards();
    expect(cards).toHaveLength(1);
    expect(cards[0].cardId).toBe('0001-f001');
    expect(cards[0].termName).toBe('標準貫入試験');
  });

  it('HTTPエラー時にErrorをthrowすること', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({}),
    } as unknown as Response);

    await expect(loadFactCards()).rejects.toThrow('404');
  });

  it('不正なJSONスキーマ時にErrorをthrowすること', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ invalid: 'data' }),
    } as unknown as Response);

    await expect(loadFactCards()).rejects.toThrow();
  });

  it('fetch失敗時にErrorをthrowすること', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(loadFactCards()).rejects.toThrow();
  });
});
