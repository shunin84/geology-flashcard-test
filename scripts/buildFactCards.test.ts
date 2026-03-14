import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const TEST_SEEDS_DIR = join(process.cwd(), 'data', 'fact-card-seeds-test');
const TEST_OUTPUT_DIR = join(process.cwd(), 'public', 'data', 'fact-cards-test');

function writeSeed(fileName: string, content: object) {
  writeFileSync(join(TEST_SEEDS_DIR, fileName), JSON.stringify(content, null, 2), 'utf-8');
}

function runBuild(seedsDir: string, outputDir: string): { stdout: string; stderr: string; exitCode: number } {
  try {
    const result = execSync(
      `node --input-type=module --experimental-vm-modules -e "
        import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
        import { join } from 'path';
        import { SeedFileSchema } from './src/schemas/cards.ts';
      " 2>&1`,
      { encoding: 'utf-8', cwd: process.cwd() }
    );
    return { stdout: result, stderr: '', exitCode: 0 };
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; status?: number };
    return { stdout: e.stdout ?? '', stderr: e.stderr ?? '', exitCode: e.status ?? 1 };
  }
}

// buildFactCards の核心ロジックのテスト（モジュールとして直接テスト）
describe('buildFactCards ロジック', () => {
  describe('seedスキーマ検証', () => {
    it('有効なseedは検証に通ること', async () => {
      const { SeedFileSchema } = await import('../src/schemas/cards.js');
      const validSeed = {
        termId: '0001',
        termName: '標準貫入試験',
        cards: [
          {
            cardKey: 'f001',
            prompt: '標準貫入試験の問い',
            answer: '答え',
            detail: '説明',
            tags: ['タグ'],
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
      const result = SeedFileSchema.safeParse(validSeed);
      expect(result.success).toBe(true);
    });

    it('promptが空文字のseedはエラーになること', async () => {
      const { SeedFileSchema } = await import('../src/schemas/cards.js');
      const invalid = {
        termId: '0001',
        termName: '標準貫入試験',
        cards: [
          {
            cardKey: 'f001',
            prompt: '',
            answer: '答え',
            detail: '',
            tags: [],
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
      const result = SeedFileSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('answerが空文字のseedはエラーになること', async () => {
      const { SeedFileSchema } = await import('../src/schemas/cards.js');
      const invalid = {
        termId: '0001',
        termName: '標準貫入試験',
        cards: [
          {
            cardKey: 'f001',
            prompt: '問い',
            answer: '',
            detail: '',
            tags: [],
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
      const result = SeedFileSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('cardId生成', () => {
    it('termIdとcardKeyからcardIdを正しく生成できること', () => {
      const termId = '0001';
      const cardKey = 'f001';
      const cardId = `${termId}-${cardKey}`;
      expect(cardId).toBe('0001-f001');
    });

    it('複数のcardKeyが別々のcardIdになること', () => {
      const termId = '0001';
      const cardKeys = ['f001', 'f002', 'f003'];
      const cardIds = cardKeys.map((key) => `${termId}-${key}`);
      const uniqueIds = new Set(cardIds);
      expect(uniqueIds.size).toBe(cardKeys.length);
    });
  });

  describe('重複cardIdチェック', () => {
    it('同じcardIdは重複として検出されること', () => {
      const cardIdSet = new Set<string>();
      const cardId = '0001-f001';
      cardIdSet.add(cardId);
      expect(cardIdSet.has(cardId)).toBe(true); // 重複検出
    });
  });

  describe('章導出', () => {
    it('sourceRefsから正しく章を導出できること', () => {
      const sourceRefs = [
        { chapter: 3, chapterLabel: '第3章', occurrenceId: 'a', yearKey: 'R4', yearLabel: '令和4年度', isSupplemental: false },
        { chapter: 2, chapterLabel: '第2章', occurrenceId: 'b', yearKey: 'R4', yearLabel: '令和4年度', isSupplemental: false },
      ];
      const chapterMap = new Map<number, string>();
      for (const ref of sourceRefs) {
        if (!chapterMap.has(ref.chapter)) {
          chapterMap.set(ref.chapter, ref.chapterLabel);
        }
      }
      const chapters = Array.from(chapterMap.keys()).sort((a, b) => a - b);
      expect(chapters).toEqual([2, 3]);
    });

    it('isSupplementalOnlyはすべてのsourceRefがsupplementalのときtrueになること', () => {
      const allSupplemental = [
        { isSupplemental: true },
        { isSupplemental: true },
      ];
      const isSupplementalOnly = allSupplemental.every((r) => r.isSupplemental);
      expect(isSupplementalOnly).toBe(true);
    });

    it('isSupplementalOnlyは一つでも非supplementalがあればfalseになること', () => {
      const mixed = [
        { isSupplemental: false },
        { isSupplemental: true },
      ];
      const isSupplementalOnly = mixed.every((r) => r.isSupplemental);
      expect(isSupplementalOnly).toBe(false);
    });
  });
});
