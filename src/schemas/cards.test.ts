import { describe, it, expect } from 'vitest';
import { SeedFileSchema, FactCardsOutputSchema } from './cards';

const validSeedFile = {
  termId: '0001',
  termName: '標準貫入試験',
  cards: [
    {
      cardKey: 'f001',
      prompt: '標準貫入試験で採取される試料は乱した試料か乱さない試料か。',
      answer: '乱した試料',
      detail: 'SPTサンプラーで採取される。',
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
    },
  ],
};

describe('SeedFileSchema', () => {
  it('有効なseedファイルを検証できること', () => {
    const result = SeedFileSchema.safeParse(validSeedFile);
    expect(result.success).toBe(true);
  });

  it('promptが空文字のseedをエラーとして検出すること', () => {
    const invalid = {
      ...validSeedFile,
      cards: [
        {
          ...validSeedFile.cards[0],
          prompt: '',
        },
      ],
    };
    const result = SeedFileSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('answerが空文字のseedをエラーとして検出すること', () => {
    const invalid = {
      ...validSeedFile,
      cards: [
        {
          ...validSeedFile.cards[0],
          answer: '',
        },
      ],
    };
    const result = SeedFileSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('sourceRefsが空配列のseedをエラーとして検出すること', () => {
    const invalid = {
      ...validSeedFile,
      cards: [
        {
          ...validSeedFile.cards[0],
          sourceRefs: [],
        },
      ],
    };
    const result = SeedFileSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('termIdが必須であること', () => {
    const { termId: _, ...invalid } = validSeedFile;
    const result = SeedFileSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('cardId生成', () => {
  it('termIdとcardKeyからcardIdが生成できること', () => {
    const termId = '0001';
    const cardKey = 'f001';
    const cardId = `${termId}-${cardKey}`;
    expect(cardId).toBe('0001-f001');
  });
});

describe('章導出', () => {
  it('sourceRefsから重複なしの章リストを導出できること', () => {
    const sourceRefs = [
      { chapter: 3, chapterLabel: '第3章' },
      { chapter: 2, chapterLabel: '第2章' },
      { chapter: 3, chapterLabel: '第3章' }, // 重複
    ];
    const chapterMap = new Map<number, string>();
    for (const ref of sourceRefs) {
      if (!chapterMap.has(ref.chapter)) {
        chapterMap.set(ref.chapter, ref.chapterLabel);
      }
    }
    const chapters = Array.from(chapterMap.keys()).sort((a, b) => a - b);
    const chapterLabels = chapters.map((ch) => chapterMap.get(ch)!);

    expect(chapters).toEqual([2, 3]);
    expect(chapterLabels).toEqual(['第2章', '第3章']);
  });
});

describe('FactCardsOutputSchema', () => {
  it('有効な出力スキーマを検証できること', () => {
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
    const result = FactCardsOutputSchema.safeParse(validOutput);
    expect(result.success).toBe(true);
  });
});
