/* =========================================================
   FX: звук, частици, кибрит, вятър, нощен режим, reveal
   ========================================================= */
window.MC = window.MC || {};
(function (MC) {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  MC.$ = $; MC.$$ = $$;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };
  MC.store = store;
  // тъч устройство (телефон/таблет) — без hover, клечката се влачи с пръст
  MC.touch = matchMedia('(hover: none), (pointer: coarse)').matches;
  document.documentElement.classList.toggle('touch', MC.touch);
  // текстове, различни за тъч: data-touch-text="..."
  document.addEventListener('DOMContentLoaded', () => {
    if (MC.touch) $$('[data-touch-text]').forEach(el => { el.innerHTML = el.dataset.touchText; });
  });

  /* ================= AUDIO (синтезиран, без файлове) ================= */
  const A = { ctx: null, on: store.get('mc-sound') !== 'off', noise: null };
  function ac() {
    if (!A.on) return null;
    if (!A.ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      A.ctx = new C();
      const len = A.ctx.sampleRate * 1.5, buf = A.ctx.createBuffer(1, len, A.ctx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      A.noise = buf;
    }
    if (A.ctx.state === 'suspended') A.ctx.resume();
    return A.ctx;
  }
  function noise(dur, type, freq, q, vol, attack) {
    const c = ac(); if (!c) return;
    const t = c.currentTime, src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    src.buffer = A.noise; f.type = type; f.frequency.value = freq; f.Q.value = q || 1;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + (attack || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(c.destination);
    src.start(t, Math.random()); src.stop(t + dur + 0.05);
  }
  function tone(freq, dur, vol, type, when, slide) {
    const c = ac(); if (!c) return;
    const t = c.currentTime + (when || 0), o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
  }
  MC.sfx = {
    strike() { noise(0.22, 'bandpass', 2600, 0.8, 0.5, 0.005); setTimeout(() => noise(0.5, 'lowpass', 900, 0.7, 0.35, 0.03), 120); for (let i = 0; i < 5; i++) setTimeout(() => noise(0.03, 'highpass', 4000, 1, 0.15), 150 + Math.random() * 300); },
    scratch() { noise(0.06, 'bandpass', 3200, 1.2, 0.12, 0.004); },
    light() { noise(0.45, 'lowpass', 700, 0.6, 0.22, 0.05); },
    snuff() { noise(0.28, 'highpass', 600, 0.5, 0.18, 0.01); },
    click() { tone(1800, 0.04, 0.2, 'square'); setTimeout(() => tone(900, 0.05, 0.15, 'square'), 60); },
    pop() { tone(520, 0.12, 0.18, 'sine', 0, 1040); },
    chime() { [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.5, 0.12, 'sine', i * 0.11)); },
    tick() { tone(1200, 0.03, 0.06, 'triangle'); }
  };
  MC.sound = {
    get on() { return A.on; },
    toggle() { A.on = !A.on; store.set('mc-sound', A.on ? 'on' : 'off'); if (A.on) MC.sfx.pop(); return A.on; }
  };

  /* ================= PARTICLES (canvas) ================= */
  const cv = $('#fx-canvas'), cx = cv.getContext('2d');
  let P = [], raf = 0, W = 0, H = 0, dpr = 1, rainUntil = 0, rainType = null;
  function size() { dpr = Math.min(window.devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  size(); addEventListener('resize', size);
  const SETS = {
    snow: ['❄', '❅', '•', '•'], hearts: ['❤️', '💗', '💕', '🌹'], petals: ['🌸', '🌷', '🌺', '💮'],
    eggs: ['🥚', '🐣', '🌼', '🐰'], confetti: ['🤍', '✨', '🕊️'], party: ['🎉', '🎈', '✨', '🎂']
  };
  const CONF = ['#e0607e', '#f2c17a', '#f1a3b6', '#8fbf6a', '#4fb6e3', '#fff'];
  function spawnRain() {
    const set = SETS[rainType] || SETS.confetti, isSnow = rainType === 'snow';
    const glyph = set[Math.floor(Math.random() * set.length)];
    P.push({
      kind: (rainType === 'confetti' || rainType === 'party') && Math.random() < .55 ? 'rect' : 'glyph', glyph,
      x: Math.random() * W, y: -30, vx: (Math.random() - .5) * 1.2, vy: 1.2 + Math.random() * (isSnow ? 1.2 : 2.4),
      s: isSnow ? 10 + Math.random() * 16 : 16 + Math.random() * 18, r: Math.random() * 6, vr: (Math.random() - .5) * .08,
      sway: Math.random() * 6, life: 1, decay: 0, color: CONF[Math.floor(Math.random() * CONF.length)], g: 0.01
    });
  }
  MC.fx = {
    rain(type, ms) { rainType = type; rainUntil = performance.now() + (ms || 3200); loop(); },
    sparks(x, y, n, opts) {
      opts = opts || {};
      for (let i = 0; i < (n || 18); i++) {
        const a = Math.random() * Math.PI * 2, sp = 1 + Math.random() * (opts.power || 4.5);
        P.push({ kind: 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.5, s: 1.5 + Math.random() * 2.2, life: 1, decay: .02 + Math.random() * .03, g: .12, color: opts.color || (Math.random() < .5 ? '#ffd27a' : '#ff9b3d') });
      }
      loop();
    },
    hearts(x, y, n) {
      for (let i = 0; i < (n || 8); i++) {
        const a = -Math.PI / 2 + (Math.random() - .5) * 1.8, sp = 2 + Math.random() * 3;
        P.push({ kind: 'glyph', glyph: ['❤️', '💗', '✨', '🕯️'][i % 4], x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, s: 14 + Math.random() * 10, r: 0, vr: (Math.random() - .5) * .1, sway: 0, life: 1, decay: .018, g: .08 });
      }
      loop();
    }
  };
  function loop() { if (!raf) raf = requestAnimationFrame(tick); }
  function tick(now) {
    raf = 0;
    cx.clearRect(0, 0, W, H);
    if (now < rainUntil && Math.random() < .55) spawnRain();
    P = P.filter(p => p.life > 0 && p.y < H + 60);
    for (const p of P) {
      p.vy += p.g; p.x += p.vx + (p.sway ? Math.sin(now / 600 + p.sway) * .6 : 0); p.y += p.vy; p.life -= p.decay; p.r += p.vr || 0;
      cx.globalAlpha = Math.max(0, Math.min(1, p.life));
      if (p.kind === 'spark') {
        cx.fillStyle = p.color; cx.shadowColor = p.color; cx.shadowBlur = 8;
        cx.beginPath(); cx.arc(p.x, p.y, p.s, 0, 6.283); cx.fill(); cx.shadowBlur = 0;
      } else if (p.kind === 'rect') {
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.color; cx.fillRect(-p.s / 4, -p.s / 8, p.s / 2, p.s / 4); cx.restore();
      } else {
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r * .3);
        cx.font = `${p.s}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",serif`; cx.textAlign = 'center';
        cx.fillStyle = rainType === 'snow' ? '#fff' : '#e0607e';
        cx.fillText(p.glyph, 0, 0); cx.restore();
      }
    }
    cx.globalAlpha = 1;
    if (P.length || now < rainUntil) raf = requestAnimationFrame(tick);
  }

  /* ================= TOAST ================= */
  let tt;
  MC.toast = function (msg, ms) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), ms || 2600);
  };

  /* ================= POINTER + MATCH ================= */
  const ptr = { x: innerWidth / 2, y: innerHeight / 2, px: 0, py: 0, t: 0, v: 0 };
  MC.ptr = ptr;
  const m = { el: $('#match'), state: 'none', burnT: 0, timer: 0, strikeDist: 0, drag: null };
  MC.match = m;
  const BURN_MS = 16000;
  // при тъч главичката е над пръста (пръстът държи клечката), за да се вижда пламъкът
  const TOUCH_OFF = [-38, -60];
  const isTouch = e => e.pointerType === 'touch';
  const tipOf = e => isTouch(e) ? [e.clientX + TOUCH_OFF[0], e.clientY + TOUCH_OFF[1]] : [e.clientX, e.clientY];
  MC.setPtr = function (e) {
    const [x, y] = tipOf(e);
    ptr.x = ptr.px = x; ptr.y = ptr.py = y; ptr.t = performance.now(); ptr.v = 0;
  };

  function placeMatch() { m.el.style.transform = `translate(${ptr.x}px, ${ptr.y}px)`; }

  // хващане на клечката с пръст (от кутийката, плаващия бутон или паркираната клечка)
  m.grab = function (e) {
    MC.setPtr(e);
    m.drag = e.pointerId;
    m.el.classList.remove('parked');
    if (m.state !== 'none') placeMatch();
  };
  let parkTold = false;
  const endDrag = e => {
    if (m.drag === null || m.drag !== e.pointerId) return;
    m.drag = null;
    if (m.state === 'unlit') m.drop(false);
    else if (m.state === 'lit') {
      m.el.classList.add('parked');
      if (!parkTold) { parkTold = true; MC.toast('🔥 Клечката чака. Докосни я, за да я хванеш пак', 3000); }
    }
  };
  addEventListener('pointerup', endDrag);
  addEventListener('pointercancel', endDrag);
  $('.match-grip', m.el).addEventListener('pointerdown', e => { e.preventDefault(); m.grab(e); });

  m.take = function (lit) {
    m.state = 'unlit'; m.strikeDist = 0;
    m.el.classList.add('show'); m.el.classList.remove('lit', 'dying', 'parked');
    m.el.style.setProperty('--burn', 0);
    document.body.classList.add('has-match');
    placeMatch();
    document.dispatchEvent(new CustomEvent('mc:match', { detail: 'take' }));
    if (lit) setTimeout(() => m.ignite(), 120);
  };
  m.ignite = function () {
    if (m.state !== 'unlit') return;
    m.state = 'lit'; m.burnT = performance.now();
    m.el.classList.add('lit');
    m.el.querySelector('.wick').classList.add('on');
    MC.sfx.strike(); MC.fx.sparks(ptr.x, ptr.y, 26);
    document.dispatchEvent(new CustomEvent('mc:match', { detail: 'lit' }));
    cancelAnimationFrame(m.timer); burn();
  };
  function burn() {
    const p = (performance.now() - m.burnT) / BURN_MS;
    m.el.style.setProperty('--burn', Math.min(p, 1) * .75);
    if (p > .82) m.el.classList.add('dying');
    if (p >= 1) { m.drop(true); MC.toast('Клечката изгоря 🔥 Вземи нова от кутийката'); return; }
    m.timer = requestAnimationFrame(burn);
  }
  m.drop = function (smoke) {
    if (m.state === 'none') return;
    const w = m.el.querySelector('.wick');
    if (m.state === 'lit' && smoke !== false) MC.snuffWickRaw(w);
    w.classList.remove('on');
    m.state = 'none'; m.drag = null; cancelAnimationFrame(m.timer);
    m.el.classList.remove('lit', 'dying', 'parked');
    setTimeout(() => { if (m.state === 'none') { m.el.classList.remove('show'); } }, 500);
    document.body.classList.remove('has-match');
    document.dispatchEvent(new CustomEvent('mc:match', { detail: 'drop' }));
  };
  // дим без да засяга .candle
  MC.snuffWickRaw = function (w) {
    for (let i = 0; i < 3; i++) {
      const s = document.createElement('span'); s.className = 'smoke';
      s.style.setProperty('--dx', (Math.random() * 30 - 15).toFixed(0) + 'px'); s.style.animationDelay = i * .15 + 's';
      w.appendChild(s); setTimeout(() => s.remove(), 3000);
    }
  };

  function wickPoint(w) { const r = w.getBoundingClientRect(); return [r.left, r.top]; }
  function distSeg(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
    let t = l ? ((px - ax) * dx + (py - ay) * dy) / l : 0; t = Math.max(0, Math.min(1, t));
    const qx = ax + t * dx - px, qy = ay + t * dy - py; return Math.sqrt(qx * qx + qy * qy);
  }

  let leanRaf = 0;
  function onMove(e) {
    const touch = isTouch(e);
    // с пръст движим клечката само докато я държим (иначе пръстът скролва страницата)
    if (touch && m.drag !== e.pointerId) return;
    const now = performance.now(), dt = Math.max(now - ptr.t, 1), [tx, ty] = tipOf(e);
    ptr.px = ptr.x; ptr.py = ptr.y; ptr.x = tx; ptr.y = ty; ptr.t = now;
    ptr.v = Math.hypot(ptr.x - ptr.px, ptr.y - ptr.py) / dt;
    if (m.state !== 'none') placeMatch();

    // драсване по лентата (с пръст: по цялата кутийка, по-леко)
    if (m.state === 'unlit') {
      const zones = touch ? '[data-strike], #mb-strike, #matchbox' : '[data-strike], #mb-strike';
      const pad = touch ? 14 : 6;
      const z = $$(zones).find(el => { const r = el.getBoundingClientRect(); return ptr.x > r.left - pad && ptr.x < r.right + pad && ptr.y > r.top - pad - 4 && ptr.y < r.bottom + pad + 4; });
      if (z && ptr.v > (touch ? .2 : .35)) {
        m.strikeDist += Math.hypot(ptr.x - ptr.px, ptr.y - ptr.py);
        if (Math.random() < .5) MC.sfx.scratch();
        if (Math.random() < .3) MC.fx.sparks(ptr.x, ptr.y, 3, { power: 2 });
        if (m.strikeDist > (touch ? 50 : 70)) m.ignite();
      }
    }
    // палене с клечката
    if (m.state === 'lit') {
      const reach = touch ? 30 : 24;
      $$('.wick:not(.on)').forEach(w => {
        if (w.closest('.match, .loader')) return;
        const [wx, wy] = wickPoint(w);
        if (distSeg(wx, wy, ptr.px, ptr.py, ptr.x, ptr.y) < reach) { if (MC.lightWick(w)) { MC.fx.sparks(wx, wy, 10, { power: 2.5 }); if (!w.closest('.candle')) w.dispatchEvent(new CustomEvent('mc:wick', { bubbles: true, detail: true })); } }
      });
      $$('.candle[data-kind="led"]:not(.is-lit)').forEach(c => {
        const r = c.getBoundingClientRect();
        if (ptr.x > r.left && ptr.x < r.right && ptr.y > r.top && ptr.y < r.top + r.height * .55) MC.lightCandle(c);
      });
    }
    // вятър: бързо минаване гаси пламъка
    if (m.state !== 'lit' && e.pointerType === 'mouse') {
      if (ptr.v > 1.1) {
        $$('.wick.on').forEach(w => {
          if (w.closest('.match, .loader')) return;
          const [wx, wy] = wickPoint(w);
          if (distSeg(wx, wy - 12, ptr.px, ptr.py, ptr.x, ptr.y) < 34) {
            if (ptr.v > 2.6) {
              MC.snuffWick(w); MC.wind = (MC.wind || 0) + 1;
              if (!w.closest('.candle')) w.dispatchEvent(new CustomEvent('mc:wick', { bubbles: true, detail: false }));
            }
            else { w.classList.add('gust'); setTimeout(() => w.classList.remove('gust'), 450); }
          }
        });
      }
    }
    if (!leanRaf) leanRaf = requestAnimationFrame(lean);
  }
  function lean() {
    leanRaf = 0;
    $$('.wick.on').forEach(w => {
      if (w.closest('.match, .loader')) return;
      const [wx, wy] = wickPoint(w), dx = wx - ptr.x, dy = wy - ptr.y, d = Math.hypot(dx, dy);
      const f = w.querySelector('.flame');
      if (d < 160) f.style.setProperty('--lean', (Math.max(-1, Math.min(1, dx / 80)) * (1 - d / 160) * 22).toFixed(1) + 'deg');
      else f.style.removeProperty('--lean');
    });
  }
  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('pointerdown', e => { ptr.t = performance.now(); onMove(e); if (m.state !== 'none') { m.el.classList.add('press'); setTimeout(() => m.el.classList.remove('press'), 150); } });
  addEventListener('keydown', e => { if (e.key === 'Escape') m.drop(); });
  document.addEventListener('contextmenu', e => { if (m.state !== 'none') { e.preventDefault(); m.drop(); } });
  document.addEventListener('mouseleave', () => m.el.classList.remove('show'));
  document.addEventListener('mouseenter', () => { if (m.state !== 'none') m.el.classList.add('show'); });

  // звук при палене/гасене на свещ
  document.addEventListener('mc:candle', e => { e.detail.lit ? MC.sfx.light() : MC.sfx.snuff(); });

  /* ================= NIGHT MODE + CORD ================= */
  MC.setNight = function (on) {
    document.body.classList.toggle('night', on);
    const cord = $('#lamp-cord'); cord.setAttribute('aria-label', on ? 'Светни лампите' : 'Угаси лампите');
    if (on) {
      const visible = $$('.candle').filter(c => { const r = c.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && !c.closest('.opt') && !c.closest('.cart-thumb'); });
      visible.forEach((c, i) => setTimeout(() => MC.lightCandle(c, true), 300 + i * 140));
      setTimeout(() => MC.sfx.light(), 300);
      MC.toast('🌙 Лампите са угасени. Уютно, нали?');
    } else MC.toast('💡 Светна!');
  };
  (function cord() {
    const c = $('#lamp-cord'); let sy = null, pulled = false;
    const fire = () => { c.classList.remove('pulled'); void c.offsetWidth; c.classList.add('pulled'); MC.sfx.click(); MC.setNight(!document.body.classList.contains('night')); };
    c.addEventListener('pointerdown', e => { sy = e.clientY; pulled = false; c.setPointerCapture(e.pointerId); });
    c.addEventListener('pointermove', e => {
      if (sy === null) return;
      const d = Math.max(0, Math.min(60, e.clientY - sy));
      c.querySelector('.cord-line').style.flex = `0 0 ${68 + d}px`;
      if (d > 34 && !pulled) { pulled = true; fire(); }
    });
    const up = () => { if (sy !== null && !pulled) fire(); sy = null; c.querySelector('.cord-line').style.flex = ''; };
    c.addEventListener('pointerup', up); c.addEventListener('pointercancel', () => { sy = null; c.querySelector('.cord-line').style.flex = ''; });
    c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fire(); } });
  })();

  /* ================= ГЛОБАЛЕН ЛОУДЪР ================= */
  const ld = $('#loader'), ldText = $('#loader-text'), t0 = performance.now();
  MC.loader = {
    // за бъдещи заявки към бекенда (изпращане на поръчка и т.н.)
    show(text) { ldText.textContent = text || 'Момент…'; ld.classList.add('soft'); ld.classList.remove('hide'); },
    hide() { ld.classList.add('hide'); }
  };
  let booted = false;
  function boot() {
    if (booted) return; booted = true;
    setTimeout(() => {
      MC.loader.hide();
      document.body.classList.add('loaded');
      document.dispatchEvent(new Event('mc:loaded'));
    }, Math.max(0, 1100 - (performance.now() - t0)));
  }
  if (document.readyState === 'complete') boot(); else addEventListener('load', boot);
  setTimeout(boot, 4500); // бавни шрифтове/мрежа — не чакаме вечно

  /* ================= REVEAL + COUNTERS ================= */
  MC.observeReveal = function (root) {
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in'); io.unobserve(en.target);
      $$('[data-count]', en.target).forEach(countUp);
    }), { threshold: .15, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal', root).forEach(el => io.observe(el));
  };
  function countUp(el) {
    const to = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now();
    (function f(now) { const p = Math.min((now - t0) / 1400, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(to * e) + suf; if (p < 1) requestAnimationFrame(f); })(t0);
  }
})(window.MC);
