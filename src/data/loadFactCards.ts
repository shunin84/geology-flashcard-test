import { FactCardsOutputSchema } from '../schemas/cards';
import type { FactCard } from '../types';

export async function loadFactCards(): Promise<FactCard[]> {
  let response: Response;
  try {
    response = await fetch(`${import.meta.env.BASE_URL}data/fact-cards/fact-cards.json`);
  } catch (err) {
    throw new Error(`ネットワークエラー: fact-cards.json の取得に失敗しました。`);
  }

  if (!response.ok) {
    throw new Error(
      `fact-cards.json の取得に失敗しました (HTTP ${response.status})`
    );
  }

  let raw: unknown;
  try {
    raw = await response.json();
  } catch (err) {
    throw new Error(`fact-cards.json のJSON解析に失敗しました。`);
  }

  const parsed = FactCardsOutputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `fact-cards.json のスキーマ検証に失敗しました: ${parsed.error.message}`
    );
  }

  return parsed.data.cards;
}
