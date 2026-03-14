import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const SOURCE_DIR = '/Users/yumawada/Desktop/restudy-git/generated/term-context';
const OUTPUT_DIR = join(rootDir, 'data', 'fact-card-candidates');

type OfficialOccurrence = {
  id: string;
  yearKey: string;
  yearLabel: string;
  chapter: number;
  chapterLabel: string;
  qType?: string;
  questionText?: string;
  choices?: string[];
  correctAnswer?: string;
  explanation?: string;
};

type TermContextFile = {
  term_id: string;
  term_name: string;
  official_occurrences?: OfficialOccurrence[];
  supplemental_occurrences?: OfficialOccurrence[];
};

function extractOccurrences(
  occurrences: OfficialOccurrence[],
  isSupplemental: boolean
) {
  return occurrences.map((occ) => {
    const correctChoiceText =
      occ.choices && occ.correctAnswer
        ? occ.choices[parseInt(occ.correctAnswer, 10) - 1] ?? null
        : null;

    return {
      occurrenceId: occ.id,
      yearKey: occ.yearKey,
      yearLabel: occ.yearLabel,
      chapter: occ.chapter,
      chapterLabel: occ.chapterLabel,
      isSupplemental,
      qType: occ.qType ?? null,
      questionText: occ.questionText ?? null,
      correctAnswer: occ.correctAnswer ?? null,
      correctChoiceText,
      explanation: occ.explanation ?? null,
    };
  });
}

function main() {
  if (!existsSync(SOURCE_DIR)) {
    console.log(`Source directory not found, skipping: ${SOURCE_DIR}`);
    return;
  }

  let sourceFiles: string[];
  try {
    sourceFiles = readdirSync(SOURCE_DIR).filter((f) => f.endsWith('.json'));
  } catch (err) {
    console.error(`Failed to read source directory: ${SOURCE_DIR}`, err);
    process.exit(1);
  }

  if (sourceFiles.length === 0) {
    console.log('No source files found.');
    return;
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });

  let hasError = false;
  let processed = 0;

  for (const fileName of sourceFiles) {
    const filePath = join(SOURCE_DIR, fileName);
    let raw: TermContextFile;
    try {
      raw = JSON.parse(readFileSync(filePath, 'utf-8')) as TermContextFile;
    } catch (err) {
      console.error(`[${fileName}] Failed to parse JSON:`, err);
      hasError = true;
      continue;
    }

    if (!raw.term_id || !raw.term_name) {
      console.error(`[${fileName}] Missing required keys: term_id or term_name`);
      hasError = true;
      continue;
    }

    const officialOccurrences = extractOccurrences(
      raw.official_occurrences ?? [],
      false
    );
    const supplementalOccurrences = extractOccurrences(
      raw.supplemental_occurrences ?? [],
      true
    );

    const candidate = {
      termId: raw.term_id,
      termName: raw.term_name,
      occurrences: [...officialOccurrences, ...supplementalOccurrences],
    };

    const outputFile = join(OUTPUT_DIR, fileName);
    try {
      writeFileSync(outputFile, JSON.stringify(candidate, null, 2), 'utf-8');
      processed++;
    } catch (err) {
      console.error(`[${fileName}] Failed to write output:`, err);
      hasError = true;
    }
  }

  if (hasError) {
    console.error('Extract failed due to errors above.');
    process.exit(1);
  }

  console.log(`Extracted ${processed} files to ${OUTPUT_DIR}`);
}

main();
