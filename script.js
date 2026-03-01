/**
 * SEFIN GWACHHA — PORTFOLIO
 * script.js  |  v2.0.0
 *
 * Sections:
 *  1. Configuration & Data
 *  2. Lenis Smooth Scroll
 *  3. Custom Cursor
 *  4. Preloader
 *  5. Navigation
 *  6. Hero Entry Animation
 *  7. Scroll Animations
 *  8. Number Counter
 *  9. Case Study Modal
 * 10. Live Nepal Time
 * 11. Init
 */

(function () {
  'use strict';

  /* ============================================================
     1. CONFIGURATION & PROJECT DATA
  ============================================================ */

  const CONFIG = {
    preloader: {
      tickInterval: 55,   // ms between progress ticks
      minStep:       4,   // min progress increment
      maxStep:      18,   // max progress increment
    },
    lenis: {
      duration:     1.35,
      touchMultiplier: 2.0,
    },
    cursor: {
      lerp: 0.13,  // lower = smoother but slower follow
    },
    scroll: {
      triggerStart: 'top 86%',
      revealDuration: 1.0,
      staggerDelay: 0.08,
    },
  };

  /** Project data injected into the case study modal. */
  const PROJECTS = {
    euphoria: {
      title:    'EUPHORIA',
      subtitle: 'Platform Architecture & Experience Design',
      year:     '2024',
      client:   'Confidential',
      role:     'Lead Engineer & Art Director',
      duration: '4 Months',
      tags:     ['Platform Architecture', 'WebGL', 'React', 'Next.js', 'GSAP'],
      img:      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
      overview:
        'Euphoria is an immersive digital platform redefining how audiences discover and experience ' +
        'contemporary music. The brief demanded a site that felt less like a product and more like an ' +
        'environment — somewhere between a venue and a visual essay. The challenge: make technology ' +
        'invisible so emotion becomes the interface.',
      challenge:
        'The core tension was performance versus expressivity. High-fidelity WebGL shaders and ' +
        'real-time audio visualisations needed to coexist with a sub-100 ms LCP. The client\'s brand ' +
        'language was intentionally undefined — a creative constraint that demanded strong editorial ' +
        'decision-making from the first wireframe to final deployment.',
      strategy:
        'Rather than retrofit existing templates, we built a bespoke rendering pipeline that ' +
        'prioritised perceptual performance. Animations were choreographed to mask load states, ' +
        'creating the illusion of instantaneity. Content was sequenced to reveal itself at the pace ' +
        'of the music — never faster, never forced.',
      engineering:
        'The architecture separates presentation logic from data concerns using a headless CMS ' +
        '(Sanity) feeding typed Next.js App Router routes. WebGL is isolated in a dedicated Web Worker, ' +
        'ensuring the main thread remains unblocked during shader compilation. Three.js scene graphs ' +
        'are memoised and reused across route transitions using a custom instance pool.',
      visual:
        'A system of near-black grounds, warm amber type, and a single editorial image per page. ' +
        'Typography does the heavy lifting — Bebas Neue at 18vw for headers, DM Serif for italicised ' +
        'emotional anchors. Motion is choreographed, not decorative. Every transition earns its place.',
      outcome: { perf: '98', lcp: '0.8s', bounce: '−34%' },
    },

    cherished: {
      title:    'CHERISHED',
      subtitle: 'UI/UX Design & Engineering',
      year:     '2024',
      client:   'Cherished Memories Ltd.',
      role:     'Full-Stack Creative Engineer',
      duration: '3 Months',
      tags:     ['UI/UX Design', 'Next.js', 'GSAP', 'Framer Motion', 'Prisma', 'PostgreSQL'],
      img:      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop',
      overview:
        'A platform for preserving family histories through interactive timelines, media galleries, ' +
        'and AI-assisted narrative generation. The product needed to feel simultaneously modern and ' +
        'emotionally resonant — technology in service of memory. Users arrive in vulnerable moments; ' +
        'the interface had to honour that weight.',
      challenge:
        'Balancing feature density with emotional clarity. Every interaction had to be intuitive, ' +
        'forgiving, and warm — even for users who had never encountered a digital archive before. ' +
        'The data model was complex: nested family trees, multi-format media, and time-sensitive ' +
        'collaborative editing across time zones.',
      strategy:
        'A restraint-first design philosophy — remove everything non-essential before adding. We ran ' +
        'six user-testing rounds before writing a single line of production CSS. Every feature was ' +
        'pressure-tested against the question: does this serve memory, or just serve the product?',
      engineering:
        'Next.js App Router with React Server Components for sub-second first paints. A custom gesture ' +
        'library handles timeline scrubbing on mobile with 60 fps smoothness on mid-range devices. ' +
        'Image processing runs on-edge via Cloudflare Workers, eliminating origin latency for ' +
        'media-heavy pages. Real-time collaboration is powered by Yjs CRDTs over WebSocket.',
      visual:
        'Soft cream backgrounds, hand-drawn typographic accents, and a deliberate absence of sharp ' +
        'edges. The design language borrows from archival print — aged paper, analogue imperfection, ' +
        'deliberate margins. Interaction states use warmth and expansion rather than colour change.',
      outcome: { perf: '96', lcp: '1.1s', bounce: '−41%' },
    },

    meridian: {
      title:    'MERIDIAN',
      subtitle: 'Brand Identity & Three.js Experience',
      year:     '2023',
      client:   'Meridian Capital Partners',
      role:     'Creative Director & Developer',
      duration: '6 Months',
      tags:     ['Brand Identity', 'Three.js', 'TypeScript', 'GLSL', 'Blender', 'Sanity'],
      img:      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2560&auto=format&fit=crop',
      overview:
        'Meridian required a complete digital identity — a brand system and web presence that ' +
        'communicated global authority while feeling distinctly forward-looking. The result is a ' +
        'WebGL-first site built around a bespoke 3D typographic sculpture that rotates in real-time, ' +
        'responding to scroll velocity and ambient cursor position.',
      challenge:
        'Financial services audiences are sceptical of creative excess. Every visual decision needed ' +
        'to communicate precision, substance, and earned confidence. Creativity had to function as ' +
        'evidence of capability — not decoration. The site had to convert institutional investors, ' +
        'not designers.',
      strategy:
        'Lead with competence, signal ambition through craft. The 3D type sculpture is not decoration ' +
        '— it is a proof of technical capability deployed deliberately as a brand asset. Every ' +
        'interaction was stress-tested against a single question: does this increase or decrease ' +
        'institutional trust?',
      engineering:
        'A custom GLSL vertex shader drives the typographic distortion, responding to scroll velocity ' +
        'in real-time. The Three.js scene is exported from Blender and post-processed with a custom ' +
        'toon-shading pipeline that gives the geometry a hand-crafted quality absent from standard ' +
        'PBR materials. TypeScript strict mode throughout, zero runtime type errors in production.',
      visual:
        'Near-black ground. A single brand colour — a cooled gold. Condensed grotesque type at ' +
        'architectural scale. White space used as a signal of confidence, not absence of content. ' +
        'The visual system scales from business cards to 6-metre conference room walls without ' +
        'degradation.',
      outcome: { perf: '97', lcp: '0.9s', bounce: '−28%' },
    },
  };

  /* ============================================================
     2. LENIS SMOOTH SCROLL
  ============================================================ */

  let lenis;

  function initLenis() {
    gsap.registerPlugin(ScrollTrigger);

    lenis = new Lenis({
      duration: CONFIG.lenis.duration,
      easing:   t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth:   true,
      touchMultiplier: CONFIG.lenis.touchMultiplier,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0, 0);
  }

  /* ============================================================
     3. CUSTOM CURSOR
  ============================================================ */

  function initCursor() {
    const IS_MOUSE = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    const curEl    = document.getElementById('cursor');

    if (!IS_MOUSE || !curEl) return;

    let mx = window.innerWidth  / 2;
    let my = window.innerHeight / 2;
    let cx = mx, cy = my;

    window.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
    }, { passive: true });

    (function loop() {
      cx += (mx - cx) * CONFIG.cursor.lerp;
      cy += (my - cy) * CONFIG.cursor.lerp;
      curEl.style.transform = `translate3d(${cx}px,${cy}px,0)`;
      requestAnimationFrame(loop);
    })();

    // State: link hover
    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', () => curEl.classList.add('state-link'));
      el.addEventListener('mouseleave', () => curEl.classList.remove('state-link'));
    });

    // State: project view
    document.querySelectorAll('.project-item').forEach(el => {
      el.addEventListener('mouseenter', () => {
        curEl.classList.remove('state-link');
        curEl.classList.add('state-view');
      });
      el.addEventListener('mouseleave', () => curEl.classList.remove('state-view'));
    });

    // State: modal
    const modal = document.getElementById('modal');
    if (modal) {
      modal.addEventListener('mouseenter', () => {
        curEl.classList.remove('state-link', 'state-view');
        curEl.classList.add('state-modal');
      });
      modal.addEventListener('mouseleave', () => curEl.classList.remove('state-modal'));
    }
  }

  /* ============================================================
     4. PRELOADER
  ============================================================ */

  function initPreloader(onComplete) {
    const preNum  = document.getElementById('pre-num');
    const preFill = document.getElementById('pre-fill');
    const preEl   = document.getElementById('preloader');
    let pct = 0;

    const tick = setInterval(() => {
      pct += Math.floor(Math.random() * (CONFIG.preloader.maxStep - CONFIG.preloader.minStep + 1))
           + CONFIG.preloader.minStep;

      if (pct >= 100) {
        pct = 100;
        clearInterval(tick);
        setTimeout(onComplete, 120);
      }

      if (preNum)  preNum.textContent   = pct;
      if (preFill) preFill.style.width  = pct + '%';
      if (preEl)   preEl.setAttribute('aria-valuenow', pct);

    }, CONFIG.preloader.tickInterval);
  }

  /* ============================================================
     5. NAVIGATION — hide on scroll down, show on scroll up
  ============================================================ */

  function initNav() {
    const navEl  = document.getElementById('nav');
    if (!navEl) return;

    let lastY    = 0;
    let ticking  = false;

    function update() {
      const y = window.scrollY;
      if (y > 90 && y > lastY)  navEl.classList.add('is-hidden');
      else                       navEl.classList.remove('is-hidden');
      lastY   = y;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ============================================================
     6. HERO ENTRY ANIMATION
  ============================================================ */

  function playHeroEntry(onComplete) {
    const tl = gsap.timeline({ onComplete });

    tl
      // Curtain wipe left → right, then preloader out
      .to('.pre-curtain', {
        scaleX:   1,
        duration: 0.78,
        ease:     'power4.inOut',
      })
      .set('#preloader', { autoAlpha: 0 })

      // Hero horizontal rule
      .to('.hero-rule', {
        scaleX:   1,
        duration: 1.5,
        ease:     'power3.inOut',
      }, '-=0.15')

      // Portrait fade in
      .to('.hero-portrait', {
        autoAlpha: 1,
        duration:  1.3,
        ease:      'power3.out',
      }, '-=1.2')

      // Giant words
      .to('.h-word, .h-serif', {
        y:        '0%',
        autoAlpha: 1,
        duration:  1.4,
        ease:      'power4.out',
        stagger:   0.1,
      }, '-=1.1')

      // Bottom meta bar
      .to('.hero-meta, .hero-scroll-indicator', {
        y:         0,
        autoAlpha: 1,
        duration:  0.95,
        ease:      'power3.out',
        stagger:   0.09,
      }, '-=0.75')

      // Nav
      .add(() => {
        const nav = document.getElementById('nav');
        if (nav) nav.classList.add('is-visible');
      }, '-=0.5');
  }

  /* ============================================================
     7. SCROLL ANIMATIONS
  ============================================================ */

  function initScrollAnimations() {
    const T = CONFIG.scroll.triggerStart;
    const D = CONFIG.scroll.revealDuration;

    // ── Generic .gs-fade ──
    gsap.utils.toArray('.gs-fade').forEach(el => {
      const delay = parseFloat(getComputedStyle(el).getPropertyValue('--d') || '0');
      gsap.to(el, {
        opacity:   1,
        duration:  D * 0.9,
        ease:      'power2.out',
        delay,
        scrollTrigger: { trigger: el, start: T },
      });
    });

    // ── Generic .gs-up ──
    gsap.utils.toArray('.gs-up').forEach(el => {
      const delay = parseFloat(getComputedStyle(el).getPropertyValue('--d') || '0');
      gsap.to(el, {
        y:        0,
        opacity:  1,
        duration: D,
        ease:     'power3.out',
        delay,
        scrollTrigger: { trigger: el, start: T },
      });
    });

    // ── Manifesto text lines ──
    gsap.utils.toArray('.manifesto-heading .mask > span').forEach((span, i) => {
      gsap.to(span, {
        y:        '0%',
        duration: 1.3,
        ease:     'power4.out',
        delay:    i * 0.065,
        scrollTrigger: { trigger: '.manifesto-heading', start: 'top 82%' },
      });
    });

    // ── Works archive title ──
    gsap.utils.toArray('.works-title .mask > span').forEach(span => {
      gsap.to(span, {
        y:        '0%',
        duration: 1.15,
        ease:     'power4.out',
        scrollTrigger: { trigger: '.works-title', start: 'top 86%' },
      });
    });

    // ── Process title ──
    gsap.utils.toArray('.process-title .mask > span').forEach((span, i) => {
      gsap.to(span, {
        y:        '0%',
        duration: 1.15,
        ease:     'power4.out',
        delay:    i * 0.07,
        scrollTrigger: { trigger: '.process-title', start: 'top 86%' },
      });
    });

    // ── Project items ──
    gsap.utils.toArray('.gs-project').forEach((el, i) => {
      gsap.to(el, {
        y:        0,
        opacity:  1,
        duration: 1.15,
        ease:     'power3.out',
        delay:    0.04,
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });

    // ── Footer eyebrow ──
    gsap.to('.footer-eyebrow', {
      opacity:  1,
      y:        0,
      duration: 0.9,
      ease:     'power3.out',
      scrollTrigger: { trigger: '.footer-top', start: 'top 85%' },
    });

    // ── Footer CTA lines ──
    gsap.utils.toArray('.footer-cta .mask > span').forEach((span, i) => {
      gsap.to(span, {
        y:        '0%',
        duration: 1.35,
        ease:     'power4.out',
        delay:    i * 0.1,
        scrollTrigger: { trigger: '.footer-cta', start: 'top 90%' },
      });
    });

    // ── Hero portrait parallax ──
    gsap.to('.hero-portrait', {
      yPercent: 18,
      ease:     'none',
      scrollTrigger: {
        trigger: '#hero',
        start:   'top top',
        end:     'bottom top',
        scrub:   1.4,
      },
    });

    // ── Number counters (triggered when section enters view) ──
    document.querySelectorAll('[data-count]').forEach(el => {
      const target  = parseInt(el.dataset.count, 10);
      const suffix  = el.dataset.suffix || '';
      const obj     = { val: 0 };

      ScrollTrigger.create({
        trigger:  el,
        start:    'top 82%',
        once:     true,
        onEnter:  () => {
          gsap.to(obj, {
            val:      target,
            duration: 1.8,
            ease:     'power2.out',
            onUpdate: () => {
              el.textContent = Math.round(obj.val) + suffix;
            },
          });
        },
      });
    });

    // ── Number items reveal ──
    gsap.utils.toArray('.number-item').forEach((el, i) => {
      gsap.to(el, {
        opacity:  1,
        y:        0,
        duration: 0.95,
        ease:     'power3.out',
        delay:    i * 0.1,
        scrollTrigger: { trigger: el, start: 'top 85%' },
      });
    });
  }

  /* ============================================================
     8. (Number Counter is inline above in initScrollAnimations)
  ============================================================ */

  /* ============================================================
     9. CASE STUDY MODAL
  ============================================================ */

  function buildModalHTML(p) {
    const techTags = p.tags
      .map(t => `<span class="modal-tech">${t}</span>`)
      .join('');

    return `
      <p class="modal-eyebrow">${p.subtitle} — ${p.year}</p>
      <h2 class="modal-title">${p.title}</h2>

      <div class="modal-hero-img">
        <img src="${p.img}" alt="${p.title} — hero image" loading="lazy" width="1200" height="675">
      </div>

      <div class="modal-body">

        <aside class="modal-sidebar">
          <div class="modal-sidebar-item">
            <span class="modal-sidebar-label">Client</span>
            <span class="modal-sidebar-val">${p.client}</span>
          </div>
          <div class="modal-sidebar-item">
            <span class="modal-sidebar-label">Role</span>
            <span class="modal-sidebar-val">${p.role}</span>
          </div>
          <div class="modal-sidebar-item">
            <span class="modal-sidebar-label">Duration</span>
            <span class="modal-sidebar-val">${p.duration}</span>
          </div>
          <div class="modal-sidebar-item">
            <span class="modal-sidebar-label">Tech Stack</span>
            <div class="modal-tech-list">${techTags}</div>
          </div>
        </aside>

        <div class="modal-content-body">

          <h3 class="modal-section-title">OVERVIEW</h3>
          <p class="modal-text">${p.overview}</p>

          <h3 class="modal-section-title">THE CHALLENGE</h3>
          <p class="modal-text">${p.challenge}</p>

          <blockquote class="modal-quote">
            "The best interfaces are invisible.<br>
             The best engineering is quiet.<br>
             Both require the courage to remove."
          </blockquote>

          <h3 class="modal-section-title">STRATEGY</h3>
          <p class="modal-text">${p.strategy}</p>

          <h3 class="modal-section-title">ENGINEERING APPROACH</h3>
          <p class="modal-text">${p.engineering}</p>

          <h3 class="modal-section-title">VISUAL SYSTEM</h3>
          <p class="modal-text">${p.visual}</p>

          <div class="modal-outcome">
            <p class="modal-outcome-title">MEASURABLE OUTCOMES</p>
            <div class="modal-outcome-stats">
              <div>
                <div class="outcome-stat-num">${p.outcome.perf}</div>
                <p class="outcome-stat-label">Lighthouse Score</p>
              </div>
              <div>
                <div class="outcome-stat-num">${p.outcome.lcp}</div>
                <p class="outcome-stat-label">Largest Contentful Paint</p>
              </div>
              <div>
                <div class="outcome-stat-num">${p.outcome.bounce}</div>
                <p class="outcome-stat-label">Bounce Rate Change</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  function initModal() {
    const modal       = document.getElementById('modal');
    const modalInner  = document.getElementById('modal-content');
    const modalClose  = document.getElementById('modal-close');

    if (!modal || !modalInner || !modalClose) return;

    function openModal(projectKey) {
      const project = PROJECTS[projectKey];
      if (!project) return;

      // Inject content
      modalInner.innerHTML = buildModalHTML(project);

      // Show modal
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      modalClose.classList.add('is-visible');

      // Pause lenis, lock body scroll
      if (lenis) lenis.stop();
      document.body.style.overflow = 'hidden';

      // Reset scroll position
      modal.scrollTop = 0;

      // Focus trap — move focus into modal
      modal.focus();
    }

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      modalClose.classList.remove('is-visible');

      if (lenis) lenis.start();
      document.body.style.overflow = '';
    }

    // Open via project item click or keyboard
    document.querySelectorAll('.project-item').forEach(el => {
      el.addEventListener('click', () => openModal(el.dataset.project));
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal(el.dataset.project);
        }
      });
    });

    // Close via button
    modalClose.addEventListener('click', closeModal);

    // Close via Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });

    // Close via backdrop click (outside modal-inner)
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal();
    });
  }

  /* ============================================================
     10. LIVE NEPAL TIME
  ============================================================ */

  function initLiveTime() {
    const el = document.getElementById('live-time');
    if (!el) return;

    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kathmandu',
      hour:     '2-digit',
      minute:   '2-digit',
      second:   '2-digit',
      hour12:   false,
    });

    function tick() {
      el.textContent = fmt.format(new Date());
    }

    tick();
    setInterval(tick, 1000);
  }

  /* ============================================================
     11. INIT — Boot sequence
  ============================================================ */

  function boot() {
    // Lenis & GSAP ScrollTrigger must be ready before scroll animations
    initLenis();

    // Cursor (non-blocking)
    initCursor();

    // Live time
    initLiveTime();

    // Preloader → hero entry → scroll animations → nav
    initPreloader(() => {
      playHeroEntry(() => {
        document.body.classList.add('page-ready');
        initScrollAnimations();
        initNav();
        initModal();
      });
    });
  }

  // Wait for DOM + fonts (best effort)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
