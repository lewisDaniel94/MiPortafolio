/**
 * Portafolio — Lewis Habano
 * JavaScript puro (sin librerías externas).
 */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Año y edad automáticos ---------- */
  const now = new Date();
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = now.getFullYear();

  const ageEl = $("#age");
  if (ageEl) {
    const birth = new Date(1994, 3, 29); // 29 de abril de 1994
    let age = now.getFullYear() - birth.getFullYear();
    const hadBirthday =
      now.getMonth() > birth.getMonth() ||
      (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
    if (!hadBirthday) age--;
    ageEl.textContent = age;
  }

  /* ---------- Menú móvil ---------- */
  const navbar = $("#navbar");
  const menuToggle = $("#menuToggle");

  const setMenu = (open) => {
    navbar.classList.toggle("open", open);
    menuToggle.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    // Se bloquea el scroll desde <html> (no desde <body>) para no alterar el fondo fijo
    document.documentElement.classList.toggle("menu-open", open);
  };
  menuToggle.addEventListener("click", () => setMenu(!navbar.classList.contains("open")));
  $$(".nav-link").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  // Si se agranda la pantalla con el menú abierto, se cierra solo
  window.addEventListener("resize", () => { if (window.innerWidth > 991) setMenu(false); });

  /* ---------- Scroll: header, progreso, volver arriba ---------- */
  const header = $("#header");
  const progress = $("#scrollProgress");
  const toTop = $("#toTop");

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle("scrolled", y > 20);
    toTop.classList.toggle("show", y > 600);
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Enlace activo según la sección visible ---------- */
  const links = $$(".nav-link");
  const sections = links.map((l) => $(l.getAttribute("href"))).filter(Boolean);

  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + entry.target.id));
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => navObserver.observe(s));
  }

  /* ---------- Animación de entrada (reveal) + barras + contadores ---------- */
  const animateCount = (el) => {
    const target = +el.dataset.target;
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const duration = 1400;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const revealItems = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add("in");
          $$(".bar-fill", el).forEach((b) => (b.style.width = b.dataset.level + "%"));
          $$(".count", el).forEach(animateCount);
          obs.unobserve(el);
        });
      },
      { threshold: 0.15 }
    );
    revealItems.forEach((el) => io.observe(el));
  } else {
    // Navegadores muy antiguos: mostrar todo
    revealItems.forEach((el) => el.classList.add("in"));
    $$(".bar-fill").forEach((b) => (b.style.width = b.dataset.level + "%"));
    $$(".count").forEach(animateCount);
  }

  /* ---------- Efecto de escritura en el hero ---------- */
  const typedEl = $("#typed");
  if (typedEl) {
    const words = ["Front End Developer", "Creador de sitios web", "Apasionado por aprender", "Junior con ganas de crecer"];
    if (reduceMotion) {
      typedEl.textContent = words[0];
    } else {
      let w = 0, c = 0, deleting = false;
      const type = () => {
        const word = words[w];
        typedEl.textContent = word.slice(0, c);
        let delay = deleting ? 40 : 85;
        if (!deleting && c === word.length) { delay = 1800; deleting = true; }
        else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 400; }
        c += deleting ? -1 : 1;
        // evita pasarse de rango tras el cambio de estado
        c = Math.max(0, Math.min(c, word.length));
        setTimeout(type, delay);
      };
      type();
    }
  }

  /* ---------- Filtro de proyectos ---------- */
  const filterBtns = $$(".filter");
  const projects = $$(".project");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const f = btn.dataset.filter;
      projects.forEach((p) => {
        const show = f === "all" || p.dataset.cat === f;
        p.classList.toggle("hide", !show);
        if (show) {
          p.classList.remove("pop");
          void p.offsetWidth; // reinicia la animación
          p.classList.add("pop");
        }
      });
    });
  });

  /* ---------- Pestañas Formación / Experiencia ---------- */
  $$(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".tab").forEach((t) => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
      $$(".tab-panel").forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      const panel = $("#tab-" + tab.dataset.tab);
      panel.classList.add("active");
      $$(".reveal", panel).forEach((el) => el.classList.add("in"));
    });
  });

  /* ---------- Efecto 3D (tilt) en tarjetas de proyecto — solo con mouse ---------- */
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (canHover && !reduceMotion) {
    projects.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });

    /* Brillo que sigue al cursor */
    const glow = $("#cursorGlow");
    let raf = null, mx = 0, my = 0;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      glow.style.opacity = 1;
      if (!raf) raf = requestAnimationFrame(() => {
        glow.style.transform = `translate(${mx}px, ${my}px)`;
        raf = null;
      });
    });
    document.addEventListener("mouseleave", () => (glow.style.opacity = 0));
  }

  /* ---------- Formulario de contacto (abre tu app de correo) ---------- */
  const form = $("#contactForm");
  const status = $("#formStatus");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      $$(".field", form).forEach((f) => f.classList.remove("invalid"));
      if (!name) form.name.closest(".field").classList.add("invalid");
      if (!emailOk) form.email.closest(".field").classList.add("invalid");
      if (!message) form.message.closest(".field").classList.add("invalid");

      if (!name || !emailOk || !message) {
        status.className = "form-status err";
        status.textContent = "Por favor completá todos los campos con un email válido.";
        return;
      }

      const subject = encodeURIComponent("Contacto desde tu portafolio - " + name);
      const body = encodeURIComponent(`Nombre: ${name}\nEmail: ${email}\n\n${message}`);
      window.location.href = `mailto:habanolewis@gmail.com?subject=${subject}&body=${body}`;

      status.className = "form-status ok";
      status.textContent = "¡Listo! Se abrirá tu app de correo para enviar el mensaje.";
      form.reset();
    });
  }
})();
