/* =========================================================
   Main: навигация, поводи, scroll история, за мен, поръчка
   ========================================================= */
(function (MC) {
  const { $, $$ } = MC;

  /* ---------- nav ---------- */
  const nav = $('#nav'), links = $('#nav-links'), burger = $('#burger');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 30);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  burger.addEventListener('click', () => {
    const open = !links.classList.contains('open');
    links.classList.toggle('open', open); nav.classList.toggle('menu-open', open); burger.setAttribute('aria-expanded', open);
  });
  links.addEventListener('click', e => { if (e.target.closest('a')) { links.classList.remove('open'); nav.classList.remove('menu-open'); burger.setAttribute('aria-expanded', false); } });
  const sb = $('#sound-btn');
  const syncSound = () => { sb.setAttribute('aria-pressed', MC.sound.on); sb.setAttribute('aria-label', MC.sound.on ? 'Изключи звука' : 'Включи звука'); };
  sb.addEventListener('click', () => { MC.sound.toggle(); syncSound(); }); syncSound();

  /* ---------- лого: пламъчето на „i“ ---------- */
  const logo = $('#logo'), lw = $('.logo-wick', logo);
  $$('.logo-sub', logo).forEach(el => { el.innerHTML = [...el.textContent].map((c, i) => `<b style="--i:${i}">${c}</b>`).join(''); });
  let relightT, waveT;
  const lwPoint = () => { const r = lw.getBoundingClientRect(); return [r.left, r.top]; };
  function logoLight(fx) {
    if (!MC.lightWick(lw, true)) return;
    if (fx) { const [x, y] = lwPoint(); MC.fx.sparks(x, y, 12, { power: 2.5 }); MC.sfx.light(); }
  }
  // угасено от вятъра → само се пали отново след малко; запалено с кибрит → звук
  logo.addEventListener('mc:wick', e => {
    clearTimeout(relightT);
    if (e.detail) MC.sfx.light();
    else relightT = setTimeout(() => logoLight(true), 3200);
  });
  logo.addEventListener('click', () => {
    clearTimeout(relightT);
    if (!lw.classList.contains('on')) logoLight(true);
    else {
      lw.classList.add('flare'); setTimeout(() => lw.classList.remove('flare'), 380);
      const [x, y] = lwPoint(); MC.fx.sparks(x, y - 8, 10, { power: 2 }); MC.sfx.pop();
    }
    logo.classList.remove('wave'); void logo.offsetWidth; logo.classList.add('wave');
    clearTimeout(waveT); waveT = setTimeout(() => logo.classList.remove('wave'), 1000);
  });
  document.addEventListener('mc:loaded', () => setTimeout(() => logoLight(true), 450));

  /* ---------- плаващ кибрит (след hero) ---------- */
  const fab = $('#fab-match');
  new IntersectionObserver(([en]) => fab.classList.toggle('show', !en.isIntersecting), { threshold: .05 }).observe($('.hero'));
  // на мобилно/таблет кибритът се крие в работилницата, за да не пречи на бутоните „Назад/Напред“
  const narrow = matchMedia('(max-width: 980px)');
  new IntersectionObserver(([en]) => document.body.classList.toggle('fab-off', en.isIntersecting && narrow.matches), { rootMargin: '-20% 0px -20% 0px' }).observe($('.builder-wrap'));
  const fabTake = () => {
    MC.match.take(true);
    MC.toast(MC.touch ? '🔥 Влачи запалената клечка с пръст до фитил' : '🔥 Имаш запалена клечка! Доближи я до фитил. (Esc за да я пуснеш)', 3200);
  };
  fab.addEventListener('pointerdown', e => {
    e.preventDefault();
    if (e.pointerType === 'touch') MC.match.grab(e);
    fabTake();
  });
  // клавиатура (Enter/Space)
  fab.addEventListener('click', e => {
    if (e.detail !== 0) return;
    const r = fab.getBoundingClientRect(); MC.ptr.x = r.left + r.width / 2; MC.ptr.y = r.top;
    fabTake();
  });

  /* ---------- поводи ---------- */
  const occ = $('#occ-grid');
  occ.innerHTML = MC.occasions.map(o => `<button class="occ reveal" data-fx="${o.fx}"><span class="occ-e">${o.e}</span><h3>${o.name}</h3><p>${o.text}</p></button>`).join('');
  occ.addEventListener('click', e => {
    const b = e.target.closest('.occ'); if (!b) return;
    MC.fx.rain(b.dataset.fx, 3400); MC.sfx.chime();
    b.classList.remove('boom'); void b.offsetWidth; b.classList.add('boom');
  });

  /* ---------- scroll история: как се прави свещ ---------- */
  const stage = $('#story-stage');
  const blobs = [[-56, 6, 15], [-34, -2, 18], [-8, -6, 20], [18, -2, 19], [44, 2, 16], [62, 8, 12], [-46, -16, 13], [-18, -22, 15], [10, -24, 15], [36, -16, 13], [-4, -36, 12]];
  stage.innerHTML = `<div class="story-box" style="position:relative;height:100%;aspect-ratio:3/4;max-width:100%;margin:0 auto">
    <svg viewBox="0 0 300 400" aria-hidden="true">
      <defs><clipPath id="st-clip"><path d="M85,155 L215,155 L203.5,359 Q203,366 195,366 L105,366 Q97,366 96.5,359 Z"/></clipPath></defs>
      <g transform="translate(32,0)"><g id="st-pitcher" style="transform-origin:96px 52px"><path d="M40,30 L104,30 L98,92 Q96,100 86,100 L58,100 Q48,100 46,92 Z" fill="#f4ede6" stroke="#cdbfb3" stroke-width="2"/>
        <path d="M104,34 L118,40 L104,48" fill="#f4ede6" stroke="#cdbfb3" stroke-width="2"/><path d="M40,44 Q22,50 28,70 Q32,80 44,78" fill="none" stroke="#cdbfb3" stroke-width="5"/>
        <rect x="46" y="40" width="54" height="14" fill="#e7577a" id="st-pitch-wax" opacity=".9"/></g></g>
      <rect id="st-stream" x="146" y="60" width="8" height="0" rx="4" fill="#e7577a"/>
      <g id="st-dropper" opacity="0" style="transition:opacity .3s"><rect x="183" y="40" width="14" height="44" rx="5" fill="#fff" stroke="#cdbfb3" stroke-width="2"/><rect x="179" y="26" width="22" height="18" rx="7" fill="#e0607e"/><path d="M186,84 L190,100 L194,84Z" fill="#cdbfb3"/></g>
      ${[0, 1, 2].map(i => `<path class="st-drop" d="M0,-8 Q6,0 0,6 Q-6,0 0,-8Z" fill="#f2c17a" opacity="0"/>`).join('')}
      <path d="M80,150 L220,150 L208,362 Q207,372 196,372 L104,372 Q93,372 92,362 Z" fill="rgba(255,255,255,.08)"/>
      <!-- фитилът е зад восъка: вижда се само над него -->
      <path d="M150,364 Q152,240 150,96" stroke="#3b2a22" stroke-width="3" fill="none"/><rect x="143" y="360" width="14" height="5" rx="1" fill="#9a9a9a"/>
      <g clip-path="url(#st-clip)">
        <rect id="st-l1" x="80" y="366" width="140" height="0" fill="#e7577a"/>
        <rect id="st-l2" x="80" y="366" width="140" height="0" fill="#c98d63"/>
        <g id="st-crumbs" opacity="0">${Array.from({ length: 34 }, () => `<circle cx="${(95 + Math.random() * 110).toFixed(1)}" cy="0" r="${(1.5 + Math.random() * 2.5).toFixed(1)}" fill="${Math.random() > .5 ? '#a8714f' : '#e3b48a'}"/>`).join('')}</g>
        <rect id="st-l3" x="80" y="366" width="140" height="0" fill="#f6b8c8"/>
        <ellipse id="st-ripple" cx="190" cy="366" rx="0" ry="0" fill="none" stroke="#f2c17a" stroke-width="2" opacity="0"/>
      </g>
      <path d="M80,150 L220,150 L208,362 Q207,372 196,372 L104,372 Q93,372 92,362 Z" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="2.5"/>
      <path d="M92,160 L100,350" stroke="#fff" stroke-width="5" opacity=".25" stroke-linecap="round"/>
      ${blobs.map(b => `<circle class="st-blob" cx="${150 + b[0]}" cy="${152 + b[1]}" r="${b[2]}" fill="#fbd3dc" stroke="#efb9c6" stroke-width="1.5" style="transform-box:fill-box;transform-origin:center;transform:scale(0)"/>`).join('')}
      <g id="st-berries" opacity="0">
        <g class="st-berry"><path d="M0,-11 C11,-13 16,-2 11,7 C7,13 2,18 0,20 C-2,18 -7,13 -11,7 C-16,-2 -11,-13 0,-11Z" fill="#e2323f"/><path d="M0,-11 L-8,-17 L-2,-12 L-3,-20 L1,-12 L6,-19 L3,-11 L10,-13Z" fill="#3f9b47"/></g>
        <g class="st-berry"><path d="M0,-11 C11,-13 16,-2 11,7 C7,13 2,18 0,20 C-2,18 -7,13 -11,7 C-16,-2 -11,-13 0,-11Z" fill="#e2323f"/><path d="M0,-11 L-8,-17 L-2,-12 L-3,-20 L1,-12 L6,-19 L3,-11 L10,-13Z" fill="#3f9b47"/></g>
      </g>
      <g id="st-label" style="transform-box:fill-box;transform-origin:center;transform:scale(0)"><circle cx="150" cy="292" r="26" fill="#fffaf8" stroke="#f1c3cd" stroke-width="2"/>
        <text x="150" y="290" text-anchor="middle" font-family="Great Vibes" font-size="15" fill="#b0405a">Handmade</text><text x="150" y="305" text-anchor="middle" font-family="Great Vibes" font-size="12" fill="#b0405a">with love</text></g>
      <g id="st-scents" font-size="20" text-anchor="middle"><text x="118" y="300" opacity="0">🍓</text><text x="184" y="300" opacity="0">🍪</text><text x="150" y="300" opacity="0">✨</text></g>
    </svg>
    <span class="wick" id="st-wick" style="left:50%;top:24%"><span class="flame" style="--fw:20px"><i></i></span></span>
  </div>`;
  const q = s => stage.querySelector(s);
  // височини на слоевете: горният стига до ~164, точно под „сметаната“ (иначе тя виси във въздуха)
  const L = [q('#st-l1'), q('#st-l2'), q('#st-l3')], H = [80, 56, 66];
  const seg = (p, a, b) => Math.max(0, Math.min(1, (p - a) / (b - a)));
  const steps = $$('#story-steps li'), story = $('#story');
  // изричен номер: скритите на мобилно (display:none) стъпки не броят в CSS counter
  steps.forEach((li, i) => { li.dataset.n = i + 1; });
  const drops = $$('.st-drop', stage), scents = $$('#st-scents text', stage), blobEls = $$('.st-blob', stage), berries = $$('.st-berry', stage);
  const crumbs = q('#st-crumbs');
  let lastStep = -1;
  function storyTick() {
    const r = story.getBoundingClientRect(), total = r.height - innerHeight;
    const p = Math.max(0, Math.min(1, -r.top / total));
    const f = [seg(p, .03, .17), seg(p, .36, .48), seg(p, .48, .6)];
    let y = 366;
    L.forEach((el, i) => { const h = H[i] * f[i]; y -= h; el.setAttribute('y', y); el.setAttribute('height', h); });
    crumbs.setAttribute('opacity', f[1] > 0 ? 1 : 0);
    const c1 = 366 - H[0], c2 = c1 - H[1];
    $$('circle', crumbs).forEach((c, i) => c.setAttribute('cy', (c2 + 4 + (i * 7.3 % (H[1] - 6)) + (1 - f[1]) * 40).toFixed(1)));
    // кана + струя
    const pouring = [0, 1, 2].find(i => f[i] > 0 && f[i] < 1);
    const col = ['#e7577a', '#c98d63', '#f6b8c8'][pouring === undefined ? 0 : pouring];
    q('#st-pitcher').style.transform = `rotate(${pouring !== undefined ? 38 : 0}deg)`;
    q('#st-pitcher').style.transition = 'transform .5s, opacity .5s';
    q('#st-pitcher').style.opacity = p > .62 ? 0 : 1; // след последния слой каната си отива
    q('#st-pitch-wax').setAttribute('fill', col);
    const st = q('#st-stream');
    st.setAttribute('fill', col);
    st.setAttribute('height', pouring !== undefined ? Math.max(0, y - 62) : 0);
    // аромат
    const ap = seg(p, .18, .36);
    q('#st-dropper').setAttribute('opacity', ap > 0 && ap < 1 ? 1 : 0);
    // капките падат от капкомера право в разтопения восък, с кръгче при удара
    let ripple = -1;
    drops.forEach((d, i) => {
      const t = ap * 3 - i, on = t > 0 && t < 1;
      d.setAttribute('opacity', on ? 1 : 0);
      d.setAttribute('transform', `translate(190,${104 + Math.min(t, 1) * (y - 108)})`);
      if (t >= 1 && t < 1.7 && ap < 1) ripple = (t - 1) / .7;
    });
    const rp = q('#st-ripple');
    rp.setAttribute('cy', y + 1);
    rp.setAttribute('rx', ripple < 0 ? 0 : (4 + ripple * 16).toFixed(1));
    rp.setAttribute('ry', ripple < 0 ? 0 : (1.5 + ripple * 4).toFixed(1));
    rp.setAttribute('opacity', ripple < 0 ? 0 : (1 - ripple).toFixed(2));
    // ароматът се издига от восъка нагоре, извън чашата
    scents.forEach((s, i) => { const t = seg(p, .22 + i * .04, .42 + i * .04); s.setAttribute('opacity', (Math.sin(t * Math.PI)).toFixed(2)); s.setAttribute('transform', `translate(0,${(y - 6 - 300 - t * 120).toFixed(1)})`); });
    // декорация
    blobEls.forEach((b, i) => { const t = seg(p, .6 + i * .012, .64 + i * .012); b.style.transform = `scale(${t < 1 ? t * 1.1 : 1})`; });
    const bp = seg(p, .74, .82);
    q('#st-berries').setAttribute('opacity', bp > 0 ? 1 : 0);
    berries[0].setAttribute('transform', `translate(122,${-40 + bp * 166}) rotate(-15)`);
    berries[1].setAttribute('transform', `translate(178,${-80 + bp * 210}) rotate(18)`);
    q('#st-label').style.transform = `scale(${seg(p, .82, .88)})`;
    const w = q('#st-wick');
    if (p > .93) MC.lightWick(w, true); else if (w.classList.contains('on') && p < .9) MC.snuffWick(w, true);
    // стъпки
    const step = p < .18 ? 0 : p < .36 ? 1 : p < .6 ? 2 : p < .82 ? 3 : 4;
    if (step !== lastStep) {
      lastStep = step;
      steps.forEach((li, i) => { li.classList.toggle('on', i === step); li.classList.toggle('done', i < step); li.classList.toggle('next', i === step + 1); });
    }
  }
  let sRaf = 0;
  addEventListener('scroll', () => { if (!sRaf) sRaf = requestAnimationFrame(() => { sRaf = 0; storyTick(); }); }, { passive: true });
  addEventListener('resize', storyTick); storyTick();

  /* ---------- полароид (слънчоглед + свещ) ---------- */
  const petals = Array.from({ length: 22 }, (_, i) => `<ellipse cx="0" cy="-52" rx="11" ry="30" fill="${i % 2 ? '#f7c531' : '#f2b01e'}" transform="rotate(${i * 360 / 22})"/>`).join('');
  $('#polaroid-img').innerHTML = `<svg viewBox="0 0 400 500" style="position:absolute;inset:0;width:100%;height:100%">
      <g transform="translate(300,120)" opacity=".95"><g class="sun-spin">${petals}</g><circle r="38" fill="#6b3d1f"/><circle r="28" fill="#4a2a14"/></g>
      <g transform="translate(90,90) scale(.55)" opacity=".7"><g>${petals}</g><circle r="38" fill="#6b3d1f"/></g>
      <path d="M300,160 Q290,330 260,500" stroke="#4f8a3a" stroke-width="10" fill="none"/><path d="M290,300 Q340,270 360,300 Q330,320 290,300Z" fill="#5f9b45"/>
    </svg>
    <div style="position:absolute;left:14%;bottom:4%;width:56%">${MC.candle(MC.products.find(p => p.id === 'red-velvet').look)}</div>`;
  setTimeout(() => { const c = $('#polaroid-img .candle'); if (c) MC.lightCandle(c, true); }, 600);

  /* ---------- Instagram лента ---------- */
  const tiles = MC.products.filter(p => p.look.vessel !== 'bouquet').slice(0, 10);
  $('#insta-row').innerHTML = [...tiles, ...tiles].map(p => `<a class="insta-tile" href="${MC.contact.instagram}" target="_blank" rel="noopener" aria-label="${p.name} в Instagram">${MC.candle(p.look)}</a>`).join('');

  /* ---------- поръчка ---------- */
  const form = $('#order-form'), fItems = $('#f-items');
  const allAromas = [...new Set([...MC.aromas.year, ...MC.aromas.xmas].map(a => a.n))];
  $('#f-aroma').insertAdjacentHTML('beforeend', allAromas.map(a => `<option>${a}</option>`).join(''));
  const today = new Date(); $('#f-date').min = today.toISOString().slice(0, 10);

  MC.fillOrder = function (text) {
    if (text) { fItems.value = text; fItems.classList.remove('filled'); void fItems.offsetWidth; fItems.classList.add('filled'); }
    $('#order').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => form.querySelector('[name="name"]').focus({ preventScroll: true }), 900);
  };
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    $$('.field', form).forEach(f => f.classList.remove('err'));
    const chk = (name, test) => { const el = form.elements[name]; if (!test(el.value.trim())) { el.closest('.field').classList.add('err'); ok = false; } };
    chk('name', v => v.length > 1);
    chk('phone', v => v.replace(/\D/g, '').length >= 6);
    chk('items', v => v.length > 2);
    if (!ok) { MC.toast('Попълни полетата, отбелязани с * 🙂'); return; }
    // ДЕМО: тук ще се изпраща към бекенда (имейл / Viber / Telegram); лоудърът е глобалният
    MC.loader.show('Изпращам поръчката…');
    setTimeout(() => {
      MC.loader.hide();
      $('#success-title').textContent = `Благодаря, ${form.elements.name.value.trim().split(' ')[0]}! 💕`;
      $('#form-success').hidden = false;
      MC.sfx.chime(); MC.fx.rain('confetti', 2600);
      MC.cart.clear && MC.cart.clear();
    }, 1200);
  });
  $('#success-close').addEventListener('click', () => { form.reset(); $('#form-success').hidden = true; });

  /* ---------- FAQ: плавно отваряне/затваряне (само един отворен) ---------- */
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const faqs = $$('.faq-list details');
  function setFaq(d, open) {
    const sum = $('summary', d);
    const from = d.getBoundingClientRect().height;   // текуща височина (и по средата на анимация)
    if (d._anim) { d._anim.cancel(); d._anim = null; }
    d.classList.toggle('is-open', open);
    if (open) d.open = true;
    const to = open ? d.getBoundingClientRect().height : sum.getBoundingClientRect().height;
    if (reduce.matches) { if (!open) d.open = false; return; }
    d._anim = d.animate({ height: [from + 'px', to + 'px'] }, { duration: open ? 420 : 340, easing: 'cubic-bezier(.2, .8, .2, 1)' });
    d._anim.onfinish = () => { d._anim = null; if (!open) d.open = false; };
  }
  faqs.forEach(d => {
    if (d.open) d.classList.add('is-open');
    $('summary', d).addEventListener('click', e => {
      e.preventDefault();
      const open = !d.classList.contains('is-open');
      if (open) faqs.forEach(o => { if (o !== d && o.classList.contains('is-open')) setFaq(o, false); });
      setFaq(d, open);
      MC.sfx.tick();
    });
  });

  /* ---------- reveal ---------- */
  MC.observeReveal(document);
})(window.MC);
