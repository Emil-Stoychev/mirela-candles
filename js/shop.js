/* =========================================================
   Магазин: филтри, карти със свещи, кошница
   ========================================================= */
(function (MC) {
  const { $, $$ } = MC;
  const grid = $('#products'), filters = $('#filters');

  /* ---------- филтри ---------- */
  filters.innerHTML = MC.categories.map((c, i) => `<button role="tab" data-cat="${c.id}" class="${i ? '' : 'is-active'}" aria-selected="${!i}">${c.name}</button>`).join('');
  filters.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', filters).forEach(x => { x.classList.toggle('is-active', x === b); x.setAttribute('aria-selected', x === b); });
    // на мобилно (хоризонтален скрол) центрира избрания филтър
    if (filters.scrollWidth > filters.clientWidth) filters.scrollTo({ left: b.offsetLeft - (filters.clientWidth - b.offsetWidth) / 2, behavior: 'smooth' });
    const cat = b.dataset.cat;
    $$('.p-card', grid).forEach((card, i) => {
      const show = cat === 'all' || card.dataset.cat === cat;
      card.classList.toggle('hide', !show);
      if (show) { card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop'); card.style.animationDelay = (i % 6) * 40 + 'ms'; }
    });
    MC.sfx.tick();
  });

  /* ---------- карти ---------- */
  grid.innerHTML = MC.products.map(p => `
    <article class="p-card reveal" data-id="${p.id}" data-cat="${p.cat}">
      <div class="p-visual">
        ${p.badge ? `<span class="p-badge">${p.badge}</span>` : ''}
        <button class="p-light" aria-label="Запали или угаси ${p.name}"><span class="lt-on">🔥</span><span class="lt-off">💨</span></button>
        ${MC.candle(p.look)}
      </div>
      <div class="p-body">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="p-aromas">${p.aromas.map(a => `<span>${a}</span>`).join('')}</div>
        <div class="p-foot">
          <span class="p-price"><small>от</small>${p.price} €</span>
          <button class="p-add">+ В кошницата</button>
        </div>
      </div>
    </article>`).join('');

  grid.addEventListener('click', e => {
    const card = e.target.closest('.p-card'); if (!card) return;
    const candle = $('.candle', card);
    if (e.target.closest('.p-light') || (e.target.closest('.candle[data-kind="led"]'))) { MC.toggleCandle(candle); return; }
    const add = e.target.closest('.p-add');
    if (add) {
      const p = MC.products.find(x => x.id === card.dataset.id);
      MC.cart.add({ key: p.id, name: p.name, desc: p.aromas.join(' · '), price: p.price, look: p.look }, candle);
      add.classList.add('added'); add.textContent = '✓ Добавено';
      setTimeout(() => { add.classList.remove('added'); add.textContent = '+ В кошницата'; }, 1500);
    }
  });
  // .lit клас на картата за ореола
  document.addEventListener('mc:candle', e => { const c = e.detail.el.closest('.p-card'); if (c) c.classList.toggle('lit', MC.isLit(e.detail.el)); });
  // и при тихо палене (нощен режим)
  new MutationObserver(ms => ms.forEach(m => { const c = m.target.closest && m.target.closest('.p-card'); if (c && m.target.classList.contains('candle')) c.classList.toggle('lit', m.target.classList.contains('is-lit')); }))
    .observe(grid, { subtree: true, attributes: true, attributeFilter: ['class'] });

  // лек 3D наклон на картите
  grid.addEventListener('pointermove', e => {
    const card = e.target.closest('.p-card'); if (!card || e.pointerType !== 'mouse') return;
    const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    card.style.transform = `translateY(-6px) perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
  });
  grid.addEventListener('pointerout', e => { const card = e.target.closest('.p-card'); if (card && !card.contains(e.relatedTarget)) card.style.transform = ''; });

  /* ---------- кошница ---------- */
  const drawer = $('#cart'), back = $('#drawer-backdrop'), list = $('#cart-items');
  let items = [];
  try { items = JSON.parse(MC.store.get('mc-cart') || '[]'); } catch (e) { items = []; }

  MC.cart = {
    items: () => items,
    add(item, fromEl) {
      const ex = items.find(i => i.key === item.key);
      ex ? ex.qty++ : items.push(Object.assign({ qty: 1 }, item));
      save(); fly(fromEl); MC.sfx.pop();
      MC.toast(`🕯️ ${item.name} е в кошницата`);
    },
    open() { drawer.classList.add('open'); back.classList.add('show'); drawer.setAttribute('aria-hidden', 'false'); },
    close() { drawer.classList.remove('open'); back.classList.remove('show'); drawer.setAttribute('aria-hidden', 'true'); },
    summary() { return items.map(i => `• ${i.name}${i.desc ? ' (' + i.desc + ')' : ''} ×${i.qty}`).join('\n'); },
    clear() { items = []; save(); }
  };

  function save() { MC.store.set('mc-cart', JSON.stringify(items)); render(); }
  function render() {
    const n = items.reduce((s, i) => s + i.qty, 0), total = items.reduce((s, i) => s + i.qty * i.price, 0);
    const cnt = $('#cart-count'); cnt.textContent = n; cnt.classList.toggle('has', n > 0);
    $('#cart-total').textContent = total + ' €';
    $('#cart-send').disabled = !n;
    list.innerHTML = n ? items.map((i, k) => `
      <div class="cart-item" data-k="${k}">
        <div class="cart-thumb">${MC.candle(i.look, { label: i.label })}</div>
        <div><b>${i.name}</b><small>${i.desc || ''}</small><small>${i.price} € / бр.</small></div>
        <div class="qty"><button data-d="-1" aria-label="По-малко">−</button><span>${i.qty}</span><button data-d="1" aria-label="Повече">+</button></div>
      </div>`).join('')
      : `<div class="cart-empty"><span class="big">🕯️</span>Кошницата е празна.<br>Избери си сладка свещ!</div>`;
  }
  list.addEventListener('click', e => {
    const b = e.target.closest('[data-d]'); if (!b) return;
    const k = +b.closest('.cart-item').dataset.k;
    items[k].qty += +b.dataset.d;
    if (items[k].qty <= 0) items.splice(k, 1);
    save();
  });
  function fly(el) {
    const btn = $('#cart-btn'); btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump');
    if (!el) return;
    const r = el.getBoundingClientRect(), t = btn.getBoundingClientRect();
    const f = el.cloneNode(true); f.classList.add('fly');
    Object.assign(f.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px' });
    document.body.appendChild(f);
    requestAnimationFrame(() => {
      const s = 30 / r.width;
      f.style.transform = `translate(${t.left + t.width / 2 - r.left - r.width / 2}px, ${t.top + t.height / 2 - r.top - r.height / 2}px) scale(${s}) rotate(20deg)`;
      f.style.opacity = '.3';
    });
    setTimeout(() => { f.remove(); MC.fx.hearts(t.left + t.width / 2, t.top + t.height / 2, 6); }, 800);
  }
  $('#cart-btn').addEventListener('click', MC.cart.open);
  $('#cart-close').addEventListener('click', MC.cart.close);
  back.addEventListener('click', MC.cart.close);
  addEventListener('keydown', e => { if (e.key === 'Escape') MC.cart.close(); });
  $('#cart-send').addEventListener('click', () => {
    MC.cart.close();
    MC.fillOrder && MC.fillOrder(MC.cart.summary());
  });
  render();
})(window.MC);
