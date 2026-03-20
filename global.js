/* ============================================================
   GALAXIA DRIVE-IN — GLOBAL JS
   Navbar · Cart · Animations · Toast · Stars · Loader
   ============================================================ */

'use strict';

/* ===== PAGE LOADER ===== */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('page-loader');
    if (loader) loader.classList.add('hidden');
  }, 900);
});

/* ===== NAVBAR ===== */
const navbar   = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navMobile = document.querySelector('.nav-mobile');

window.addEventListener('scroll', () => {
  if (!navbar) return;
  navbar.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

if (hamburger && navMobile) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navMobile.classList.toggle('open');
    document.body.style.overflow = navMobile.classList.contains('open') ? 'hidden' : '';
  });
}

// Close mobile menu on link click
document.querySelectorAll('.nav-mobile .nav-link').forEach(link => {
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
const CART_KEY = 'galaxia_cart';

const Cart = {
  items: [],

  load() {
    try {
      this.items = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      this.items = [];
    }
    this.render();
  },

  save() {
    localStorage.setItem(CART_KEY, JSON.stringify(this.items));
    this.render();
  },

  add(product) {
    const existing = this.items.find(i => i.id === product.id);
    if (existing) {
      existing.qty += product.qty || 1;
    } else {
      this.items.push({ ...product, qty: product.qty || 1 });
    }
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
    this.save();
  },

  clear() {
    this.items = [];
    this.save();
  },

  total() {
    return this.items.reduce((s, i) => s + i.price * i.qty, 0);
  },

  count() {
    return this.items.reduce((s, i) => s + i.qty, 0);
  },

  bump() {
    const el = document.querySelector('.cart-count');
    if (!el) return;
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  },

  render() {
    // Update counter badge
    const count = this.count();
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
      el.classList.toggle('hidden', count === 0);
    });

    // Render sidebar items
    const container = document.getElementById('cart-items-list');
    const emptyEl   = document.getElementById('cart-empty');
    const footerEl  = document.getElementById('cart-footer');
    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = '';
      if (emptyEl)  emptyEl.style.display  = 'flex';
      if (footerEl) footerEl.style.display = 'none';
      return;
    }

    if (emptyEl)  emptyEl.style.display  = 'none';
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
      </div>
    `).join('');

    // Update total
    const totalEl = document.getElementById('cart-total-amount');
    if (totalEl) totalEl.textContent = `Q${this.total().toFixed(2)}`;
  }
};

// Cart open/close
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

document.querySelector('.cart-btn')?.addEventListener('click', openCart);
document.querySelector('.cart-overlay')?.addEventListener('click', closeCart);
document.querySelector('.cart-close')?.addEventListener('click', closeCart);
document.getElementById('checkout-btn')?.addEventListener('click', () => {
  window.location.href = 'tickets.html';
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
  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${msg}</div>
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

/* ===== SCROLL REVEAL ===== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

function initReveal() {
  document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right').forEach(el => {
    revealObserver.observe(el);
  });
}

/* ===== STARFIELD CANVAS ===== */
function initStars(canvasId = 'stars-canvas') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [], raf;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + .3,
      speed: Math.random() * .15 + .05,
      alpha: Math.random(),
      dir: Math.random() > .5 ? 1 : -1
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.alpha += s.speed * s.dir * .012;
      if (s.alpha >= 1 || s.alpha <= 0) s.dir *= -1;
      ctx.save();
      ctx.globalAlpha = Math.max(0, s.alpha);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    raf = requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize, { passive: true });
}

/* ===== COUNTER ANIMATION ===== */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const start = performance.now();
  const from = 0;
  (function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (target - from) * eased).toLocaleString() + (el.dataset.suffix || '');
    if (progress < 1) requestAnimationFrame(step);
  })(start);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

function initCounters() {
  document.querySelectorAll('[data-counter]').forEach(el => counterObserver.observe(el));
}

/* ===== SMOOTH ANCHOR SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) + 16;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});

/* ===== PARALLAX (subtle) ===== */
function initParallax() {
  const elements = document.querySelectorAll('[data-parallax]');
  if (!elements.length) return;
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    elements.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      el.style.transform = `translateY(${sy * speed}px)`;
    });
  }, { passive: true });
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  Cart.load();
  initReveal();
  initCounters();
  initParallax();

  // Trigger scrolled state if already scrolled on load
  if (window.scrollY > 30) navbar?.classList.add('scrolled');
});

// Expose globals
window.Cart = Cart;
window.openCart = openCart;
window.closeCart = closeCart;
window.showToast = showToast;
window.initStars = initStars;