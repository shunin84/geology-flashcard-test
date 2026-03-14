import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlashCard } from './FlashCard';
import type { FactCard } from '../../types';

const sampleCard: FactCard = {
  cardId: '0001-f001',
  termId: '0001',
  termName: '標準貫入試験',
  chapters: [3],
  chapterLabels: ['第3章'],
  prompt: '標準貫入試験で使用するサンプラーの名称は何か。',
  answer: 'スプリットバレルサンプラー',
  detail: 'SPTサンプラーとも呼ばれる。',
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
};

describe('FlashCard', () => {
  it('表面表示時にpromptが表示されること', () => {
    render(<FlashCard card={sampleCard} isFlipped={false} onFlip={vi.fn()} />);
    expect(screen.getByText(sampleCard.prompt)).toBeInTheDocument();
  });

  it('表面表示時にanswerが表示されないこと（最重要テスト）', () => {
    render(<FlashCard card={sampleCard} isFlipped={false} onFlip={vi.fn()} />);
    // 表面のdivにanswerのテキストが含まれていないこと
    const cardFront = screen.getByTestId('card-front');
    expect(cardFront).not.toHaveTextContent(sampleCard.answer);
    // 裏面にanswerが含まれていること（裏面はaria-hidden="true"の状態）
    const cardBack = screen.getByTestId('card-back');
    expect(cardBack).toHaveTextContent(sampleCard.answer);
    // 裏面はaria-hidden属性がtrueであること
    expect(cardBack).toHaveAttribute('aria-hidden', 'true');
  });

  it('「答えを見る」ボタンが表面に表示されること', () => {
    render(<FlashCard card={sampleCard} isFlipped={false} onFlip={vi.fn()} />);
    expect(screen.getByRole('button', { name: /答えを見る/ })).toBeInTheDocument();
  });

  it('isFlipped=trueの時にanswerが裏面に含まれること', () => {
    render(<FlashCard card={sampleCard} isFlipped={true} onFlip={vi.fn()} />);
    const cardBack = screen.getByTestId('card-back');
    expect(cardBack).toHaveTextContent(sampleCard.answer);
    // isFlipped=trueの時、裏面のaria-hiddenはfalse（省略される）
    expect(cardBack).not.toHaveAttribute('aria-hidden', 'true');
  });

  it('onFlipがボタンクリックで呼ばれること', async () => {
    const onFlip = vi.fn();
    render(<FlashCard card={sampleCard} isFlipped={false} onFlip={onFlip} />);
    const btn = screen.getByRole('button', { name: /答えを見る/ });
    btn.click();
    expect(onFlip).toHaveBeenCalledTimes(1);
  });
});
