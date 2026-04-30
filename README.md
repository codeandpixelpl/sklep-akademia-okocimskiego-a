# Sklep — Akademia Okocimskiego (Wersja A)

Statyczny prototyp sklepu e-commerce dla **Akademii Piłkarskiej Okocimski Brzesko**. Czysty HTML/CSS/Vanilla JS, bez build-systemu. Backend zostanie dorobiony przez dewelopera — tutaj jest gotowy front + dane mockowe + miejsca oznaczone `TODO(backend)`.

## Uruchomienie lokalne

```bash
python3 -m http.server 8767
# otwórz http://localhost:8767/index.html
```

## Struktura

```
.
├── index.html                  # strona główna
├── kategoria.html              # listing produktów (filtry, sort, paginacja)
├── produkt.html                # PDP — galeria, rozmiary, recenzje, JSON-LD Product
├── checkout.html               # 4-krokowy formularz zamówienia
├── koszyk.html                 # pełna strona koszyka
├── dziekujemy.html             # potwierdzenie zamówienia
├── moje-konto.html             # konto użytkownika (mock)
├── ulubione.html               # wishlist (localStorage)
├── wyniki-wyszukiwania.html    # wyniki wyszukiwania
├── logowanie.html, rejestracja.html, reset-hasla.html
├── konto.html                  # routing logowanie ↔ rejestracja
├── faq.html, dostawa-i-zwroty.html, reklamacje.html
├── regulamin.html, polityka-prywatnosci.html
├── tabela-rozmiarow.html, kontakt.html, o-nas.html
├── 404.html, 500.html
├── robots.txt, sitemap.xml
├── 00 - Assets/
│   ├── css/site.css            # globalne style
│   ├── js/
│   │   ├── products.js         # AO_PRODUCTS + AO_Catalog (mock)
│   │   ├── cart.js             # AO_Cart (localStorage)
│   │   ├── site.js             # AO_Site, header/footer/popup/toast
│   │   ├── cookies.js          # banner zgód RODO
│   │   └── analytics.js        # GTM/Meta Pixel placeholder
│   └── (obrazy hero, kategorii, logo)
└── 01 - Produkty/              # zdjęcia produktów
```

## Architektura JS

Wszystkie moduły są IIFE i eksponują API na `window`. **Dewu**: po podpięciu backendu zachowaj te kontrakty.

### `AO_Catalog` (products.js)

```js
AO_Catalog.findById(id)        // produkt po ID
AO_Catalog.findBySlug(slug)    // produkt po slugu URL-friendly
AO_Catalog.byCategory(kat)     // wszystkie produkty z kategorii
AO_Catalog.featured(limit)     // wyróżnione produkty
AO_Catalog.related(id, limit)  // powiązane (dla cross-sellu)
AO_Catalog.search(query)       // pełnotekstowe wyszukiwanie
AO_Catalog.all()               // tablica wszystkich
AO_Catalog.meta(kat)           // metadane kategorii (title, label, slug)
```

Schemat produktu — patrz `product.schema.json`.

### `AO_Cart` (cart.js)

Stan w `localStorage:'ao_cart'`. Eventy: `ao:cart-change`, `ao:cart-open`, `ao:cart-close`.

```js
AO_Cart.add(productId, size, qty)
AO_Cart.remove(key)
AO_Cart.changeQty(key, delta)
AO_Cart.setQty(key, qty)
AO_Cart.all()                  // tablica pozycji
AO_Cart.total() / count() / subtotal()
AO_Cart.openDrawer() / closeDrawer()
AO_Cart.FREE_SHIP_THRESHOLD    // 199 zł (próg darmowej dostawy)
```

### `AO_Site` (site.js)

```js
AO_Site.escapeHtml(str)
AO_Site.formatPrice(value)
AO_Site.omnibusHTML(product)   // "Najniższa cena z 30 dni" — wymóg ustawowy
AO_Site.toast(text, ms)
AO_Site.Wishlist               // load/save/has/toggle/all (localStorage:'ao_wishlist')
AO_Site.getQueryParam(name)
AO_Site.setQueryParams(obj)
```

