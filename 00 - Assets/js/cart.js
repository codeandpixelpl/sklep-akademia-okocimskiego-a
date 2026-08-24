/* ============================================================
   AO_Cart — wspólna logika koszyka (localStorage 'ao_cart')
   ----
   API publiczne: window.AO_Cart
     - load()/save()/clear()
     - all(), total(), count(), subtotal()
     - add(productId, size, qty?)
     - addItem({key,productId,name,category,price,image,size,qty}) — niskopoziomowo
     - remove(key)
     - changeQty(key, delta)
     - setQty(key, qty)
     - openDrawer()/closeDrawer()
     - bindDrawer() — montuje listenery na ikonach koszyka i drawerze
     - render() — renderuje aktualny stan w drawerze (wymaga DOM #cart-items, #cart-empty, #cart-footer, #cart-total, #cart-ship-info, #cart-count-drawer)
     - on(event, fn) — 'change'|'open'|'close'
   Dane bazują na window.AO_Catalog (products.js).
============================================================ */
(function () {
  'use strict';

  const STORAGE_KEY = 'ao_cart';
  const FREE_SHIP_THRESHOLD = 199;

  let cart = [];
  const listeners = { change: [], open: [], close: [] };

  function emit(evt, payload) {
    (listeners[evt] || []).forEach(fn => { try { fn(payload); } catch (e) { console.error(e); } });
    document.dispatchEvent(new CustomEvent('ao:cart-' + evt, { detail: payload }));
  }

  function load() {
    try { cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { cart = []; }
    return cart;
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  function clear() {
    cart = [];
    save();
    render();
    updateBadge();
    emit('change', { cart });
  }

  function all() { return cart.slice(); }
  function total() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }
  function subtotal() { return total(); }
  function count() { return cart.reduce((s, i) => s + i.qty, 0); }
  function getItem(key) { return cart.find(i => i.key === key) || null; }

  function buildKey(productId, size) {
    return size ? `${productId}_${size}` : `${productId}`;
  }

  function add(productId, size, qty) {
    const q = Math.max(1, parseInt(qty, 10) || 1);
    const product = window.AO_Catalog ? window.AO_Catalog.findById(productId) : null;
    if (!product) {
      console.warn('AO_Cart.add: nie znaleziono produktu', productId);
      return false;
    }
    const key = buildKey(product.id, size);
    const existing = cart.find(i => i.key === key);
    if (existing) {
      existing.qty += q;
    } else {
      cart.push({
        key,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        category: product.cat || product.category,
        price: product.price,
        image: product.image,
        size: size || null,
        qty: q,
      });
    }
    save();
    render();
    updateBadge();
    emit('change', { cart, addedKey: key });
    return true;
  }

  function addItem(item) {
    if (!item || !item.key) return false;
    const existing = cart.find(i => i.key === item.key);
    if (existing) existing.qty += (item.qty || 1);
    else cart.push(Object.assign({ qty: 1 }, item));
    save(); render(); updateBadge();
    emit('change', { cart, addedKey: item.key });
    return true;
  }

  function remove(key) {
    cart = cart.filter(i => i.key !== key);
    save(); render(); updateBadge();
    emit('change', { cart, removedKey: key });
  }

  function changeQty(key, delta) {
    const item = cart.find(i => i.key === key);
    if (!item) return;
    item.qty = Math.max(1, item.qty + (parseInt(delta, 10) || 0));
    save(); render(); updateBadge();
    emit('change', { cart, changedKey: key });
  }

  function setQty(key, qty) {
    const item = cart.find(i => i.key === key);
    if (!item) return;
    item.qty = Math.max(1, parseInt(qty, 10) || 1);
    save(); render(); updateBadge();
    emit('change', { cart, changedKey: key });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  function render() {
    const container = document.getElementById('cart-items');
    const emptyEl = document.getElementById('cart-empty');
    const footer = document.getElementById('cart-footer');
    const totalEl = document.getElementById('cart-total');
    const shipInfo = document.getElementById('cart-ship-info');

    if (!container) return; // strona bez drawera (np. 404)

    container.querySelectorAll('.cart-item').forEach(el => el.remove());

    if (cart.length === 0) {
      if (emptyEl) emptyEl.style.display = '';
      if (footer) footer.style.display = 'none';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (footer) footer.style.display = '';

    cart.forEach(item => {
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <div class="cart-item-img"><img src="${item.image}" alt="${escapeHtml(item.name)}" loading="lazy"></div>
        <div class="cart-item-info">
          <div class="cart-item-meta">${escapeHtml(item.category || '')}</div>
          <div class="cart-item-name">${escapeHtml(item.name)}</div>
          ${item.size ? `<div class="cart-item-size">Rozmiar: <strong>${escapeHtml(item.size)}</strong></div>` : ''}
          <div class="cart-item-bottom">
            <div class="cart-item-price">${item.price * item.qty} zł</div>
            <div style="display:flex;align-items:center;gap:4px;">
              <div class="qty-ctrl">
                <button class="qty-btn" data-key="${item.key}" data-delta="-1" aria-label="Zmniejsz">−</button>
                <span class="qty-val">${item.qty}</span>
                <button class="qty-btn" data-key="${item.key}" data-delta="1" aria-label="Zwiększ">+</button>
              </div>
              <button class="cart-item-remove" data-key="${item.key}" aria-label="Usuń">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
              </button>
            </div>
          </div>
        </div>`;
      container.appendChild(el);
    });

    const t = total();
    if (totalEl) totalEl.textContent = `${t} zł`;
    if (shipInfo) {
      const diff = FREE_SHIP_THRESHOLD - t;
      shipInfo.innerHTML = diff > 0
        ? `Dodaj jeszcze <span>${diff} zł</span>, aby otrzymać darmową dostawę.`
        : `<span>Masz darmową dostawę! 🎉</span>`;
    }

    renderCrossSell();
  }

  /* Cross-sell — produkty powiązane z pierwszym produktem w koszyku */
  function renderCrossSell() {
    const host = document.getElementById('cart-crosssell');
    if (!host) return;
    // Schowaj cross-sell jeśli koszyk już ma ≥3 pozycje (CTA musi być widoczny)
    if (cart.length === 0 || cart.length >= 3 || !window.AO_Catalog) {
      host.innerHTML = '';
      host.style.display = 'none';
      return;
    }
    const cartIds = new Set(cart.map(i => Number(i.productId)));
    const seedId = Number(cart[0].productId);
    let suggestions = window.AO_Catalog.related(seedId, 6).filter(p => !cartIds.has(p.id)).slice(0, 3);
    // fallback: featured
    if (suggestions.length === 0) {
      suggestions = window.AO_Catalog.featured(3).filter(p => !cartIds.has(p.id)).slice(0, 3);
    }
    if (suggestions.length === 0) { host.style.display = 'none'; return; }

    host.style.display = '';
    host.innerHTML = `
      <div class="cart-cs-title">Dodaj do zamówienia</div>
      <div class="cart-cs-list">
        ${suggestions.map(p => `
          <div class="cart-cs-item" data-cs-id="${p.id}">
            <div class="cart-cs-img"><img src="${p.image}" alt="${escapeHtml(p.name)}" width="48" height="48" loading="lazy"></div>
            <div class="cart-cs-info">
              <div class="cart-cs-name">${escapeHtml(p.name)}</div>
              <div class="cart-cs-price">${p.price} zł</div>
            </div>
            <button class="cart-cs-add" type="button" data-cs-add="${p.id}" aria-label="Dodaj ${escapeHtml(p.name)} do koszyka">+</button>
          </div>
        `).join('')}
      </div>`;

    host.querySelectorAll('[data-cs-add]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.csAdd);
        const product = window.AO_Catalog.findById(id);
        if (!product) return;
        // Jeżeli produkt ma rozmiary — nie dodajemy bez wyboru, tylko przekierowujemy na PDP
        if (product.sizes && product.sizes.length > 0) {
          location.href = 'produkt.html?id=' + id;
          return;
        }
        add(id, null, 1);
      });
    });
  }

  function updateBadge() {
    const c = count();
    document.querySelectorAll('.cart-badge').forEach(el => {
      el.textContent = c;
      el.style.display = c === 0 ? 'none' : '';
    });
    const drawerCount = document.getElementById('cart-count-drawer');
    if (drawerCount) drawerCount.textContent = `(${c})`;
    // floating cart (jeśli istnieje)
    const fcCount = document.getElementById('fc-count');
    if (fcCount) fcCount.textContent = c;
    const floating = document.getElementById('floating-cart');
    if (floating) floating.classList.toggle('show', c > 0);
  }

  let _lastFocus = null;
  let _trapHandler = null;

  function getFocusable(root) {
    return Array.from(root.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(el => el.offsetParent !== null);
  }

  function openDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (!drawer || !overlay) return;
    _lastFocus = document.activeElement;
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Focus na przycisk zamknięcia (a nie na losowy element)
    const closeBtn = document.getElementById('cart-close');
    setTimeout(() => closeBtn?.focus(), 30);

    // Focus trap
    _trapHandler = function (e) {
      if (e.key !== 'Tab') return;
      const focusable = getFocusable(drawer);
      if (focusable.length === 0) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    };
    drawer.addEventListener('keydown', _trapHandler);
    emit('open', {});
  }

  function closeDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (!drawer || !overlay) return;
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    if (_trapHandler) drawer.removeEventListener('keydown', _trapHandler);
    _trapHandler = null;
    if (_lastFocus && typeof _lastFocus.focus === 'function') _lastFocus.focus();
    _lastFocus = null;
    emit('close', {});
  }

  function bindDrawer() {
    const closeBtn = document.getElementById('cart-close');
    const overlay = document.getElementById('cart-overlay');
    const cartIconBtn = document.getElementById('cart-icon-btn');
    const itemsContainer = document.getElementById('cart-items');
    const floating = document.getElementById('floating-cart');

    // Wstrzyknij kontener cross-sell, jeśli go jeszcze nie ma
    if (itemsContainer && !document.getElementById('cart-crosssell')) {
      const cs = document.createElement('div');
      cs.id = 'cart-crosssell';
      cs.className = 'cart-crosssell';
      cs.style.display = 'none';
      itemsContainer.parentNode.insertBefore(cs, itemsContainer.nextSibling);
    }

    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);
    if (cartIconBtn) cartIconBtn.addEventListener('click', openDrawer);
    if (floating) floating.addEventListener('click', openDrawer);

    if (itemsContainer) {
      itemsContainer.addEventListener('click', e => {
        const qtyBtn = e.target.closest('.qty-btn');
        const removeBtn = e.target.closest('.cart-item-remove');
        if (qtyBtn) changeQty(qtyBtn.dataset.key, parseInt(qtyBtn.dataset.delta, 10));
        if (removeBtn) remove(removeBtn.dataset.key);
      });
    }

    // ESC zamyka drawer
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        const drawer = document.getElementById('cart-drawer');
        if (drawer && drawer.classList.contains('open')) closeDrawer();
      }
    });
  }

  function on(event, fn) {
    if (listeners[event]) listeners[event].push(fn);
  }

  function init() {
    load();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        bindDrawer();
        render();
        updateBadge();
      });
    } else {
      bindDrawer();
      render();
      updateBadge();
    }
  }

  // Public API
  window.AO_Cart = {
    load, save, clear,
    all, total, subtotal, count, getItem,
    add, addItem, remove, changeQty, setQty,
    openDrawer, closeDrawer, bindDrawer,
    render, updateBadge,
    on,
    FREE_SHIP_THRESHOLD,
  };

  init();
})();
