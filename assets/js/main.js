/* =========================================================
   Alesia Krecheva — Portfolio JavaScript
   ========================================================= */

/* ————— DOM Ready helper ————— */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initCustomCursor();
  initReveal();
  initHero();
  initTimeline();
  initModal();
  initIntroSplash();
  initEasterEgg();
  initSoundWaves();
  initDotGrids();
  initLogoCarousels();
  initFeedbackCarousels();
  initFloatingDots();
});

/* ————— Header: scroll-shrink & mobile nav ————— */
function initHeader() {
  const header = $(".site-header");
  const toggle = $(".nav-toggle");
  const nav    = $(".site-nav");

  const onScroll = () => {
    if (window.scrollY > 12) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("is-open");
    });
  }
}

/* ————— Custom Cursor ————— */
function initCustomCursor() {
  if (window.matchMedia("(hover: none)").matches) return;

  const dot  = document.createElement("div");
  const ring = document.createElement("div");
  dot.className  = "cursor-dot";
  ring.className = "cursor-ring";
  document.body.append(dot, ring);

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform  = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
  });

  const raf = () => {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  const hoverables = "a, button, .icon-node, .tl-card, .hero-dots button";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(hoverables)) ring.classList.add("is-hover");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(hoverables)) ring.classList.remove("is-hover");
  });
}

