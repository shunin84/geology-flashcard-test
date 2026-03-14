# 地質調査技士試験 一問一答暗記カードアプリ 実装計画

## Context

地質調査技士試験の合格に向けて、過去問データ（R1〜R7年度）と予想問題から得られる
**正しい知識**を、一問一答形式の暗記カードとして学習できるアプリを作成する。

生の過去問や4択問題をそのまま表示するのではなく、
問題・正答・解説から抽出した知識を、短く答えられる形に正規化して使う。

**ユーザー要件（更新版）：**
- 出題形式: **一問一答型**
- 表面: **問いのみ表示**（答えは見せない）
- 裏面: **答え + 補足説明 + 出典情報**
- 過去問・予想問題は **知識の出典** として使い、問題文そのものは学習UIの中心にしない
- 学習範囲: **過去問 + 予想問題**（official_occurrences + supplemental_occurrences の両方）

## 目標と非目標

### 目標
- 問題を見て選ぶ学習ではなく、**答えを自力で想起する反復学習**を支援する
- 1枚のカードには **1つの知識** だけを載せる
- 学習済み・要復習の進捗を保存し、繰り返し回せるようにする
- 章、用語、予想問題を含むかどうかで範囲を絞れるようにする

### 非目標
- 4択問題の再現
- 自動採点や模試機能
- 問題文・選択肢・表をそのまま大量に読ませるUI

## 技術スタック

**Vite + React + TypeScript**（静的データアプリ、SSR不要）
- `zustand` — 状態管理 + LocalStorage 進捗永続化
- `zod` — seed / build output / runtime load のスキーマ検証
- `@fontsource/zen-kaku-gothic-new` — UI フォントをローカル導入
- `tsx` — TypeScript 製の補助スクリプト実行
- `vitest` + `@testing-library/react` + `jsdom` — データ整形・状態管理・UI の最低限テスト
- CSS Modules — スコープ付きスタイル

## ClaudeCode 実装前提

### 実装の前提
- ClaudeCode は **このリポジトリを新規アプリとして初期化してよい**
- ただし既存の `plans/` ディレクトリは保持し、上書きしない
- バックエンドは作らない。静的ファイル + フロントエンドのみで完結させる
- データ生成スクリプトも同じリポジトリ内で管理する
- 型定義とスキーマ検証を先に作り、UI はその後に実装する

### 初回実装の完成範囲
- アプリ本体、データ生成スクリプト、テストを実装する
- seed は **まず 10〜20 枚程度のレビュー済みサンプルカード** で動作確認できる状態を完成条件とする
- 71ファイル全体のカード作成は、初回実装とは別の継続作業として扱う

### 初回実装で必ず含めるもの
- 2章以上にまたがるサンプルカード
- 過去問由来カードと予想問題由来カードの両方
- 同一用語に複数カードがあるケース
- フィルターと進捗保存が確認できる最低限のデータ量

## データソース

### 生データ
- **term-context JSONファイル**: `/Users/yumawada/Desktop/restudy-git/generated/term-context/`（71ファイル）
- 各ファイルに `term_id`, `term_name`, `official_occurrences`, `supplemental_occurrences` が含まれる

### 実行時データ
- アプリは生データを直接読むのではなく、整形済みの **fact-cards JSON** を読む
- 配置先: `public/data/fact-cards/fact-cards.json`

### この方針にする理由
- 生データは4択形式で、**想起学習向きの問いになっていない**
- 1つの問題に複数知識が混在する
- 表形式・組合せ問題は、そのままだと一問一答に向かない
- `occurrence.id` が用語横断で重複するため、問題単位のまま進捗管理しづらい

## 一問一答カードの作り方

### 基本方針
- 過去問・予想問題の **正答内容** と **解説** から、覚えるべき知識を抽出する
- 1つの設問から、必要に応じて **複数のカード** を作る
- カードは「知識の最小単位」に分解する

### カード化ルール
- 1カード = 1ファクト
- 問いは短く、答えは短く返せる形にする
- 問いは「何を答えればよいか」が一読で分かる文にする
- 問いに不要な前提やひっかけ表現を持ち込まない
- 選択肢番号 `(1)〜(4)` はカードに出さない
- 「不適切なものを選べ」のような否定問題は、**正しい知識の肯定文** に変換する
- 表形式・組合せ問題は、表全体を再現せず、**覚えるべき対応関係** を1件ずつカード化する
- 解説が弱いものは、出典だけ保持してカード化保留にしてもよい

