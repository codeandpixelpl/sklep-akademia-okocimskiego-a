# HANDOFF — backend integration checklist

Lista wszystkich miejsc, w których front czeka na backend. Punkty oznaczone `TODO(backend)` w kodzie. Tam gdzie jest też `TODO(klient)` — chodzi o dane wejściowe od klienta (NIP, adres, GTM ID).

## 1. API endpoints do zaimplementowania

| Metoda | Endpoint | Plik klienta | Linia |
|---|---|---|---|
| GET  | `/api/products`, `/api/products/{id}` | `00 - Assets/js/products.js` | mock w `AO_PRODUCTS` (1-256) |
| POST | `/api/orders` | `checkout.html` | 1126 |
| POST | `/api/promo/validate` | `checkout.html` | 962 |
| POST | `/api/auth/login` | `logowanie.html` | 123 |
| POST | `/api/auth/register` | `rejestracja.html` | 197 |
| POST | `/api/auth/password-reset` | `reset-hasla.html` | 100 |
| POST | `/api/auth/logout` | `moje-konto.html` | 249 |
| GET  | `/api/me/orders` | `moje-konto.html` | 192 |
| PATCH | `/api/me` | `moje-konto.html` | 228 |
| PUT | `/api/me/addresses` | `moje-konto.html` | 241 |
| POST | `/api/contact` | `kontakt.html` | 171 |
| POST | `/api/complaints` | `reklamacje.html` | 146 |
| POST | `/api/reviews` | `produkt.html` | 728 |
| POST | `/api/notify-on-stock` | `produkt.html` | 601 |
| POST | `/api/newsletter` | `00 - Assets/js/site.js` | 236, mountNewsletterPopup |

## 2. Wymagania bezpieczeństwa

### CSRF
Wszystkie `POST/PATCH/PUT/DELETE` muszą wymagać tokenu CSRF. Token wstrzykiwać do każdej strony jako `<meta name="csrf-token" content="…">` i wyciągać w fetch:

```js
headers: { 'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content }
```

### Rate limiting (per IP, per email)
- `/api/auth/login` — 5/min, blokada na 15 min po 10 błędach
- `/api/auth/password-reset` — 3/h
- `/api/auth/register` — 5/h
- `/api/newsletter` — 5/h
- `/api/contact`, `/api/complaints` — 5/h

### Hash haseł
**argon2id** lub **bcrypt(cost=12+)**. NIGDY md5/sha-1/plain.

