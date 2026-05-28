
/* ===== PAGE LOADER ===== */
window.addEventListener('load', () => {
  hideLoader();
});
// Safety fallback — hide loader after 2s even if external CDN is slow
setTimeout(hideLoader, 2000);

function hideLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader || loader._hidden) return;
  loader._hidden = true;
  loader.classList.add('hidden');
  loader.addEventListener('transitionend', () => loader.remove(), { once: true });
}


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

document.querySelectorAll('.nav-mobile a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger?.classList.remove('open');
    navMobile?.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* Mark active nav link */
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
    if (existing) {
      existing.qty += product.qty || 1;
    } else {
      this.items.push({ ...product, qty: product.qty || 1 });
    }
    this.save();
    this.bump();
    showToast('Añadido al carrito', product.name, 'shopping-cart-simple');
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
    return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  count() {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  },

  bump() {
    document.querySelectorAll('.cart-count, .cart-fab-count').forEach(el => {
      el.classList.remove('bump');
      void el.offsetWidth; // reflow
      el.classList.add('bump');
    });
  },

  /* Returns category icon class (Phosphor) */
  _iconFor(category) {
    const map = {
      ticket: 'ticket',
      snack:  'popcorn',
      combo:  'bowl-food',
      merch:  'shopping-bag',
      bebida: 'cup',
    };
    const key = (category || '').toLowerCase();
    return map[key] || 'package';
  },

  render() {
    const count = this.count();

    /* Badge updates */
    document.querySelectorAll('.cart-count, .cart-fab-count').forEach(el => {
      el.textContent = count;
      el.classList.toggle('hidden', count === 0);
    });

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
        <div class="cart-item-icon">
          <i class="ph ph-${this._iconFor(item.category)}"></i>
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">Q${(item.price * item.qty).toFixed(2)}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="Cart.updateQty('${item.id}', -1)" aria-label="Reducir cantidad">−</button>
            <span>${item.qty}</span>
            <button class="qty-btn" onclick="Cart.updateQty('${item.id}', 1)" aria-label="Aumentar cantidad">+</button>
            <button class="cart-item-del" onclick="Cart.remove('${item.id}')" title="Eliminar" aria-label="Eliminar producto">
              <i class="ph ph-x"></i>
            </button>
          </div>
        </div>
      </div>`).join('');

    const totalEl = document.getElementById('cart-total-amount');
    if (totalEl) totalEl.textContent = `Q${this.total().toFixed(2)}`;
  }
};

/* ===== CART OPEN / CLOSE ===== */
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
  document.querySelector('.cart-overlay')?.addEventListener('click', closeCart);
  document.querySelector('.cart-close')?.addEventListener('click', closeCart);
  Cart.load();
});

/* ===== TOAST NOTIFICATIONS ===== */
/**
 * @param {string} title   - Toast title
 * @param {string} msg     - Toast message
 * @param {string} icon    - Phosphor icon name (e.g. 'check-circle', 'warning')
 * @param {number} duration - ms to display
 */
function showToast(title, msg, icon = 'bell', duration = 3500) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-icon"><i class="ph ph-${icon}"></i></div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${msg}</div>
    </div>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/* ===== SCROLL REVEAL ===== */
document.documentElement.classList.add('js');

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.05 });

function observeReveal(root) {
  (root || document).querySelectorAll(
    '.reveal:not(.is-visible), .reveal-right:not(.is-visible), .reveal-left:not(.is-visible), .reveal-up:not(.is-visible)'
  ).forEach(el => {
    revealObserver.observe(el);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Small delay ensures DOM is fully painted before observing
  setTimeout(observeReveal, 50);
});
window.observeReveal = observeReveal;

/* ===== COUNTER ANIMATION ===== */
function animateCounter(el) {
  const target   = parseFloat(el.dataset.target || 0);
  const suffix   = el.dataset.suffix || '';
  const prefix   = el.dataset.prefix || '';
  const duration = 1600;
  const start    = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3);
    el.textContent = prefix + Math.round(target * ease).toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      counterObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('[data-counter]').forEach(el => counterObserver.observe(el));

/* ===== STARFIELD CANVAS ===== */
function initStars(canvasId = 'stars-canvas') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    stars = Array.from({ length: 140 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      a: Math.random(),
      s: Math.random() * 0.006 + 0.002,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.a += s.s;
      if (s.a > 1 || s.a < 0) s.s *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.a * 0.8})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  draw();
}

/* ===== UTILITY: Generate order code ===== */
function generateOrderCode(prefix = 'AC') {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const rand  = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${prefix}-${rand}`;
}
window.generateOrderCode = generateOrderCode;