### 問いの書き方ルール
- 「何か」だけで終わらせず、**答える軸** を明示する
- 答える軸の例: 名称、目的、区分、条件、理由、単位、可否、対応関係
- 二択や対比が前提の知識は、`AかBか` を問いに含める
- 専門用語だけ並べた省略形は避け、必要な主語を入れる
- 表面を読んだ時点で、利用者が「短い語句で答える問題」なのか「どちらかを答える問題」なのか分かるようにする

### 問いの良し悪しの例
- 悪い例: `標準貫入試験で採取される試料は何か。`
- 良い例: `標準貫入試験で採取される試料は、乱した試料と乱さない試料のどちらか。`
- 良い例: `標準貫入試験で採取される試料の区分は何か。`

### カード例

```
表面:
標準貫入試験で採取される試料は、乱した試料と乱さない試料のどちらか。

裏面:
乱した試料

補足:
SPTサンプラーで採取されるのは乱さない試料ではない。

出典:
第3章 / 令和4年度 / 過去問由来
```

## データ生成パイプライン

### 方針
生データからその場で自動的に一問一答を組み立てるのではなく、
**事前に知識カードデータを生成・見直ししてからアプリに載せる**。

### 生成ステップ
1. `term-context` から、カード候補の材料を抽出する
2. 人が見直しながら、一問一答の形に書き換える
3. 実行時用の `fact-cards.json` にビルドする

### 中間データの考え方
- **候補データ**: 元の設問、正答、解説、出典情報を保持する
- **レビュー済みデータ**: 実際にアプリで使う問い・答え・補足説明を保持する

### 候補データの出力先
- `data/fact-card-candidates/`
- 基本は用語単位で1ファイル
- 例: `data/fact-card-candidates/0001_標準貫入試験.json`

### 候補データの JSON 形式

```json
{
  "termId": "0001",
  "termName": "標準貫入試験",
  "occurrences": [
    {
      "occurrenceId": "4-03-038",
      "yearKey": "R4",
      "yearLabel": "令和4年度",
      "chapter": 3,
      "chapterLabel": "第3章",
      "isSupplemental": false,
      "qType": "不適切なもの",
      "questionText": "次は，標準貫入試験について述べたものである。不適切なもの一つを選べ。",
      "correctAnswer": "2",
      "correctChoiceText": "(2) SPTサンプラーで採取された試料は，乱れの少ない試料である。",
      "explanation": "正解は「2」。乱れの少ない試料ではなく「乱した試料」の間違い。",
      "reference": "..."
    }
  ]
}
```

### 候補データ抽出ルール
- `extractFactCandidates.ts` は **カードを自動生成しない**
- あくまでレビューしやすい材料を、用語単位で整理して吐き出す
- `correctChoiceText` は `choices[correctAnswer - 1]` が取れる場合だけ埋める
- `choices` が空の問題では、`questionText` と `explanation` をそのまま保持する
- 出力は pretty JSON にして、人が直接読める形にする

### 重要な前提
- このアプリの品質は、UIよりも **カード生成ルールとレビュー品質** に強く依存する
- そのため、データ生成はアプリ本体とは別フェーズで扱う

## ランタイムデータ構造

### コア型定義（`src/types/index.ts`）

```typescript
export type SourceRef = {
  occurrenceId: string;   // "4-03-038"
  yearKey: string;        // "R4"
  yearLabel: string;      // "令和4年度"
  chapter: number;        // 3
  chapterLabel: string;   // "第3章"
  isSupplemental: boolean;
};

export type FactCard = {
  cardId: string;         // "0001-f001"
  termId: string;         // "0001"
  termName: string;       // "標準貫入試験"
  chapters: number[];     // [3]
  chapterLabels: string[]; // ["第3章"]
  prompt: string;         // 表面の問い
  answer: string;         // 裏面の短答
  detail: string;         // 補足説明
  tags: string[];         // ["原位置試験", "試料"]
  sourceRefs: SourceRef[];
  isSupplementalOnly: boolean;
};

export type CardProgress = {
  learned: boolean;
  flagged: boolean;
};

export type FilterState = {
  chapters: number[];        // [] = 全章
  termIds: string[];         // [] = 全用語
  tags: string[];            // [] = 全タグ
  showOnlyUnlearned: boolean;
  showOnlyFlagged: boolean;
  includeSupplemental: boolean;
};
```

