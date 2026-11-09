/* =========================================================
   Hero: кибрит, кутийка, подсказки, затопляне на сцената
   ========================================================= */
(function (MC) {
  const { $, $$ } = MC;
  const byId = id => MC.products.find(p => p.id === id).look;
  const table = $('#hero-table');
  const set = [['daiquiri', 'hc-1'], ['strawberry-cup', 'hc-2'], ['red-velvet', 'hc-3'], ['bear', 'hc-4']];
  table.innerHTML = set.map(([id, cls]) => `<div class="hc ${cls}">${MC.candle(byId(id))}</div>`).join('');

  const hero = $('.hero'), box = $('#matchbox'), strike = $('#mb-strike');
  const hint = $('#hero-hint'), hStep = $('#hint-step'), hText = $('#hint-text');
  const wicks = () => $$('.wick', table);
  let celebrated = false, lastKey = '';

  function setHint(step, text, done) {
    const key = step + text;
    if (key === lastKey) return; lastKey = key;
    hStep.textContent = step; hText.textContent = text;
    hint.classList.toggle('done', !!done);
    hint.classList.remove('flash'); void hint.offsetWidth; hint.classList.add('flash');
  }

  function update() {
    const all = wicks(), lit = all.filter(w => w.classList.contains('on')).length;
    hero.style.setProperty('--warm', (lit / all.length).toFixed(2));
    const st = MC.match.state;
    box.classList.toggle('ready', st === 'unlit');
    box.classList.toggle('grabbed', st !== 'none');
    if (lit === all.length) {
      setHint('✓', MC.touch ? 'Уютно е, нали? ✨' : 'Уютно е, нали? Мини бързо с мишката над пламък 🌬️', true);
      if (!celebrated) {
        celebrated = true;
        const r = table.getBoundingClientRect();
        MC.fx.sparks(r.left + r.width / 2, r.top + r.height * .3, 40, { power: 6 });
        MC.sfx.chime();
      }
    } else {
      celebrated = false;
      const t = MC.touch;
      if (st === 'none') setHint('1', lit ? (t ? 'Хвани нова клечка и запали останалите' : 'Вземи нова клечка и запали останалите') : (t ? 'Хвани клечка от кутийката и я влачи 👇' : 'Вземи клечка от кутийката'));
      else if (st === 'unlit') setHint('2', t ? 'Драсни я бързо по кутийката ↘' : 'Драсни я бързо по тъмната лента ↘');
      else setHint(lit ? '4' : '3', lit ? `Браво! ✨ Остават още ${all.length - lit}` : (t ? 'Влачи пламъка до фитила 🕯️' : 'Доближи пламъка до фитила 🕯️'));
    }
  }
  document.addEventListener('mc:candle', update);
  document.addEventListener('mc:match', update);

  /* кутийката */
  box.addEventListener('pointerdown', e => {
    e.preventDefault();
    const onStrike = e.target === strike;
    if (e.pointerType === 'touch') {
      // с пръст: хващаш клечка и я влачиш; драсваш я по кутийката, после до фитила
      MC.match.grab(e);
      if (MC.match.state === 'none') { MC.match.take(false); MC.sfx.tick(); }
      return;
    }
    if (MC.match.state === 'none') {
      MC.match.take(onStrike);
      MC.sfx.tick();
    } else if (MC.match.state === 'unlit' && onStrike) MC.match.ignite();
  });
  box.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    const r = box.getBoundingClientRect();
    MC.ptr.x = r.left + r.width / 2; MC.ptr.y = r.top;
    if (MC.match.state === 'none') MC.match.take(true);
  });
  strike.addEventListener('click', () => { if (MC.match.state === 'unlit') MC.match.ignite(); });

  /* запали / угаси всички */
  const allBtn = $('#light-all');
  const allLit = () => $$('.wick.on', table).length === wicks().length;
  allBtn.addEventListener('click', () => {
    if (allLit()) $$('.wick.on', table).forEach((w, i) => setTimeout(() => { w.classList.add('gust'); setTimeout(() => MC.snuffWick(w), 260); }, i * 90));
    else $$('.candle', table).forEach((c, i) => setTimeout(() => MC.lightCandle(c), i * 260));
  });
  document.addEventListener('mc:candle', () => { allBtn.textContent = allLit() ? '💨 Угаси всички' : '✨ Запали всички'; });

  /* един път: съобщение при угасяне с мишката */
  let windTold = false;
  document.addEventListener('mc:candle', e => {
    if (!e.detail.lit && MC.wind && !windTold) { windTold = true; MC.toast('Фууу! Угаси я с мишката 😄 По-бавно около пламъка'); }
  });

  update();
})(window.MC);
