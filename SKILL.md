---
name: anim-fluid-mask
description: "Fluid / organic page-transition animation (pure HTML/CSS/JS, no deps). Use when you need a page-transition effect with a fluid / organic feel — e.g. 画像ギャラリー、ケーススタディ、フルスクリーンの章切り替え. 波打つ液体カーテンが下から立ち上がって画面を覆い、覆い切った裏で作品を差し替え、引いて新作品が現れるギャラリー遷移。覆う色は次作品の色で、新しい色が流れ込んで沈静化するよう見える。カーテン通過後にキャプション（作品名・カテゴリ・年・説明）が立ち上がり、サムネイルで直接ジャンプもできる。WebGL なし。"
---

# anim-fluid-mask (B·Tr · 流体マスク遷移)

Pure HTML + CSS + vanilla JS, **zero dependencies**. 波打つ液体カーテンが下から立ち上がって画面を覆い、覆い切った裏で作品を差し替え、引いて新作品が現れるギャラリー遷移。覆う色は次作品の色で、新しい色が流れ込んで沈静化するよう見える。カーテン通過後にキャプション（作品名・カテゴリ・年・説明）が立ち上がり、サムネイルで直接ジャンプもできる。WebGL なし。

## When to use / 使いどころ
- **EN:** a *page-transition* effect with a *fluid / organic* feel.
- **JP:** 流体・有機 × ページ遷移。推奨配置: 画像ギャラリー、ケーススタディ、フルスクリーンの章切り替え

## Bundled assets / 同梱アセット
This skill folder is the reference implementation — copy from these files:
- `index.html` — full working demo (open to preview)
- `style.css` — component styles
- `script.js` — the self-contained logic
- `README.md` — full human-facing doc (JP): mechanism, accessibility, constraints

## How to apply / 組み込み手順
Copy the component CSS block from `style.css` and the script from `script.js` (no build step), then follow the markup/parameters below.

### 1. 2 ファイルをコピー

`style.css` / `script.js` を移植先へ。外部依存ゼロ、WebGL なし。

### 2. マークアップ

```html
<div class="fluid" data-fluid-mask>
  <div class="fm-stage" data-fm-stage>
    <section class="fm-panel is-active" data-fm-name="TIDE" style="--c:#0066ff">…</section>
    <section class="fm-panel"           data-fm-name="EMBER" style="--c:#ff2d55">…</section>
    …
    <svg class="fm-veil" data-fm-veil viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
      <path data-fm-path d=""/>
    </svg>
  </div>

  <div class="fm-ui">
    <button class="fm-btn" data-fm-prev aria-label="前">←</button>
    <div class="fm-dots" data-fm-dots></div>
    <button class="fm-btn" data-fm-next aria-label="次">→</button>
  </div>
</div>
<script src="./fluid-mask.js"></script>
```

- パネルは任意枚数。`--c` が覆い色＝パネル背景色
- `data-fm-name` は将来ラベル等に流用可
- 操作：`← / →` キー（ステージが視野内）、prev/next、ドット（自動生成）。端は wrap

## Customize / カスタマイズ
### カスタマイズ
### CSS 変数

| 変数 | 役割 | デフォルト |
|---|---|---|
| `--fm-stage-h` | ステージ高さ | `min(78vh,620px)` |

### JS 定数（`script.js` 冒頭）

| 定数 | 役割 | デフォルト |
|---|---|---|
| `COVER` / `REVEAL` | 覆う / 引く 各フェーズの時間(ms) | `640` / `640` |
| `AMP` | 波の振幅（viewBox 600 基準） | `46` |
| `WOBBLE` | 縁の揺らぎ速度 | `0.18` |

```js
// 振幅を上げて荒い波に
const AMP = 80;
// ゆっくり大きくうねらせる
const WOBBLE = 0.32;
```

---
> Full mechanism, accessibility and known constraints: see **`README.md`** / 詳細・機構・アクセシビリティは README.md 参照。