### CSP header (zalecane)
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com;
```

### Anti-bot (na newsletter, kontakt, reklamacje, rejestracja)
- Honeypot (ukryte pole, jeśli wypełnione = bot)
- hCaptcha lub Cloudflare Turnstile (preferowane jako lżejsze)

## 3. Walidacja po stronie serwera

### Krytyczne — NIGDY nie ufaj klientowi:

- **Cena produktu** — zawsze pobieraj z DB, nie z requestu (klient może wstrzyknąć price=0).
- **Stock** — przy `POST /api/orders` zatrzaśnij stock w transakcji DB. Race condition = sprzedaż czegoś czego nie ma.
- **Kupon rabatowy** — waliduj na serwerze (data ważności, użycia, min. wartość koszyka). `checkout.html:962`.
- **Suma zamówienia** — przelicz po stronie serwera, porównaj z tym co dostałeś od klienta. Jeśli różnica → odrzuć.
- **NIP** — walidator sumy kontrolnej już jest po stronie klienta (`checkout.html:958`), zduplikuj na serwerze.
- **Zgody** — zapisz timestamp + IP zaakceptowania regulaminu/polityki (RODO accountability).

## 4. Płatności — integracja

Front wysyła do `POST /api/orders` payload:

```json
{
  "customer": { "firstName", "lastName", "email", "phone" },
  "address": { "street", "zip", "city", "country" },
  "delivery": "inpost|courier|pickup",
  "payment": "blik|przelewy24|card|transfer|cash|bnpl",
  "items": [{ "productId", "size", "qty" }],
  "promo": "AO10",
  "invoice": { "company", "nip", "address", "zip" } | null,
  "consents": { "terms": true, "privacy": true, "newsletter": false },
  "blikCode": "123456" | null,
  "notes": "…"
}
```

Backend:
1. Waliduje stock + cenę
2. Zapisuje order ze statusem `pending_payment`
3. Inicjuje płatność u providera (Przelewy24/PayU/Stripe)
4. Zwraca `{ orderId, paymentUrl }` lub `{ orderId, blikRedirect }`
5. Webhook od providera → status `paid` → wyzwala wysyłkę faktury, maila potwierdzającego, decrement stocka

## 5. Faktury (PL) — KSeF

**KSeF jest obowiązkowy od 2026-04-01.** Każda wystawiona faktura musi trafić do Krajowego Systemu e-Faktur.

Rekomendacja: integracja z **iFirma API** lub **Fakturownia API** — one same wysyłają do KSeF.

Trigger: po `payment_status: paid` i `invoice != null` w order.

## 6. E-maile transakcyjne

Provider: Resend / SendGrid / Postmark.

Szablony do przygotowania:
1. Potwierdzenie zamówienia (z linkiem do śledzenia)
2. Status wysyłki (numer trackingu od InPost/DPD)
3. Reset hasła (link 1h ważny)
4. Welcome email po rejestracji + double opt-in newsletter
5. "Twój produkt znów dostępny" (notify-on-stock)
6. Reset hasła
7. Faktura PDF jako załącznik

## 7. GTM / Meta Pixel

**`00 - Assets/js/analytics.js` linie 12-14:**

```js
const GTM_ID = '';        // TODO(klient): wpisz GTM-XXXXXXX
const META_PIXEL_ID = ''; // TODO(klient): wpisz Pixel ID
```

Po stronie klienta wyzwalają się eventy:
- `view_item` (PDP)
- `add_to_cart`, `remove_from_cart`
- `begin_checkout`
- `purchase` (na dziekujemy.html)
- `search`

Wszystkie respektują zgodę cookie (`AO_Cookies.hasConsent('analytics' | 'marketing')`).

## 8. Friendly URLs

Obecnie: `produkt.html?id=11`, `kategoria.html?kat=koszulki`.

Docelowo (router/htaccess):
```
/produkt/<slug>/         → produkt.html?id=<lookup_by_slug>
/kategoria/<kat>/        → kategoria.html?kat=<kat>
/wyniki?q=<query>        → wyniki-wyszukiwania.html?q=<query>
```

`slug` jest już w `AO_PRODUCTS` — dev przepiąć render linków z `?id=${id}` na `/produkt/${slug}/`.

## 9. Dane do uzupełnienia przez klienta

Wszystkie miejsca z markerem `[DO UZUPEŁNIENIA]`:

- `regulamin.html:67` — adres siedziby Akademii, NIP, KRS
- `regulamin.html:111` — data obowiązywania regulaminu
- `polityka-prywatnosci.html:66` — adres siedziby + NIP administratora
- `dostawa-i-zwroty.html:118,131,146` — adres do wysyłki zwrotów
- `kontakt.html:129` — adres siedziby (widoczny dla klientów)
- `regulamin.html` — pełna treść regulaminu (obecnie szablon)
- `polityka-prywatnosci.html` — pełna treść (obecnie szablon)
- `o-nas.html` — historia klubu, opisy
- `lowest30dPrice` w `products.js` — wartości historyczne (obecnie = `price`)

## 10. Zmiana domeny w canonical / OG

Globalna podmiana przed wdrożeniem:

```bash
grep -rln "https://sklep.akademia-okocim.pl" *.html
# zamień na docelową domenę produkcyjną
```

## 11. Asset optimization (przed deployem)

Obecne rozmiary:
- `cat-spodenki.jpg` — 1.18 MB
- `cat-czapki.jpg`, `cat-gadgety.jpg`, `cat-getry.png` — ~700 KB każdy
- `hero-banner.jpg` — 1 MB
- `freepik_*.png` (folder `generowane/`) — 8-9 MB każde

**Do zrobienia:**
1. Wszystkie JPG/PNG → WebP (50-70% redukcji), AVIF gdzie się da
2. `<picture>` z fallback dla starszych przeglądarek
3. Folder `generowane/` to surowe outputy AI — usunąć z deployu lub przenieść poza katalog publiczny
4. Wideo hover (`*.mp4` w `01 - Produkty/`) — kompresja H.264 baseline, max 2 MB

## 12. Hosting / DNS

- HTTPS + HSTS + redirect 301 z http → https
- `www` → bez `www` (lub odwrotnie, ale konsekwentnie)
- `robots.txt` ma już sitemap entry — zaktualizuj URL po zmianie domeny
- CDN dla statyków (Cloudflare wystarczy)

## 13. Localstorage migration

Po podpięciu auth — przenieść stan z localStorage do konta użytkownika:

| LocalStorage key | Migracja |
|---|---|
| `ao_cart` | sync z `/api/me/cart` przy logowaniu |
| `ao_wishlist` | sync z `/api/me/wishlist` |
| `ao_user` | usunąć (zastąpione sesją/JWT) |
| `ao_last_order` | zostawić jako fallback |
| `ao_notify_subs` | sync z `/api/notify-on-stock/me` |
| `ao_consent` | zostawić (per-przeglądarka, RODO) |
| `ao_newsletter_popup_seen` | zostawić |
