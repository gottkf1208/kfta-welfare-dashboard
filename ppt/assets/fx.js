/* 화이트 크리스마스 효과: 클릭할 때 반짝이 + 은은한 눈 내림
   - 외부 요청 없음. 캔버스 한 장(pointer-events: none)에 그린다.
   - 움직임 줄이기 설정이면 눈은 기본 꺼짐, 반짝이는 작게.
   - 오른쪽 아래 작은 버튼(또는 S 키)으로 눈 켜기/끄기. */
(function () {
  'use strict';
  if (window.__quokaFx) return;
  window.__quokaFx = true;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var KEY = 'quoka-fx-snow';
  var snowOn = !reduce;
  try { var saved = localStorage.getItem(KEY); if (saved !== null) snowOn = saved === '1'; } catch (e) {}

  var cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2147483000';
  var ctx = cv.getContext('2d');
  var W = 0, H = 0, DPR = 1;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    fitSnow();
  }

  /* ---------- 눈 ---------- */
  var flakes = [];
  function makeFlake(randomY) {
    var r = 1.2 + Math.random() * 3.2;
    return {
      x: Math.random() * W,
      y: randomY ? Math.random() * H : -10 - Math.random() * 40,
      r: r,
      vy: 0.25 + r * 0.16 + Math.random() * 0.25,
      sway: 0.4 + Math.random() * 0.9,
      ph: Math.random() * Math.PI * 2,
      a: 0.55 + Math.random() * 0.4
    };
  }
  function fitSnow() {
    var target = Math.min(110, Math.round((W * H) / 19000));
    while (flakes.length < target) flakes.push(makeFlake(true));
    if (flakes.length > target) flakes.length = target;
  }
  function drawFlake(f) {
    // 흰 바탕에서도 보이도록: 흰 중심 + 아주 옅은 라일락 테두리
    var g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 1.6);
    g.addColorStop(0, 'rgba(255,255,255,' + f.a + ')');
    g.addColorStop(0.55, 'rgba(255,255,255,' + (f.a * 0.9) + ')');
    g.addColorStop(1, 'rgba(196,182,224,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r * 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(190,176,220,' + (f.a * 0.35) + ')';
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.stroke();
  }

  /* ---------- 클릭: 핑크 선 눈송이 + 반짝이 가루 ---------- */
  var FX_DUR = 760;
  var FX_DOT_COLORS = ['#1b3a8f', '#6f8fd8', '#C4A8EE', '#F6B8D3', '#1b3a8f'];
  function fxMakeBurst(x, y, now, reduce) {
    var n = reduce ? 0 : 7, dots = [], base = Math.random() * Math.PI * 2;
    for (var i = 0; i < n; i++) {
      dots.push({
        a: base + (Math.PI * 2 * i) / n + (Math.random() - 0.5) * 0.5,
        d: 0.75 + Math.random() * 0.45,
        r: 1.1 + Math.random() * 1.3,
        c: FX_DOT_COLORS[i % FX_DOT_COLORS.length],
        ph: Math.random() * 6.28
      });
    }
    return { x: x, y: y, t0: now, rot: Math.random() * 0.5, dots: dots };
  }
  function fxEaseOutBack(t) { var c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
  function fxEaseOut(t) { return 1 - Math.pow(1 - t, 3); }
  function fxFlake(ctx, x, y, s, rot, alpha) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.strokeStyle = 'rgba(227,21,122,' + alpha + ')';
    ctx.lineWidth = 1.4; ctx.lineCap = 'round';
    ctx.beginPath();
    for (var i = 0; i < 6; i++) {
      ctx.moveTo(0, 0); ctx.lineTo(0, -s);
      ctx.moveTo(0, -s * 0.52); ctx.lineTo(s * 0.22, -s * 0.74);
      ctx.moveTo(0, -s * 0.52); ctx.lineTo(-s * 0.22, -s * 0.74);
      ctx.moveTo(0, -s * 0.8); ctx.lineTo(s * 0.12, -s * 0.93);
      ctx.moveTo(0, -s * 0.8); ctx.lineTo(-s * 0.12, -s * 0.93);
      ctx.rotate(Math.PI / 3);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(227,21,122,' + alpha + ')';
    ctx.beginPath(); ctx.arc(0, 0, 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  /* 그리기: 끝났으면 false */
  function fxDrawBurst(ctx, b, now) {
    var t = (now - b.t0) / FX_DUR;
    if (t >= 1) return false;
    if (t < 0) return true;
    var grow = fxEaseOutBack(Math.min(1, t / 0.38));
    var fade = t < 0.5 ? 1 : 1 - (t - 0.5) / 0.5;
    fxFlake(ctx, b.x, b.y, 12 * grow * (1 + 0.06 * t), b.rot + 0.55 * fxEaseOut(t), 0.9 * fade);
    for (var i = 0; i < b.dots.length; i++) {
      var p = b.dots[i];
      var dist = (12 + 20 * fxEaseOut(t)) * p.d;
      var px = b.x + Math.cos(p.a) * dist;
      var py = b.y + Math.sin(p.a) * dist + 9 * t * t;
      var tw = 0.65 + 0.35 * Math.sin(t * 22 + p.ph);
      ctx.globalAlpha = Math.max(0, (1 - t) * tw);
      ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(px, py, p.r * (1 - 0.35 * t), 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    return true;
  }
  var bursts = [];
  function burst(x, y) {
    bursts.push(fxMakeBurst(x, y, performance.now(), reduce));
    if (bursts.length > 12) bursts.shift();
    wake();
  }

  /* ---------- 루프 ---------- */
  var raf = 0, last = 0;
  function frame(t) {
    raf = 0;
    var dt = last ? Math.min(2.2, (t - last) / 16.67) : 1; last = t;
    ctx.clearRect(0, 0, W, H);

    if (snowOn) {
      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
        f.ph += 0.012 * dt;
        f.y += f.vy * dt;
        f.x += Math.sin(f.ph) * f.sway * 0.35 * dt;
        if (f.y > H + 10 || f.x < -20 || f.x > W + 20) { flakes[i] = makeFlake(false); continue; }
        drawFlake(f);
      }
    }

    var now = performance.now();
    for (var k = bursts.length - 1; k >= 0; k--) {
      if (!fxDrawBurst(ctx, bursts[k], now)) bursts.splice(k, 1);
    }

    if (snowOn || bursts.length) wake();
  }
  function wake() { if (!raf && !document.hidden) raf = requestAnimationFrame(frame); }

  /* ---------- 눈 켜기/끄기 버튼 ---------- */
  function addToggle() {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'quoka-snow-toggle';
    b.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M12 2v20M4.5 6.5l15 11M19.5 6.5l-15 11M9.5 3.5 12 6l2.5-2.5M9.5 20.5 12 18l2.5 2.5"/></svg><span></span>';
    function label() {
      b.querySelector('span').textContent = snowOn ? '눈 끄기' : '눈 켜기';
      b.setAttribute('aria-pressed', snowOn ? 'true' : 'false');
    }
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      snowOn = !snowOn;
      try { localStorage.setItem(KEY, snowOn ? '1' : '0'); } catch (err) {}
      label(); wake();
    });
    label();
    var st = document.createElement('style');
    st.textContent = '.quoka-snow-toggle{position:fixed;left:50%;bottom:10px;transform:translateX(-50%);z-index:2147483001;display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px 0 10px;border-radius:999px;border:1px solid #d9e0ee;background:rgba(255,255,255,.86);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);color:#5A2E47;font:600 12px/1 Paperlogy,"Pretendard Variable",Pretendard,"Malgun Gothic",sans-serif;cursor:pointer;opacity:.72;transition:opacity .2s}.quoka-snow-toggle:hover,.quoka-snow-toggle:focus-visible{opacity:1}.quoka-snow-toggle svg{color:#1b3a8f}@media print{.quoka-snow-toggle{display:none}}';
    document.head.appendChild(st);
    document.body.appendChild(b);
  }

  function init() {
    document.body.appendChild(cv);
    resize();
    addToggle();
    window.addEventListener('resize', resize);
    window.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      burst(e.clientX, e.clientY);
    }, { passive: true });
    document.addEventListener('keydown', function (e) {
      if ((e.key === 's' || e.key === 'S') && !/input|textarea|select/i.test((e.target && e.target.tagName) || '') && !(e.target && e.target.isContentEditable)) {
        var b = document.querySelector('.quoka-snow-toggle'); if (b) b.click();
      }
    });
    document.addEventListener('visibilitychange', function () { last = 0; wake(); });
    wake();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
