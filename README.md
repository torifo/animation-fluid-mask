# B·Tr · 流体マスク遷移

> 波打つ液体カーテンが下から立ち上がって画面を覆い、覆い切った裏で作品を差し替え、引いて新作品が現れるギャラリー遷移。覆う色は次作品の色で、新しい色が流れ込んで沈静化するよう見える。カーテン通過後にキャプション（作品名・カテゴリ・年・説明）が立ち上がり、サムネイルで直接ジャンプもできる。WebGL なし。

> デモは架空フォトグラファー/スタジオの作品ギャラリー（Tidal Drift / Ember Fields / Moss Protocol / Noct Suite）として実装。ケーススタディや写真シリーズの閲覧に使える実用構成。

**Live demo**: `./index.html`

## 概要

| 項目 | 内容 |
|---|---|
| ジャンル | B · 流体・有機 |
| 用途 | Tr · ページ遷移 |
| 主な参考 | Resn.co, Codrops（Gallery Transitions） |
| 依存 | なし（Pure HTML + CSS + Vanilla JS） |
| 推奨配置 | 画像ギャラリー、ケーススタディ、フルスクリーンの章切り替え |


## スキルとして導入 / Install as a skill

このリポジトリは Claude Code / Codex CLI 共通の **`SKILL.md`**（オープン標準）を同梱しており、AI エージェントのスキルとして使えます。リポジトリ自体をスキルディレクトリへリンクするだけです。

This repo ships a cross-agent **`SKILL.md`** (open standard) usable by both Claude Code and Codex CLI. Just link the repo into the agent's skills directory.

```bash
# Claude Code
ln -s "$(pwd)" ~/.claude/skills/anim-fluid-mask
# Codex CLI
ln -s "$(pwd)" ~/.codex/skills/anim-fluid-mask
```

エージェントを再起動すると `description` に基づき自動でマッチします（スキル名: `anim-fluid-mask`）。
Restart the agent; it is matched automatically by the skill's `description` (skill name: `anim-fluid-mask`).

## 仕組み

1. 液体カーテンは塗りつぶした SVG `<path>` 1 本。上端は 2 つの正弦波を重ねた波形で、揺らぎ `t` を進めて常に波打つ
2. パラメータ `p`（0＝画面下に隠れる / 1＝完全に覆う）で上端の高さを制御：`edge = (1-p)*(H+3*AMP) - AMP`。`p=1` で波の山が y=0 以下＝全面被覆、`p=0` で谷が H 以下＝完全に隠れる
3. **覆う**：`p` を 0→1（`easeInOut`、`COVER`ms）。覆い色は次パネルの `--c`
4. 覆い切った瞬間に `.fm-panel` の `is-active` を差し替え
5. **引く**：`p` を 1→0（`REVEAL`ms）。波打つカーテンが下へ引き、新パネルが現れる
6. **キャプション立ち上げ**：引き終わりに active パネルへ `.is-revealed` を付与 → `.fm-cap` の各行が staggered でフェード/スライドイン
7. **サムネイル / カウンター**：`.fm-thumb`（色スウォッチ + 作品名）を JS が自動生成。現在地をハイライトし `01 / 04` を更新

塗り path のモーフィングだけで、マスク/フィルタの相互運用問題を避けて流体表現を出す。背景は CSS グラデーション + パターンの「アート」レイヤー（`.fm-art`）で、外部画像なしに作品らしい面を作る。

## 組み込み手順

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

## カスタマイズ

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

## アクセシビリティ

`prefers-reduced-motion: reduce` のとき、液体カーテンを動かさずパネルを即時切替する。

## 制約 / 既知の挙動

- 遷移中は `busy` でロック（`COVER + REVEAL`）
- `viewBox` は `0 0 1000 600` 固定（`preserveAspectRatio="none"` でステージに引き伸ばし）。`AMP` はこの 600 系基準
- 全パネルは DOM 常駐。非アクティブは `display:none`

## ライセンス

ANIMATION DESIGN STUDY の一部として公開（コピペ自由）。
