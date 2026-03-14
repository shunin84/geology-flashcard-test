import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SeedFileSchema, FactCardsOutputSchema } from '../src/schemas/cards.ts';
import type { FactCard } from '../src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

function normalizeText(text: string): string {
  return text.trim().replace(/\n{3,}/g, '\n\n');
}

function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const tag of tags) {
    const t = tag.trim();
    if (t && !seen.has(t)) {
      seen.add(t);
      result.push(t);
    }
  }
  return result;
}

function main() {
  const seedsDir = join(rootDir, 'data', 'fact-card-seeds');
  const outputDir = join(rootDir, 'public', 'data', 'fact-cards');
  const outputFile = join(outputDir, 'fact-cards.json');

  let seedFiles: string[];
  try {
    seedFiles = readdirSync(seedsDir).filter((f) => f.endsWith('.json'));
  } catch (err) {
    console.error(`Failed to read seeds directory: ${seedsDir}`, err);
    process.exit(1);
  }

  if (seedFiles.length === 0) {
    console.warn('No seed files found. Writing empty output.');
    mkdirSync(outputDir, { recursive: true });
    const output = {
      generatedAt: new Date().toISOString(),
      cardCount: 0,
      cards: [],
    };
    writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`Written: ${outputFile}`);
    return;
  }

  const allCards: FactCard[] = [];
  const cardIdSet = new Set<string>();
  let hasError = false;

  for (const fileName of seedFiles) {
    const filePath = join(seedsDir, fileName);
    let raw: unknown;
    try {
      raw = JSON.parse(readFileSync(filePath, 'utf-8'));
    } catch (err) {
      console.error(`[${fileName}] Failed to parse JSON:`, err);
      hasError = true;
      continue;
    }

    const parsed = SeedFileSchema.safeParse(raw);
    if (!parsed.success) {
      console.error(`[${fileName}] Schema validation failed:`);
      console.error(parsed.error.issues);
      hasError = true;
      continue;
    }

    const seed = parsed.data;

    // cardKeyの重複チェック（ファイル内）
    const cardKeySet = new Set<string>();
    let fileHasError = false;
    for (const card of seed.cards) {
      if (cardKeySet.has(card.cardKey)) {
        console.error(`[${fileName}] Duplicate cardKey: ${card.cardKey}`);
        fileHasError = true;
        hasError = true;
      }
      cardKeySet.add(card.cardKey);
    }
    if (fileHasError) continue;

    for (const card of seed.cards) {
      const cardId = `${seed.termId}-${card.cardKey}`;

      // グローバルなcardId重複チェック
      if (cardIdSet.has(cardId)) {
        console.error(`Duplicate cardId across seeds: ${cardId} (in ${fileName})`);
        hasError = true;
        continue;
      }
      cardIdSet.add(cardId);

      // テキストの正規化
      const prompt = normalizeText(card.prompt);
      const answer = normalizeText(card.answer);
      const detail = normalizeText(card.detail);

      if (!prompt) {
        console.error(`[${fileName}] cardKey=${card.cardKey}: prompt is empty after trim`);
        hasError = true;
        continue;
      }
      if (!answer) {
        console.error(`[${fileName}] cardKey=${card.cardKey}: answer is empty after trim`);
        hasError = true;
        continue;
      }

      // sourceRefsの重複チェック
      const refKeys = new Set<string>();
      let refHasError = false;
      for (const ref of card.sourceRefs) {
        const refKey = `${ref.occurrenceId}|${ref.yearKey}|${ref.chapter}`;
        if (refKeys.has(refKey)) {
          console.error(`[${fileName}] cardKey=${card.cardKey}: Duplicate sourceRef: ${refKey}`);
          refHasError = true;
          hasError = true;
        }
        refKeys.add(refKey);
      }
      if (refHasError) continue;

      // chapters と chapterLabels を sourceRefs から導出
      const chapterMap = new Map<number, string>();
      for (const ref of card.sourceRefs) {
        if (!chapterMap.has(ref.chapter)) {
          chapterMap.set(ref.chapter, ref.chapterLabel);
        }
      }
      const chapters = Array.from(chapterMap.keys()).sort((a, b) => a - b);
      const chapterLabels = chapters.map((ch) => chapterMap.get(ch)!);

      // isSupplementalOnly の計算
      const isSupplementalOnly = card.sourceRefs.every((ref) => ref.isSupplemental);

      const tags = normalizeTags(card.tags);

      allCards.push({
        cardId,
        termId: seed.termId,
        termName: seed.termName,
        chapters,
        chapterLabels,
        prompt,
        answer,
        detail,
        tags,
        sourceRefs: card.sourceRefs,
        isSupplementalOnly,
      });
    }
  }

  if (hasError) {
    console.error('Build failed due to errors above.');
    process.exit(1);
  }

  // ソート: chapters[0] asc → termId asc → cardId asc
  allCards.sort((a, b) => {
    const ch = (a.chapters[0] ?? 0) - (b.chapters[0] ?? 0);
    if (ch !== 0) return ch;
    if (a.termId < b.termId) return -1;
    if (a.termId > b.termId) return 1;
    if (a.cardId < b.cardId) return -1;
    if (a.cardId > b.cardId) return 1;
    return 0;
  });

  const output = {
    generatedAt: new Date().toISOString(),
    cardCount: allCards.length,
    cards: allCards,
  };

  // 出力の検証
  const validation = FactCardsOutputSchema.safeParse(output);
  if (!validation.success) {
    console.error('Output schema validation failed:');
    console.error(validation.error.issues);
    process.exit(1);
  }

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`Written: ${outputFile} (${allCards.length} cards)`);
}

main();
