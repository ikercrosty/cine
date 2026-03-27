/* ============================================================
   AUTOCINE ANTIGUA — GLOBAL JS
   Navbar · Cart · FAB · Animations · Toast · Stars · Loader
   ============================================================ */
'use strict';

/* ===== PAGE LOADER ===== */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('page-loader');
    if (loader) { loader.classList.add('hidden'); loader.addEventListener('transitionend', () => loader.remove(), {once:true}); }
  }, 900);
});

/* ===== NAVBAR ===== */
const navbar    = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navMobile = document.querySelector('.nav-mobile');

window.addEventListener('scroll', () => {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

if (hamburger) {
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    if (navMobile) {
      navMobile.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }
  });
}

// Close mobile menu on link click
document.querySelectorAll('.nav-mobile a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger?.classList.remove('open');
    navMobile?.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Active nav link
(function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[href]').forEach(link => {
    const href = link.getAttribute('href').split('/').pop();
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

/* ===== CART SYSTEM ===== */
const CART_KEY = 'autocine_cart';

const Cart = {
  items: [],

  load() {
    try { this.items = JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { this.items = []; }
    this.render();
  },

  save() {
    localStorage.setItem(CART_KEY, JSON.stringify(this.items));
    this.render();
  },

  add(product) {
    const existing = this.items.find(i => i.id === product.id);
    if (existing) { existing.qty += product.qty || 1; }
    else { this.items.push({ ...product, qty: product.qty || 1 }); }
    this.save();
    this.bump();
    showToast('¡Añadido!', `${product.name} en tu carrito`, '🛒');
  },

  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
  },

  updateQty(id, delta) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    item.qty = Math.max(1, item.qty + delta);
    if (item.qty === 0) { this.remove(id); return; }
    this.save();
  },

  clear() { this.items = []; this.save(); },

  total() { return this.items.reduce((s, i) => s + i.price * i.qty, 0); },

  count() { return this.items.reduce((s, i) => s + i.qty, 0); },

  bump() {
    document.querySelectorAll('.cart-count, .cart-fab-count').forEach(el => {
      el.classList.remove('bump');
      void el.offsetWidth;
      el.classList.add('bump');
    });
  },

  render() {
    const count = this.count();
    // Update all count badges (navbar + FAB)
    document.querySelectorAll('.cart-count, .cart-fab-count').forEach(el => {
      el.textContent = count;
      el.classList.toggle('hidden', count === 0);
    });

    // Sidebar items
    const container = document.getElementById('cart-items-list');
    const emptyEl   = document.getElementById('cart-empty');
    const footerEl  = document.getElementById('cart-footer');
    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = '';
      if (emptyEl)  emptyEl.style.display = 'flex';
      if (footerEl) footerEl.style.display = 'none';
      return;
    }

    if (emptyEl)  emptyEl.style.display = 'none';
    if (footerEl) footerEl.style.display = 'block';

    container.innerHTML = this.items.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-emoji">${item.emoji || '🎬'}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">Q${(item.price * item.qty).toFixed(2)}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="Cart.updateQty('${item.id}', -1)">−</button>
            <span>${item.qty}</span>
            <button class="qty-btn" onclick="Cart.updateQty('${item.id}', 1)">+</button>
            <button class="cart-item-del" onclick="Cart.remove('${item.id}')" title="Eliminar">✕</button>
          </div>
        </div>
      </div>`).join('');

    const totalEl = document.getElementById('cart-total-amount');
    if (totalEl) totalEl.textContent = `Q${this.total().toFixed(2)}`;
  }
};

/* ===== CART OPEN/CLOSE ===== */
function openCart() {
  document.querySelector('.cart-overlay')?.classList.add('open');
  document.querySelector('.cart-sidebar')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.querySelector('.cart-overlay')?.classList.remove('open');
  document.querySelector('.cart-sidebar')?.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
  // Wire overlay click
  document.querySelector('.cart-overlay')?.addEventListener('click', closeCart);
  document.querySelector('.cart-close')?.addEventListener('click', closeCart);
  // Load cart
  Cart.load();
});

/* ===== TOAST ===== */
function showToast(title, msg, icon = '✨', duration = 3500) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<div class="toast-icon">${icon}</div><div class="toast-body"><div class="toast-title">${title}</div><div class="toast-msg">${msg}</div></div>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, duration);
}

/* ===== SCROLL REVEAL ===== */
// Add 'js' class to html so CSS can scope reveal styles
document.documentElement.classList.add('js');

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.05, rootMargin: '0px 0px 0px 0px' });

function observeReveal(root) {
  (root || document).querySelectorAll('.reveal:not(.is-visible)').forEach(el => {
    revealObserver.observe(el);
  });
}

// Initial observe on DOM ready
document.addEventListener('DOMContentLoaded', observeReveal);
// Expose globally so dynamic renderers can call it after adding content
window.observeReveal = observeReveal;

/* ===== COUNTER ANIMATION ===== */
function animateCounter(el) {
  const target = parseFloat(el.dataset.target || 0);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 1600;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const val = Math.round(target * ease);
    el.textContent = prefix + val.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const cObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); cObserver.unobserve(e.target); } });
}, { threshold: 0.3 });
document.querySelectorAll('[data-counter]').forEach(el => cObserver.observe(el));

/* ===== STARFIELD ===== */
function initStars(canvasId = 'stars-canvas') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    stars = Array.from({length: 140}, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + .3,
      a: Math.random(),
      s: Math.random() * .006 + .002
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.a += s.s; if (s.a > 1 || s.a < 0) s.s *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.a * .8})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  resize();
  window.addEventListener('resize', resize);
  draw();
}