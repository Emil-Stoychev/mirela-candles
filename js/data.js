/* =========================================================
   Mirela Candles — данни (продукти, аромати, поводи)
   Всичко тук е лесно за редакция без да пипаш логиката.
   Цените са примерни — да се уточнят с Мирела.
   ========================================================= */
window.MC = window.MC || {};

MC.contact = {
  phone: '0884625259',
  phoneIntl: '+359884625259',
  instagram: 'https://www.instagram.com/mirela_candles/',
  handle: '@mirela_candles'
};

/* Цветове на восъка (използват се и в конструктора) */
MC.wax = {
  pink:      { name: 'Розово облаче',  c: '#f2a7bb' },
  berry:     { name: 'Ягодово червено', c: '#e0394f' },
  choco:     { name: 'Шоколад',        c: '#7a4a3a' },
  vanilla:   { name: 'Ванилия',        c: '#f6ead6' },
  lavender:  { name: 'Лавандула',      c: '#b79ad9' },
  mint:      { name: 'Матча',          c: '#8fbf6a' },
  hawaii:    { name: 'Синя Хавай',     c: '#4fb6e3' },
  caramel:   { name: 'Карамел',        c: '#d99a55' }
};

/* Каталог — по нейните реални продукти от Instagram */
MC.products = [
  {
    id: 'red-velvet', name: 'Червено кадифе', cat: 'jar',
    desc: 'Свещ-сладкиш в бурканче със сметанов восък, ягоди и сърце.',
    aromas: ['Кокосов трюфел', 'Шоколадова бисквитка'], price: 22, badge: 'Хит',
    look: { vessel: 'jar', wax: ['#f7efe6', 'crumb:#c98d63', '#e0394f'], cream: '#fff3f1', toppings: ['strawberry', 'heart', 'waffle'], ribbon: '#ffffff' }
  },
  {
    id: 'strawberry-cup', name: 'Ягодов сладкиш в чаша', cat: 'cup',
    desc: 'Розови слоеве, бисквитени трохи и пухкава „сметана“ отгоре.',
    aromas: ['Шоколадова бисквитка', 'Ванилия с кокос'], price: 20,
    look: { vessel: 'cup', wax: ['#e7577a', 'crumb:#c98d63', '#f6b8c8'], cream: '#fbd3dc', toppings: ['strawberry', 'chocobear', 'macaron'] }
  },
  {
    id: 'hot-choco', name: 'Топъл шоколад', cat: 'cup',
    desc: 'За любителите на какаото — шоколад, гофрета и шоколадово мече.',
    aromas: ['Ванилия', 'Шоколад'], price: 20,
    look: { vessel: 'cup', wax: ['#6e3f31', 'crumb:#a8714f', '#8a5642'], cream: '#f6ead6', toppings: ['waffle', 'chocobear', 'strawberry'] }
  },
  {
    id: 'blue-hawaii', name: 'Синя Хавай', cat: 'cocktail',
    desc: 'Свещ-коктейл с кристален „лед“ и синя панделка.',
    aromas: ['Кокос с ванилия'], price: 24, badge: 'Коктейл',
    look: { vessel: 'coupe', wax: ['#3fa6db', '#6cc6ee'], toppings: ['ice'], ribbon: '#2f8fd8' }
  },
  {
    id: 'pornstar', name: 'Порнстар Мартини', cat: 'cocktail',
    desc: 'С маракуя — оранжево-розов залез в чаша.',
    aromas: ['Портокал', 'Само ванилия'], price: 24,
    look: { vessel: 'coupe', wax: ['#f39a3b', '#f47a86'], toppings: ['orange'], ribbon: '#fde6ea' }
  },
  {
    id: 'daiquiri', name: 'Ягодово Дайкири', cat: 'cocktail',
    desc: 'Две ягодки, червена панделка и аромат на лято.',
    aromas: ['Ягода'], price: 24,
    look: { vessel: 'coupe', wax: ['#d9233d', '#ee4b5f'], toppings: ['strawberry'], ribbon: '#d01f36' }
  },
  {
    id: 'manhattan', name: 'Мартини с череши', cat: 'cocktail',
    desc: 'Класически Манхатън с две восъчни черешки.',
    aromas: ['Вишна'], price: 24,
    look: { vessel: 'martini', wax: ['#7d1230', '#c42a4c'], toppings: ['cherry'], ribbon: '#d01f36' }
  },
  {
    id: 'matcha', name: 'Айс матча с ягода', cat: 'drink',
    desc: 'Стъклена кенче-чаша със сламка — матча върху ягодово пюре.',
    aromas: ['Мента', 'Ягода'], price: 22,
    look: { vessel: 'can', wax: ['#d8324b', '#8fbf6a', '#a7cf86'], toppings: ['ice'], straw: '#ffffff' }
  },
  {
    id: 'pumpkin-latte', name: 'Ледено тиквено лате', cat: 'drink',
    desc: 'Есенната напитка, която не изстива — само ухае.',
    aromas: ['Тиква', 'Канела и ябълка'], price: 22, badge: 'Есен',
    look: { vessel: 'can', wax: ['#e98b3a', '#f2b47a', '#f8e6d2'], toppings: ['ice'], straw: '#f3d2b5' }
  },
  {
    id: 'iced-coffee', name: 'Айс кафе', cat: 'drink',
    desc: 'За човека, който не може без кафе сутрин (и вечер).',
    aromas: ['Кафе', 'Само ванилия'], price: 22,
    look: { vessel: 'can', wax: ['#6d4434', '#a8775c', '#efe0cf'], toppings: ['ice'], straw: '#e9d9c9' }
  },
  {
    id: 'blueberry', name: 'Боровинков облак', cat: 'cup',
    desc: 'Лавандулово-син десерт с боровинки и бисквитен слой.',
    aromas: ['Лавандула', 'Само ванилия'], price: 20,
    look: { vessel: 'cup', wax: ['#6f74d6', 'crumb:#c98d63', '#9da2ee'], cream: '#cfc6f3', toppings: ['blueberry'] }
  },
  {
    id: 'xmas-jar', name: 'Коледа в бурканче', cat: 'jar',
    desc: 'Джинджифилово човече, портокалово резенче и шоколад.',
    aromas: ['Джинджифилова бисквитка с карамел'], price: 22, badge: 'Коледа',
    look: { vessel: 'jar', wax: ['#6e3f31', 'crumb:#c98d63', '#f7efe6'], cream: '#fffaf3', toppings: ['gingerbread', 'orange', 'waffle'], ribbon: '#c8102e' }
  },
  {
    id: 'bouquet', name: 'Светещ букет в кутия', cat: 'gift',
    desc: 'Рози от ароматен восък в кутия с LED лампички. Натисни го!',
    aromas: ['Ягода', 'Ванилия с кокос'], price: 45, badge: 'Светещ',
    look: { vessel: 'bouquet', flowers: ['#f06d8f', '#f9b6c6', '#ffffff', '#e0394f'], box: '#f6c9d2', ribbon: '#ffffff' }
  },
  {
    id: 'bear', name: 'Мече-свещ', cat: 'gift',
    desc: 'Пухкаво восъчно мече — най-сладкият малък подарък.',
    aromas: ['Ягода'], price: 9,
    look: { vessel: 'bear', wax: ['#f39ab3'] }
  },
  {
    id: 'bowl', name: 'Гипсова купа с рози', cat: 'gift',
    desc: 'Ароматен восък с плаващи восъчни рози и три фитила.',
    aromas: ['Роза', 'Само ванилия'], price: 32,
    look: { vessel: 'bowl', wax: ['#f3b7c6'], flowers: ['#b8325a', '#f39a3b', '#d94a6a', '#f39a3b', '#b8325a'] }
  }
];