### build 出力の JSON 形式

`public/data/fact-cards/fact-cards.json` は配列直書きではなく、メタ情報付きオブジェクトにする。

```json
{
  "generatedAt": "2026-03-14T00:00:00.000Z",
  "cardCount": 12,
  "cards": [
    {
      "cardId": "0001-f001",
      "termId": "0001",
      "termName": "標準貫入試験",
      "chapters": [3],
      "chapterLabels": ["第3章"],
      "prompt": "標準貫入試験で採取される試料は、乱した試料と乱さない試料のどちらか。",
      "answer": "乱した試料",
      "detail": "SPTサンプラーで採取されるのは乱さない試料ではない。",
      "tags": ["原位置試験", "試料"],
      "sourceRefs": [
        {
          "occurrenceId": "4-03-038",
          "yearKey": "R4",
          "yearLabel": "令和4年度",
          "chapter": 3,
          "chapterLabel": "第3章",
          "isSupplemental": false
        }
      ],
      "isSupplementalOnly": false
    }
  ]
}
```

### build ルール
- `cards` は `chapters[0]`, `termId`, `cardId` の昇順で安定ソートする
- `generatedAt` は ISO 8601 文字列
- `cardCount` は `cards.length`
- `isSupplementalOnly` は `sourceRefs.every((ref) => ref.isSupplemental)` で算出する
- `chapters` は重複除去 + 昇順ソート
- `chapterLabels` は `chapters` に対応するラベルを同順で並べる
- build 失敗時は非0終了コードを返す

### 章の扱いルール
- カードは **複数の出典** を持てるため、章も複数持てる形にする
- そのため `FactCard` は `chapter` 単数ではなく `chapters: number[]` を持つ
- 章フィルターでは、`chapters` に選択章が1つでも含まれていれば表示対象とする
- ただし seed 作成時は、可能な限り **1カード1章** に寄せる
- 複数章にまたがるカードは、本当に同一知識として束ねる価値がある場合だけ許可する

## seed フォーマット

`data/fact-card-seeds/` には、レビュー済みの一問一答カード原稿を JSON で保存する。

### ファイル分割方針
- 基本は **用語単位で1ファイル**
- 例: `data/fact-card-seeds/0001_標準貫入試験.json`

### seed の JSON 形式

```json
{
  "termId": "0001",
  "termName": "標準貫入試験",
  "cards": [
    {
      "cardKey": "f001",
      "prompt": "標準貫入試験で採取される試料は、乱した試料と乱さない試料のどちらか。",
      "answer": "乱した試料",
      "detail": "SPTサンプラーで採取されるのは乱さない試料ではない。",
      "tags": ["原位置試験", "試料"],
      "sourceRefs": [
        {
          "occurrenceId": "4-03-038",
          "yearKey": "R4",
          "yearLabel": "令和4年度",
          "chapter": 3,
          "chapterLabel": "第3章",
          "isSupplemental": false
        }
      ]
    }
  ]
}
```

### seed の必須項目
- `termId`
- `termName`
- `cards`
- `cards[].cardKey`
- `cards[].prompt`
- `cards[].answer`
- `cards[].detail`
- `cards[].tags`
- `cards[].sourceRefs`
- `cards[].sourceRefs[].occurrenceId`
- `cards[].sourceRefs[].yearKey`
- `cards[].sourceRefs[].yearLabel`
- `cards[].sourceRefs[].chapter`
- `cards[].sourceRefs[].chapterLabel`
- `cards[].sourceRefs[].isSupplemental`

### seed の検証ルール
- `cardKey` は同一ファイル内で一意
- 実行時の `cardId` は `${termId}-${cardKey}` で生成する
- `prompt` は空文字不可
- `answer` は空文字不可
- `tags` は空配列可だが、可能なら1件以上付ける
- `sourceRefs` は1件以上必須
- `sourceRefs` に含まれる `occurrenceId` は元データに存在すること
- `chapters` と `chapterLabels` は `sourceRefs` から build 時に自動導出する
- build 時に重複カードIDがあればエラーにする
- `prompt`, `answer`, `detail` は build 時に trim し、空になったらエラーにする
- 連続改行は最大2つまで正規化する
- `tags` は trim 後に空文字を除外し、重複除去する
- `sourceRefs` は `occurrenceId + yearKey + chapter` が同一の重複を許可しない

