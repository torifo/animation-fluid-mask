/* ────────────────────────────────────────────
   B·Tr · Fluid Mask (liquid curtain transition)
   - 波打つ液体カーテン（SVG path）が下から立ち上がり画面を覆う
   - 覆い切った瞬間にパネルを差し替え、引いて新パネルを出す
   - 覆い色 = 次パネルの色（--c）
   - ← → / ボタン / ドット で遷移
   - prefers-reduced-motion なら即時切替
   viewBox は 0 0 1000 600。
   ──────────────────────────────────────────── */

(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const W = 1000, H = 600;
  const COVER = 640, REVEAL = 640;   // 各フェーズ(ms)
  const AMP = 46;                    // 波の振幅
  const WOBBLE = 0.18;               // 縁の揺らぎ速度
  const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

  // 2 つの正弦波を重ねた縁（揺らぎ t）
  const wave = (x, t) => AMP * 0.6 * Math.sin(x * 0.012 + t) + AMP * 0.4 * Math.sin(x * 0.027 - t * 1.3);

  // p: 0=画面下に隠れる, 1=完全に覆う
  const buildPath = (p, t) => {
    const edge = (1 - p) * (H + 3 * AMP) - AMP;
    const N = 22;
    let d = `M 0 ${(edge + wave(0, t)).toFixed(1)}`;
    for (let k = 1; k <= N; k++) {
      const x = (W / N) * k;
      d += ` L ${x.toFixed(1)} ${(edge + wave(x, t)).toFixed(1)}`;
    }
    d += ` L ${W} ${H} L 0 ${H} Z`;
    return d;
  };

  const init = (root) => {
    const stage = root.querySelector('[data-fm-stage]');
    const veil = root.querySelector('[data-fm-veil]');
    const path = root.querySelector('[data-fm-path]');
    const panels = [...root.querySelectorAll('.fm-panel')];
    const thumbsWrap = root.querySelector('[data-fm-thumbs]');
    const countEl = root.querySelector('[data-fm-count]');
    const prevBtn = root.querySelector('[data-fm-prev]');
    const nextBtn = root.querySelector('[data-fm-next]');
    if (!stage || !veil || !path || !panels.length) return;

    const total = panels.length;
    let index = 0;
    let busy = false;
    const pad = (n) => String(n).padStart(2, '0');

    // サムネイル生成（色スウォッチ + 作品名）
    const thumbs = [];
    if (thumbsWrap) {
      panels.forEach((p, i) => {
        const b = document.createElement('button');
        b.className = 'fm-thumb'; b.type = 'button';
        b.style.setProperty('--c', getComputedStyle(p).getPropertyValue('--c').trim() || '#0a0a0a');
        b.innerHTML = `<span class="fm-thumb-sw"></span><span class="fm-thumb-tx">${p.dataset.fmName || i + 1}</span>`;
        b.addEventListener('click', () => go(i));
        thumbsWrap.appendChild(b); thumbs.push(b);
      });
    }

    // ── Moss Protocol：カーソル距離で密度が変わる粒子（canvas） ──
    const setupMoss = () => {
      if (reduce) return;
      const canvas = root.querySelector('[data-fm-moss]');
      if (!canvas) return;
      const panel = canvas.closest('.fm-panel');
      const ctx = canvas.getContext('2d');
      const DPR = Math.min(2, window.devicePixelRatio || 1);
      let w = 0, h = 0, parts = [], raf = null, mx = -999, my = -999;

      const resize = () => {
        const r = canvas.getBoundingClientRect();
        w = r.width; h = r.height;
        canvas.width = w * DPR; canvas.height = h * DPR;
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        if (!parts.length || parts.length < 2) {
          parts = Array.from({ length: 150 }, () => ({
            x: Math.random() * w, y: Math.random() * h, vy: -(0.08 + Math.random() * 0.32),
          }));
        }
      };
      const draw = () => {
        ctx.clearRect(0, 0, w, h);
        for (const p of parts) {
          p.y += p.vy; if (p.y < 0) { p.y = h; p.x = Math.random() * w; }
          const near = Math.max(0, 1 - Math.hypot(p.x - mx, p.y - my) / 170);
          const rad = 1 + near * 3.6;
          ctx.fillStyle = `rgba(190,255,212,${0.16 + near * 0.7})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, rad, 0, 6.283); ctx.fill();
        }
        raf = requestAnimationFrame(draw);
      };
      canvas.addEventListener('pointermove', (e) => {
        const r = canvas.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top;
      });
      canvas.addEventListener('pointerleave', () => { mx = -999; my = -999; });

      panel._fxStart = () => { if (raf) return; resize(); draw(); };
      panel._fxStop = () => { if (raf) { cancelAnimationFrame(raf); raf = null; } };
      window.addEventListener('resize', () => { if (raf) resize(); });
    };
    setupMoss();

    // ── Ember Fields：逆光に揺れる草原のシルエット（SVG blades + CSS sway） ──
    const setupGrass = () => {
      const host = root.querySelector('.fm-p2 .fm-art');
      if (!host || host.querySelector('.fm-grass')) return;
      const NS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'fm-grass');
      svg.setAttribute('viewBox', '0 0 1000 300');
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.setAttribute('aria-hidden', 'true');
      const BASE = 300;
      for (let i = 0; i < 72; i++) {
        const x = Math.random() * 1000;
        const h = 90 + Math.random() * 190;
        const w = 5 + Math.random() * 9;
        const bend = (Math.random() * 2 - 1) * 46;
        const p = document.createElementNS(NS, 'path');
        p.setAttribute('d',
          `M ${(x - w).toFixed(1)} ${BASE} ` +
          `Q ${(x + bend * 0.4).toFixed(1)} ${(BASE - h * 0.6).toFixed(1)} ${(x + bend).toFixed(1)} ${(BASE - h).toFixed(1)} ` +
          `Q ${(x + bend * 0.4).toFixed(1)} ${(BASE - h * 0.6).toFixed(1)} ${(x + w).toFixed(1)} ${BASE} Z`);
        p.style.animationDuration = `${3 + Math.random() * 3}s`;
        p.style.animationDelay = `${(-Math.random() * 4).toFixed(2)}s`;
        svg.appendChild(p);
      }
      host.appendChild(svg);
    };
    setupGrass();

    const setActive = (i) => {
      panels.forEach((p, k) => {
        p.classList.toggle('is-active', k === i);
        if (k !== i && p._fxStop) p._fxStop();
      });
      thumbs.forEach((b, k) => b.setAttribute('aria-current', k === i ? 'true' : 'false'));
      if (countEl) countEl.textContent = `${pad(i + 1)} / ${pad(total)}`;
      if (panels[i]._fxStart) panels[i]._fxStart();
    };

    const go = (i) => {
      i = (i + panels.length) % panels.length;   // wrap
      if (busy || i === index) return;

      if (reduce) { setActive(i); index = i; panels[i].classList.add('is-revealed'); return; }

      busy = true;
      panels.forEach((p) => p.classList.remove('is-revealed'));   // 旧キャプションを伏せる
      // 覆い色 = 次パネルの色
      const c = getComputedStyle(panels[i]).getPropertyValue('--c').trim() || '#0a0a0a';
      veil.style.setProperty('--fm-veil-color', c);

      const start = performance.now();
      let swapped = false;
      const frame = (now) => {
        const e = now - start;
        const t = e * 0.001 / WOBBLE;
        let p;
        if (e <= COVER) {
          p = easeInOut(e / COVER);
        } else {
          if (!swapped) { setActive(i); index = i; swapped = true; }
          p = 1 - easeInOut(Math.min(1, (e - COVER) / REVEAL));
        }
        path.setAttribute('d', buildPath(Math.max(0, Math.min(1, p)), t));
        if (e < COVER + REVEAL) {
          requestAnimationFrame(frame);
        } else {
          path.setAttribute('d', buildPath(0, t));   // 隠す
          panels[i].classList.add('is-revealed');    // キャプション立ち上げ
          busy = false;
        }
      };
      requestAnimationFrame(frame);
    };

    prevBtn && prevBtn.addEventListener('click', () => go(index - 1));
    nextBtn && nextBtn.addEventListener('click', () => go(index + 1));

    // ← → キー（ステージが視野内のとき）
    let inView = false;
    new IntersectionObserver((es) => { inView = es[0].isIntersecting; }, { threshold: 0.5 }).observe(stage);
    window.addEventListener('keydown', (e) => {
      if (!inView) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
    });

    // 初期：カーテンを隠した状態に + 先頭キャプションを立ち上げ
    path.setAttribute('d', buildPath(0, 0));
    setActive(0);
    requestAnimationFrame(() => panels[0].classList.add('is-revealed'));
  };

  document.querySelectorAll('[data-fluid-mask]').forEach(init);
})();