MC.categories = [
  { id: 'all', name: 'Всички' },
  { id: 'cup', name: 'В чаша' },
  { id: 'jar', name: 'В бурканче' },
  { id: 'cocktail', name: 'Коктейли' },
  { id: 'drink', name: 'Напитки' },
  { id: 'gift', name: 'Букети & подаръци' }
];

/* Нейните ароматни карти (от закачените постове) */
MC.aromas = {
  year: [
    { n: 'Шоколадова бисквитка', e: '🍪', c: '#b67a52', notes: 'какао · масло · топла бисквита' },
    { n: 'Кокос с ванилия', e: '🥥', c: '#efe3cf', notes: 'кокосово мляко · бурбон ванилия' },
    { n: 'Само шоколад', e: '🍫', c: '#6b3d2e', notes: 'тъмен шоколад · какаово зърно' },
    { n: 'Ягода', e: '🍓', c: '#e0394f', notes: 'узрели ягоди · сметана' },
    { n: 'Роза', e: '🌹', c: '#d94a6a', notes: 'рози · зелени листа · мед' },
    { n: 'Ванилия и тютюн', e: '🍂', c: '#a9744a', notes: 'тютюнев лист · ванилия · дърво' },
    { n: 'Вишна', e: '🍒', c: '#9c1b3a', notes: 'сочна вишна · бадем' },
    { n: 'Само ванилия', e: '🍦', c: '#f3e2b8', notes: 'мека, кремообразна ванилия' },
    { n: 'Мента', e: '🌿', c: '#8fcfa8', notes: 'свежа мента · лайм' },
    { n: 'Кафе', e: '☕', c: '#6d4434', notes: 'прясно смляно кафе · карамел' },
    { n: 'Лавандула', e: '🪻', c: '#b79ad9', notes: 'лавандулово поле · бергамот' },
    { n: 'Портокал', e: '🍊', c: '#f39a3b', notes: 'сочен портокал · кора' },
    { n: 'Лимон', e: '🍋', c: '#f3d34a', notes: 'лимонов сладкиш · захар' },
    { n: 'Тиква', e: '🎃', c: '#e98b3a', notes: 'тиквен пай · индийско орехче' },
    { n: 'Канела и ябълка', e: '🍎', c: '#c8433a', notes: 'печена ябълка · канела' },
    { n: 'Кокосов трюфел', e: '🤍', c: '#f7efe6', notes: 'бял шоколад · кокос · трюфел' }
  ],
  xmas: [
    { n: 'Пекарната на Дядо Коледа', e: '🎅', c: '#c8102e', notes: 'сладки · масло · захарен прашец' },
    { n: 'Коледа', e: '🎄', c: '#2f7a4f', notes: 'бор · канела · портокал' },
    { n: 'Канелени ролца', e: '🥐', c: '#c98d63', notes: 'канела · глазура · тесто' },
    { n: 'Джинджифилова бисквитка с карамел', e: '🍪', c: '#b8733a', notes: 'джинджифил · карамел · мед' },
    { n: 'Ябълков пай', e: '🥧', c: '#d99a55', notes: 'ябълки · кора · ванилия' },
    { n: 'Печена ябълка', e: '🍎', c: '#b8323a', notes: 'карамелизирана ябълка' },
    { n: 'Сладък портокал', e: '🍊', c: '#f39a3b', notes: 'портокал · карамфил' },
    { n: 'Само канела', e: '✨', c: '#a0522d', notes: 'топла канела' },
    { n: 'Шоколадова бисквитка', e: '🍪', c: '#b67a52', notes: 'какао · масло · топла бисквита' },
    { n: 'Само шоколад', e: '🍫', c: '#6b3d2e', notes: 'тъмен шоколад' },
    { n: 'Ванилия и тютюн', e: '🍂', c: '#a9744a', notes: 'тютюнев лист · ванилия' },
    { n: 'Кафе', e: '☕', c: '#6d4434', notes: 'прясно смляно кафе' },
    { n: 'Тиква', e: '🎃', c: '#e98b3a', notes: 'тиквен пай' },
    { n: 'Канела и ябълка', e: '🍎', c: '#c8433a', notes: 'печена ябълка · канела' },
    { n: 'Лимон', e: '🍋', c: '#f3d34a', notes: 'лимонов сладкиш' },
    { n: 'Само ванилия', e: '🍦', c: '#f3e2b8', notes: 'кремообразна ванилия' }
  ]
};