### 問い文の品質ルール
- `prompt` は、利用者が **何を答えるか** を一読で理解できる文にする
- `prompt` に選択肢番号や元の設問番号を持ち込まない
- `answer` は短く返せる語句または短文にする
- `detail` には、答えの根拠や誤解しやすい点を補う説明を書く
- 元の問題文のひっかけ表現は、そのまま移植しない
- `prompt` は原則 1文、多くても2文までに抑える
- `answer` は原則 40文字以内を目安にする
- `detail` は 120文字前後までを目安にする

## アプリでできること

### 学習体験
- 1枚ずつカードを表示する
- 表面には問いだけを表示する
- ユーザーは答えを頭の中で考えてからカードをめくる
- 裏面で答え・補足説明・出典を確認する

### 進捗管理
- 「学習済み」
- 「要復習」
- LocalStorage に進捗保存

### フィルター
- 章で絞る
- 用語で絞る
- タグで絞る
- 未学習のみ表示
- 要復習のみ表示
- 予想問題由来のカードを含む / 含まない

### ナビゲーション
- 前へ / 次へ
- シャッフル
- 進捗表示（例: `12 / 84`）

## 画面挙動の固定仕様

### 読み込み時
- 初回表示時に `fact-cards.json` を fetch する
- 読み込み中はカードの代わりにローディング表示を出す
- 読み込み失敗時は、再読み込みボタン付きのエラーステートを出す
- `cards.length === 0` の場合は、seed 未生成を案内するエンプティステートを出す

### カード操作
- 初期表示は常に表面
- `答えを見る` ボタンで裏面へ切り替える
- `前へ` / `次へ` で別カードへ移動したら、表示面は表面に戻す
- `学習済み` または `要復習` を押した後は、自動で次のカードへ進める
- 最後のカードで自動進行できない場合は、その場で表面に戻して状態だけ更新する

### 進捗とフィルター
- 進捗バーは **現在のフィルター結果に対する学習済み枚数** を表示する
- フィルター変更時は `currentIndex` を 0 に戻す
- `showOnlyUnlearned` が ON の状態でカードを学習済みにした場合、そのカードは次の描画からリストから外れる
- フィルター結果が0件のときは、条件を緩める案内を表示する

### シャッフルの仕様
- シャッフル OFF 時の並び順は `chapters[0] asc -> termId asc -> cardId asc`
- シャッフル ON で、現在のフィルター結果だけをランダム並びにする
- フィルター条件が変わったらシャッフル順は再生成する
- シャッフル OFF に戻したら標準順へ戻す

## 使い方の想定

1. アプリを開く
2. 学習したい章や用語で絞る
3. 表面の問いを見る
4. 頭の中で答えを言う
5. カードをめくって答え・補足を確認する
6. 「学習済み」または「要復習」を付ける
7. 次のカードへ進む
8. 後日、未学習や要復習だけを回す

## 画面構成

```
┌──────────────────────────────┐
│ 地質調査技士 一問一答カード   │
│ 第3章 / 標準貫入試験 / 12/84 │
│ [進捗バー]                   │
├──────────────────────────────┤
│ 標準貫入試験で採取される試料 │
│ は、乱した試料と乱さない試料 │
│ のどちらか。                 │
│                              │
│       [答えを見る]           │
├──────────────────────────────┤
│ [前へ] [学習済み] [要復習]   │
│ [次へ] [シャッフル] [絞り込み]│
└──────────────────────────────┘
```

裏面では以下を表示する。
- 答え
- 補足説明
- 出典情報（章、年度、過去問/予想問題）

## デザイン方針

- 中心は **1枚の大きいカード**
- 表面は情報量を抑え、答えを見たくなるレイアウトにする
- 裏面は「答え → 補足 → 出典」の順で読みやすく整理する
- 全体は **シンプル・見やすい・使いやすい** を優先し、装飾は最小限にする
- モバイルファーストで、片手操作でも回しやすくする
- フィルターは常時表示しすぎず、折りたたみまたはドロワーで扱う

