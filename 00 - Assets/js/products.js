/* ============================================================
   AO_PRODUCTS — jednolita baza produktów dla całego sklepu
   ----
   Zdjęcia pochodzą z sesji produktowej z 2026-08-21 i leżą w
   00 - Assets/produkty/<slug>/:
     karta.jpg   packshot na bieli — zdjęcie karty produktu
     hover.jpg   ujęcie na modelu — pokazywane po najechaniu
     g1..gN.jpg  galeria na stronie produktu (packshoty, potem model)

   UWAGA: ceny, oceny i liczby opinii są ORIENTACYJNE (makieta).
   Do podmiany na dane klienta przed wysyłką.

   Po podpięciu backendu zastąp tę strukturę odpowiedzią z
   GET /api/products i zachowaj ten sam schemat pól.
============================================================ */
(function () {
  'use strict';

  function pKarta(slug)      { return `00%20-%20Assets/produkty/${slug}/karta.jpg`; }
  function pHover(slug)      { return `00%20-%20Assets/produkty/${slug}/hover.jpg`; }
  function pGaleria(slug, n) { return Array.from({ length: n }, (_, i) => `00%20-%20Assets/produkty/${slug}/g${i + 1}.jpg`); }

  /**
   * Schemat produktu:
   * id, slug, kat (klucz kategorii), cat (display label kategorii),
   * name, description, price, oldPrice, lowest30dPrice (Omnibus), image, imgHover, video,
   * sizes, outSizes, badge ('new'|'hot'|'sale'|null),
   * rating, reviews, stock (liczba sztuk; null = nieznane), featured (bool)
   */
  const AO_PRODUCTS = [
    // ── STROJE MECZOWE ──
    { id:1, slug:'koszulka-meczowa', kat:'stroje', cat:'Stroje Meczowe',
      name:'Koszulka Meczowa AO — Zielona',
      description:'Koszulka meczowa Akademii Piłkarskiej Okocimski Brzesko. Zielona, z białymi wstawkami na bokach i przy dekolcie.',
      price:149, oldPrice:187, lowest30dPrice:149,
      image:pKarta('koszulka-meczowa'), imgHover:pHover('koszulka-meczowa'), gallery:pGaleria('koszulka-meczowa',5),
      sizes:['XS','S','M','L','XL'], outSizes:[], badge:'hot', rating:4.9, reviews:128, stock:null, featured:true },

    { id:2, slug:'spodenki-meczowe', kat:'stroje', cat:'Stroje Meczowe',
      name:'Spodenki Meczowe AO — Czarne',
      description:'Czarne spodenki meczowe z herbem Akademii na nogawce.',
      price:89, oldPrice:null,
      image:pKarta('spodenki-meczowe'), imgHover:pHover('spodenki-meczowe'), gallery:pGaleria('spodenki-meczowe',5),
      sizes:['XS','S','M','L','XL'], outSizes:[], badge:null, rating:4.5, reviews:67, stock:null, featured:true },

    { id:3, slug:'getry-meczowe', kat:'stroje', cat:'Stroje Meczowe',
      name:'Getry Meczowe AO — Zielone',
      description:'Getry piłkarskie w kolorze zielonym, z białą stopką i herbem Akademii na łydce.',
      price:49, oldPrice:null,
      image:pKarta('getry-meczowe'), imgHover:pHover('getry-meczowe'), gallery:pGaleria('getry-meczowe',5),
      sizes:['S','M','L'], outSizes:[], badge:'new', rating:5.0, reviews:18, stock:null, featured:false },

    // ── ODZIEŻ TRENINGOWA ──
    { id:4, slug:'bluza-termoaktywna', kat:'treningi', cat:'Odzież Treningowa',
      name:'Bluza Termoaktywna AO — Długi Rękaw',
      description:'Zielona bluza z długim rękawem, noszona pod strojem meczowym albo samodzielnie na treningu.',
      price:129, oldPrice:null,
      image:pKarta('bluza-termoaktywna'), imgHover:pHover('bluza-termoaktywna'), gallery:pGaleria('bluza-termoaktywna',5),
      sizes:['XS','S','M','L','XL'], outSizes:[], badge:'new', rating:4.8, reviews:34, stock:null, featured:true },

    { id:5, slug:'bluza-polzamek', kat:'treningi', cat:'Odzież Treningowa',
      name:'Bluza Treningowa AO — Półzamek',
      description:'Bluza treningowa z zamkiem do połowy piersi, z białymi pasami na rękawach.',
      price:189, oldPrice:null,
      image:pKarta('bluza-polzamek'), imgHover:pHover('bluza-polzamek'), gallery:pGaleria('bluza-polzamek',6),
      sizes:['XS','S','M','L','XL'], outSizes:[], badge:'new', rating:4.9, reviews:26, stock:null, featured:false },

    { id:6, slug:'spodnie-dresowe', kat:'treningi', cat:'Odzież Treningowa',
      name:'Spodnie Dresowe AO — Czarne',
      description:'Czarne spodnie dresowe ze zwężaną nogawką i zamkami przy kostce.',
      price:159, oldPrice:null,
      image:pKarta('spodnie-dresowe'), imgHover:pHover('spodnie-dresowe'), gallery:pGaleria('spodnie-dresowe',5),
      sizes:['XS','S','M','L','XL'], outSizes:[], badge:null, rating:4.6, reviews:38, stock:null, featured:false },

    { id:7, slug:'kurtka', kat:'treningi', cat:'Odzież Treningowa',
      name:'Kurtka Reprezentacyjna AO',
      description:'Kurtka wiatrówka w ciemnej zieleni, z herbem Akademii na piersi.',
      price:239, oldPrice:319, lowest30dPrice:239,
      image:pKarta('kurtka'), imgHover:pHover('kurtka'), gallery:pGaleria('kurtka',5),
      sizes:['XS','S','M','L','XL'], outSizes:[], badge:'sale', rating:4.9, reviews:33, stock:null, featured:true },

    // ── OCHRANIACZE & SKARPETY ──
    { id:8, slug:'ochraniacze-biale', kat:'ochrona', cat:'Ochraniacze',
      name:'Ochraniacze Piszczeli AO — Biało-Czarne',
      description:'Ochraniacze piszczeli w biało-czarnym wzorze, noszone pod getrami.',
      price:59, oldPrice:null,
      image:pKarta('ochraniacze-biale'), imgHover:pHover('ochraniacze-biale'), gallery:pGaleria('ochraniacze-biale',5),
      sizes:['S','M','L'], outSizes:[], badge:'new', rating:4.7, reviews:21, stock:null, featured:false },

    { id:9, slug:'ochraniacze-czerwone', kat:'ochrona', cat:'Ochraniacze',
      name:'Ochraniacze Piszczeli AO — Czerwono-Czarne',
      description:'Ochraniacze piszczeli w czerwono-czarnym wzorze, noszone pod getrami.',
      price:59, oldPrice:null,
      image:pKarta('ochraniacze-czerwone'), imgHover:pHover('ochraniacze-czerwone'), gallery:pGaleria('ochraniacze-czerwone',5),
      sizes:['S','M','L'], outSizes:[], badge:'new', rating:4.7, reviews:16, stock:null, featured:false },

    { id:10, slug:'skarpetki', kat:'ochrona', cat:'Akcesoria Meczowe',
      name:'Skarpetki AO — Białe',
      description:'Białe skarpetki z herbem Akademii na cholewce, wysokość za kostkę.',
      price:29, oldPrice:null,
      image:pKarta('skarpetki'), imgHover:pHover('skarpetki'), gallery:pGaleria('skarpetki',5),
      sizes:['S','M','L'], outSizes:[], badge:null, rating:4.8, reviews:32, stock:null, featured:true },

    // ── CZAPKI & AKCESORIA ──
    { id:11, slug:'czapka', kat:'akcesoria', cat:'Czapki',
      name:'Czapka Z Daszkiem AO — Czarna',
      description:'Czarna czapka z daszkiem, z haftowanym herbem Akademii z przodu i regulowanym zapięciem z tyłu.',
      price:69, oldPrice:null,
      image:pKarta('czapka'), imgHover:pHover('czapka'), gallery:pGaleria('czapka',5),
      sizes:[], outSizes:[], badge:'hot', rating:4.6, reviews:44, stock:null, featured:false },

    { id:12, slug:'opaska', kat:'akcesoria', cat:'Gadżety Kibica',
      name:'Opaska Silikonowa AO',
      description:'Silikonowa opaska na rękę z napisem „OKOCIMSKI BRZESKO". Do wyboru zielona albo biała.',
      price:15, oldPrice:null,
      image:pKarta('opaska'), imgHover:pHover('opaska'), gallery:pGaleria('opaska',6),
      sizes:[], outSizes:[], badge:'new', rating:4.8, reviews:12, stock:null, featured:false },
  ];

  const CATEGORY_META = {
    stroje:    { title: 'Stroje Meczowe',            label: 'Odzież',    slug: 'stroje',    tile: '00%20-%20Assets/kategorie/stroje.jpg' },
    treningi:  { title: 'Odzież Treningowa',         label: 'Odzież',    slug: 'treningi',  tile: '00%20-%20Assets/kategorie/treningi.jpg' },
    ochrona:   { title: 'Ochraniacze &amp; Skarpety', label: 'Sprzęt',    slug: 'ochrona',   tile: '00%20-%20Assets/kategorie/ochrona.jpg' },
    akcesoria: { title: 'Czapki &amp; Akcesoria',     label: 'Akcesoria', slug: 'akcesoria', tile: '00%20-%20Assets/kategorie/akcesoria.jpg' },
  };

  /* Helpers */
  function findById(id) {
    if (id == null) return null;
    const numId = Number(id);
    return AO_PRODUCTS.find(p => p.id === numId) || null;
  }
  function findBySlug(slug) {
    if (!slug) return null;
    return AO_PRODUCTS.find(p => p.slug === slug) || null;
  }
  function byCategory(kat) {
    return AO_PRODUCTS.filter(p => p.kat === kat);
  }
  function featured(limit) {
    const list = AO_PRODUCTS.filter(p => p.featured);
    return typeof limit === 'number' ? list.slice(0, limit) : list;
  }
  function related(productId, limit) {
    const p = findById(productId);
    if (!p) return [];
    const same = AO_PRODUCTS.filter(x => x.kat === p.kat && x.id !== p.id);
    // shuffle + cap
    same.sort(() => Math.random() - 0.5);
    return typeof limit === 'number' ? same.slice(0, limit) : same;
  }
  function search(query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) return [];
    return AO_PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q)
      || (p.cat || '').toLowerCase().includes(q)
      || (p.description || '').toLowerCase().includes(q)
      || (p.kat || '').toLowerCase().includes(q)
    );
  }

  // Public API
  window.AO_PRODUCTS = AO_PRODUCTS;
  window.AO_CATEGORY_META = CATEGORY_META;
  window.AO_Catalog = {
    findById,
    findBySlug,
    byCategory,
    featured,
    related,
    search,
    all: () => AO_PRODUCTS.slice(),
    meta: (kat) => CATEGORY_META[kat] || null,
  };
})();