Auto-renderuje header (`<div data-ao-header>`), footer (`<footer data-ao-footer>`) oraz montuje:
- pasek "darmowa dostawa od X zł" (`#free-ship-bar`)
- newsletter pop-up (exit-intent / scroll 50%, max raz na 14 dni)
- social proof toast (lewy dolny róg, max 3 razy/sesję)
- search autocomplete dropdown w headerze

## Zgodność prawna (PL/EU)

Wbudowane w UI:

- **Dyrektywa Omnibus** — przy każdym produkcie z `oldPrice` widoczna "Najniższa cena z 30 dni" (`product.lowest30dPrice`). Pole **wymagane** w danych przy promocjach.
- **Faktura VAT (B2B)** — checkbox + pola NIP/firma/adres w `checkout.html` z walidacją sumy kontrolnej NIP (PL).
- **Zgody rozdzielone** — regulamin (wymagane), polityka prywatności (wymagane), newsletter (opcjonalne) — w checkout i rejestracji.
- **Wzór formularza odstąpienia** — `dostawa-i-zwroty.html#wzor-odstapienia` (zgodny z załącznikiem nr 2 do ustawy o prawach konsumenta).
- **Klauzule RODO** — pod każdym formularzem (art. 6 ust. 1 lit. b RODO).
- **Cookies banner** — `cookies.js`, kategoryzacja: niezbędne / analityka / marketing.

## SEO

- `<link rel="canonical">` na każdej stronie
- JSON-LD: `Product` + `BreadcrumbList` (PDP), `BreadcrumbList` + `ItemList` (kategoria), `FAQPage` (FAQ), `Organization` + `WebSite` z `SearchAction` (home)
- Meta description, OG tags, Twitter Card per strona
- `width`/`height` na każdym `<img>` (CLS = 0)
- `<link rel="preload">` dla hero-banner (LCP)
- Friendly URLs przygotowane w `slug` — dev przepnie router z `?id=` na `/produkt/<slug>/`

## Dostępność (WCAG 2.1 AA)

- Skip link `Przejdź do treści` (focus-only)
- Focus trap w cart drawer + przywracanie focusu po zamknięciu
- ARIA labels, role na drawerach i modalach
- Reduced motion (`prefers-reduced-motion`)
- Wszystkie inputy z `<label>` lub `aria-label`
- Klawiaturowa nawigacja autocomplete (↑/↓/Enter/Escape)

## Co jest jeszcze do zrobienia po stronie deva

Pełna lista w `HANDOFF.md`. Najważniejsze:

1. **Płatności** — integracja Przelewy24/PayU/Stripe + callback URL
2. **POST /api/orders** — przyjmowanie zamówień, walidacja stocka po stronie serwera, anti-CSRF
3. **POST /api/newsletter** — endpoint + double opt-in
4. **Auth** — logowanie/rejestracja, sesje, hash haseł (argon2/bcrypt), reset hasła
5. **Faktury** — integracja iFirma/Fakturownia + KSeF (od 2026-04-01 obowiązkowe)
6. **GTM_ID + META_PIXEL_ID** — w `analytics.js` linie 13-15
7. **Friendly URLs** — przepiąć `?id=` na slugowe ścieżki

## TODO — placeholdery do uzupełnienia przez klienta

- Adres siedziby Akademii (regulamin, polityka, dostawa, reklamacje, formularz odstąpienia)
- NIP, REGON, KRS w stopce/regulaminie
- Treść "O Akademii" w `o-nas.html` (historia, sukcesy)
- Zdjęcia produktów z prawidłową rozdzielczością — pliki `cat-*.jpg` mają po 700KB-1.2MB, warto wygenerować WebP/AVIF
- Wartości w `lowest30dPrice` — obecnie ustawione równe `price` (czyli "obecna cena to najniższa z 30 dni"), jeśli faktycznie była niższa — uzupełnić z hist. cen

## Zmiana domeny w canonical

Globalnie znajdź i zamień `https://sklep.akademia-okocim.pl/` na docelową domenę przed wdrożeniem.

```bash
grep -rln "sklep.akademia-okocim.pl" *.html
```