### ビジュアル仕様
- メインカラーは `#dda249`
- ベース背景は白ではなく、少しだけ温かみのある淡い生成り系にする
- カード背景は高コントラストの白系にして、本文の可読性を優先する
- 強調色はメインカラーを中心に使い、答えの見出し・進捗バー・主要ボタンに限定して使う
- 成功状態や学習済み表示は、メインカラーと競合しない落ち着いた補助色を使う
- 境界線は濃すぎる線ではなく、薄いグレーまたは薄いベージュ系で整理する

### タイポグラフィ
- 全体フォントは **Zen Kaku Gothic New** を使う
- 見出しは太め、本文は通常ウェイトで、情報の強弱を明確にする
- 表面の問いは一番大きく見せ、1回で読める行長を保つ
- 裏面の答えは本文より明確に大きくし、最初に目に入るようにする
- 補足説明と出典は本文より少し小さくし、主従関係をはっきりさせる

### カードと余白
- カードの角丸は強すぎず、**少しだけ丸い** 印象にする
- 目安は `border-radius: 12px` 前後
- カードにはごく薄い影を入れて、背景から自然に浮かせる
- 余白は広めに取り、情報を詰め込みすぎない
- ボタンは押しやすさを優先し、モバイルでも窮屈にならない高さを確保する

### アニメーション方針
- アニメーションは **最低限**
- カード反転、ボタン押下、フィルターパネル開閉だけに限定する
- 速度は速すぎず遅すぎず、学習の流れを妨げない短時間にする
- 派手なバウンス、過剰なフェード、常時動く装飾は入れない

### レイアウト方針
- 1画面1カードを基本にし、視線が散らない構成にする
- ヘッダーには `章 / 用語 / 現在位置 / 進捗` をコンパクトに並べる
- 操作ボタンはカード直下に集約し、親指で押しやすい位置に置く
- フィルターは初期状態では畳み、必要時だけ開く
- PCでは中央寄せの読みやすい幅、モバイルでは全幅寄りで使えるようにする

### デザイントークン
- `--color-accent: #dda249`
- `--color-accent-strong: #c78d37`
- `--color-bg: #f6f1e7`
- `--color-surface: #fffdf9`
- `--color-surface-muted: #f8f3ea`
- `--color-text: #2f2417`
- `--color-text-muted: #6b5a44`
- `--color-border: #e7dcc7`
- `--color-success: #687b4a`
- `--color-flag: #b86b4b`
- `--shadow-card: 0 10px 30px rgba(63, 45, 18, 0.08)`
- `--radius-card: 12px`
- `--radius-control: 10px`
- `--max-content-width: 720px`

### アクセシビリティと操作性
- `button`, `input`, `summary` にはキーボードフォーカスを明確に出す
- `aria-pressed` を学習済み / 要復習 / シャッフル / フィルター開閉に付ける
- `prefers-reduced-motion: reduce` では反転アニメーションをほぼ無効化する
- 文字サイズは本文 `16px` 以上を基準にする
- コントラスト不足になる色の組み合わせは避ける

## プロジェクト構造

```
app-git/
├── public/
│   └── data/
│       └── fact-cards/
│           └── fact-cards.json      # アプリ実行時に読む整形済みデータ
├── data/
│   ├── fact-card-candidates/        # 抽出された候補材料
│   └── fact-card-seeds/             # レビュー済みカード原稿
├── scripts/
│   ├── extractFactCandidates.ts     # term-context から候補材料を抽出
│   └── buildFactCards.ts            # seeds から fact-cards.json を生成
├── src/
│   ├── types/index.ts               # FactCard, FilterState, CardProgress 型
│   ├── schemas/cards.ts             # zod schema
│   ├── data/loadFactCards.ts        # fact-cards.json 読み込み
│   ├── styles/
│   │   ├── tokens.css               # CSS variables
│   │   └── global.css               # reset + base styles + font
│   ├── store/
│   │   ├── useProgressStore.ts      # LocalStorage 永続化
│   │   └── useCardStore.ts          # フィルター・ナビ・シャッフル状態
│   ├── hooks/
│   │   └── useFlashCards.ts         # フィルター後カードリスト計算
│   ├── components/
│   │   ├── FlashCard/               # 表裏カード UI
│   │   ├── CardDeck/                # 前後ナビ・学習済み/要復習
│   │   ├── FilterPanel/             # 章・用語・タグ・未学習・予想問題
│   │   ├── ProgressBar/             # 学習進捗
│   │   └── StatusPanel/             # ローディング・エラー・空状態
│   ├── App.tsx
│   └── main.tsx
├── src/**/*.test.ts(x)              # loader/store/UI テスト
├── package.json
└── vite.config.ts
```

