/* ==========================================================
   Autocine Antigua — global.js
   Comportamiento compartido por todas las páginas
   ========================================================== */

// --- Iconos (Lucide) ---
document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) lucide.createIcons();
});

// --- Menú móvil ---
function initNavToggle() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const mobile = document.querySelector("[data-nav-mobile]");
  if (!toggle || !mobile) return;
  toggle.addEventListener("click", () => {
    const isOpen = mobile.classList.toggle("open");
    toggle.innerHTML = isOpen
      ? '<i data-lucide="x"></i>'
      : '<i data-lucide="menu"></i>';
    if (window.lucide) lucide.createIcons();
  });
  mobile.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      mobile.classList.remove("open");
      toggle.innerHTML = '<i data-lucide="menu"></i>';
      if (window.lucide) lucide.createIcons();
    })
  );
}

// --- Scroll reveal ---
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 6) * 80}ms`;
    obs.observe(el);
  });
}

// --- Estrellas del cielo nocturno (hero) ---
function initStars(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, stars = [];

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
    stars = Array.from({ length: 100 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5,
      opacity: Math.random(),
      speed: 0.005 + Math.random() * 0.01
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "white";
    stars.forEach(s => {
      s.opacity += s.speed;
      if (s.opacity > 1 || s.opacity < 0) s.speed = -s.speed;
      ctx.globalAlpha = Math.max(0, s.opacity);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
}

function initNightSky() {
  const sky = document.querySelector("[data-night-sky]");
  if (!sky) return;

  // Si hay un canvas, usar initStars
  const canvas = sky.querySelector('canvas');
  if (canvas) {
    initStars(canvas.id || 'stars-canvas');
    return;
  }

  // Fallback a estrellas DOM
  if (sky.querySelector('.star')) return;
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 90; i++) {
    const star = document.createElement("span");
    star.className = "star";
    const size = rand() * 1.6 + 0.5;
    star.style.top = `${rand() * 62}%`;
    star.style.left = `${rand() * 100}%`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.animationDelay = `${rand() * 5}s`;
    star.style.animationDuration = `${rand() * 3 + 2}s`;
    frag.appendChild(star);
  }
  sky.appendChild(frag);
}

// --- Toast y Notificaciones ---
function showToast(title, message, icon) {
  const toast = document.querySelector("[data-toast]");
  if (!toast) return;
  toast.innerHTML = (icon ? `<i class="${icon}"></i> ` : '') + `<strong>${title}</strong> ${message}`;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function initBuyButtons() {
  const buttons = document.querySelectorAll("[data-buy]");
  if (!buttons.length) return;
  buttons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const goesToTickets = btn.tagName === "A" && btn.getAttribute("href")?.includes('tickets.html');
      if (goesToTickets) {
        showToast("Redirigiendo", "a boletería...", "ph ph-ticket");
      }
    });
  });
}

// --- Carrito Provisorio ---
const Cart = {
  items: JSON.parse(localStorage.getItem('cart')) || [],
  add(item) {
    this.items.push(item);
    this.save();
    this.updateUI();
  },
  save() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  },
  updateUI() {
    const counts = document.querySelectorAll(".cart-count, .cart-fab-count");
    counts.forEach(c => {
      c.textContent = this.items.length;
      c.classList.toggle("hidden", this.items.length === 0);
    });
    this.renderSidebar();
  },
  renderSidebar() {
    const list = document.getElementById("cart-items-list");
    const empty = document.getElementById("cart-empty");
    const footer = document.getElementById("cart-footer");
    const total = document.getElementById("cart-total-amount");

    if (!list) return;

    if (this.items.length === 0) {
      list.innerHTML = "";
      if (empty) empty.style.display = "flex";
      if (footer) footer.style.display = "none";
    } else {
      if (empty) empty.style.display = "none";
      if (footer) footer.style.display = "block";
      list.innerHTML = this.items.map((item, index) => `
        <div class="cart-item" style="display:flex; justify-content:space-between; margin-bottom:1rem; border-bottom:1px solid var(--line); padding-bottom:0.5rem; align-items:center;">
          <div>
            <div style="font-size:0.9rem; font-weight:bold;">${item.name}</div>
            <div style="font-size:0.8rem; color:var(--muted);">Q${item.price}</div>
          </div>
          <button onclick="Cart.remove(${index})" style="background:none; border:none; color:var(--error); cursor:pointer; font-size:1.2rem;">✕</button>
        </div>
      `).join("");
      const sum = this.items.reduce((acc, curr) => acc + curr.price, 0);
      if (total) total.textContent = `Q${sum.toFixed(2)}`;
    }
  },
  remove(index) {
    this.items.splice(index, 1);
    this.save();
    this.updateUI();
  }
};

function openCart() {
  document.querySelector(".cart-sidebar")?.classList.add("open");
  document.querySelector(".cart-overlay")?.classList.add("open");
}
function closeCart() {
  document.querySelector(".cart-sidebar")?.classList.remove("open");
  document.querySelector(".cart-overlay")?.classList.remove("open");
}

// --- Animación de Scroll ---
function observeReveal() {
  const items = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  items.forEach(el => observer.observe(el));
}

document.addEventListener("DOMContentLoaded", () => {
  // Configurar overlay
  const overlay = document.querySelector(".cart-overlay");
  if (overlay) overlay.addEventListener("click", closeCart);

  // Hamburguesa móvil
  const burger = document.querySelector(".hamburger") || document.querySelector(".nav-toggle");
  const navMobile = document.querySelector(".nav-mobile") || document.querySelector("[data-nav-mobile]");

  if (burger && navMobile) {
    burger.addEventListener("click", () => {
      burger.classList.toggle("active");
      const isOpen = navMobile.classList.toggle("open");

      // Si es el toggle viejo de Lucide
      if (burger.hasAttribute('data-nav-toggle')) {
        burger.innerHTML = isOpen ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
        if (window.lucide) lucide.createIcons();
      }
    });
  }

  initNavToggle();
  initNightSky();
  initBuyButtons();
  observeReveal();
  Cart.updateUI();
});