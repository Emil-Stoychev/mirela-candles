/* =========================================================
   Работилница (конструктор) + ароматен бар
   ========================================================= */
(function (MC) {
  const { $, $$ } = MC;
  const B = MC.builder;
  const S = { vessel: 'cup', w1: 'pink', w2: 'berry', two: false, tops: ['strawberry', 'waffle'], aromas: [], ribbon: 'none', label: '' };
  let lit = false;

  function hexMix(a, b, t) {
    const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    const A = p(a), C = p(b);
    return '#' + A.map((v, i) => Math.round(v + (C[i] - v) * t).toString(16).padStart(2, '0')).join('');
  }
  function look() {
    const c1 = MC.wax[S.w1].c, c2 = MC.wax[S.w2].c, rib = B.ribbons.find(r => r.id === S.ribbon).c;
    const l = { vessel: S.vessel, toppings: S.tops.slice(), ribbon: rib };
    if (S.vessel === 'cup' || S.vessel === 'jar') {
      l.wax = S.two ? [c2, 'crumb:#c98d63', c1] : [hexMix(c1, '#000000', .12), 'crumb:#c98d63', c1];
      l.cream = hexMix(c1, '#ffffff', .62);
    } else l.wax = S.two ? [c2, c1] : [hexMix(c1, '#000000', .18), c1];
    return l;
  }
  function price() {
    return B.vessels.find(v => v.id === S.vessel).base + S.tops.reduce((s, t) => s + B.toppings.find(x => x.id === t).price, 0)
      + (S.two ? 2 : 0) + (S.ribbon !== 'none' ? 1 : 0) + (S.label ? 1 : 0);
  }
  function name() {
    const v = { cup: '', jar: '', coupe: 'Коктейл ', martini: 'Мартини ' }[S.vessel];
    const t = S.tops.map(id => B.toppings.find(x => x.id === id).name.toLowerCase());
    const base = MC.wax[S.w1].name;
    return v ? `${v}„${base}“` : base + (t.length ? ' с ' + (t.length > 1 ? t.slice(0, -1).join(', ') + ' и ' + t[t.length - 1] : t[0]) : '');
  }
  function desc() {
    const v = B.vessels.find(x => x.id === S.vessel).name;
    return [v, S.aromas.length ? 'аромат: ' + S.aromas.join(' + ') : 'аромат по избор', S.label ? `надпис „${S.label}“` : ''].filter(Boolean).join(' · ');
  }

  /* ---------- UI ---------- */
  const prev = $('#preview');
  function render(anim) {
    prev.innerHTML = MC.candle(look(), { label: S.label });
    const c = $('.candle', prev);
    if (anim) { c.classList.add('swap'); }
    if (lit) MC.lightCandle(c, true);
    $('#b-name').textContent = name();
    $('#b-desc').textContent = desc();
    $('#b-price').textContent = price() + ' €';
    const pp = $('#preview-price'), pt = price() + ' €';
    if (pp.textContent !== pt) { pp.textContent = pt; pp.classList.remove('bump'); void pp.offsetWidth; pp.classList.add('bump'); }
  }

  $('#opt-vessel').innerHTML = B.vessels.map(v => `<button class="opt opt-vessel" data-v="${v.id}"><span class="mini">${MC.candle({ vessel: v.id, wax: v.id === 'coupe' || v.id === 'martini' ? ['#e0394f', '#f2a7bb'] : ['#e7577a', 'crumb:#c98d63', '#f6b8c8'], cream: v.id === 'cup' || v.id === 'jar' ? '#fbd3dc' : null, toppings: ['strawberry'] })}</span>${v.name}</button>`).join('');
  const sw = (k, attr) => Object.entries(MC.wax).map(([id, w]) => `<button class="swatch" style="--c:${w.c}" data-${attr}="${id}" title="${w.name}" aria-label="${w.name}"></button>`).join('');
  $('#opt-wax').innerHTML = sw('w1', 'w1');
  $('#opt-wax2').innerHTML = sw('w2', 'w2');
  $('#opt-top').innerHTML = B.toppings.map(t => `<button class="opt" data-t="${t.id}">${t.e} ${t.name}</button>`).join('');
  $('#opt-aroma').innerHTML = MC.aromas.year.map(a => `<button class="opt" data-a="${a.n}">${a.e} ${a.n}</button>`).join('');
  $('#opt-ribbon').innerHTML = B.ribbons.map(r => `<button class="swatch ${r.c ? '' : 'none'}" style="--c:${r.c || '#fff'}" data-r="${r.id}" title="${r.name}" aria-label="Панделка: ${r.name}"></button>`).join('');

  function sync() {
    $$('[data-v]').forEach(b => b.classList.toggle('is-on', b.dataset.v === S.vessel));
    $$('[data-w1]').forEach(b => b.classList.toggle('is-on', b.dataset.w1 === S.w1));
    $$('[data-w2]').forEach(b => b.classList.toggle('is-on', b.dataset.w2 === S.w2));
    $$('[data-t]').forEach(b => b.classList.toggle('is-on', S.tops.includes(b.dataset.t)));
    $$('#opt-aroma [data-a]').forEach(b => b.classList.toggle('is-on', S.aromas.includes(b.dataset.a)));
    $$('[data-r]').forEach(b => b.classList.toggle('is-on', b.dataset.r === S.ribbon));
    $('.builder-steps').classList.toggle('two', S.two);
    $('#two-tone').checked = S.two;
    $('#opt-label').value = S.label;
  }
  const toggleMax = (arr, v, max) => { const i = arr.indexOf(v); if (i > -1) arr.splice(i, 1); else { arr.push(v); if (arr.length > max) arr.shift(); } };

  $('.builder-steps').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const d = b.dataset;
    if (d.v) S.vessel = d.v;
    else if (d.w1) S.w1 = d.w1;
    else if (d.w2) S.w2 = d.w2;
    else if (d.t) toggleMax(S.tops, d.t, 3);
    else if (d.a) toggleMax(S.aromas, d.a, 2);
    else if (d.r) S.ribbon = d.r;
    else return;
    MC.sfx.tick(); sync(); render(true);
  });
  $('#two-tone').addEventListener('change', e => { S.two = e.target.checked; sync(); render(true); });
  $('#opt-label').addEventListener('input', e => { S.label = e.target.value.trim(); render(false); });

  const pv = $('.builder-preview');
  $('#preview-light').addEventListener('click', () => {
    lit = !lit;
    const c = $('.candle', prev);
    lit ? MC.lightCandle(c) : MC.snuffCandle(c);
    pv.classList.toggle('lit', lit);
    lightLabel();
  });
  function lightLabel() {
    const b = $('#preview-light'), t = lit ? 'Угаси' : 'Запали';
    b.innerHTML = `<span class="ico">${lit ? '💨' : '🔥'}</span><span class="txt">${t}</span>`; b.setAttribute('aria-label', t);
  }
  document.addEventListener('mc:candle', e => {
    if (!prev.contains(e.detail.el)) return;
    lit = MC.isLit(e.detail.el); pv.classList.toggle('lit', lit);
    lightLabel();
  });
  const pick = a => a[Math.floor(Math.random() * a.length)];
  $('#preview-random').addEventListener('click', () => {
    const waxIds = Object.keys(MC.wax);
    S.vessel = pick(B.vessels).id; S.w1 = pick(waxIds); S.w2 = pick(waxIds); S.two = Math.random() < .5;
    S.tops = B.toppings.map(t => t.id).sort(() => Math.random() - .5).slice(0, 1 + Math.floor(Math.random() * 3));
    S.aromas = MC.aromas.year.map(a => a.n).sort(() => Math.random() - .5).slice(0, 1 + Math.floor(Math.random() * 2));
    S.ribbon = pick(B.ribbons).id;
    sync(); render(true); MC.sfx.pop();
    const r = prev.getBoundingClientRect(); MC.fx.sparks(r.left + r.width / 2, r.top + r.height * .3, 18, { color: '#f1a3b6' });
  });
  $('#b-add').addEventListener('click', () => {
    const key = 'custom-' + JSON.stringify(S).length + '-' + Date.now().toString(36).slice(-4);
    MC.cart.add({ key, name: name(), desc: desc(), price: price(), look: look(), label: S.label }, $('.candle', prev));
  });

  /* ---------- мобилно/таблет: стъпка по стъпка, прегледът остава видим ---------- */
  const mq = matchMedia('(max-width: 980px)');
  const stepsEl = $('#builder-steps'), stepper = $('#b-stepper');
  const panels = $$(':scope > .b-step, :scope > .b-summary', stepsEl);
  let cur = 0;
  stepper.innerHTML = panels.map((p, i) => `<button role="tab" data-go="${i}" aria-label="Стъпка ${i + 1}: ${p.dataset.name}"><i>${i + 1}</i><span>${p.dataset.name}</span></button>`).join('');
  function go(i, scroll) {
    i = Math.max(0, Math.min(panels.length - 1, i));
    stepsEl.classList.toggle('back', i < cur);
    cur = i;
    panels.forEach((p, k) => p.classList.toggle('is-current', k === i));
    $$('button', stepper).forEach((b, k) => {
      b.classList.toggle('is-current', k === i); b.classList.toggle('is-done', k < i);
      b.setAttribute('aria-selected', k === i); b.querySelector('i').textContent = k < i ? '✓' : k + 1;
    });
    $('#b-prev').style.visibility = i ? '' : 'hidden';
    const next = $('#b-next');
    next.hidden = i === panels.length - 1;
    next.textContent = i === panels.length - 2 ? 'Готово ✓' : 'Напред →';
    // ако стъпките са скрити под залепения преглед — върни ги във видимото
    if (scroll && mq.matches) {
      const gap = stepsEl.getBoundingClientRect().top - pv.getBoundingClientRect().bottom - 10;
      if (gap < 0) scrollBy({ top: gap, behavior: 'smooth' });
    }
  }
  stepper.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) { go(+b.dataset.go, true); MC.sfx.tick(); } });
  $('#b-prev').addEventListener('click', () => { go(cur - 1, true); MC.sfx.tick(); });
  $('#b-next').addEventListener('click', () => {
    go(cur + 1, true); MC.sfx.tick();
    if (cur === panels.length - 1) { const r = prev.getBoundingClientRect(); MC.fx.sparks(r.left + r.width / 2, r.top + r.height * .3, 22, { color: '#f1a3b6' }); MC.sfx.chime(); }
  });
  // плъзгане наляво/надясно с пръст между стъпките
  let sw0 = null;
  stepsEl.addEventListener('pointerdown', e => { if (e.pointerType === 'touch' && mq.matches && !e.target.closest('input')) sw0 = [e.clientX, e.clientY]; });
  stepsEl.addEventListener('pointerup', e => {
    if (!sw0) return;
    const dx = e.clientX - sw0[0], dy = e.clientY - sw0[1]; sw0 = null;
    if (Math.abs(dx) > 60 && Math.abs(dy) < 45) {
      go(cur + (dx < 0 ? 1 : -1), true); MC.sfx.tick();
      swiped = true; setTimeout(() => { swiped = false; }, 60);
    }
  });
  // плъзгането не бива да „натиска“ опцията, от която е започнало
  let swiped = false;
  stepsEl.addEventListener('click', e => { if (swiped) { e.stopPropagation(); e.preventDefault(); } }, true);
  stepsEl.addEventListener('pointercancel', () => { sw0 = null; });
  go(0);

  MC.setBuilderAromas = list => { S.aromas = list.slice(0, 2); sync(); render(true); go(3); };
  sync(); render(false);

  /* ================= АРОМАТЕН БАР ================= */
  const shelf = $('#aroma-shelf');
  let mix = [], listId = 'year';
  function shelfRender() {
    shelf.innerHTML = MC.aromas[listId].map((a, i) => `
      <button class="aroma ${mix.find(m => m.n === a.n) ? 'is-on' : ''}" data-n="${a.n}" style="--c:${a.c};animation-delay:${i * 30}ms">
        <span class="notes">${a.notes}</span><span class="wisp"></span><span class="wisp"></span><span class="wisp"></span>
        <span class="aroma-jar"><span>${a.e}</span></span><b>${a.n}</b>
      </button>`).join('');
  }
  $$('.aroma-switch button').forEach(b => b.addEventListener('click', () => {
    $$('.aroma-switch button').forEach(x => x.classList.toggle('is-active', x === b));
    listId = b.dataset.list; shelfRender(); MC.sfx.tick();
    if (listId === 'xmas') MC.fx.rain('snow', 2600);
  }));
  shelf.addEventListener('click', e => {
    const b = e.target.closest('.aroma'); if (!b) return;
    const a = MC.aromas[listId].find(x => x.n === b.dataset.n);
    const i = mix.findIndex(m => m.n === a.n);
    if (i > -1) mix.splice(i, 1); else { mix.push(a); if (mix.length > 2) mix.shift(); }
    $$('.aroma', shelf).forEach(x => x.classList.toggle('is-on', !!mix.find(m => m.n === x.dataset.n)));
    if (MC.touch) { $$('.aroma.peek', shelf).forEach(x => x.classList.remove('peek')); b.classList.add('peek'); clearTimeout(b._pk); b._pk = setTimeout(() => b.classList.remove('peek'), 2200); }
    const r = b.getBoundingClientRect(); MC.fx.sparks(r.left + r.width / 2, r.top + 20, 8, { color: a.c, power: 2.5 });
    MC.sfx.tick(); mixRender();
  });

  const ADJ = [['Пекарната', 'сладко'], ['Коледа', 'коледно'], ['Джинджифил', 'джинджифилово'], ['Шоколадова бисквитка', 'бисквитено'], ['шоколад', 'шоколадово'], ['Кокос', 'кокосово'], ['Ягода', 'ягодово'], ['Роза', 'розово'], ['тютюн', 'тютюнево'], ['Вишна', 'вишнево'], ['ванилия', 'ванилово'], ['Ванилия', 'ванилово'], ['Мента', 'ментово'], ['Кафе', 'кафено'], ['Лавандула', 'лавандулово'], ['ортокал', 'портокалово'], ['Лимон', 'лимоново'], ['Тиква', 'тиквено'], ['анел', 'канелено'], ['ябълк', 'ябълково'], ['Ябълк', 'ябълково']];
  const NOUNS = ['облаче', 'изкушение', 'вълшебство', 'желание', 'удоволствие', 'бягство'];
  const adj = n => (ADJ.find(([k]) => n.includes(k)) || [0, 'сладко'])[1];
  function mixRender() {
    const [a, b] = mix;
    $('.mix-a').style.cssText = a ? `height:${b ? 50 : 100}%;background:${a.c}` : 'height:0';
    $('.mix-b').style.cssText = b ? `height:50%;bottom:50%;background:${b.c}` : 'height:0';
    let nm = 'Избери аромати от рафта ↑';
    if (a) {
      const noun = NOUNS[(a.n.length + (b ? b.n.length : 0)) % NOUNS.length];
      const A = adj(a.n);
      nm = `${A[0].toUpperCase() + A.slice(1)} ${noun}` + (b ? ` с нотка ${b.n.toLowerCase()}` : '');
    }
    $('#mix-name').textContent = nm;
    $('#mix-use').disabled = !a;
  }
  $('#mix-use').addEventListener('click', () => {
    MC.setBuilderAromas(mix.map(m => m.n));
    // добави в чиповете ако аромата е само в коледния списък
    mix.forEach(m => { if (!$(`#opt-aroma [data-a="${m.n}"]`)) $('#opt-aroma').insertAdjacentHTML('beforeend', `<button class="opt is-on" data-a="${m.n}">${m.e} ${m.n}</button>`); });
    $('#builder').scrollIntoView({ behavior: 'smooth' });
    MC.toast('✨ Миксът е в твоята свещ');
  });
  shelfRender(); mixRender();
})(window.MC);