/* Поводи — всеки пуска свой ефект по екрана */
MC.occasions = [
  { id: 'xmas', name: 'Коледа', e: '🎄', fx: 'snow', text: 'Свещи в чаша с джинджифилови човечета, гипсови купи с елхички и шишарки.' },
  { id: 'valentine', name: 'Свети Валентин', e: '❤️', fx: 'hearts', text: 'Светещо сърце с надпис „Обичам те“ и рози от ароматен восък.' },
  { id: 'march', name: '8 март', e: '🌷', fx: 'petals', text: 'Мини свещи-цветя в целофан с табелка „Честит 8 март“.' },
  { id: 'easter', name: 'Великден', e: '🐣', fx: 'eggs', text: 'Кошнички с пролетни цветя, восъчни яйца и зайчета.' },
  { id: 'wedding', name: 'Сватби & кръщенета', e: '🤍', fx: 'confetti', text: 'Мини свещи за подарък на гостите — с име и дата.' },
  { id: 'birthday', name: 'Рожден ден', e: '🎂', fx: 'party', text: 'Букет от свещи-цветя с табелка „Честит рожден ден“.' }
];

/* Конструктор */
MC.builder = {
  vessels: [
    { id: 'cup', name: 'Чаша', base: 18 },
    { id: 'jar', name: 'Бурканче', base: 20 },
    { id: 'coupe', name: 'Коктейл', base: 22 },
    { id: 'martini', name: 'Мартини', base: 22 }
  ],
  toppings: [
    { id: 'strawberry', name: 'Ягоди', e: '🍓', price: 2 },
    { id: 'waffle', name: 'Гофрета', e: '🧇', price: 1 },
    { id: 'chocobear', name: 'Шоколадово мече', e: '🧸', price: 2 },
    { id: 'cherry', name: 'Черешки', e: '🍒', price: 2 },
    { id: 'macaron', name: 'Макарон', e: '🍬', price: 2 },
    { id: 'blueberry', name: 'Боровинки', e: '🫐', price: 1 },
    { id: 'heart', name: 'Сърце', e: '❤️', price: 1 },
    { id: 'orange', name: 'Портокал', e: '🍊', price: 1 },
    { id: 'gingerbread', name: 'Джинджифилче', e: '🍪', price: 2 },
    { id: 'ice', name: 'Лед', e: '🧊', price: 1 }
  ],
  ribbons: [
    { id: 'none', name: 'Без', c: null },
    { id: 'white', name: 'Бяла', c: '#ffffff' },
    { id: 'red', name: 'Червена', c: '#d01f36' },
    { id: 'pink', name: 'Розова', c: '#f48fb1' },
    { id: 'blue', name: 'Синя', c: '#2f8fd8' }
  ]
};