/* ————— Reveal on Scroll ————— */
function initReveal() {
  const els = $$(".reveal");
  if (!("IntersectionObserver" in window)) {
    els.forEach(el => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

  els.forEach(el => io.observe(el));
}

/* ————— Startseiten-Hero: Icon-Sequenz + Foto-Wechsel ————— */
function initHero() {
  // Orbit kreisrund halten: --orbit-ry dynamisch an Container-Seitenverhältnis
  // anpassen, damit der Kreis nicht eierförmig wird.
  const visual = document.querySelector(".hero-visual");
  if (visual) {
    const RX_PCT = 45; // --orbit-rx in %
    const makeCircular = () => {
      const { width, height } = visual.getBoundingClientRect();
      if (width && height) {
        const ry = RX_PCT * (width / height);
        visual.style.setProperty("--orbit-ry", ry + "%");
        const el = visual.querySelector(".orbit-path ellipse");
        if (el) el.setAttribute("ry", String(ry));
      }
    };
    makeCircular();
    new ResizeObserver(makeCircular).observe(visual);
  }

  // Sichtbarer Debug-Indikator (temporär) — zeigt oben-rechts an, welches
  // Event ausgelöst wurde. Kann entfernt werden sobald das Klick-Problem
  // identifiziert ist. Autom. deaktivieren wenn kein ?debug in der URL.
  const debugMode = /[?&]debug/.test(location.search);
  let debugBar = null;
  if (debugMode) {
    debugBar = document.createElement("div");
    debugBar.style.cssText = "position:fixed;top:10px;right:10px;background:#222;color:#0f0;padding:8px 12px;font:14px monospace;z-index:99999;border-radius:6px;pointer-events:none;max-width:300px;";
    debugBar.textContent = "Warte auf Klick...";
    document.body.appendChild(debugBar);
  }
  const flash = (msg) => {
    if (debugBar) { debugBar.textContent = msg; console.log("[orbit]", msg); }
  };

  // GLOBALER Klick-Delegator für die Orbit-Icons.
  // Wir hören auf MEHRERE Event-Typen, damit die Navigation garantiert
  // triggered — selbst wenn:
  //   - der Browser den Klick als Drag interpretiert (mouseup-Fallback)
  //   - eine Extension click abfängt (touchend/pointerup als Backup)
  //   - Standard-Anchor-Verhalten deaktiviert ist
  const navigateFromEvent = (e) => {
    if (e.button && e.button !== 0) return;
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;
    const target = e.target;
    if (!target || !target.closest) return;
    const link = target.closest("a.icon-node");
    if (!link) {
      flash(`${e.type} — NICHT auf Icon (target: ${target.tagName})`);
      return;
    }
    const href = link.getAttribute("href");
    if (!href) return;
    flash(`${e.type} → navigiere zu ${href}`);
    e.preventDefault();
    window.location.href = href;
  };

  document.addEventListener("click",     navigateFromEvent, true);
  document.addEventListener("mouseup",   navigateFromEvent, true);
  document.addEventListener("touchend",  navigateFromEvent, true);
  document.addEventListener("pointerup", navigateFromEvent, true);

  const stage = document.querySelector(".photo-stage");
  if (!stage) return;

  /* Slots (Wrapper um jedes <img>) tragen die Slide-Animation.
     Das <img> im Slot ist pro data-key skaliert/positioniert, sodass die
     Person auf allen Bildern gleich groß erscheint und die Füße/Grundlinie
     auf identischer Höhe liegen (siehe hero.css). */
  const slots  = $$(".photo-stage .photo-slot");
  const nodes  = $$(".icon-node");
  const dots   = $$(".hero-dots button");

  if (slots.length <= 1) stage.classList.add("single-photo");

  /* ————— Bild-Mapping: Icon-Index → data-key im photo-stage —————
     Icon 1 (About)   → Bild7 → data-key="about"
     Icon 2 (SAP)     → Bild3 → data-key="sap"
     Icon 3 (DHBW)    → Bild6 → data-key="dhbw"
     Icon 4 (Contact) → Bild5 → data-key="contact"
     Hover            → Bild4 → data-key="hover"                    */
  const KEY_BY_INDEX = ["about", "sap", "dhbw", "contact"];
  const HOVER_KEY    = "hover";
  const HOVER_HOLD   = 5000;   // 5 Sekunden: Bild4 bleibt sichtbar
  const slotByKey    = {};
  slots.forEach(s => { slotByKey[s.dataset.key] = s; });

  /* Aktuell sichtbarer Slot (Initialzustand aus HTML). */
  let currentSlot = slots.find(s => s.classList.contains("is-active")) || slots[0];
  if (currentSlot) {
    currentSlot.classList.add("is-active");
    currentSlot.classList.remove("is-leaving");
  }

  /* Slide-Wechsel: alter Slot verlässt den Container nach rechts,
     neuer Slot kommt gleichzeitig von rechts hereingeschoben.
     Der Container ist immer gefüllt (kein leerer Zwischenzustand). */
  const showPhoto = (key) => {
    const next = slotByKey[key];
    if (!next || next === currentSlot) return;

    const prev = currentSlot;

    next.classList.remove("is-active", "is-leaving");
    // Force reflow, damit die Transition beim Wechsel nach is-active greift
    void next.offsetWidth;
    next.classList.add("is-active");

    if (prev) {
      prev.classList.remove("is-active");
      prev.classList.add("is-leaving");
      /* Nach Abschluss der Slide-Animation aufräumen, damit prev
         beim nächsten Zyklus wieder von rechts einlaufen kann. */
      const cleanup = (e) => {
        if (e.propertyName !== "transform") return;
        prev.classList.remove("is-leaving");
        prev.removeEventListener("transitionend", cleanup);
      };
      prev.addEventListener("transitionend", cleanup);
    }

    currentSlot = next;
  };

  /* Hover-Status (Priorität über Auto-Rotation).
     Während hoverActive === true bleibt Bild4 sichtbar, der Auto-Cycle darf
     zwar intern weiter Icons wechseln, aber das Bild wird nicht überschrieben. */
  let hoverActive = false;
  let hoverTimer  = null;

  let index = 0;
  const setActive = (i, opts = {}) => {
    index = (i + nodes.length) % nodes.length;
    nodes.forEach((n, k) => n.classList.toggle("is-glowing", k === index));
    dots.forEach((d, k)  => d.classList.toggle("is-active",  k === index));

    /* Bildwechsel nur wenn kein Hover-Lock aktiv ist (Priorität Hover > Auto).
       Ausnahme: explizites opts.force = true (z.B. nach Ablauf der 5 Sekunden). */
    if (slots.length > 1 && (!hoverActive || opts.force)) {
      const key = KEY_BY_INDEX[index] || KEY_BY_INDEX[0];
      showPhoto(key);
    }
  };

  const triggerHover = () => {
    /* Bild4 anzeigen und für HOVER_HOLD ms fixieren. Ein erneuter Hover
       während dieser Zeit setzt das 5-Sekunden-Fenster wieder auf voll zurück. */
    hoverActive = true;
    showPhoto(HOVER_KEY);
    if (hoverTimer) clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => {
      hoverActive = false;
      hoverTimer  = null;
      /* Direkt zurück zu dem Bild des aktuell aktiven Icons springen. */
      const key = KEY_BY_INDEX[index] || KEY_BY_INDEX[0];
      showPhoto(key);
    }, HOVER_HOLD);
  };

  // Erst mal alle "aus", dann sequenziell einschalten
  nodes.forEach(n => n.classList.remove("is-glowing"));

  // Sequenz beim Laden — bestehende Icon-Animation unverändert
  nodes.forEach((n, k) => {
    setTimeout(() => setActive(k), 700 + k * 650);
  });

  // Danach auto-cycle — bestehendes Timing unverändert
  let timer;
  const start = () => {
    stop();
    timer = setInterval(() => setActive(index + 1), 3400);
  };
  const stop = () => { if (timer) clearInterval(timer); };

  setTimeout(start, 700 + nodes.length * 650 + 400);

  /* Klick-Handling für Icons: Hover triggert Bild4-Lock (5 s), Icon-Cycle läuft
     im Hintergrund weiter. Navigation wird global von navigateFromEvent (oben)
     robust behandelt — hier NICHT stop()/setActive() bei mouseenter aufrufen,
     damit die Auto-Animation der Icons wie gefordert unverändert weiterläuft. */
  nodes.forEach((n) => {
    n.addEventListener("mouseenter", triggerHover);
    /* mouseleave löst KEINE sofortige Rückkehr aus — Bild4 bleibt volle 5 s. */

    // Zusätzlicher robuster Navigations-Fallback (unverändert):
    n.addEventListener("click", (e) => {
      if (!e.isTrusted) return;
      const href = n.getAttribute("href");
      if (!href || e.defaultPrevented) return;
      if (e.button && e.button !== 0) return;
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;
      e.preventDefault();
      window.location.href = href;
    });
  });

  /* Touch-Geräte: einmaliges Tippen auf die Timeline zählt ebenfalls als
     Hover-Ereignis (Bild4 für 5 Sekunden). */
  nodes.forEach((n) => {
    n.addEventListener("touchstart", triggerHover, { passive: true });
  });

  // Dots-Steuerung
  dots.forEach((d, k) => {
    d.addEventListener("click", () => { stop(); setActive(k); start(); });
  });

  // Kein Parallax-Effekt mehr — hält Kopf beim Hover stabil im Bild
}

/* ————— Timeline: Progress-Line + Reveal ————— */
function initTimeline() {
  const timeline = $(".timeline");
  if (!timeline) return;

  const items = $$(".timeline-item", timeline);

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add("is-visible");
    });
  }, { threshold: 0.2, rootMargin: "0px 0px -80px 0px" });
  items.forEach(el => io.observe(el));

  const updateProgress = () => {
    const rect = timeline.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const start = rect.top - viewportH * 0.5;
    const end   = rect.bottom - viewportH * 0.5;
    const total = end - start;
    const scrolled = Math.min(Math.max(-start, 0), total);
    const pct = total > 0 ? (scrolled / total) * 100 : 0;
    timeline.style.setProperty("--progress", pct + "%");
  };

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();
}