## ファイル責務の固定仕様

### `scripts/extractFactCandidates.ts`
- 入力: `/Users/yumawada/Desktop/restudy-git/generated/term-context/*.json`
- 出力: `data/fact-card-candidates/*.json`
- 役割: 元データをレビュー用の候補材料へ整形する
- 失敗条件: JSON不正、必須キー欠落、読み込み不能ファイル

### `scripts/buildFactCards.ts`
- 入力: `data/fact-card-seeds/*.json`
- 出力: `public/data/fact-cards/fact-cards.json`
- 役割: seed 検証、派生項目生成、安定ソート、出力
- 失敗条件: seed 不正、重複 `cardId`、参照不整合

### `src/schemas/cards.ts`
- `SourceRef`, `FactCard`, build output object, seed file の zod schema をまとめる
- スクリプトとアプリで同じ schema を使い回す

### `src/styles/global.css`
- `@fontsource/zen-kaku-gothic-new` を読み込む
- `body`, `button`, `input` にフォントを適用する
- reset とベース余白、背景色、文字色を定義する

### `src/data/loadFactCards.ts`
- fetch + schema parse を行う
- 成功時は `FactCard[]` を返し、失敗時は UI 側で扱える Error を投げる

### `src/store/useProgressStore.ts`
- `progressById: Record<string, CardProgress>`
- action: `markLearned(cardId, learned?)`
- action: `toggleFlag(cardId)`
- action: `resetProgress()`
- LocalStorage key は固定文字列で一元管理する

### `src/store/useCardStore.ts`
- state: `filter`, `currentIndex`, `isFlipped`, `isShuffleEnabled`
- action: `setFilter(partial)`
- action: `resetFilters()`
- action: `flip()`
- action: `goNext(total)`
- action: `goPrev(total)`
- action: `resetToFront()`
- action: `setShuffleEnabled(enabled)`

### `src/hooks/useFlashCards.ts`
- 入力: `allCards`, `filter`, `progressById`, `isShuffleEnabled`
- 出力: `filteredCards`, `learnedCount`, `flaggedCount`
- フィルター・進捗・シャッフルを合成して、UI がそのまま使える形にする

### `src/components/FlashCard/`
- 表面 / 裏面の見た目と反転表示だけを担当する
- 状態管理は持ち込まず、props 駆動にする

### `src/components/CardDeck/`
- 現在カードの表示とナビボタン、学習済み / 要復習ボタンをまとめる
- ストアと進捗ストアを接続するコンテナ寄りコンポーネントにする

### `src/components/FilterPanel/`
- 章、用語、タグ、未学習、要復習、予想問題トグルを表示する
- モバイルでは折りたたみ、PCではサイド/上部の簡易パネルとして扱う

### `src/components/StatusPanel/`
- ローディング、ロード失敗、0件時を共通描画する
- アプリ全体の例外処理を散らさないために用意する

## npm scripts

- `npm run extract:cards` — `tsx scripts/extractFactCandidates.ts`
- `npm run build:cards` — `tsx scripts/buildFactCards.ts`
- `npm run test` — vitest 実行
- `npm run dev` — Vite 開発サーバ
- `npm run build` — 本体ビルド
- `npm run check` — `npm run build:cards && npm run test && npm run build`

## 実装ステップ

### Phase 1: セットアップ
1. 既存ファイルを壊さないように、Vite 雛形は一時ディレクトリで作成してからルートへ移す
   - 例: `npm create vite@latest .tmp-vite -- --template react-ts`
   - 必要ファイルだけをルートへコピーし、`plans/` は保持する
2. `npm install zustand zod @fontsource/zen-kaku-gothic-new`
3. `npm install -D tsx vitest @testing-library/react @testing-library/jest-dom jsdom`
4. `package.json` に `extract:cards`, `build:cards`, `test`, `check` script を追加
5. `src/types/index.ts`, `src/schemas/cards.ts`, `src/styles/tokens.css`, `src/styles/global.css` を作成

### Phase 2: カードデータ生成基盤
6. `scripts/extractFactCandidates.ts` を作成
   - `term-context` を読む
   - 正答、解説、用語、年度、章を候補材料として取り出す
   - 人が見直しやすい中間形式で出力する
