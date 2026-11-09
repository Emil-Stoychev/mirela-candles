/* =========================================================
   Candle engine — рисува свещите като SVG + истински пламъци
   MC.candle(look, opts) -> HTML string
   ========================================================= */
window.MC = window.MC || {};
(function (MC) {
  let uid = 0;
  const VW = 200, VH = 260;

  /* ---------- helpers ---------- */
  function shade(hex, amt) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const n = parseInt(c, 16);
    let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
    return `rgb(${r},${g},${b})`;
  }
  MC.shade = shade;

  function rng(seed) { // mulberry32
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function wavePath(y, amp, phase) {
    let d = `M10,${y}`, up = phase ? 1 : -1;
    for (let x = 10; x < 190; x += 20) { d += ` Q${x + 10},${y + amp * up} ${x + 20},${y}`; up *= -1; }
    return d + ` L190,${VH} L10,${VH} Z`;
  }

  /* ---------- vessels ---------- */
  const V = {
    cup: {
      outer: 'M50,92 L150,92 L142,232 Q141,239 133,239 L67,239 Q59,239 58,232 Z',
      inner: 'M54,96 L146,96 L138.4,230 Q137.8,235 132,235 L68,235 Q62.2,235 61.6,230 Z',
      bottom: 235, fillTop: 122, creamTop: 99, rim: 92, rimW: 50, wicks: [[100, 58, 96]],
      label: [100, 188, 17], toppingY: 80, shine: 'M60,102 L55,224', mode: 'layers'
    },
    jar: {
      outer: 'M56,104 Q52,106 52,114 L52,226 Q52,239 66,239 L134,239 Q148,239 148,226 L148,114 Q148,106 144,104 Z',
      inner: 'M61,92 L139,92 L139,106 L143,108 Q144,110 144,116 L144,224 Q144,235 132,235 L68,235 Q56,235 56,224 L56,116 Q56,110 57,108 L61,106 Z',
      bottom: 235, fillTop: 130, creamTop: 95, rim: 90, rimW: 42, wicks: [[100, 56, 94]],
      label: [100, 190, 18], toppingY: 78, shine: 'M59,118 L59,222', mode: 'layers', neck: true
    },
    coupe: {
      outer: 'M26,96 L174,96 Q172,142 100,150 Q28,142 26,96 Z',
      inner: 'M31,99 L169,99 Q166,138 100,146 Q34,138 31,99 Z',
      bottom: 146, fillTop: 101, rim: 96, wicks: [[100, 72, 102]],
      label: [100, 124, 12], toppingY: 96, shine: 'M40,104 Q48,128 70,138', mode: 'gradient', stem: [149, 222, 36], bowAt: [100, 180]
    },
    martini: {
      outer: 'M28,88 L172,88 L106,158 L94,158 Z',
      inner: 'M36,93 L164,93 L104,154 L96,154 Z',
      bottom: 154, fillTop: 98, rim: 88, wicks: [[100, 70, 99]],
      toppingY: 94, shine: 'M44,96 L86,140', mode: 'gradient', stem: [157, 222, 34], bowAt: [100, 184]
    },
    can: {
      outer: 'M60,70 L140,70 Q144,70 144,76 L144,232 Q144,239 137,239 L63,239 Q56,239 56,232 L56,76 Q56,70 60,70 Z',
      inner: 'M61,75 L139,75 L139,231 Q139,234 135,234 L65,234 Q61,234 61,231 Z',
      bottom: 234, fillTop: 88, rim: 70, wicks: [[90, 64, 90]],
      label: [100, 176, 17], shine: 'M65,82 L65,226', mode: 'layers'
    }
  };

  /* ---------- toppings ---------- */
  const T = {
    strawberry(x, y) {
      const one = (dx, dy, r) => `<g transform="translate(${x + dx},${y + dy}) rotate(${r})">
        <path d="M0,-9 C9,-11 13,-2 9,6 C6,11 2,15 0,17 C-2,15 -6,11 -9,6 C-13,-2 -9,-11 0,-9Z" fill="#e2323f" stroke="#b81f2e" stroke-width="1"/>
        <path d="M-4,-4 C-2,-6 2,-6 4,-4" stroke="#ff8a8a" stroke-width="1.6" fill="none" opacity=".7"/>
        ${[[-4, 0], [3, 1], [0, 6], [-5, 7], [4, 8], [0, -2]].map(s => `<ellipse cx="${s[0]}" cy="${s[1]}" rx=".9" ry="1.3" fill="#ffe1a6"/>`).join('')}
        <path d="M0,-9 L-7,-14 L-2,-10 L-3,-17 L1,-10 L5,-16 L3,-9 L9,-11Z" fill="#3f9b47"/></g>`;
      return one(-9, 2, -14) + one(9, 4, 16);
    },
    cherry(x, y) {
      return `<path d="M${x - 7},${y} Q${x - 4},${y - 22} ${x + 4},${y - 26} M${x + 8},${y + 2} Q${x + 6},${y - 16} ${x + 4},${y - 26}" stroke="#5b7f2a" stroke-width="2" fill="none"/>
        <circle cx="${x - 7}" cy="${y + 4}" r="8.5" fill="#b3122e"/><circle cx="${x + 8}" cy="${y + 6}" r="8.5" fill="#c4163a"/>
        <circle cx="${x - 10}" cy="${y + 1}" r="2.4" fill="#fff" opacity=".6"/><circle cx="${x + 5}" cy="${y + 3}" r="2.4" fill="#fff" opacity=".6"/>`;
    },
    waffle(x, y) {
      let g = '';
      for (let i = -9; i <= 9; i += 6) g += `<line x1="${i}" y1="-10" x2="${i}" y2="10"/><line x1="-13" y1="${i * .8}" x2="13" y2="${i * .8}"/>`;
      return `<g transform="translate(${x},${y}) rotate(-14)"><rect x="-14" y="-11" width="28" height="22" rx="3" fill="#d89a52" stroke="#a96b2e" stroke-width="1.2"/>
        <g stroke="#b47738" stroke-width="1.4">${g}</g></g>`;
    },
    chocobear(x, y) {
      return `<g transform="translate(${x},${y - 4})"><ellipse cx="0" cy="12" rx="10" ry="10" fill="#6b3b2a"/>
        <circle cx="-8" cy="-9" r="4.5" fill="#6b3b2a"/><circle cx="8" cy="-9" r="4.5" fill="#6b3b2a"/>
        <circle cx="0" cy="-2" r="10" fill="#7a4532"/><ellipse cx="0" cy="2" rx="4.5" ry="3.4" fill="#a8714f"/>
        <circle cx="-3.6" cy="-4" r="1.3" fill="#2b1611"/><circle cx="3.6" cy="-4" r="1.3" fill="#2b1611"/>
        <ellipse cx="-3" cy="-7" rx="3" ry="1.5" fill="#fff" opacity=".18"/></g>`;
    },
    macaron(x, y) {
      return `<g transform="translate(${x},${y}) rotate(10)"><ellipse cx="0" cy="5" rx="13" ry="5.5" fill="#f28fb0"/>
        <rect x="-12" y="-1" width="24" height="5" rx="2" fill="#fff4ee"/><ellipse cx="0" cy="-2" rx="13" ry="5.5" fill="#f6a7c1"/>
        <ellipse cx="-4" cy="-4" rx="5" ry="1.6" fill="#fff" opacity=".45"/></g>`;
    },
    blueberry(x, y) {
      return [[-12, 2], [0, -4], [12, 3], [-3, 7], [8, -9]].map(p => `<circle cx="${x + p[0]}" cy="${y + p[1]}" r="6.2" fill="#4b5cb8"/>
        <circle cx="${x + p[0] - 2}" cy="${y + p[1] - 2}" r="1.8" fill="#9aa7ff" opacity=".7"/>
        <path d="M${x + p[0] - 1.6},${y + p[1] + 2} l1.6,-1.6 l1.6,1.6" stroke="#2c3780" stroke-width="1" fill="none"/>`).join('');
    },
    heart(x, y) {
      return `<g transform="translate(${x},${y}) rotate(-8)"><path d="M0,10 C-14,0 -12,-12 -4,-11 C-1,-11 0,-8 0,-6 C0,-8 1,-11 4,-11 C12,-12 14,0 0,10Z" fill="#d6284a" stroke="#a81733" stroke-width="1"/>
        <ellipse cx="-5" cy="-6" rx="2.5" ry="1.5" fill="#fff" opacity=".5"/></g>`;
    },
    orange(x, y) {
      let seg = '';
      for (let a = 0; a <= 180; a += 36) { const r = a * Math.PI / 180; seg += `<line x1="0" y1="0" x2="${(-Math.cos(r) * 12).toFixed(1)}" y2="${(-Math.sin(r) * 12).toFixed(1)}"/>`; }
      return `<g transform="translate(${x},${y}) rotate(-20)"><path d="M-15,0 A15,15 0 0 1 15,0Z" fill="#f39a2b"/>
        <path d="M-12.5,0 A12.5,12.5 0 0 1 12.5,0Z" fill="#ffc35a"/><g stroke="#f7e3b0" stroke-width="1.3">${seg}</g></g>`;
    },
    gingerbread(x, y) {
      return `<g transform="translate(${x},${y - 6}) rotate(8)"><path d="M0,-16 a7,7 0 1 1 -.1,0 Z M-5,-4 L-14,-2 Q-17,2 -13,4 L-5,3 L-8,16 Q-8,20 -4,19 L0,10 L4,19 Q8,20 8,16 L5,3 L13,4 Q17,2 14,-2 L5,-4 Z" fill="#b8733a" stroke="#8b4f22" stroke-width="1"/>
        <circle cx="-2.5" cy="-10" r="1.1" fill="#fff"/><circle cx="2.5" cy="-10" r="1.1" fill="#fff"/>
        <path d="M-3,-6 Q0,-4 3,-6" stroke="#fff" stroke-width="1" fill="none"/><circle cx="0" cy="0" r="1.3" fill="#e2323f"/><circle cx="0" cy="5" r="1.3" fill="#3f9b47"/></g>`;
    },
    ice(x, y) {
      return [[-16, 2, 12], [2, -3, -8], [17, 4, 20]].map(p => `<rect x="${x + p[0] - 8}" y="${y + p[1] - 8}" width="16" height="16" rx="3.5"
        transform="rotate(${p[2]} ${x + p[0]} ${y + p[1]})" fill="rgba(235,248,255,.55)" stroke="rgba(255,255,255,.95)" stroke-width="1.4"/>`).join('');
    }
  };

  function rose(x, y, r, c) {
    const d = shade(c, -0.28);
    return `<g transform="translate(${x},${y})"><circle r="${r}" fill="${c}"/>
      <path d="M${-r * .78},${r * .15} Q0,${r * 1.15} ${r * .78},${r * .15}" stroke="${d}" stroke-width="1.2" fill="none"/>
      <path d="M${-r * .58},${-r * .12} Q0,${r * .7} ${r * .58},${-r * .12}" stroke="${d}" stroke-width="1.1" fill="none"/>
      <path d="M${-r * .32},${-r * .38} Q0,${r * .18} ${r * .36},${-r * .32}" stroke="${d}" stroke-width="1" fill="none"/>
      <circle cy="${-r * .2}" r="${r * .2}" fill="${shade(c, -0.12)}"/><ellipse cx="${-r * .4}" cy="${-r * .5}" rx="${r * .25}" ry="${r * .12}" fill="#fff" opacity=".35"/></g>`;
  }

  function bow(x, y, c, s) {
    const d = shade(c, -0.2);
    return `<g transform="translate(${x},${y}) scale(${s || 1})">
      <path d="M-2,2 C-8,14 -14,30 -18,44 L-11,40 L-8,47 C-4,32 0,16 2,3Z" fill="${c}" stroke="${d}"/>
      <path d="M2,2 C8,14 16,28 22,40 L14,38 L13,46 C8,30 2,16 -1,3Z" fill="${c}" stroke="${d}"/>
      <path d="M0,0 C-10,-15 -31,-14 -29,-2 C-28,8 -10,6 0,0Z" fill="${c}" stroke="${d}"/>
      <path d="M0,0 C10,-15 31,-14 29,-2 C28,8 10,6 0,0Z" fill="${c}" stroke="${d}"/>
      <ellipse rx="5.5" ry="5" fill="${c}" stroke="${d}"/></g>`;
  }

  function label(x, y, r, text) {
    const t = text ? `<text x="${x}" y="${y + 3}" font-size="${Math.min(10, 120 / Math.max(text.length, 1))}" class="lbl">${esc(text)}</text>`
      : `<text x="${x}" y="${y - 1}" font-size="${r * .55}" class="lbl">Handmade</text><text x="${x}" y="${y + r * .45}" font-size="${r * .45}" class="lbl">with love</text>`;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fffaf8" stroke="#f1c3cd" stroke-width="1.2"/>${t}`;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m])); }

  function wick(x, top, base) {
    return `<path d="M${x},${base} Q${x + 1.6},${(base + top) / 2} ${x},${top}" stroke="#3b2a22" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <circle class="wick-tip" cx="${x}" cy="${top}" r="1.7"/>`;
  }

  function creamBlobs(cx, rimY, w, c) {
    const s = w / 50;
    const blobs = [[0, -27, 9], [-26, -15, 11], [-4, -19, 12], [17, -16, 11], [-37, 3, 12], [-18, -3, 15], [2, -6, 16], [22, -3, 15], [38, 3, 12]];
    const d = shade(c, -0.1);
    return blobs.map(b => `<circle cx="${cx + b[0] * s}" cy="${rimY + b[1]}" r="${b[2] * Math.min(s, 1.05)}" fill="${c}" stroke="${d}" stroke-width="1.1"/>
      <path d="M${cx + b[0] * s - b[2] * .5},${rimY + b[1] - b[2] * .35} q${b[2] * .4},-${b[2] * .3} ${b[2] * .8},0" stroke="#fff" stroke-width="1.6" fill="none" opacity=".65" stroke-linecap="round"/>`).join('');
  }

  /* ---------- main generator ---------- */
  MC.candle = function (look, opts) {
    opts = opts || {};
    const id = 'c' + (++uid);
    const R = rng(uid * 97 + 13);
    const v = V[look.vessel];
    let svg = '', wicks = [];

    if (v) {
      const wax = look.wax || ['#f2a7bb'];
      let inside = '';
      if (v.mode === 'gradient') {
        const stops = wax.map((c, i) => `<stop offset="${wax.length > 1 ? i / (wax.length - 1) : 0}" stop-color="${c}"/>`).reverse().join('');
        inside += `<linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1">${stops}</linearGradient>
          <rect x="0" y="${v.fillTop}" width="${VW}" height="${VH}" fill="url(#${id}g)"/>
          <ellipse cx="100" cy="${v.fillTop + 1}" rx="66" ry="3" fill="#fff" opacity=".25"/>`;
      } else {
        const h = (v.bottom - v.fillTop) / wax.length;
        for (let i = wax.length - 1; i >= 0; i--) {
          const top = v.bottom - (i + 1) * h;
          const crumb = wax[i].indexOf('crumb:') === 0;
          const col = crumb ? wax[i].slice(6) : wax[i];
          inside += `<path d="${wavePath(top, i === wax.length - 1 ? 2 : 4, i % 2)}" fill="${col}"/>`;
          if (crumb) {
            for (let k = 0; k < 46; k++) {
              const cx = 52 + R() * 96, cy = top + 3 + R() * (h - 4);
              inside += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(1.2 + R() * 2.6).toFixed(1)}" fill="${shade(col, R() > .5 ? -0.22 : 0.2)}"/>`;
            }
          }
        }
        if (look.cream) {
          inside += `<path d="M10,${v.creamTop} L190,${v.creamTop} L190,${v.fillTop} ${(() => { let d = '', up = 1; for (let x = 190; x > 10; x -= 15) { d += `Q${x - 7.5},${v.fillTop + 5 * up} ${x - 15},${v.fillTop} `; up *= -1; } return d; })()} Z" fill="${look.cream}"/>`;
        } else if (look.vessel === 'can' || look.vessel === 'cup' || look.vessel === 'jar') {
          inside += `<ellipse cx="100" cy="${v.fillTop + 1}" rx="40" ry="2.4" fill="#fff" opacity=".22"/>`;
        }
        if (look.vessel === 'can' && (look.toppings || []).includes('ice')) {
          inside += T.ice(100, v.fillTop + 26) + T.ice(96, v.fillTop + 62);
        }
      }

      // back of glass (empty part tint)
      svg += `<path d="${v.outer}" fill="rgba(255,255,255,.28)"/>`;
      svg += `<clipPath id="${id}k"><path d="${v.inner}"/></clipPath><g clip-path="url(#${id}k)">${inside}</g>`;

      // straw for can
      if (look.vessel === 'can') {
        const sc = look.straw || '#fff';
        svg += `<g><path d="M116,226 L128,28" stroke="${sc}" stroke-width="9" stroke-linecap="round"/>
          <path d="M116,226 L128,28" stroke="${shade(sc, -0.15)}" stroke-width="9" stroke-dasharray="6 7" stroke-linecap="round" opacity=".5"/></g>`;
      }

      // glass front
      svg += `<path d="${v.outer}" fill="rgba(255,255,255,.1)" stroke="rgba(110,70,70,.32)" stroke-width="1.6"/>
        <path d="${v.shine}" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".55"/>`;
      if (v.neck) {
        svg += `<rect x="58" y="88" width="84" height="18" rx="3" fill="rgba(255,255,255,.18)" stroke="rgba(110,70,70,.3)" stroke-width="1.4"/>
          <path d="M60,94 L140,96 M60,100 L140,102" stroke="rgba(110,70,70,.22)" stroke-width="1.2"/>`;
      }
      if (v.stem) {
        svg += `<path d="M96.5,${v.stem[0]} L103.5,${v.stem[0]} L102.6,${v.stem[1]} L97.4,${v.stem[1]}Z" fill="rgba(255,255,255,.5)" stroke="rgba(110,70,70,.32)" stroke-width="1.3"/>
          <ellipse cx="100" cy="${v.stem[1] + 4}" rx="${v.stem[2]}" ry="6" fill="rgba(255,255,255,.45)" stroke="rgba(110,70,70,.32)" stroke-width="1.3"/>`;
      }
      if (v.label) svg += label(v.label[0], v.label[1], v.label[2], opts.label);

      // ribbon
      if (look.ribbon) {
        if (v.bowAt) svg += bow(v.bowAt[0], v.bowAt[1], look.ribbon, .78);
        else if (v.neck) svg += `<rect x="57" y="95" width="86" height="7" fill="${look.ribbon}" stroke="${shade(look.ribbon, -0.2)}" stroke-width=".8"/>` + bow(72, 99, look.ribbon, .55);
        else if (look.vessel === 'cup') svg += `<path d="M51.2,128 L148.8,128 L148.3,135 L51.7,135Z" fill="${look.ribbon}" stroke="${shade(look.ribbon, -0.2)}" stroke-width=".8"/>` + bow(72, 131, look.ribbon, .55);
      }

      // cream overflow + toppings
      if (look.cream) svg += creamBlobs(100, v.rim + 4, v.rimW, look.cream);
      const tops = (look.toppings || []).filter(t => !(look.vessel === 'can' && t === 'ice'));
      const slots = look.cream ? [[-24, 2], [25, 3], [2, -14]] : [[-30, 0], [30, 0], [0, -8]];
      const ty = v.toppingY || v.fillTop;
      tops.slice(0, 3).forEach((t, i) => { if (T[t]) svg += T[t](100 + slots[i][0], ty + slots[i][1]); });

      v.wicks.forEach(w => { svg += wick(w[0], w[1], w[2]); wicks.push([w[0], w[1]]); });
    }
    else if (look.vessel === 'bear') {
      const c = (look.wax || ['#f39ab3'])[0], l = shade(c, 0.35), d = shade(c, -0.18);
      svg += `<g stroke="${d}" stroke-width="1.4">
        <ellipse cx="74" cy="228" rx="17" ry="12" fill="${c}"/><ellipse cx="126" cy="228" rx="17" ry="12" fill="${c}"/>
        <ellipse cx="100" cy="186" rx="47" ry="47" fill="${c}"/>
        <ellipse cx="58" cy="172" rx="13" ry="19" fill="${c}" transform="rotate(28 58 172)"/><ellipse cx="142" cy="172" rx="13" ry="19" fill="${c}" transform="rotate(-28 142 172)"/>
        <circle cx="70" cy="82" r="14" fill="${c}"/><circle cx="130" cy="82" r="14" fill="${c}"/>
        <circle cx="100" cy="112" r="38" fill="${c}"/></g>
        <circle cx="70" cy="82" r="7" fill="${l}"/><circle cx="130" cy="82" r="7" fill="${l}"/>
        <ellipse cx="100" cy="194" rx="26" ry="28" fill="${l}"/>
        <ellipse cx="100" cy="124" rx="16" ry="12" fill="${l}"/><ellipse cx="100" cy="118" rx="5.5" ry="4" fill="#3b2420"/>
        <circle cx="86" cy="104" r="3.6" fill="#3b2420"/><circle cx="114" cy="104" r="3.6" fill="#3b2420"/>
        <path d="M95,128 Q100,133 105,128" stroke="#3b2420" stroke-width="1.6" fill="none"/>
        <ellipse cx="82" cy="92" rx="9" ry="4" fill="#fff" opacity=".3"/><ellipse cx="80" cy="170" rx="10" ry="5" fill="#fff" opacity=".25"/>
        <circle cx="86" cy="114" r="5" fill="#ff6f8f" opacity=".35"/><circle cx="114" cy="114" r="5" fill="#ff6f8f" opacity=".35"/>`;
      if (look.ribbon) svg += bow(100, 150, look.ribbon, .55);
      svg += wick(100, 62, 76); wicks.push([100, 62]);
    }
    else if (look.vessel === 'bowl') {
      const c = (look.wax || ['#f3b7c6'])[0];
      const fl = look.flowers || ['#b8325a', '#f39a3b', '#d94a6a'];
      svg += `<path d="M14,150 Q18,220 100,224 Q182,220 186,150Z" fill="#ece5df" stroke="#cdc3bb" stroke-width="1.5"/>
        <ellipse cx="100" cy="150" rx="86" ry="21" fill="#f5f0eb" stroke="#d6ccc4" stroke-width="1.2"/>
        <ellipse cx="100" cy="151" rx="76" ry="16" fill="${c}"/>
        <ellipse cx="80" cy="146" rx="30" ry="4" fill="#fff" opacity=".25"/>
        ${Array.from({ length: 22 }, () => `<circle cx="${(24 + R() * 152).toFixed(1)}" cy="${(166 + R() * 48).toFixed(1)}" r="${(.6 + R()).toFixed(1)}" fill="#c9bfb6"/>`).join('')}
        <path d="M60,162 q10,-6 18,-2 M128,163 q8,-7 16,-1" stroke="#6fa35a" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      const pos = [[52, 150, 11], [80, 143, 12], [100, 157, 13], [122, 143, 12], [148, 150, 11]];
      pos.forEach((p, i) => { svg += rose(p[0], p[1], p[2], fl[i % fl.length]); });
      [[80, 124, 140], [122, 124, 140], [100, 138, 153]].forEach(w => { svg += wick(w[0], w[1], w[2]); wicks.push([w[0], w[1]]); });
    }
    else if (look.vessel === 'bouquet') {
      const box = look.box || '#f6c9d2', fl = look.flowers || ['#f06d8f', '#f9b6c6', '#fff'];
      const pos = [[64, 132, 15], [92, 126, 16], [122, 128, 16], [140, 140, 13], [56, 108, 13], [78, 104, 15], [104, 98, 16], [130, 104, 15], [146, 116, 12], [90, 80, 14], [116, 78, 14], [70, 84, 11], [138, 88, 11], [103, 60, 12]];
      svg += `<path d="M44,140 Q100,30 156,140" fill="none" stroke="#fff" stroke-width="1" opacity=".7" stroke-dasharray="3 4"/>`;
      pos.slice().reverse().forEach((p, i) => { svg += rose(p[0], p[1], p[2], fl[i % fl.length]); });
      for (let k = 0; k < 18; k++) svg += `<circle cx="${(52 + R() * 96).toFixed(1)}" cy="${(64 + R() * 80).toFixed(1)}" r="${(1.4 + R() * 1.4).toFixed(1)}" fill="#fff"/>`;
      svg += `<path d="M44,150 l8,-12 l8,12 l8,-12 l8,12 l8,-12 l8,12 l8,-12 l8,12 l8,-12 l8,12 l8,-12 l8,12" fill="none" stroke="#fff" stroke-width="1.6"/>
        <rect x="48" y="150" width="104" height="84" fill="${box}"/>
        <ellipse cx="100" cy="234" rx="52" ry="8" fill="${shade(box, -0.1)}"/>
        <ellipse cx="100" cy="150" rx="52" ry="8" fill="${shade(box, 0.15)}"/>
        <rect x="48" y="196" width="104" height="9" fill="${look.ribbon || '#fff'}" opacity=".95"/>
        <text x="128" y="186" class="lbl" font-size="11">for you</text>
        <path d="M54,160 L54,228" stroke="#fff" stroke-width="3" opacity=".35"/>` + bow(76, 200, look.ribbon || '#fff', .6);
      const leds = [[58, 120], [74, 96], [96, 112], [112, 88], [134, 112], [148, 128], [84, 140], [120, 140], [100, 72], [64, 144], [138, 96]];
      svg += leds.map((p, i) => `<circle class="led" style="--d:${(i * 0.37) % 2}s" cx="${p[0]}" cy="${p[1]}" r="2.6"/>`).join('');
    }

    const kind = look.vessel === 'bouquet' ? 'led' : 'wick';
    const flames = wicks.map(w => `<span class="wick" style="left:${(w[0] / VW * 100).toFixed(2)}%;top:${(w[1] / VH * 100).toFixed(2)}%"><span class="flame"><i></i></span></span>`).join('');
    return `<div class="candle" data-kind="${kind}" data-vessel="${look.vessel}">
      <svg viewBox="0 0 ${VW} ${VH}" aria-hidden="true" focusable="false">${svg}</svg>${flames}</div>`;
  };

  /* ---------- light / snuff API ---------- */
  function emit(el, lit) { document.dispatchEvent(new CustomEvent('mc:candle', { detail: { el, lit } })); }

  MC.lightWick = function (w, silent) {
    if (!w || w.classList.contains('on')) return false;
    w.classList.add('on');
    w.querySelector('.flame').style.animationDelay = (-Math.random() * 3).toFixed(2) + 's';
    const c = w.closest('.candle');
    if (c) { c.classList.add('is-lit'); if (!silent) emit(c, true); }
    return true;
  };

  MC.snuffWick = function (w, silent) {
    if (!w || !w.classList.contains('on')) return false;
    w.classList.remove('on');
    for (let i = 0; i < 3; i++) {
      const s = document.createElement('span');
      s.className = 'smoke';
      s.style.setProperty('--dx', (Math.random() * 30 - 15).toFixed(0) + 'px');
      s.style.animationDelay = (i * 0.18) + 's';
      w.appendChild(s);
      setTimeout(() => s.remove(), 3200);
    }
    const c = w.closest('.candle');
    if (c) { if (!c.querySelector('.wick.on')) c.classList.remove('is-lit'); if (!silent) emit(c, false); }
    return true;
  };

  MC.lightCandle = function (c, silent) {
    if (c.dataset.kind === 'led') { if (!c.classList.contains('is-lit')) { c.classList.add('is-lit'); if (!silent) emit(c, true); } return; }
    c.querySelectorAll('.wick').forEach((w, i) => setTimeout(() => MC.lightWick(w, silent || i > 0), i * 220));
  };
  MC.snuffCandle = function (c, silent) {
    if (c.dataset.kind === 'led') { if (c.classList.contains('is-lit')) { c.classList.remove('is-lit'); if (!silent) emit(c, false); } return; }
    c.querySelectorAll('.wick.on').forEach((w, i) => MC.snuffWick(w, silent || i > 0));
  };
  MC.toggleCandle = function (c) { c.classList.contains('is-lit') ? MC.snuffCandle(c) : MC.lightCandle(c); };
  MC.isLit = c => c.classList.contains('is-lit');
})(window.MC);
