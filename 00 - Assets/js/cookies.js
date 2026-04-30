/* ============================================================
   AO_Cookies — banner zgód RODO/cookies (opt-in)
   ----
   Banner pojawia się tylko jeśli localStorage('ao_cookies_consent')
   nie istnieje. Po wyborze użytkownika zapisuje obiekt:
     { essential: true, analytics: bool, marketing: bool, ts: number, version: 1 }
============================================================ */
(function () {
  'use strict';

  const STORAGE_KEY = 'ao_cookies_consent';
  const CONSENT_VERSION = 1;

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return (raw && raw.version === CONSENT_VERSION) ? raw : null;
    } catch { return null; }
  }

  function save(consent) {
    const data = Object.assign({ essential: true, ts: Date.now(), version: CONSENT_VERSION }, consent);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    document.dispatchEvent(new CustomEvent('ao:cookies-consent', { detail: data }));
    return data;
  }

  function inject() {
    if (document.getElementById('ao-cookie-banner')) return;
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.id = 'ao-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Zgody na pliki cookies');
    banner.innerHTML = `
      <h4>🍪 Cenimy Twoją prywatność</h4>
      <p>Używamy plików cookies, aby sklep działał poprawnie (niezbędne) oraz — za Twoją zgodą — do analityki i marketingu. Szczegóły w <a href="polityka-prywatnosci.html">Polityce prywatności</a>.</p>
      <div class="cookie-actions">
        <button class="btn-accept-all" type="button" data-action="all">Akceptuję wszystkie</button>
        <button class="btn-essential" type="button" data-action="essential">Tylko niezbędne</button>
        <button class="btn-settings" type="button" data-action="settings">Ustawienia</button>
      </div>
    `;
    document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.add('show'));

    banner.querySelector('[data-action="all"]').addEventListener('click', () => {
      save({ essential: true, analytics: true, marketing: true });
      hide();
    });
    banner.querySelector('[data-action="essential"]').addEventListener('click', () => {
      save({ essential: true, analytics: false, marketing: false });
      hide();
    });
    banner.querySelector('[data-action="settings"]').addEventListener('click', openSettings);
  }

  function openSettings() {
    let modal = document.getElementById('ao-cookie-modal');
    if (modal) { modal.classList.add('open'); return; }

    modal = document.createElement('div');
    modal.id = 'ao-cookie-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:3500;display:none;align-items:center;justify-content:center;padding:20px;';
    modal.innerHTML = `
      <div style="background:var(--bg-card);border:1px solid rgba(201,168,76,0.2);border-radius:14px;padding:32px;max-width:520px;width:100%;max-height:90vh;overflow-y:auto;">
        <h3 style="font-family:'Bebas Neue',sans-serif;font-size:24px;color:var(--text-primary);margin-bottom:8px;letter-spacing:0.04em;">Ustawienia cookies</h3>
        <p style="font-size:13px;color:var(--text-secondary);margin-bottom:20px;line-height:1.6;">Zarządzaj kategoriami plików cookies. Możesz cofnąć zgodę w dowolnym momencie.</p>

        <label style="display:flex;align-items:flex-start;gap:12px;padding:14px;background:var(--surface);border-radius:8px;margin-bottom:10px;opacity:0.75;">
          <input type="checkbox" checked disabled style="margin-top:3px;flex-shrink:0;">
          <div>
            <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:14px;color:var(--text-primary);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">Niezbędne</div>
            <div style="font-size:12px;color:var(--text-muted);">Wymagane do działania sklepu (koszyk, sesja, logowanie). Zawsze aktywne.</div>
          </div>
        </label>

        <label style="display:flex;align-items:flex-start;gap:12px;padding:14px;background:var(--surface);border-radius:8px;margin-bottom:10px;cursor:pointer;">
          <input type="checkbox" id="ck-analytics" style="margin-top:3px;flex-shrink:0;accent-color:var(--gold);">
          <div>
            <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:14px;color:var(--text-primary);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">Analityczne</div>
            <div style="font-size:12px;color:var(--text-muted);">Pomagają nam zrozumieć, jak używasz sklepu (Google Analytics).</div>
          </div>
        </label>

        <label style="display:flex;align-items:flex-start;gap:12px;padding:14px;background:var(--surface);border-radius:8px;margin-bottom:20px;cursor:pointer;">
          <input type="checkbox" id="ck-marketing" style="margin-top:3px;flex-shrink:0;accent-color:var(--gold);">
          <div>
            <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:14px;color:var(--text-primary);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">Marketingowe</div>
            <div style="font-size:12px;color:var(--text-muted);">Personalizacja reklam i remarketing (Meta Pixel, Google Ads).</div>
          </div>
        </label>

        <div style="display:flex;gap:10px;">
          <button id="ck-save" type="button" style="flex:1;padding:12px;background:var(--gold);color:var(--bg-deep);border:none;border-radius:6px;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;">Zapisz wybór</button>
          <button id="ck-cancel" type="button" style="padding:12px 20px;background:transparent;color:var(--text-secondary);border:1.5px solid rgba(240,235,227,0.15);border-radius:6px;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;">Anuluj</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // pre-fill istniejącymi zgodami (jeśli są)
    const existing = load();
    if (existing) {
      modal.querySelector('#ck-analytics').checked = !!existing.analytics;
      modal.querySelector('#ck-marketing').checked = !!existing.marketing;
    }

    modal.style.display = 'flex';
    modal.classList.add('open');

    modal.querySelector('#ck-save').addEventListener('click', () => {
      save({
        essential: true,
        analytics: modal.querySelector('#ck-analytics').checked,
        marketing: modal.querySelector('#ck-marketing').checked,
      });
      modal.style.display = 'none';
      hide();
    });
    modal.querySelector('#ck-cancel').addEventListener('click', () => {
      modal.style.display = 'none';
    });
    modal.addEventListener('click', e => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  function hide() {
    const banner = document.getElementById('ao-cookie-banner');
    if (banner) banner.classList.remove('show');
  }

  function init() {
    const consent = load();
    if (!consent) {
      // pokaż banner gdy DOM gotowy
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject);
      } else {
        inject();
      }
    }
  }

  // Public API
  window.AO_Cookies = {
    get: load,
    save,
    show: inject,
    openSettings,
    hasConsent: (category) => {
      const c = load();
      return c ? !!c[category] : false;
    },
  };

  init();
})();
