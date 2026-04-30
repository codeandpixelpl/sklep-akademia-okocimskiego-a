/* ============================================================
   AO_Analytics — placeholder śledzenia zdarzeń (GA4/GTM/Meta Pixel)
   ----
   Po podpięciu backendu/GTM:
   1. Dodaj GTM container ID poniżej (TODO).
   2. Wywołania track() są już rozsiane w cart.js i checkout —
      zostają zignorowane jeśli użytkownik nie wyraził zgody marketingowej.
============================================================ */
(function () {
  'use strict';

  // TODO(klient): wpisz właściwy GTM container ID, np. 'GTM-XXXXX'
  const GTM_ID = '';
  // TODO(klient): wpisz Meta Pixel ID, np. '1234567890'
  const META_PIXEL_ID = '';

  function loadGTM(id) {
    if (!id) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${id}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  }

  function loadMetaPixel(id) {
    if (!id) return;
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', id);
    window.fbq('track', 'PageView');
    /* eslint-enable */
  }

  function hasConsent(category) {
    if (window.AO_Cookies && typeof window.AO_Cookies.hasConsent === 'function') {
      return window.AO_Cookies.hasConsent(category);
    }
    return false;
  }

  function init() {
    if (hasConsent('analytics')) loadGTM(GTM_ID);
    if (hasConsent('marketing')) loadMetaPixel(META_PIXEL_ID);
  }

  // Po zmianie zgody — załaduj jeśli trzeba
  document.addEventListener('ao:cookies-consent', () => {
    if (hasConsent('analytics') && GTM_ID && !window.dataLayer) loadGTM(GTM_ID);
    if (hasConsent('marketing') && META_PIXEL_ID && !window.fbq) loadMetaPixel(META_PIXEL_ID);
  });

  /**
   * track('event_name', { ...params })
   * Standardowe eventy GA4 e-commerce:
   *  view_item, add_to_cart, remove_from_cart, view_cart,
   *  begin_checkout, add_payment_info, purchase
   */
  function track(eventName, params) {
    if (!hasConsent('analytics')) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: eventName }, params || {}));
    // Meta Pixel (mapowanie nazw)
    if (window.fbq && hasConsent('marketing')) {
      const map = {
        view_item: 'ViewContent',
        add_to_cart: 'AddToCart',
        begin_checkout: 'InitiateCheckout',
        purchase: 'Purchase',
      };
      const fbName = map[eventName];
      if (fbName) window.fbq('track', fbName, params || {});
    }
    if (typeof console !== 'undefined' && location.hostname === 'localhost') {
      console.log('[AO_Analytics]', eventName, params);
    }
  }

  window.AO_Analytics = { track, init };

  // Auto-track AO_Cart events
  document.addEventListener('ao:cart-change', e => {
    const detail = e.detail || {};
    if (detail.addedKey) {
      const item = (detail.cart || []).find(i => i.key === detail.addedKey);
      if (item) {
        track('add_to_cart', {
          currency: 'PLN',
          value: item.price,
          items: [{ item_id: item.productId, item_name: item.name, price: item.price, quantity: item.qty }],
        });
      }
    }
    if (detail.removedKey) {
      track('remove_from_cart', { item_key: detail.removedKey });
    }
  });

  init();
})();
