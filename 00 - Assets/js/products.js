/* ============================================================
   AO_PRODUCTS — jednolita baza produktów dla całego sklepu
   ----
   Po podpięciu backendu zastąp tę strukturę odpowiedzią z
   GET /api/products i zachowaj ten sam schemat pól.
============================================================ */
(function () {
  'use strict';

  const IMG = {
    bluza1:  '01%20-%20Produkty/01%20-%20Bluza/Bluza_01.png',
    bluza2:  '01%20-%20Produkty/01%20-%20Bluza/Bluza_02.png',
    bluza3:  '01%20-%20Produkty/01%20-%20Bluza/Bluza_03.png',
    bluzaVid:'01%20-%20Produkty/01%20-%20Bluza/Bluza_04%20%2B%20hover.mp4',
    getry1:  '01%20-%20Produkty/02%20-%20Getry/Getry_01.png',
    getry2:  '01%20-%20Produkty/02%20-%20Getry/Getry_02.png',
    skarp1:  '01%20-%20Produkty/03%20-%20Skarpetki/Skarpetki_01.png',
    skarp2:  '01%20-%20Produkty/03%20-%20Skarpetki/Skarpetki_02.png',
    kurtka1: '01%20-%20Produkty/04%20-%20Kurtka/kurtka_01.png',
    kurtka2: '01%20-%20Produkty/04%20-%20Kurtka/kurtka_02.png',
    kurtkaVid:'01%20-%20Produkty/04%20-%20Kurtka/kurtka_05%20_hover.mp4',
    spod1:   '01%20-%20Produkty/05%20-%20Spodenki/spodenki_01.png',
    spod2:   '01%20-%20Produkty/05%20-%20Spodenki/spodenki_02.png',
  };

  /**
   * Schemat produktu:
   * id, slug, kat (klucz kategorii), cat (display label kategorii),
   * name, description, price, oldPrice, lowest30dPrice (Omnibus), image, imgHover, video,
   * sizes, outSizes, badge ('new'|'hot'|'sale'|null),
   * rating, reviews, stock (liczba sztuk; null = nieznane), featured (bool)
   */
  const AO_PRODUCTS = [
    // ── BLUZY ──
    { id:11, slug:'bluza-kangurka-ao-zielona', kat:'bluzy', cat:'Bluzy Treningowe',
      name:'Bluza Kangurka AO — Zielona',
      description:'Oficjalna bluza treningowa Akademii Piłkarskiej Okocimski Brzesko. Wykonana z wysokiej jakości bawełny ze wzornictwem AP Okocimski. Skład: 80% bawełna, 20% poliester. Kangurka z przednią kieszenią, haft z logo Akademii na piersi, napis „AP OKOCIMSKI BRZESKO" na plecach. Dostępna w rozmiarach XS–XL.',
      price:229, oldPrice:null, image:IMG.bluza1, imgHover:IMG.bluza2, video:IMG.bluzaVid,
      gallery:[IMG.bluza1, IMG.bluza2, IMG.bluza3],
      sizes:['XS','S','M','L','XL'], outSizes:[], badge:'new', rating:5.0, reviews:24, stock:18, featured:true },

    { id:12, slug:'bluza-polo-ao', kat:'bluzy', cat:'Bluzy Casual',
      name:'Bluza Polo AO',
      description:'Casualowa bluza z kołnierzykiem polo. Idealna na chłodniejsze dni poza boiskiem.',
      price:199, oldPrice:null, image:IMG.getry1, imgHover:null,
      sizes:['S','M','L','XL'], outSizes:[], badge:null, rating:4.6, reviews:18, stock:12, featured:false },

    { id:13, slug:'kurtka-windbreaker-ao', kat:'bluzy', cat:'Kurtki',
      name:'Kurtka Reprezentacyjna Windbreaker',
      description:'Lekka, przewiewna kurtka ochronna na treningi w deszczu. Wodoodporna, oddychająca tkanina.',
      price:239, oldPrice:319, lowest30dPrice:239, image:IMG.kurtka1, imgHover:IMG.kurtka2, video:IMG.kurtkaVid,
      gallery:[IMG.kurtka1, IMG.kurtka2],
      sizes:['XS','S','M','L','XL'], outSizes:[], badge:'sale', rating:4.9, reviews:33, stock:7, featured:true },

    { id:14, slug:'kurtka-zimowa-ao', kat:'bluzy', cat:'Kurtki',
      name:'Kurtka Zimowa AO Softshell',
      description:'Ciepła, zimowa kurtka softshell z barwami klubu. Idealna na zimowe treningi i mecze.',
      price:349, oldPrice:null, image:IMG.kurtka1, imgHover:null,
      sizes:['S','M','L','XL'], outSizes:[], badge:'new', rating:4.8, reviews:15, stock:5, featured:false },

    { id:15, slug:'bluza-kangurka-ao-classic', kat:'bluzy', cat:'Bluzy Treningowe',
      name:'Bluza Kangurka AO Classic',
      description:'Klasyczna bluza klubowa w wersji bardziej ekonomicznej. Wszystkie rozmiary dostępne.',
      price:179, oldPrice:null, image:IMG.bluza1, imgHover:null,
      sizes:['XS','S','M','L','XL','XXL'], outSizes:[], badge:null, rating:4.7, reviews:41, stock:22, featured:false },

    { id:16, slug:'kamizelka-ao-pro', kat:'bluzy', cat:'Kurtki',
      name:'Kamizelka AO Pro',
      description:'Lekka kamizelka treningowa, dobra na wiosnę i jesień.',
      price:159, oldPrice:199, lowest30dPrice:159, image:IMG.spod1, imgHover:null,
      sizes:['S','M','L','XL'], outSizes:['L'], badge:'sale', rating:4.4, reviews:9, stock:3, featured:false },

    // ── KOSZULKI ──
    { id:1, slug:'koszulka-meczowa-ao-zielona', kat:'koszulki', cat:'Stroje Meczowe',
      name:'Koszulka Meczowa AO — Zielona',
      description:'Oficjalna koszulka meczowa drużyny pierwszego zespołu. Materiał oddychający, szybkoschnący.',
      price:149, oldPrice:187, lowest30dPrice:149, image:IMG.bluza1, imgHover:null,
      sizes:['XS','S','M','L','XL'], outSizes:[], badge:'hot', rating:4.9, reviews:128, stock:35, featured:true },

    { id:2, slug:'koszulka-wyjazdowa-ao-biala', kat:'koszulki', cat:'Stroje Meczowe',
      name:'Koszulka Wyjazdowa AO — Biała',
      description:'Wyjazdowa wersja koszulki meczowej w jasnej kolorystyce.',
      price:149, oldPrice:null, image:IMG.getry1, imgHover:null,
      sizes:['S','M','L','XL'], outSizes:['XL'], badge:'new', rating:4.7, reviews:56, stock:8, featured:false },

    { id:3, slug:'koszulka-treningowa-dryfit', kat:'koszulki', cat:'Treningi',
      name:'Koszulka Treningowa AO Dry-Fit',
      description:'Koszulka do treningów z technologią Dry-Fit. Odprowadza wilgoć od ciała.',
      price:99, oldPrice:null, image:IMG.skarp1, imgHover:null,
      sizes:['XS','S','M','L','XL'], outSizes:[], badge:'new', rating:4.8, reviews:34, stock:25, featured:false },

    { id:4, slug:'koszulka-polo-ao-classic', kat:'koszulki', cat:'Casual',
      name:'Koszulka Polo AO Classic',
      description:'Elegancka koszulka polo do nieformalnych okazji.',
      price:119, oldPrice:null, image:IMG.kurtka1, imgHover:null,
      sizes:['S','M','L','XL'], outSizes:['S'], badge:null, rating:4.5, reviews:22, stock:14, featured:false },

    { id:5, slug:'koszulka-reprezentacyjna-czarna', kat:'koszulki', cat:'Stroje Meczowe',
      name:'Koszulka Reprezentacyjna — Czarna',
      description:'Limitowana, czarna wersja koszulki reprezentacyjnej.',
      price:149, oldPrice:179, lowest30dPrice:149, image:IMG.spod1, imgHover:null,
      sizes:['XS','S','M','L','XL'], outSizes:['XS'], badge:'sale', rating:4.6, reviews:44, stock:6, featured:false },

    { id:6, slug:'koszulka-kibica-ao-retro', kat:'koszulki', cat:'Kolekcja Retro',
      name:'Koszulka Kibica AO Retro',
      description:'Stylizacja retro nawiązująca do dawnych lat klubu.',
      price:129, oldPrice:null, image:IMG.bluza1, imgHover:null,
      sizes:['S','M','L','XL','XXL'], outSizes:[], badge:'new', rating:5.0, reviews:12, stock:9, featured:false },

    // ── SPODENKI ──
    { id:21, slug:'spodenki-treningowe-dryfit', kat:'spodenki', cat:'Spodenki',
      name:'Spodenki Treningowe Dry-Fit',
      description:'Wygodne spodenki treningowe z technologią Dry-Fit.',
      price:89, oldPrice:null, image:IMG.spod1, imgHover:IMG.spod2,
      sizes:['XS','S','M','L','XL'], outSizes:[], badge:null, rating:4.5, reviews:67, stock:30, featured:true },

    { id:22, slug:'spodenki-meczowe-zielone', kat:'spodenki', cat:'Stroje Meczowe',
      name:'Spodenki Meczowe AO — Zielone',
      description:'Oficjalne spodenki meczowe pasujące do koszulki głównej.',
      price:99, oldPrice:null, image:IMG.spod1, imgHover:null,
      sizes:['S','M','L','XL'], outSizes:[], badge:'new', rating:4.7, reviews:29, stock:18, featured:false },

    { id:23, slug:'spodnie-dresowe-comfort', kat:'spodenki', cat:'Spodnie',
      name:'Spodnie Dresowe AO Comfort',
      description:'Wygodne spodnie dresowe z bawełny.',
      price:149, oldPrice:179, lowest30dPrice:149, image:IMG.kurtka1, imgHover:null,
      sizes:['XS','S','M','L','XL','XXL'], outSizes:[], badge:'sale', rating:4.6, reviews:38, stock:11, featured:false },

    { id:24, slug:'spodenki-bramkarskie', kat:'spodenki', cat:'Stroje Bramkarskie',
      name:'Spodenki Bramkarskie AO',
      description:'Spodenki z wyściółką dla bramkarzy.',
      price:109, oldPrice:null, image:IMG.skarp1, imgHover:null,
      sizes:['S','M','L','XL'], outSizes:['S'], badge:null, rating:4.3, reviews:11, stock:4, featured:false },

    { id:25, slug:'legginsy-treningowe', kat:'spodenki', cat:'Odzież Damska',
      name:'Legginsy Treningowe AO',
      description:'Legginsy damskie do treningów i casual.',
      price:119, oldPrice:null, image:IMG.getry1, imgHover:null,
      sizes:['XS','S','M','L'], outSizes:[], badge:'new', rating:4.8, reviews:20, stock:13, featured:false },

    // ── CZAPKI / AKCESORIA ──
    { id:31, slug:'czapka-snapback', kat:'czapki', cat:'Czapki',
      name:'Czapka Z Daszkiem AO Snapback',
      description:'Klasyczny snapback z haftowanym logo klubu.',
      price:69, oldPrice:null, image:IMG.kurtka1, imgHover:null,
      sizes:[], outSizes:[], badge:null, rating:4.6, reviews:89, stock:42, featured:false },

    { id:32, slug:'czapka-zimowa-zielona', kat:'czapki', cat:'Czapki Zimowe',
      name:'Czapka Zimowa AO — Zielona',
      description:'Ciepła czapka zimowa z pomponem.',
      price:49, oldPrice:null, image:IMG.spod1, imgHover:null,
      sizes:[], outSizes:[], badge:'new', rating:4.8, reviews:44, stock:28, featured:false },

    { id:33, slug:'szalik-ao-classic', kat:'czapki', cat:'Akcesoria',
      name:'Szalik AO Classic',
      description:'Tradycyjny szalik kibica w barwach klubu.',
      price:59, oldPrice:null, image:IMG.bluza1, imgHover:null,
      sizes:[], outSizes:[], badge:'hot', rating:4.9, reviews:112, stock:55, featured:false },

    { id:34, slug:'opaska-treningowa', kat:'czapki', cat:'Akcesoria',
      name:'Opaska Treningowa AO',
      description:'Opaska na głowę pochłaniająca pot.',
      price:29, oldPrice:null, image:IMG.getry1, imgHover:null,
      sizes:[], outSizes:[], badge:null, rating:4.4, reviews:23, stock:60, featured:false },

    { id:35, slug:'rekawiczki-ao-zima', kat:'czapki', cat:'Akcesoria',
      name:'Rękawiczki AO Zima',
      description:'Ciepłe rękawiczki z dotykiem do telefonu.',
      price:39, oldPrice:49, lowest30dPrice:39, image:IMG.skarp1, imgHover:null,
      sizes:[], outSizes:[], badge:'sale', rating:4.5, reviews:17, stock:19, featured:false },

    { id:61, slug:'getry-meczowe-zielone', kat:'czapki', cat:'Akcesoria Meczowe',
      name:'Getry Meczowe AO — Zielone',
      description:'Oficjalne getry meczowe pierwszego zespołu.',
      price:49, oldPrice:null, image:IMG.getry1, imgHover:IMG.getry2,
      sizes:['S','M','L'], outSizes:[], badge:'new', rating:5.0, reviews:18, stock:26, featured:true },

    { id:62, slug:'skarpetki-ao-biale', kat:'czapki', cat:'Akcesoria Meczowe',
      name:'Skarpetki AO — Białe',
      description:'Sportowe skarpetki w jasnej wersji.',
      price:29, oldPrice:null, image:IMG.skarp1, imgHover:IMG.skarp2,
      sizes:['S','M','L'], outSizes:[], badge:'new', rating:4.8, reviews:32, stock:48, featured:true },

    // ── TORBY ──
    { id:41, slug:'torba-sportowa-pro-30l', kat:'torby', cat:'Torby Sportowe',
      name:'Torba Sportowa AO Pro 30L',
      description:'Profesjonalna torba na trening, 30 litrów.',
      price:189, oldPrice:null, image:IMG.spod1, imgHover:null,
      sizes:[], outSizes:[], badge:'hot', rating:4.8, reviews:42, stock:14, featured:false },

    { id:42, slug:'torba-na-ramie-mini', kat:'torby', cat:'Torby Casual',
      name:'Torba Na Ramię AO Mini',
      description:'Niewielka torba miejska na co dzień.',
      price:99, oldPrice:null, image:IMG.kurtka1, imgHover:null,
      sizes:[], outSizes:[], badge:'new', rating:4.7, reviews:28, stock:18, featured:false },

    { id:43, slug:'plecak-ao-20l', kat:'torby', cat:'Plecaki',
      name:'Plecak AO 20L',
      description:'Wygodny plecak codzienny z sekcją na laptopa.',
      price:159, oldPrice:199, lowest30dPrice:159, image:IMG.bluza1, imgHover:null,
      sizes:[], outSizes:[], badge:'sale', rating:4.6, reviews:35, stock:9, featured:false },

    { id:44, slug:'worek-sportowy', kat:'torby', cat:'Torby Sportowe',
      name:'Worek Sportowy AO',
      description:'Lekki worek na strój i obuwie.',
      price:49, oldPrice:null, image:IMG.skarp1, imgHover:null,
      sizes:[], outSizes:[], badge:null, rating:4.3, reviews:14, stock:33, featured:false },

    { id:45, slug:'torba-sprzetowa-xl', kat:'torby', cat:'Sprzęt',
      name:'Torba Sprzętowa XL',
      description:'Duża torba na sprzęt klubowy.',
      price:249, oldPrice:null, image:IMG.getry1, imgHover:null,
      sizes:[], outSizes:[], badge:'new', rating:4.9, reviews:8, stock:6, featured:false },

    // ── GADŻETY ──
    { id:51, slug:'zestaw-kibica-szalik-kubek', kat:'gadgety', cat:'Zestawy',
      name:'Zestaw Kibica AO — Szalik + Kubek',
      description:'Idealny prezent dla kibica: szalik i kubek w jednym opakowaniu.',
      price:99, oldPrice:null, image:IMG.skarp1, imgHover:null,
      sizes:[], outSizes:[], badge:'new', rating:5.0, reviews:12, stock:24, featured:false },

    { id:52, slug:'kubek-ao-350ml', kat:'gadgety', cat:'Gadżety',
      name:'Kubek AO 350ml',
      description:'Kubek ceramiczny z logo klubu.',
      price:49, oldPrice:null, image:IMG.spod1, imgHover:null,
      sizes:[], outSizes:[], badge:null, rating:4.7, reviews:56, stock:75, featured:false },

    { id:53, slug:'flaga-akademii', kat:'gadgety', cat:'Gadżety Kibica',
      name:'Flaga Akademii 90×60cm',
      description:'Klubowa flaga na maszt lub do mieszkania.',
      price:39, oldPrice:null, image:IMG.bluza1, imgHover:null,
      sizes:[], outSizes:[], badge:'hot', rating:4.8, reviews:88, stock:50, featured:false },

    { id:54, slug:'brelok-ao', kat:'gadgety', cat:'Gadżety',
      name:'Brelok AO z Logo',
      description:'Metalowy brelok z grawerowanym logo.',
      price:19, oldPrice:null, image:IMG.kurtka1, imgHover:null,
      sizes:[], outSizes:[], badge:null, rating:4.5, reviews:34, stock:120, featured:false },

    { id:55, slug:'bidon-ao-750ml', kat:'gadgety', cat:'Akcesoria Sportowe',
      name:'Bidon AO 750ml',
      description:'Sportowy bidon z dziubkiem antykapaniowym.',
      price:59, oldPrice:null, image:IMG.getry1, imgHover:null,
      sizes:[], outSizes:[], badge:'new', rating:4.6, reviews:21, stock:40, featured:false },

    { id:56, slug:'zestaw-podarunkowy-premium', kat:'gadgety', cat:'Zestawy',
      name:'Zestaw Podarunkowy Premium AO',
      description:'Ekskluzywny zestaw prezentowy: koszulka, szalik, kubek i brelok.',
      price:149, oldPrice:null, image:IMG.skarp1, imgHover:null,
      sizes:[], outSizes:[], badge:'hot', rating:4.9, reviews:19, stock:8, featured:false },
  ];

  const CATEGORY_META = {
    koszulki: { title: 'Koszulki & Stroje',     label: 'Odzież',     slug: 'koszulki' },
    bluzy:    { title: 'Bluzy & Kurtki',        label: 'Odzież',     slug: 'bluzy' },
    spodenki: { title: 'Spodenki & Spodnie',    label: 'Odzież',     slug: 'spodenki' },
    czapki:   { title: 'Czapki & Akcesoria',    label: 'Akcesoria',  slug: 'czapki' },
    torby:    { title: 'Torby & Sprzęt',        label: 'Sprzęt',     slug: 'torby' },
    gadgety:  { title: 'Gadżety Kibica',         label: 'Gadżety',    slug: 'gadgety' },
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
  window.AO_IMG = IMG;
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
