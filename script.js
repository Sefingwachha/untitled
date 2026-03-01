/**
 * SEFIN GWACHHA — PORTFOLIO
 * script.js  |  v2.1.0
 *
 * Defensive boot — site loads & animates even if a CDN fails.
 */

(function () {
  'use strict';

  /* ============================================================
     1. CONFIG & PROJECT DATA
  ============================================================ */

  const CONFIG = {
    preloader: { tickMs: 50, minStep: 4, maxStep: 20 },
    lenis:     { duration: 1.3, touchMultiplier: 2 },
    cursor:    { lerp: 0.12 },
  };

  const PROJECTS = {
    euphoria: {
      title: 'EUPHORIA', subtitle: 'Platform Architecture & Experience Design', year: '2024',
      client: 'Confidential', role: 'Lead Engineer & Art Director', duration: '4 Months',
      tags: ['Platform Architecture','WebGL','React','Next.js','GSAP'],
      img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
      overview: 'Euphoria is an immersive digital platform redefining how audiences discover and experience contemporary music. The brief demanded a site that felt less like a product and more like an environment — somewhere between a venue and a visual essay. Technology disappears so emotion becomes the interface.',
      challenge: 'The core tension was performance versus expressivity. High-fidelity WebGL shaders and real-time audio visualisations needed to coexist with a sub-100ms LCP. The client\'s brand language was intentionally undefined — a creative constraint demanding strong editorial decision-making from wireframe to deploy.',
      strategy: 'Rather than retrofit existing templates, we built a bespoke rendering pipeline that prioritised perceptual performance. Animations were choreographed to mask load states, creating the illusion of instantaneity. Content was sequenced to reveal at the pace of the music — never forced.',
      engineering: 'The architecture separates presentation logic from data using a headless CMS (Sanity) feeding typed Next.js App Router routes. WebGL is isolated in a dedicated Web Worker, keeping the main thread unblocked during shader compilation. Three.js scene graphs are memoised and reused across transitions.',
      visual: 'Near-black grounds, warm amber type, and a single editorial image per page. Typography does the heavy lifting — Bebas Neue at 18vw for headers, DM Serif for emotional anchors. Motion is choreographed, not decorative.',
      outcome: { perf: '98', lcp: '0.8s', bounce: '−34%' },
    },
    cherished: {
      title: 'CHERISHED', subtitle: 'UI/UX Design & Engineering', year: '2024',
      client: 'Cherished Memories Ltd.', role: 'Full-Stack Creative Engineer', duration: '3 Months',
      tags: ['UI/UX Design','Next.js','GSAP','Framer Motion','Prisma','PostgreSQL'],
      img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop',
      overview: 'A platform for preserving family histories through interactive timelines, media galleries, and AI-assisted narrative generation. The product needed to feel simultaneously modern and emotionally resonant — technology in service of memory.',
      challenge: 'Balancing feature density with emotional clarity. Every interaction had to be intuitive, forgiving, and warm — even for users unfamiliar with digital archives. The data model was complex: nested family trees, multi-format media, and real-time collaborative editing across time zones.',
      strategy: 'A restraint-first design philosophy — remove everything non-essential before adding. We ran six user-testing rounds before writing a single line of production CSS. Every feature was pressure-tested: does this serve memory, or just serve the product?',
      engineering: 'Next.js App Router with React Server Components for sub-second first paints. A custom gesture library handles timeline scrubbing at 60fps on mid-range devices. Image processing runs on-edge via Cloudflare Workers. Real-time collaboration powered by Yjs CRDTs over WebSocket.',
      visual: 'Soft cream backgrounds, hand-drawn typographic accents, and a deliberate absence of sharp edges. The design language borrows from archival print — aged paper, analogue imperfection, deliberate margins.',
      outcome: { perf: '96', lcp: '1.1s', bounce: '−41%' },
    },
    meridian: {
      title: 'MERIDIAN', subtitle: 'Brand Identity & Three.js Experience', year: '2023',
      client: 'Meridian Capital Partners', role: 'Creative Director & Developer', duration: '6 Months',
      tags: ['Brand Identity','Three.js','TypeScript','GLSL','Blender','Sanity'],
      img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2560&auto=format&fit=crop',
      overview: 'Meridian required a complete digital identity — a brand system and web presence communicating global authority while feeling distinctly forward-looking. The result: a WebGL-first site built around a bespoke 3D typographic sculpture responding to scroll velocity in real-time.',
      challenge: 'Financial services audiences are sceptical of creative excess. Every visual decision needed to communicate precision, substance, and earned confidence. Creativity had to function as evidence of capability — not decoration.',
      strategy: 'Lead with competence, signal ambition through craft. The 3D type sculpture is a proof of technical capability deployed deliberately as a brand asset. Every interaction was tested against one question: does this increase or decrease institutional trust?',
      engineering: 'A custom GLSL vertex shader drives the typographic distortion responding to scroll velocity. The Three.js scene is post-processed with a custom toon-shading pipeline. TypeScript strict mode throughout — zero runtime type errors in production.',
      visual: 'Near-black ground. A single brand colour — cooled gold. Condensed grotesque type at architectural scale. White space used as a signal of confidence, not absence of content.',
      outcome: { perf: '97', lcp: '0.9s', bounce: '−28%' },
    },
  };

  /* ============================================================
     2. UTILITIES
  ============================================================ */
  function qs(s, c)  { return (c || document).querySelector(s);  }
  function qsa(s, c) { return Array.from((c || document).querySelectorAll(s)); }
  function hasGsap() { return typeof gsap !== 'undefined'; }
  function hasLenis(){ return typeof Lenis !== 'undefined'; }
  function hasST()   { return hasGsap() && typeof ScrollTrigger !== 'undefined'; }

  function forceShow(el) {
    if (!el) return;
    el.style.opacity    = '1';
    el.style.transform  = 'none';
    el.style.visibility = 'visible';
  }
  function forceShowAll(sel) { qsa(sel).forEach(forceShow); }

  /* ============================================================
     3. LENIS
  ============================================================ */
  var lenis = null;

  function initLenis() {
    if (!hasLenis() || !hasGsap()) return;
    try {
      lenis = new Lenis({
        duration: CONFIG.lenis.duration,
        easing: function(t){ return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        smooth: true,
        touchMultiplier: CONFIG.lenis.touchMultiplier,
      });
      if (hasST()) lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function(time){ lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0, 0);
    } catch(e) {
      console.warn('[SG] Lenis failed:', e);
      lenis = null;
    }
  }

  /* ============================================================
     4. GSAP SETUP
  ============================================================ */
  function initGsap() {
    if (hasGsap() && hasST()) gsap.registerPlugin(ScrollTrigger);
  }

  /* ============================================================
     5. CUSTOM CURSOR
  ============================================================ */
  function initCursor() {
    var isMouse = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    var cur = qs('#cursor');
    if (!isMouse || !cur) return;

    var mx = innerWidth/2, my = innerHeight/2, cx = mx, cy = my;
    var L = CONFIG.cursor.lerp;

    window.addEventListener('mousemove', function(e){ mx=e.clientX; my=e.clientY; }, {passive:true});

    (function loop(){
      cx += (mx-cx)*L; cy += (my-cy)*L;
      cur.style.transform = 'translate3d('+cx+'px,'+cy+'px,0)';
      requestAnimationFrame(loop);
    })();

    qsa('a,button').forEach(function(el){
      el.addEventListener('mouseenter', function(){ cur.classList.add('state-link'); });
      el.addEventListener('mouseleave', function(){ cur.classList.remove('state-link'); });
    });
    qsa('.project-item').forEach(function(el){
      el.addEventListener('mouseenter', function(){
        cur.classList.remove('state-link');
        cur.classList.add('state-view');
      });
      el.addEventListener('mouseleave', function(){ cur.classList.remove('state-view'); });
    });
  }

  /* ============================================================
     6. PRELOADER
  ============================================================ */
  function runPreloader(onDone) {
    var numEl  = qs('#pre-num');
    var fillEl = qs('#pre-fill');
    var loader = qs('#preloader');
    var pct = 0;

    var tick = setInterval(function(){
      var step = Math.floor(Math.random()*(CONFIG.preloader.maxStep-CONFIG.preloader.minStep+1))
               + CONFIG.preloader.minStep;
      pct = Math.min(100, pct + step);

      if (numEl)  numEl.textContent  = pct;
      if (fillEl) fillEl.style.width = pct+'%';
      if (loader) loader.setAttribute('aria-valuenow', pct);

      if (pct >= 100) {
        clearInterval(tick);
        setTimeout(onDone, 180);
      }
    }, CONFIG.preloader.tickMs);
  }

  /* ============================================================
     7. NAVIGATION
  ============================================================ */
  function initNav() {
    var nav = qs('#nav');
    if (!nav) return;
    var lastY = 0, ticking = false;

    function update(){
      var y = window.scrollY;
      if (y > 90 && y > lastY) nav.classList.add('is-hidden');
      else                      nav.classList.remove('is-hidden');
      lastY = y; ticking = false;
    }

    window.addEventListener('scroll', function(){
      if (!ticking){ requestAnimationFrame(update); ticking=true; }
    }, {passive:true});
  }

  /* ============================================================
     8. HERO ENTRY ANIMATION
  ============================================================ */
  function playHeroEntry(onComplete) {
    var nav = qs('#nav');

    /* — No GSAP fallback — */
    if (!hasGsap()) {
      var loader = qs('#preloader');
      if (loader) { loader.style.display='none'; loader.style.visibility='hidden'; }
      forceShowAll('.h-word,.h-serif,.hero-portrait,.hero-meta,.hero-scroll-indicator');
      if (nav) nav.classList.add('is-visible');
      if (onComplete) onComplete();
      return;
    }

    var tl = gsap.timeline({
      onComplete: function(){
        document.body.classList.add('page-ready');
        if (onComplete) onComplete();
      }
    });

    tl
      .to('.pre-curtain', { scaleX:1, duration:0.78, ease:'power4.inOut' })
      .set('#preloader',  { autoAlpha:0 })
      .to('.hero-rule',   { scaleX:1, duration:1.5, ease:'power3.inOut' }, '-=0.15')
      .to('.hero-portrait',{ autoAlpha:1, duration:1.3, ease:'power3.out' }, '-=1.2')
      .to('.h-word, .h-serif', {
        y:'0%', autoAlpha:1,
        duration:1.45, ease:'power4.out', stagger:0.1,
      }, '-=1.1')
      .to('.hero-meta, .hero-scroll-indicator', {
        y:0, autoAlpha:1,
        duration:1.0, ease:'power3.out', stagger:0.09,
      }, '-=0.8')
      .add(function(){ if (nav) nav.classList.add('is-visible'); }, '-=0.5');
  }

  /* ============================================================
     9. SCROLL ANIMATIONS
  ============================================================ */
  function initScrollAnimations() {
    if (!hasGsap() || !hasST()) {
      /* Reveal everything immediately */
      forceShowAll(
        '.gs-fade,.gs-up,.gs-project,'+
        '.manifesto-heading .mask>span,'+
        '.works-title .mask>span,'+
        '.process-title .mask>span,'+
        '.footer-cta .mask>span,'+
        '.footer-eyebrow,.number-item,.service-item,.process-step'
      );
      initCountersIO();
      return;
    }

    var T = 'top 86%';

    /* gs-fade */
    qsa('.gs-fade').forEach(function(el){
      var d = parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
      gsap.to(el, { opacity:1, duration:0.9, ease:'power2.out', delay:d,
        scrollTrigger:{ trigger:el, start:T } });
    });

    /* gs-up */
    qsa('.gs-up').forEach(function(el){
      var d = parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
      gsap.to(el, { y:0, opacity:1, duration:1.05, ease:'power3.out', delay:d,
        scrollTrigger:{ trigger:el, start:T } });
    });

    /* Manifesto lines */
    qsa('.manifesto-heading .mask>span').forEach(function(span,i){
      gsap.to(span, { y:'0%', duration:1.3, ease:'power4.out', delay:i*0.065,
        scrollTrigger:{ trigger:'.manifesto-heading', start:'top 82%' } });
    });

    /* Works title */
    qsa('.works-title .mask>span').forEach(function(span){
      gsap.to(span, { y:'0%', duration:1.15, ease:'power4.out',
        scrollTrigger:{ trigger:'.works-title', start:T } });
    });

    /* Process title */
    qsa('.process-title .mask>span').forEach(function(span,i){
      gsap.to(span, { y:'0%', duration:1.15, ease:'power4.out', delay:i*0.07,
        scrollTrigger:{ trigger:'.process-title', start:T } });
    });

    /* Project items */
    qsa('.gs-project').forEach(function(el){
      gsap.to(el, { y:0, opacity:1, duration:1.15, ease:'power3.out',
        scrollTrigger:{ trigger:el, start:T } });
    });

    /* Service items */
    qsa('.service-item').forEach(function(el,i){
      gsap.to(el, { y:0, opacity:1, duration:1.0, ease:'power3.out', delay:(i%2)*0.08,
        scrollTrigger:{ trigger:el, start:T } });
    });

    /* Process steps */
    qsa('.process-step').forEach(function(el,i){
      gsap.to(el, { y:0, opacity:1, duration:0.95, ease:'power3.out', delay:i*0.08,
        scrollTrigger:{ trigger:'.process-track', start:'top 82%' } });
    });

    /* Number items */
    qsa('.number-item').forEach(function(el,i){
      gsap.to(el, { y:0, opacity:1, duration:0.95, ease:'power3.out', delay:i*0.1,
        scrollTrigger:{ trigger:el, start:T } });
    });

    /* Footer */
    gsap.to('.footer-eyebrow', { opacity:1, y:0, duration:0.9, ease:'power3.out',
      scrollTrigger:{ trigger:'.footer-top', start:'top 85%' } });

    qsa('.footer-cta .mask>span').forEach(function(span,i){
      gsap.to(span, { y:'0%', duration:1.4, ease:'power4.out', delay:i*0.1,
        scrollTrigger:{ trigger:'.footer-cta', start:'top 90%' } });
    });

    qsa('.footer-bottom .gs-fade').forEach(function(el,i){
      gsap.to(el, { opacity:1, duration:0.75, ease:'power2.out', delay:i*0.07,
        scrollTrigger:{ trigger:'.footer-bottom', start:'top 90%' } });
    });

    /* Hero portrait parallax */
    gsap.to('.hero-portrait', { yPercent:18, ease:'none',
      scrollTrigger:{ trigger:'#hero', start:'top top', end:'bottom top', scrub:1.4 } });

    /* Animated counters */
    qsa('[data-count]').forEach(function(el){
      var target = parseInt(el.dataset.count, 10);
      var suffix = el.dataset.suffix || '';
      var proxy  = { val:0 };
      ScrollTrigger.create({ trigger:el, start:'top 82%', once:true,
        onEnter: function(){
          gsap.to(proxy, { val:target, duration:1.85, ease:'power2.out',
            onUpdate: function(){ el.textContent = Math.round(proxy.val)+suffix; }
          });
        }
      });
    });
  }

  /* Fallback counters without GSAP */
  function initCountersIO() {
    if (!('IntersectionObserver' in window)) {
      qsa('[data-count]').forEach(function(el){
        el.textContent = el.dataset.count + (el.dataset.suffix||'');
      });
      return;
    }
    var io = new IntersectionObserver(function(entries, obs){
      entries.forEach(function(entry){
        if (!entry.isIntersecting) return;
        var el=entry.target, target=parseInt(el.dataset.count,10), suffix=el.dataset.suffix||'';
        var dur=1600, start=performance.now();
        function step(now){
          var p=Math.min((now-start)/dur,1), e=1-Math.pow(1-p,3);
          el.textContent = Math.round(target*e)+suffix;
          if(p<1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        obs.unobserve(el);
      });
    }, {threshold:0.3});
    qsa('[data-count]').forEach(function(el){ io.observe(el); });
  }

  /* ============================================================
     10. MODAL
  ============================================================ */
  function buildModalHTML(p) {
    var tags = p.tags.map(function(t){ return '<span class="modal-tech">'+t+'</span>'; }).join('');
    return '<p class="modal-eyebrow">'+p.subtitle+' — '+p.year+'</p>'+
      '<h2 class="modal-title">'+p.title+'</h2>'+
      '<div class="modal-hero-img"><img src="'+p.img+'" alt="'+p.title+'" loading="lazy" width="1200" height="675"></div>'+
      '<div class="modal-body">'+
        '<aside class="modal-sidebar">'+
          '<div class="modal-sidebar-item"><span class="modal-sidebar-label">Client</span><span class="modal-sidebar-val">'+p.client+'</span></div>'+
          '<div class="modal-sidebar-item"><span class="modal-sidebar-label">Role</span><span class="modal-sidebar-val">'+p.role+'</span></div>'+
          '<div class="modal-sidebar-item"><span class="modal-sidebar-label">Duration</span><span class="modal-sidebar-val">'+p.duration+'</span></div>'+
          '<div class="modal-sidebar-item"><span class="modal-sidebar-label">Stack</span><div class="modal-tech-list">'+tags+'</div></div>'+
        '</aside>'+
        '<div class="modal-content-body">'+
          '<h3 class="modal-section-title">OVERVIEW</h3><p class="modal-text">'+p.overview+'</p>'+
          '<h3 class="modal-section-title">THE CHALLENGE</h3><p class="modal-text">'+p.challenge+'</p>'+
          '<blockquote class="modal-quote">"The best interfaces are invisible.<br>The best engineering is quiet.<br>Both require the courage to remove."</blockquote>'+
          '<h3 class="modal-section-title">STRATEGY</h3><p class="modal-text">'+p.strategy+'</p>'+
          '<h3 class="modal-section-title">ENGINEERING APPROACH</h3><p class="modal-text">'+p.engineering+'</p>'+
          '<h3 class="modal-section-title">VISUAL SYSTEM</h3><p class="modal-text">'+p.visual+'</p>'+
          '<div class="modal-outcome">'+
            '<p class="modal-outcome-title">MEASURABLE OUTCOMES</p>'+
            '<div class="modal-outcome-stats">'+
              '<div><div class="outcome-stat-num">'+p.outcome.perf+'</div><p class="outcome-stat-label">Lighthouse Score</p></div>'+
              '<div><div class="outcome-stat-num">'+p.outcome.lcp+'</div><p class="outcome-stat-label">LCP</p></div>'+
              '<div><div class="outcome-stat-num">'+p.outcome.bounce+'</div><p class="outcome-stat-label">Bounce Rate Change</p></div>'+
            '</div>'+
          '</div>'+
        '</div>'+
      '</div>';
  }

  function initModal() {
    var modal    = qs('#modal');
    var inner    = qs('#modal-content');
    var closeBtn = qs('#modal-close');
    if (!modal || !inner || !closeBtn) return;

    function open(key) {
      var p = PROJECTS[key]; if (!p) return;
      inner.innerHTML = buildModalHTML(p);
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden','false');
      closeBtn.classList.add('is-visible');
      if (lenis) lenis.stop();
      document.body.style.overflow = 'hidden';
      modal.scrollTop = 0;
    }

    function close() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden','true');
      closeBtn.classList.remove('is-visible');
      if (lenis) lenis.start();
      document.body.style.overflow = '';
    }

    qsa('.project-item').forEach(function(el){
      el.addEventListener('click', function(){ open(el.dataset.project); });
      el.addEventListener('keydown', function(e){
        if (e.key==='Enter'||e.key===' '){ e.preventDefault(); open(el.dataset.project); }
      });
    });

    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', function(e){
      if (e.key==='Escape' && modal.classList.contains('is-open')) close();
    });
  }

  /* ============================================================
     11. LIVE NEPAL TIME
  ============================================================ */
  function initLiveTime() {
    var el = qs('#live-time'); if (!el) return;
    var fmt = new Intl.DateTimeFormat('en-GB',{
      timeZone:'Asia/Kathmandu', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false
    });
    function tick(){ el.textContent = fmt.format(new Date()); }
    tick(); setInterval(tick, 1000);
  }

  /* ============================================================
     12. BOOT
  ============================================================ */
  function boot() {
    initGsap();
    initLenis();
    initCursor();
    initLiveTime();

    runPreloader(function(){
      playHeroEntry(function(){
        document.body.classList.add('page-ready');
        initScrollAnimations();
        initNav();
        initModal();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
