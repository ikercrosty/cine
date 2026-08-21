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
function initNightSky() {
  const sky = document.querySelector("[data-night-sky]");
  if (!sky) return;
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

// --- Toast ("Redirigiendo a boletería…") ---
function initBuyButtons() {
  const toast = document.querySelector("[data-toast]");
  const buttons = document.querySelectorAll("[data-buy]");
  if (!toast || !buttons.length) return;
  buttons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const goesToTickets = btn.tagName === "A" && btn.getAttribute("href");
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 1800);
      if (goesToTickets) return; // deja que el link navegue normalmente
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  initReveal();
  initNightSky();
  initBuyButtons();
});