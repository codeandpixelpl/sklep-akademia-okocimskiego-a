/* ============================================================
   AO_Site — wspólne UI (hamburger, search, fade-up, helpery)
============================================================ */
(function () {
  'use strict';

  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  function formatPrice(value) {
    const n = Number(value) || 0;
    return n.toLocaleString('pl-PL', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' zł';
  }

  /* Omnibus — najniższa cena z 30 dni przed obniżką (wymagane gdy oldPrice).
     Zwraca pusty string gdy nie ma promocji. */
  function omnibusHTML(product) {
    if (!product || !product.oldPrice) return '';
    const lowest = product.lowest30dPrice != null ? product.lowest30dPrice : product.price;
    return `<div class="price-omnibus" title="Wymagane prawem (Dyrektywa Omnibus)">Najniższa cena z 30 dni: ${lowest} zł</div>`;
  }

  function getQueryParam(name) {
    return new URLSearchParams(location.search).get(name);
  }

  function setQueryParams(params, opts = {}) {
    const url = new URL(location.href);
    Object.keys(params).forEach(k => {
      const v = params[k];
      if (v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) {
        url.searchParams.delete(k);
      } else if (Array.isArray(v)) {
        url.searchParams.set(k, v.join(','));
      } else {
        url.searchParams.set(k, String(v));
      }
    });
    if (opts.replace) history.replaceState({}, '', url);
    else history.pushState({}, '', url);
  }

  /* Wzbogać mobile-nav o search + brakujące linki (Konto/Ulubione)
     Wywołane raz, przed bindHamburger, żeby linki były klikalne. */
  function enrichMobileNav() {
    const nav = document.getElementById('mobile-nav');
    if (!nav || nav.dataset.enriched === '1') return;
    nav.dataset.enriched = '1';

    // Dodaj search input na początku (jeśli nie ma)
    if (!nav.querySelector('.mobile-nav-search')) {
      const searchForm = document.createElement('form');
      searchForm.className = 'mobile-nav-search';
      searchForm.action = 'wyniki-wyszukiwania.html';
      searchForm.method = 'get';
      searchForm.setAttribute('role', 'search');
      searchForm.innerHTML = `
        <input type="search" name="q" placeholder="Szukaj produktu…" aria-label="Szukaj" required>
        <button type="submit">OK</button>
      `;
      nav.insertBefore(searchForm, nav.firstChild);
    }

    // Upewnij się że są linki do Moje konto i Ulubione
    const links = Array.from(nav.querySelectorAll('a')).map(a => a.getAttribute('href'));
    if (!links.includes('konto.html') && !links.includes('moje-konto.html')) {
      const a = document.createElement('a');
      a.href = 'konto.html';
      a.textContent = 'Moje konto';
      nav.appendChild(a);
    }
    if (!links.includes('ulubione.html')) {
      const a = document.createElement('a');
      a.href = 'ulubione.html';
      a.textContent = 'Ulubione';
      nav.appendChild(a);
    }
  }

  /* Hamburger + mobile nav */
  function bindHamburger() {
    const btn = document.getElementById('hamburger-btn');
    const nav = document.getElementById('mobile-nav');
    if (!btn || !nav) return;

    btn.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      btn.classList.toggle('open', isOpen);
      btn.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
      // Focus na pierwszy link po otwarciu
      if (isOpen) {
        const first = nav.querySelector('a, input, button');
        setTimeout(() => first?.focus(), 30);
      }
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* Search w headerze + autocomplete dropdown */
  function bindHeaderSearch() {
    const trigger = document.getElementById('search-trigger');
    const form = document.getElementById('search-form');
    const input = form ? form.querySelector('input[name="q"]') : null;
    if (!trigger || !form || !input) return;

    // Stwórz kontener autocomplete
    let suggestBox = form.querySelector('.search-suggest');
    if (!suggestBox) {
      suggestBox = document.createElement('div');
      suggestBox.className = 'search-suggest';
      suggestBox.setAttribute('role', 'listbox');
      suggestBox.hidden = true;
      form.appendChild(suggestBox);
    }

    trigger.addEventListener('click', e => {
      e.preventDefault();
      const open = form.classList.toggle('open');
      if (open) setTimeout(() => input.focus(), 50);
      else suggestBox.hidden = true;
    });

    let activeIdx = -1;

    function renderSuggestions(items) {
      if (!items.length) {
        suggestBox.hidden = true;
        suggestBox.innerHTML = '';
        return;
      }
      suggestBox.innerHTML = items.map((p, i) => `
        <a href="produkt.html?id=${p.id}" class="search-suggest-item" role="option" data-idx="${i}">
          <div class="search-suggest-img"><img src="${p.image}" alt="" width="48" height="48" loading="lazy"></div>
          <div class="search-suggest-body">
            <div class="search-suggest-cat">${escapeHtml(p.cat)}</div>
            <div class="search-suggest-name">${escapeHtml(p.name)}</div>
            <div class="search-suggest-price">${p.price} zł${p.oldPrice ? ` <span class="search-suggest-old">${p.oldPrice} zł</span>` : ''}</div>
          </div>
        </a>`).join('') + `<div class="search-suggest-all"><a href="wyniki-wyszukiwania.html?q=${encodeURIComponent(input.value)}">Zobacz wszystkie wyniki →</a></div>`;
      suggestBox.hidden = false;
      activeIdx = -1;
    }

    let lastQuery = '';
    input.addEventListener('input', () => {
      const q = (input.value || '').trim();
      if (q === lastQuery) return;
      lastQuery = q;
      if (q.length < 2 || !window.AO_Catalog) {
        suggestBox.hidden = true;
        return;
      }
      const results = window.AO_Catalog.search(q).slice(0, 5);
      renderSuggestions(results);
    });

    input.addEventListener('keydown', e => {
      const items = suggestBox.querySelectorAll('.search-suggest-item');
      if (suggestBox.hidden || items.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIdx = (activeIdx + 1) % items.length;
        items.forEach((el, i) => el.classList.toggle('active', i === activeIdx));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIdx = (activeIdx - 1 + items.length) % items.length;
        items.forEach((el, i) => el.classList.toggle('active', i === activeIdx));
      } else if (e.key === 'Enter' && activeIdx >= 0) {
        e.preventDefault();
        items[activeIdx].click();
      }
    });

    document.addEventListener('click', e => {
      if (form.classList.contains('open') && !form.contains(e.target) && e.target !== trigger && !trigger.contains(e.target)) {
        form.classList.remove('open');
        suggestBox.hidden = true;
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && form.classList.contains('open')) {
        form.classList.remove('open');
        suggestBox.hidden = true;
      }
    });
  }

  /* Newsletter — walidacja + stub fetch + auto-injection zgody RODO */
  function bindNewsletter() {
    document.querySelectorAll('.newsletter-form').forEach(form => {
      // Usuń stary onsubmit attribute jeśli był
      form.removeAttribute('onsubmit');

      // Wstrzyknij checkbox zgody + klauzulę informacyjną RODO (jeśli jeszcze ich nie ma)
      if (!form.querySelector('.newsletter-consent')) {
        const formId = 'nl-consent-' + Math.random().toString(36).slice(2, 8);
        const consentHTML = `
          <label class="newsletter-consent">
            <input type="checkbox" id="${formId}" name="consent" required>
            <span>Wyrażam zgodę na otrzymywanie newslettera (informacji handlowych) drogą elektroniczną. Zgoda jest dobrowolna i mogę ją wycofać w każdej chwili. <span class="newsletter-req">*</span></span>
          </label>
          <p class="newsletter-fineprint">
            Administrator: Akademia Piłkarska Okocimski Brzesko. Podstawa: art. 6 ust. 1 lit. a RODO. Szczegóły: <a href="polityka-prywatnosci.html" target="_blank" rel="noopener">Polityka prywatności</a>.
          </p>`;
        form.insertAdjacentHTML('beforeend', consentHTML);
      }

      form.addEventListener('submit', async e => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        const consent = form.querySelector('input[name="consent"]');
        const button = form.querySelector('button[type="submit"]');
        const origLabel = button.textContent;
        let msgEl = form.querySelector('.newsletter-msg');
        if (!msgEl) {
          msgEl = document.createElement('div');
          msgEl.className = 'newsletter-msg';
          form.appendChild(msgEl);
        }

        const email = (input.value || '').trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          msgEl.className = 'newsletter-msg err';
          msgEl.textContent = 'Wpisz poprawny adres e-mail.';
          return;
        }
        if (consent && !consent.checked) {
          msgEl.className = 'newsletter-msg err';
          msgEl.textContent = 'Zaznacz zgodę na otrzymywanie newslettera.';
          consent.focus();
          return;
        }

        button.disabled = true;
        button.textContent = 'Zapisuję…';

        try {
          // TODO(backend): podmień na właściwy endpoint
          // const res = await fetch('/api/newsletter', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, consent: true }) });
          // if (!res.ok) throw new Error('Network');
          await new Promise(r => setTimeout(r, 600)); // tymczasowy mock
          msgEl.className = 'newsletter-msg ok';
          msgEl.textContent = 'Dziękujemy! Sprawdź skrzynkę, żeby potwierdzić zapis (double opt-in).';
          input.value = '';
          if (consent) consent.checked = false;
          button.textContent = 'Zapisano!';
          setTimeout(() => { button.textContent = origLabel; button.disabled = false; }, 2200);
        } catch {
          msgEl.className = 'newsletter-msg err';
          msgEl.textContent = 'Coś poszło nie tak. Spróbuj ponownie.';
          button.disabled = false;
          button.textContent = origLabel;
        }
      });
    });
  }

  /* Intersection Observer — fade-up */
  function bindFadeUp() {
    if (typeof IntersectionObserver === 'undefined') {
      document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
  }

  /* Toast helper */
  function toast(text, ms) {
    let el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(el._hideTimer);
    el._hideTimer = setTimeout(() => el.classList.remove('show'), ms || 1800);
  }

  /* Wishlist (localStorage) */
  const WISHLIST_KEY = 'ao_wishlist';
  const Wishlist = {
    load() {
      try { return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []; }
      catch { return []; }
    },
    save(list) { localStorage.setItem(WISHLIST_KEY, JSON.stringify(list)); },
    has(productId) {
      return this.load().some(id => Number(id) === Number(productId));
    },
    toggle(productId) {
      const id = Number(productId);
      let list = this.load();
      const exists = list.some(x => Number(x) === id);
      if (exists) list = list.filter(x => Number(x) !== id);
      else list.push(id);
      this.save(list);
      document.dispatchEvent(new CustomEvent('ao:wishlist-changed', { detail: { id, added: !exists } }));
      return !exists;
    },
    all() { return this.load(); },
  };

  /* Renderuje wspólny topbar + header + mobile-nav.
     Wystarczy w pliku HTML mieć <div data-ao-header></div> jako pierwszy element <body>. */
  function renderHeader() {
    const placeholders = document.querySelectorAll('[data-ao-header]');
    if (placeholders.length === 0) return;

    const html = `
      <a href="#main" class="skip-link">Przejdź do treści</a>
      <div class="site-header-wrap">
      <div class="topbar">Darmowa dostawa od 199 zł &nbsp;&bull;&nbsp; Odbiór osobisty w Brzesku</div>
      <header>
        <div class="header-inner">
          <a href="index.html" class="logo">
            <img src="00%20-%20Assets/image%201.png" alt="Akademia Okocimskiego">
          </a>
          <nav>
            <a href="index.html" data-nav="index">Sklep</a>
            <a href="kategoria.html?kat=stroje" data-nav="stroje">Stroje Meczowe</a>
            <a href="kategoria.html?kat=treningi" data-nav="treningi">Treningowe</a>
            <a href="kategoria.html?kat=ochrona" data-nav="ochrona">Ochraniacze</a>
            <a href="kategoria.html?kat=akcesoria" data-nav="akcesoria">Akcesoria</a>
            <a href="kontakt.html" data-nav="kontakt">Kontakt</a>
          </nav>
          <div class="header-actions">
            <button id="search-trigger" aria-label="Szukaj" aria-expanded="false">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
            <a href="konto.html" aria-label="Moje konto">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </a>
            <a href="ulubione.html" aria-label="Ulubione">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            </a>
            <button id="cart-icon-btn" aria-label="Koszyk">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <span class="cart-badge" style="display:none;" aria-live="polite">0</span>
            </button>
          </div>
          <button class="nav-hamburger" id="hamburger-btn" aria-label="Menu" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>
        <form id="search-form" class="search-form" action="wyniki-wyszukiwania.html" method="get" role="search">
          <label for="header-search-input" class="visually-hidden">Szukaj produktu</label>
          <input type="search" id="header-search-input" name="q" placeholder="Szukaj produktu…" aria-label="Szukaj produktu" autocomplete="off" required>
          <button type="submit">Szukaj</button>
        </form>
      </header>
      </div>
      <div class="mobile-nav" id="mobile-nav">
        <a href="index.html">Sklep</a>
        <a href="kategoria.html?kat=stroje">Stroje Meczowe</a>
        <a href="kategoria.html?kat=treningi">Odzież Treningowa</a>
        <a href="kategoria.html?kat=ochrona">Ochraniacze &amp; Skarpety</a>
        <a href="kategoria.html?kat=akcesoria">Czapki &amp; Akcesoria</a>
        <a href="kontakt.html">Kontakt</a>
      </div>
    `;
    placeholders.forEach(el => { el.outerHTML = html; });

    // Podświetl aktywny link nav (na podstawie aktualnego pliku/parametru)
    const path = location.pathname.split('/').pop() || 'index.html';
    const kat = new URLSearchParams(location.search).get('kat');
    let key = null;
    if (path === 'index.html' || path === '') key = 'index';
    else if (path === 'kategoria.html' && kat) key = kat;
    else if (path === 'kontakt.html') key = 'kontakt';
    if (key) {
      const link = document.querySelector(`header nav a[data-nav="${key}"]`);
      if (link) link.classList.add('active');
    }
  }

  /* Renderuje wspólną stopkę. Aby z niego skorzystać, w pliku HTML wystarczy:
       <footer data-ao-footer></footer>
     Stopka zostanie wstrzyknięta automatycznie. */
  function renderFooter() {
    const placeholders = document.querySelectorAll('footer[data-ao-footer]');
    if (placeholders.length === 0) return;
    const html = `
      <div class="container">
        <div class="footer-top">
          <div class="footer-brand">
            <a href="index.html" class="logo"><img src="00%20-%20Assets/image%201.png" alt="Akademia Okocimskiego" style="height:44px;"></a>
            <p>Oficjalny sklep Akademii Piłkarskiej Okocimskiego w Brzesku. Reprezentuj swój klub z dumą i stylem.</p>
            <div class="footer-social">
              <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
              <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg></a>
              <a href="#" aria-label="YouTube"><svg viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#fff"/></svg></a>
            </div>
          </div>
          <div class="footer-col">
            <h4>Sklep</h4>
            <ul>
              <li><a href="kategoria.html?kat=stroje">Stroje Meczowe</a></li>
              <li><a href="kategoria.html?kat=treningi">Odzież Treningowa</a></li>
              <li><a href="kategoria.html?kat=ochrona">Ochraniacze &amp; Skarpety</a></li>
              <li><a href="kategoria.html?kat=akcesoria">Czapki &amp; Akcesoria</a></li>
              <li><a href="o-nas.html">O Akademii</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Konto</h4>
            <ul>
              <li><a href="logowanie.html">Logowanie</a></li>
              <li><a href="rejestracja.html">Rejestracja</a></li>
              <li><a href="moje-konto.html">Moje zamówienia</a></li>
              <li><a href="ulubione.html">Ulubione</a></li>
              <li><a href="kontakt.html">Kontakt</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Pomoc</h4>
            <ul>
              <li><a href="dostawa-i-zwroty.html">Dostawa i zwroty</a></li>
              <li><a href="reklamacje.html">Reklamacje</a></li>
              <li><a href="tabela-rozmiarow.html">Tabela rozmiarów</a></li>
              <li><a href="faq.html">FAQ</a></li>
              <li><a href="regulamin.html">Regulamin</a></li>
              <li><a href="polityka-prywatnosci.html">Polityka prywatności</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 Akademia Okocimskiego. Wszelkie prawa zastrzeżone.</p>
          <div class="payment-badges">
            <span class="payment-badge">Visa</span>
            <span class="payment-badge">Mastercard</span>
            <span class="payment-badge">Blik</span>
            <span class="payment-badge">Przelewy24</span>
          </div>
        </div>
      </div>`;
    placeholders.forEach(el => { el.innerHTML = html; });
  }

  /* Auto-ładowanie cookies.js i analytics.js — żeby nie trzeba było wpisywać <script>
     w każdym pliku HTML osobno */
  function autoloadModule(src) {
    return new Promise(resolve => {
      // już załadowany?
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = resolve;
      s.onerror = resolve;
      document.head.appendChild(s);
    });
  }

  async function autoloadAddons() {
    // cookies.js — banner zgód RODO
    await autoloadModule('00%20-%20Assets/js/cookies.js');
    // analytics.js — wysyła eventy gdy jest zgoda 'analytics'
    await autoloadModule('00%20-%20Assets/js/analytics.js');
  }

  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run);
    } else {
      run();
    }
  }

  function run() {
    renderHeader();   // musi być pierwszy — header zawiera elementy używane przez resztę
    renderFooter();
    enrichMobileNav();
    bindHamburger();
    bindHeaderSearch();
    bindNewsletter();
    bindFadeUp();
    autoloadAddons();
    mountFreeShipBar();
    mountNewsletterPopup();
    mountSocialProofToast();
    // Cart drawer może wymagać re-bindowania ikony koszyka skoro header został podmieniony
    if (window.AO_Cart && typeof window.AO_Cart.bindDrawer === 'function') {
      window.AO_Cart.bindDrawer();
      window.AO_Cart.updateBadge();
    }
  }

  /* Newsletter pop-up — exit-intent (desktop) lub scroll 50% (mobile), max raz na 14 dni */
  function mountNewsletterPopup() {
    // Wyklucz strony, na których pop-up byłby uciążliwy
    const path = location.pathname.split('/').pop() || 'index.html';
    if (['checkout.html','dziekujemy.html','rejestracja.html','logowanie.html','reset-hasla.html','reklamacje.html'].includes(path)) return;

    const KEY = 'ao_newsletter_popup_seen';
    const TTL_DAYS = 14;
    try {
      const seen = Number(localStorage.getItem(KEY) || 0);
      if (seen && (Date.now() - seen) < TTL_DAYS * 24 * 3600 * 1000) return;
    } catch {}

    let triggered = false;
    function show() {
      if (triggered) return;
      triggered = true;
      document.removeEventListener('mouseout', exitIntent);
      window.removeEventListener('scroll', scrollTrigger);

      const overlay = document.createElement('div');
      overlay.className = 'np-overlay';
      overlay.innerHTML = `
        <div class="np-modal" role="dialog" aria-modal="true" aria-labelledby="np-title">
          <button class="np-close" type="button" aria-label="Zamknij">×</button>
          <div class="np-badge">Tylko teraz</div>
          <h2 class="np-title" id="np-title">Zgarnij <em>-10%</em><br/>na pierwsze zakupy</h2>
          <p class="np-desc">Zapisz się do newslettera Akademii i otrzymaj kod rabatowy na maila.</p>
          <form class="np-form" novalidate>
            <input type="email" placeholder="twoj@email.pl" required autocomplete="email" aria-label="Adres e-mail" />
            <button type="submit">Wyślij kod</button>
          </form>
          <p class="np-msg" hidden></p>
          <p class="np-fineprint">Zgoda dobrowolna, można wycofać w każdej chwili. <a href="polityka-prywatnosci.html" target="_blank" rel="noopener">Polityka prywatności</a>.</p>
          <button class="np-decline" type="button">Nie, dziękuję</button>
        </div>`;
      document.body.appendChild(overlay);
      requestAnimationFrame(() => overlay.classList.add('show'));

      function close() {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
        try { localStorage.setItem(KEY, String(Date.now())); } catch {}
      }
      overlay.querySelector('.np-close').addEventListener('click', close);
      overlay.querySelector('.np-decline').addEventListener('click', close);
      overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
      document.addEventListener('keydown', function onEsc(e) {
        if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onEsc); }
      });

      overlay.querySelector('.np-form').addEventListener('submit', async ev => {
        ev.preventDefault();
        const inp = overlay.querySelector('input[type="email"]');
        const msg = overlay.querySelector('.np-msg');
        const email = (inp.value || '').trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          msg.hidden = false; msg.className = 'np-msg err';
          msg.textContent = 'Wpisz poprawny adres e-mail.';
          return;
        }
        const btn = overlay.querySelector('button[type="submit"]');
        btn.disabled = true; btn.textContent = 'Wysyłam…';
        // TODO(backend): POST /api/newsletter { email, source: 'popup', discount: 'AO10' }
        await new Promise(r => setTimeout(r, 700));
        msg.hidden = false; msg.className = 'np-msg ok';
        msg.innerHTML = 'Sprawdź skrzynkę! Kod rabatowy: <strong>AO10</strong>';
        inp.value = '';
        btn.textContent = 'Wysłane';
        setTimeout(close, 2200);
      });
    }

    function exitIntent(e) {
      if (e.clientY < 10 && !e.relatedTarget) show();
    }
    function scrollTrigger() {
      const pct = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (pct > 0.5) show();
    }

    // Pokaż dopiero po ≥2 odsłonach w sesji + po 30s na stronie (mniej nachalnie)
    const VIEW_KEY = 'ao_session_pageviews';
    let views = 0;
    try { views = Number(sessionStorage.getItem(VIEW_KEY) || 0); } catch {}
    views += 1;
    try { sessionStorage.setItem(VIEW_KEY, String(views)); } catch {}
    if (views < 2) return;

    setTimeout(() => {
      const isDesktop = window.matchMedia('(min-width: 768px)').matches;
      if (isDesktop) document.addEventListener('mouseout', exitIntent);
      else window.addEventListener('scroll', scrollTrigger, { passive: true });
    }, 30000);
  }

  /* Social proof toast — "Anna z Krakowa kupiła X" w lewym dolnym rogu */
  function mountSocialProofToast() {
    const path = location.pathname.split('/').pop() || 'index.html';
    if (['checkout.html','dziekujemy.html'].includes(path)) return;
    if (!window.AO_Catalog) return;

    const NAMES = [
      ['Anna','Krakowa'], ['Marek','Tarnowa'], ['Ola','Brzeska'], ['Tomek','Bochni'],
      ['Kasia','Krakowa'], ['Piotr','Nowego Sącza'], ['Magda','Wieliczki'], ['Bartek','Brzeska'],
      ['Ewa','Tarnowa'], ['Krzysztof','Krakowa'], ['Justyna','Bochni'], ['Adam','Brzeska']
    ];
    const items = AO_Catalog.all().slice();
    if (items.length === 0) return;

    let bubble;
    let timer;
    function buildBubble() {
      bubble = document.createElement('div');
      bubble.className = 'sp-toast';
      document.body.appendChild(bubble);
    }
    function showOne() {
      const [name, city] = NAMES[Math.floor(Math.random() * NAMES.length)];
      const product = items[Math.floor(Math.random() * items.length)];
      const minutesAgo = Math.floor(Math.random() * 25) + 2;
      bubble.innerHTML = `
        <div class="sp-toast-img"><img src="${product.image}" alt="" width="40" height="40"></div>
        <div class="sp-toast-body">
          <div class="sp-toast-text"><strong>${name}</strong> z miasta ${city}<br/>kupił${name.endsWith('a') ? 'a' : ''} <em>${product.name}</em></div>
          <div class="sp-toast-time">${minutesAgo} min temu · ✓ Zweryfikowane</div>
        </div>
        <button class="sp-toast-close" type="button" aria-label="Zamknij">×</button>`;
      bubble.classList.add('show');
      bubble.querySelector('.sp-toast-close').onclick = () => bubble.classList.remove('show');
      clearTimeout(timer);
      timer = setTimeout(() => bubble.classList.remove('show'), 5500);
    }

    setTimeout(() => {
      buildBubble();
      let count = 0;
      function loop() {
        if (count >= 2) return; // max 2 razy na sesję (mniej spamu)
        showOne();
        count++;
        setTimeout(loop, 60000); // co 60s
      }
      setTimeout(loop, 12000); // pierwszy po 12s
    }, 1000);
  }

  /* Aktualizuje tekst w topbarze: gdy koszyk niepusty pokazuje progress do darmowej dostawy.
     Przy pustym koszyku — domyślny tekst marketingowy. */
  function mountFreeShipBar() {
    const topbar = document.querySelector('.topbar');
    if (!topbar) return;
    const THRESHOLD = (window.AO_Cart && window.AO_Cart.FREE_SHIP_THRESHOLD) || 199;
    const DEFAULT_HTML = topbar.dataset.defaultHtml || topbar.innerHTML;
    topbar.dataset.defaultHtml = DEFAULT_HTML;

    function update() {
      if (!window.AO_Cart) return;
      const t = window.AO_Cart.total();
      const c = window.AO_Cart.count();
      if (c === 0) {
        topbar.innerHTML = DEFAULT_HTML;
        topbar.classList.remove('done');
        return;
      }
      const diff = THRESHOLD - t;
      if (diff > 0) {
        topbar.innerHTML = `Brakuje <strong>${diff} zł</strong> do darmowej dostawy`;
        topbar.classList.remove('done');
      } else {
        topbar.innerHTML = `Masz darmową dostawę! 🎉`;
        topbar.classList.add('done');
      }
    }

    document.addEventListener('ao:cart-change', update);
    if (window.AO_Cart) update();
  }

  // Public API
  window.AO_Site = {
    escapeHtml,
    formatPrice,
    omnibusHTML,
    getQueryParam,
    setQueryParams,
    toast,
    Wishlist,
  };

  init();
})();
