export type SourceRef = {
  occurrenceId: string;
  yearKey: string;
  yearLabel: string;
  chapter: number;
  chapterLabel: string;
  isSupplemental: boolean;
};

export type FactCard = {
  cardId: string;
  termId: string;
  termName: string;
  chapters: number[];
  chapterLabels: string[];
  prompt: string;
  answer: string;
  detail: string;
  tags: string[];
  sourceRefs: SourceRef[];
  isSupplementalOnly: boolean;
};

export type CardProgress = {
  learned: boolean;
  flagged: boolean;
};

export type FilterState = {
  chapters: number[];
  termIds: string[];
  tags: string[];
  showOnlyUnlearned: boolean;
  showOnlyFlagged: boolean;
  includeSupplemental: boolean;
};