/* ————— Timeline-Detail-Modal ————— */
function initModal() {
  const cards    = $$(".tl-card");
  const backdrop = $(".modal-backdrop");
  const modal    = $(".modal");
  if (!modal || !backdrop) return;

  const titleEl = $(".modal-header h2", modal);
  const dateEl  = $(".modal-header .date", modal);
  const roleEl  = $(".modal-header .role", modal);
  const bodyEl  = $(".modal-body", modal);
  const tagsEl  = $(".modal-tags", modal);
  const closeEl = $(".modal-close", modal);

  const open = (data) => {
    titleEl.textContent = data.title || "";
    dateEl.textContent  = data.date  || "";
    roleEl.textContent  = data.role  || "";
    bodyEl.innerHTML    = data.body  || "";
    tagsEl.innerHTML    = (data.tags || [])
      .map(t => `<span class="tag">${t}</span>`).join("");

    backdrop.classList.add("is-open");
    modal.classList.add("is-open");
    document.body.classList.add("modal-open");
  };

  const close = () => {
    backdrop.classList.remove("is-open");
    modal.classList.remove("is-open");
    document.body.classList.remove("modal-open");
  };

  cards.forEach(card => {
    card.addEventListener("click", () => {
      const data = {
        title: card.dataset.title,
        date:  card.dataset.date,
        role:  card.dataset.role,
        body:  card.dataset.body,
        tags:  (card.dataset.tags || "").split("|").filter(Boolean)
      };
      open(data);
    });
  });

  closeEl.addEventListener("click", close);
  backdrop.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

/* ————— Intro Splash (AK Signatur) ————— */
function initIntroSplash() {
  const splash = $(".intro-splash");
  if (!splash) return;

  // Nur einmal pro Session zeigen
  if (sessionStorage.getItem("introSeen")) {
    splash.classList.add("is-done");
    return;
  }

  setTimeout(() => {
    splash.classList.add("is-done");
    sessionStorage.setItem("introSeen", "1");
  }, 2200);
}

/* ————— Easter Egg: 3x auf Logo klicken → Konfetti-Herzchen ————— */
function initEasterEgg() {
  const brand = $(".brand");
  if (!brand) return;

  let clicks = 0;
  let resetT;
  brand.addEventListener("click", (e) => {
    if (window.location.hash === "#/" || window.location.pathname.endsWith("index.html")) return;
    clicks++;
    clearTimeout(resetT);
    resetT = setTimeout(() => (clicks = 0), 1200);
    if (clicks >= 3) {
      clicks = 0;
      confettiHearts();
    }
  });
}

function confettiHearts() {
  const colors = ["#c87082", "#eeb2c0", "#f3e0e5", "#b98871"];
  const n = 30;
  for (let i = 0; i < n; i++) {
    const h = document.createElement("span");
    h.textContent = "♥";
    h.style.cssText = `
      position: fixed;
      top: 50vh; left: 50vw;
      color: ${colors[i % colors.length]};
      font-size: ${12 + Math.random() * 20}px;
      z-index: 9999;
      pointer-events: none;
      transform: translate(-50%, -50%);
      transition: transform 1.6s cubic-bezier(.2,.6,.2,1), opacity 1.6s ease;
    `;
    document.body.appendChild(h);
    requestAnimationFrame(() => {
      const dx = (Math.random() - 0.5) * window.innerWidth * 0.8;
      const dy = (Math.random() - 0.5) * window.innerHeight * 0.9;
      const rot = (Math.random() - 0.5) * 360;
      h.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rot}deg)`;
      h.style.opacity = "0";
    });
    setTimeout(() => h.remove(), 1700);
  }
}

/* ————— Sound-Wave Landschaft (Work at SAP) ————— */
function initSoundWaves() {
  buildWave($("#sap-wave-in"),  { count: 55, tone: "warm", direction: "in"  });
  buildWave($("#sap-wave-out"), { count: 25, tone: "warm", direction: "out" });
}

/**
 * Erzeugt viele leicht versetzte Bezier-Kurven im SVG, um den Sound-Wave-Look
 * (fließende Höhenlinien wie im Mockup) zu erzeugen.
 */
function buildWave(svg, opts = {}) {
  if (!svg) return;

  const { count = 50, direction = "in" } = opts;
  const W = 1440;
  const H = 700;

  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("preserveAspectRatio", "none");

  // Farbverlauf: oben hellere, unten dunklere Linien
  const strokeAt = (t) => {
    // t: 0 (oben) → 1 (unten)
    if (direction === "in") {
      // von cream (weich) → dunkel-braun
      const alpha = 0.08 + 0.35 * t;
      return `rgba(74, 43, 33, ${alpha})`;
    } else {
      // outro: von dunkel → hell
      const alpha = 0.35 - 0.28 * t;
      return `rgba(247, 242, 238, ${Math.max(0.05, alpha)})`;
    }
  };

  const frag = document.createDocumentFragment();

  // Basis-Y-Koordinaten für 4 Kontrollpunkte
  // Wir generieren Kurven, die sich in einer sanften Landschaft bewegen
  // und Richtung unten flacher werden (fokus auf Wellental in der Mitte)
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    // Basis-Baseline geht von 0.15 (oben) bis 0.85 (unten) der Höhe
    const baseY = H * (0.10 + 0.75 * t);

    // Amplitude nimmt zur Mitte hin zu und zum Rand hin ab
    // Am oberen Rand wenig Amplitude, in der Mitte hoch, unten wenig
    const distFromCenter = Math.abs(t - 0.5) * 2; // 0 → 1
    const amp = (1 - distFromCenter * 0.75) * 90;

    // Phase variiert leicht, damit die Wellen "atmen"
    const phase = i * 0.15;

    // Kontrollpunkte mit sanften Cosinus-Variationen
    const y1 = baseY + amp * Math.sin(phase);
    const y2 = baseY - amp * 0.8 * Math.sin(phase + 0.7);
    const y3 = baseY + amp * 0.6 * Math.sin(phase + 1.4);
    const y4 = baseY - amp * 0.9 * Math.sin(phase + 2.1);
    const y5 = baseY + amp * 0.5 * Math.sin(phase + 2.8);

    const d = `M 0 ${y1.toFixed(1)}
               C ${W*0.20} ${y2.toFixed(1)}, ${W*0.35} ${y3.toFixed(1)}, ${W*0.50} ${((y3+y4)/2).toFixed(1)}
               S ${W*0.80} ${y4.toFixed(1)}, ${W} ${y5.toFixed(1)}`;

    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", d);
    p.setAttribute("stroke", strokeAt(t));
    frag.appendChild(p);
  }

  svg.appendChild(frag);
}

/* ————— Feedback-Karussell (Cross-Fade + 5-Sekunden-Autoplay + Hover-Pause) —————
   Anforderungen laut Auftrag:
   - Alle 5 Sekunden automatisch auf nächstes Feedback wechseln
   - Bei Hover: Autoplay pausiert SOFORT und bleibt beim aktuellen Slide
   - Bei Mouse-Leave: Rotation setzt fort (nicht sofort umschalten, Timer neu starten)
   - Unendliche Schleife (3 → 1)
   - Keine Layout-Shifts: alle Slides sind absolut übereinander gestapelt */
function initFeedbackCarousels() {
  const carousels = $$("[data-feedback-carousel]");
  if (!carousels.length) return;

  carousels.forEach((root) => {
    const slides = $$(".feedback-slide", root);
    const dotsWrap = $("[data-feedback-dots]", root);
    const prevBtn  = $("[data-feedback-prev]", root);
    const nextBtn  = $("[data-feedback-next]", root);
    if (slides.length < 2) return;

    const rawInterval = parseInt(root.dataset.interval, 10);
    const interval = isNaN(rawInterval) ? 5000 : rawInterval;
    let index = 0;
    let timer = null;

    // Dots
    let dots = [];
    if (dotsWrap) {
      dotsWrap.innerHTML = "";
      slides.forEach((_, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", `Show feedback ${i + 1}`);
        b.addEventListener("click", () => { go(i); restart(); });
        dotsWrap.appendChild(b);
      });
      dots = $$("button", dotsWrap);
    }

    const apply = () => {
      slides.forEach((s, i) => s.classList.toggle("is-active", i === index));
      dots.forEach((d, i)   => d.classList.toggle("is-active", i === index));
    };

    const go   = (i) => { index = ((i % slides.length) + slides.length) % slides.length; apply(); };
    const next = () => go(index + 1);
    const prev = () => go(index - 1);

    const start   = () => { stop(); if (interval > 0) timer = setInterval(next, interval); };
    const stop    = () => { if (timer) { clearInterval(timer); timer = null; } };
    const restart = () => { stop(); start(); };

    if (nextBtn) nextBtn.addEventListener("click", () => { next(); if (interval > 0) restart(); });
    if (prevBtn) prevBtn.addEventListener("click", () => { prev(); if (interval > 0) restart(); });

    /* Kritisch: Autoplay pausiert bei Hover, läuft nach Leave weiter.
       Nach Mouse-Leave starten wir das 5-Sekunden-Intervall neu — es wird
       also NICHT sofort umgeschaltet. */
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    // Touch-Geräte: Tap pausiert kurz — nach Ende wieder Start.
    root.addEventListener("touchstart", stop, { passive: true });
    root.addEventListener("touchend",   start, { passive: true });
    // Accessibility: Fokus innerhalb pausiert Autoplay
    root.addEventListener("focusin",  stop);
    root.addEventListener("focusout", start);

    apply();
    start();
  });
}

document.addEventListener("DOMContentLoaded", initSkillBars);function initSkillBars() {
  const bars = $$(".skill-bar");
  if (bars.length === 0 || !("IntersectionObserver" in window)) {
    bars.forEach(b => animateBar(b));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateBar(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(b => io.observe(b));
}

function animateBar(bar) {
  const level = parseInt(bar.dataset.level || "50", 10);
  const clamped = Math.min(100, Math.max(0, level));
  const fill = bar.querySelector(".fill");
  const dot  = bar.querySelector(".dot");
  if (fill) fill.style.width = clamped + "%";
  if (dot)  dot.style.left    = clamped + "%";
  bar.classList.add("is-visible");
}

/* ————— Hero-Schleier: gespiegelte Rampenform aus vielen parallelen Linien ————— */
document.addEventListener("DOMContentLoaded", initHeroSchleier);

function initHeroSchleier() {
  const svg = document.getElementById("hero-schleier");
  if (!svg) return;
  const g = svg.querySelector(".wave-lines");
  if (!g) return;

  const svgNS = "http://www.w3.org/2000/svg";
  const n = 55;                       // Viele feine Linien für dichten Look
  const baselineBottom = 296;         // y-Position der untersten Linie
  const baselineTop    = 100;         // y-Position der obersten Linie
  const peakAmp        =  55;         // Peak-Amplitude (flacher Bogen, kein steiler Peak)
  const peakX          = 520;         // x-Position des Peaks (ca. 37% der Breite)

  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    // Baseline: bottom → top
    const y = baselineBottom - (baselineBottom - baselineTop) * t;
    // Amplitude: unten mehr, oben weniger (klingt sanft aus)
    const amp = peakAmp * (1 - t * 0.35);

    // Sanfte flache Bogenform:
    // Start unten links, sanfter Anstieg, Peak bei x=520, sanfter Abstieg nach rechts
    const yStart  = y;
    const yPeak   = y - amp;
    const yMid    = y - amp * 0.6;    // rechts vom Peak, immer noch relativ hoch
    const yRight  = y - amp * 0.15;   // rechtes Ende, nahe Baseline

    const d =
      `M -20 ${yStart.toFixed(1)} ` +
      `C 180 ${(yStart - amp * 0.35).toFixed(1)}, 380 ${yPeak.toFixed(1)}, ${peakX} ${yPeak.toFixed(1)} ` +
      `S 950 ${yMid.toFixed(1)}, 1150 ${(yMid + amp * 0.2).toFixed(1)} ` +
      `S 1350 ${yRight.toFixed(1)}, 1420 ${yRight.toFixed(1)}`;

    const p = document.createElementNS(svgNS, "path");
    p.setAttribute("d", d);
    g.appendChild(p);
  }
}

/* ————— Rosa Punktraster: einzelne pulsierende Punkte generieren ————— */
function initDotGrids() {
  const grids = $$(".bg-decor .dot-grid");
  if (grids.length === 0) return;

  // 11 × 11 Raster = 121 Punkte pro Grid.
  // Jeder Punkt bekommt einen zufälligen Animations-Delay,
  // damit das Ganze wie ein sanft atmender Sternenhimmel wirkt.
  grids.forEach((grid) => {
    // Falls schon initialisiert (z.B. Hot-Reload), erst leeren
    if (grid.dataset.dotsReady === "1") return;
    grid.dataset.dotsReady = "1";

    const cols = 11;
    const rows = 11;
    const total = cols * rows;
    const frag = document.createDocumentFragment();

    for (let i = 0; i < total; i++) {
      const dot = document.createElement("span");
      // Verteilung des Delays über 3.6s (Animationsdauer)
      // + kleine Zufalls-Streuung, damit kein sichtbares Muster entsteht
      const delay = (Math.random() * 3.6).toFixed(2);
      // Leichte Zufalls-Variation der Dauer für organischen Look
      const duration = (2.8 + Math.random() * 1.8).toFixed(2);
      dot.style.animationDelay = `-${delay}s`;
      dot.style.animationDuration = `${duration}s`;
      frag.appendChild(dot);
    }
    grid.appendChild(frag);
  });
}

/* ————— Logo-Karussell (auto-rotation + Pfeile, echter Infinite-Loop) —————
   Technik: Wir klonen die ersten `perView` Slides am Ende und die letzten
   `perView` Slides am Anfang. Sichtbar startet der Track am "echten" ersten
   Slide (Index = perView). Bewegt man sich über die Klone hinaus, wird nach
   Abschluss der Animation die Transition kurz deaktiviert und der Track
   unsichtbar auf die passende echte Position gesetzt. Nutzer sieht immer
   Logos — nie leere Slots, nie einen Sprung zurück. */
function initLogoCarousels() {
  const carousels = $$("[data-carousel]");
  if (!carousels.length) return;

  carousels.forEach((root) => {
    const track    = $("[data-carousel-track]", root);
    const prevBtn  = $("[data-carousel-prev]", root);
    const nextBtn  = $("[data-carousel-next]", root);
    const dotsWrap = $("[data-carousel-dots]", root);
    if (!track) return;

    const originalSlides = $$(".carousel-slide", track);
    const total          = originalSlides.length;
    if (!total) return;

    const rawInterval = parseInt(root.dataset.interval, 10);
    const interval = isNaN(rawInterval) ? 5000 : rawInterval;

    /* Wie viele Slides sind pro View sichtbar? Wird über die aktuelle
       Slide-Breite bestimmt. */
    const perView = () => {
      const viewportW = track.parentElement.getBoundingClientRect().width;
      const slideW    = originalSlides[0].getBoundingClientRect().width;
      if (!slideW) return 1;
      return Math.max(1, Math.round(viewportW / slideW));
    };

    /* Wir klonen so viele Slides wie maximal sichtbar sein können.
       Für einfache Berechnung nehmen wir den maximalen Wert (die Anzahl
       aller Slides), so ist der Loop garantiert nahtlos. */
    let cloneCount = Math.min(total, Math.max(perView(), 1));

    /* Klone anlegen: die letzten `cloneCount` Slides vor dem Anfang und
       die ersten `cloneCount` Slides nach dem Ende. */
    const buildClones = () => {
      // Alte Klone entfernen
      $$(".carousel-slide.is-clone", track).forEach((n) => n.remove());
      cloneCount = Math.min(total, Math.max(perView(), 1));

      const headClones = [];
      for (let i = 0; i < cloneCount; i++) {
        const src   = originalSlides[i];
        const clone = src.cloneNode(true);
        clone.classList.add("is-clone");
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
      }
      for (let i = cloneCount - 1; i >= 0; i--) {
        const src   = originalSlides[total - 1 - i];
        const clone = src.cloneNode(true);
        clone.classList.add("is-clone");
        clone.setAttribute("aria-hidden", "true");
        headClones.push(clone);
      }
      // In korrekter Reihenfolge am Anfang einfügen
      headClones.reverse().forEach((c) => track.insertBefore(c, track.firstChild));
    };

    buildClones();

    /* index bezieht sich auf ALLE Slides inkl. Klone.
       Echter erster Slide liegt bei index === cloneCount. */
    let index      = cloneCount;
    let timer      = null;
    let isAnimating = false;

    // Dots aufbauen (nur für die Originale)
    let dots = [];
    if (dotsWrap) {
      dotsWrap.innerHTML = "";
      for (let i = 0; i < total; i++) {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", `Go to logo ${i + 1}`);
        b.addEventListener("click", () => {
          go(cloneCount + i);
          restart();
        });
        dotsWrap.appendChild(b);
      }
      dots = $$("button", dotsWrap);
    }

    const slideWidth = () => {
      const slide = track.querySelector(".carousel-slide");
      return slide ? slide.getBoundingClientRect().width : 0;
    };

    const setTransform = (withTransition) => {
      track.style.transition = withTransition
        ? "transform 0.6s var(--ease-out)"
        : "none";
      track.style.transform = `translateX(${-index * slideWidth()}px)`;
    };

    /* Nach jedem Animationsende prüfen, ob wir in einer Klonzone stehen —
       falls ja: Transition sofort ausschalten und auf das echte Pendant
       springen. So sieht der Nutzer nie einen Sprung. */
    const onTransitionEnd = () => {
      isAnimating = false;
      if (index >= cloneCount + total) {
        index = index - total;
        setTransform(false);
        // Reflow, damit spätere transitions wieder greifen
        void track.offsetWidth;
      } else if (index < cloneCount) {
        index = index + total;
        setTransform(false);
        void track.offsetWidth;
      }
      updateDots();
    };
    track.addEventListener("transitionend", onTransitionEnd);

    const updateDots = () => {
      // Echter Slide-Index (0..total-1)
      const real = ((index - cloneCount) % total + total) % total;
      dots.forEach((d, i) => d.classList.toggle("is-active", i === real));
    };

    const go = (i) => {
      if (isAnimating) return;
      isAnimating = true;
      index = i;
      setTransform(true);
      updateDots();
    };
    const next = () => go(index + 1);
    const prev = () => go(index - 1);

    const start = () => {
      stop();
      if (interval > 0) timer = setInterval(next, interval);
    };
    const stop = () => {
      if (timer) { clearInterval(timer); timer = null; }
    };
    const restart = () => { stop(); start(); };

    if (nextBtn) nextBtn.addEventListener("click", () => { next(); if (interval > 0) restart(); });
    if (prevBtn) prevBtn.addEventListener("click", () => { prev(); if (interval > 0) restart(); });

    // Bei Hover pausieren
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);

    // Reagiert auf Resize (Slide-Breite ändert sich, ggf. Klone neu bauen)
    let resizeRaf = null;
    window.addEventListener("resize", () => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        const desired = Math.min(total, Math.max(perView(), 1));
        if (desired !== cloneCount) {
          // Klone neu bauen und Position halten
          const real = ((index - cloneCount) % total + total) % total;
          buildClones();
          index = cloneCount + real;
        }
        setTransform(false);
        updateDots();
      });
    });

    // Initial-Position ohne Transition setzen
    requestAnimationFrame(() => {
      setTransform(false);
      updateDots();
      start();
    });
  });
}

/* ————— Floating Dots: dezente schwebende Partikel im Hero ————— */
function initFloatingDots() {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const COUNT  = 8;
  const colors = ["#eeb2c0", "#f3e0e5", "#dbb5be", "#c9a0ab"];

  const container = document.createElement("div");
  container.className = "floating-dots";
  container.setAttribute("aria-hidden", "true");
  hero.appendChild(container);

  for (let i = 0; i < COUNT; i++) {
    const dot = document.createElement("span");
    const size = 3 + Math.random() * 5;
    const x    = 10 + Math.random() * 80;
    const y    = 10 + Math.random() * 80;
    const dur  = 20 + Math.random() * 25;
    const del  = -(Math.random() * dur);

    dot.style.cssText =
      "position:absolute;" +
      "width:" + size + "px;" +
      "height:" + size + "px;" +
      "left:" + x + "%;" +
      "top:" + y + "%;" +
      "border-radius:50%;" +
      "background:" + colors[i % colors.length] + ";" +
      "opacity:" + (0.1 + Math.random() * 0.12) + ";" +
      "animation:floatDot " + dur + "s ease-in-out " + del + "s infinite;" +
      "pointer-events:none;";

    container.appendChild(dot);
  }
}