7. `data/fact-card-candidates/` のサンプル出力を確認する
8. `data/fact-card-seeds/` を整備
   - 候補材料を一問一答の形に書き換える
   - 1カード1知識に分解する
   - seed フォーマット検証を行う
   - 最低 10〜20 枚のサンプルカードを作る
9. `scripts/buildFactCards.ts` を作成
   - seeds から `public/data/fact-cards/fact-cards.json` を生成
   - `cardId = ${termId}-${cardKey}` を一意に付与する
   - `chapters` と `chapterLabels` を `sourceRefs` から導出する

### Phase 3: データ読み込み
10. `src/data/loadFactCards.ts` を作成
   - `fact-cards.json` を fetch
   - 型安全に `FactCard[]` として返す

### Phase 4: 状態管理
11. `src/store/useProgressStore.ts`
   - `Record<cardId, CardProgress>` を保持
   - learned / flagged を独立更新
12. `src/store/useCardStore.ts`
   - allCards, filter, currentIndex, isFlipped, shuffle
   - フィルター変更や進捗変更時に `currentIndex` を reset / clamp
13. `src/hooks/useFlashCards.ts`
   - フィルター後のカードリストを計算

### Phase 5: UIコンポーネント
14. `FlashCard.tsx` + `FlashCard.module.css`
   - 表面: `prompt` のみ
   - 裏面: `answer` + `detail` + `sourceRefs`
   - クリックまたはボタンでフリップ
15. `CardDeck.tsx`
   - 前へ / 次へ
   - 学習済み / 要復習
   - シャッフル
   - 現在位置表示
16. `ProgressBar.tsx`
   - 学習済み枚数 / 全枚数
17. `FilterPanel.tsx`
   - 章、用語、タグ
   - 未学習のみ、要復習のみ
   - 予想問題を含むか
18. `StatusPanel.tsx`
   - ローディング・エラー・0件時の表示

### Phase 6: 統合・仕上げ
19. `App.tsx` でレイアウト統合
20. モバイルファーストCSS（`max-width: 640px` 中心）
21. `vitest` で最低限の自動テストを追加
   - build script: seed 検証、`cardId` 生成、章導出
   - loader: JSON 読み込み
   - store: フィルター変更時の index 補正
   - UI: 表面に答えが出ないこと
22. `npm run check` で総合確認

## ClaudeCode 向け実装順

ClaudeCode には次の順序で作業させる。

1. Vite 初期化、依存導入、グローバルスタイルとトークン作成
2. `src/types/index.ts` と `src/schemas/cards.ts` を先に実装
3. `extractFactCandidates.ts` と `buildFactCards.ts` を実装
4. サンプル seed を 10〜20 枚作成し、`npm run build:cards` を通す
5. loader と zustand store を実装
6. `FlashCard`, `CardDeck`, `ProgressBar`, `FilterPanel`, `StatusPanel` を実装
7. `App.tsx` で統合し、見た目を整える
8. テストを追加し、`npm run check` を通す

各ステップの完了前に次へ進まない。特に、**seed が build できる状態を作る前に UI 実装へ進まない**。

## 検証方法

1. `npm run dev` でカードが表示されることを確認
2. 表面に **答えが表示されない** ことを確認
3. カードをめくると、答え・補足・出典が表示されることを確認
4. 学習済み / 要復習を付けて、リロード後も保持されることを確認
5. 章・用語・タグ・予想問題トグルで枚数が正しく変わることを確認
6. シャッフルやフィルター変更後も currentIndex が壊れないことを確認
7. `npm run build:cards` で seed 検証と `fact-cards.json` 生成が通ることを確認
8. `npm run test` で build script / loader / store / UI テストが通ることを確認
9. `vite build && vite preview` でビルド後も動くことを確認

## 完了条件

- `npm install`
- `npm run build:cards`
- `npm run test`
- `npm run build`

上記がすべて成功すること。

加えて、次を満たすこと。
- サンプル seed 10〜20 枚で UI が成立している
- 表面に答えが表示されない
- 学習済み / 要復習 / フィルター / シャッフルが動く
- `Zen Kaku Gothic New` とメインカラー `#dda249` が反映されている
- ローディング / エラー / 0件時の表示がある

## 補足

この計画の中核は **カードUI** ではなく **知識カードデータの設計** である。
実装着手時は、まず `fact-card-seeds` の作り方とレビュー単位を決める。
