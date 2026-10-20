/**
 * Portafolio — Lewis Habano
 * JavaScript puro (sin librerías externas).
 */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Contacto (WhatsApp sin el signo +, solo números con código de país)
  const WHATSAPP = "584126613818";
  const EMAIL = "habanolewis@gmail.com";

  /* ---------- Año automático ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Menú móvil ---------- */
  const navbar = $("#navbar");
  const menuToggle = $("#menuToggle");

  const setMenu = (open) => {
    navbar.classList.toggle("open", open);
    menuToggle.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    document.documentElement.classList.toggle("menu-open", open);
  };
  menuToggle.addEventListener("click", () => setMenu(!navbar.classList.contains("open")));
  $$(".nav-link").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
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
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  /* ---------- Enlace activo según la sección visible ---------- */
  const links = $$(".nav-link");
  const sections = links.map((l) => $(l.getAttribute("href"))).filter(Boolean);

  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            links.forEach((l) => {
              const on = l.getAttribute("href") === "#" + entry.target.id;
              l.classList.toggle("active", on);
              if (on) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current");
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => navObserver.observe(s));
  }

  /* ---------- Animación de entrada (reveal) + contadores ---------- */
  const animateCount = (el) => {
    const target = +el.dataset.target;
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const duration = 1200;
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
          $$(".count", el).forEach(animateCount);
          obs.unobserve(el);
        });
      },
      { threshold: 0.15 }
    );
    revealItems.forEach((el) => io.observe(el));
  } else {
    // Navegadores muy antiguos: mostrar todo con los números finales
    revealItems.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Efecto de escritura en el hero ---------- */
  const typedEl = $("#typed");
  if (typedEl && !reduceMotion) {
    const words = [
      "Desarrollador Front End Junior",
      "Sitios web para negocios reales",
      "Sistemas de citas y pedidos",
      "HTML · CSS · JavaScript"
    ];
    let w = 0, c = 0, deleting = false;
    const type = () => {
      const word = words[w];
      typedEl.textContent = word.slice(0, c);
      let delay = deleting ? 35 : 75;
      if (!deleting && c === word.length) { delay = 2000; deleting = true; }
      else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 400; }
      c += deleting ? -1 : 1;
      c = Math.max(0, Math.min(c, word.length));
      setTimeout(type, delay);
    };
    type();
  }

  /* ---------- Filtro de proyectos (una tarjeta puede tener varias categorías) ---------- */
  const filterBtns = $$(".filter");
  const projects = $$(".project");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => { b.classList.remove("active"); b.setAttribute("aria-pressed", "false"); });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      const f = btn.dataset.filter;
      projects.forEach((p) => {
        const cats = (p.dataset.cat || "").split(/\s+/);
        const show = f === "all" || cats.includes(f);
        p.classList.toggle("hide", !show);
        if (show) {
          p.classList.remove("pop");
          void p.offsetWidth; // reinicia la animación
          p.classList.add("pop");
        }
      });
    });
  });

  /* ---------- Pestañas Experiencia / Formación (con teclado) ---------- */
  const tabs = $$(".tab");
  const selectTab = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = $("#tab-" + t.dataset.tab);
      panel.classList.toggle("active", on);
      panel.hidden = !on;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectTab(tab, false));
    tab.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); selectTab(tabs[(i + 1) % tabs.length], true); }
      if (e.key === "ArrowLeft") { e.preventDefault(); selectTab(tabs[(i - 1 + tabs.length) % tabs.length], true); }
    });
  });

  /* ---------- Formulario de contacto: WhatsApp o email ---------- */
  const form = $("#contactForm");
  const status = $("#formStatus");

  const send = (channel) => {
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

    if (channel === "whatsapp") {
      const text = `Hola Lewis, soy ${name} (${email}).\n\n${message}`;
      window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
      status.textContent = "¡Listo! Se abrió WhatsApp con tu mensaje, solo falta enviarlo.";
    } else {
      const subject = encodeURIComponent("Contacto desde tu portafolio - " + name);
      const body = encodeURIComponent(`Nombre: ${name}\nEmail: ${email}\n\n${message}`);
      window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
      status.textContent = "¡Listo! Se abrirá tu app de correo para enviar el mensaje.";
    }
    status.className = "form-status ok";
    form.reset();
  };

  if (form) {
    $$("[data-send]", form).forEach((btn) => btn.addEventListener("click", () => send(btn.dataset.send)));
    form.addEventListener("submit", (e) => { e.preventDefault(); send("whatsapp"); });
  }
})();
