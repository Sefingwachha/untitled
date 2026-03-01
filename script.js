/**
 * SEFIN GWACHHA — script.js v3.1
 * Added Dynamic Year Update & Accessibility Focus Trap
 */
(function () {
  'use strict';

  /* ─── PROJECT DATA ─────────────────────────────────── */
  var PROJECTS = {
    euphoria: {
      title:'EUPHORIA', sub:'Platform Architecture & Experience Design', year:'2024',
      client:'Confidential', role:'Lead Engineer & Art Director', dur:'4 Months',
      tags:['Platform Architecture','WebGL','React','Next.js','GSAP'],
      img:'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
      overview:'Euphoria is an immersive digital platform redefining how audiences discover and experience contemporary music. The brief demanded a site that felt less like a product and more like an environment — somewhere between a venue and a visual essay.',
      challenge:'The core tension was performance versus expressivity. WebGL shaders and real-time audio visualisations needed to coexist with a sub-100ms LCP. The client\'s brand language was intentionally undefined — a creative constraint demanding strong editorial decision-making from wireframe to deploy.',
      strategy:'We built a bespoke rendering pipeline prioritising perceptual performance. Animations were choreographed to mask load states, creating the illusion of instantaneity. Content was sequenced to reveal at the pace of the music — never forced.',
      engineering:'Architecture separates presentation from data using a headless CMS (Sanity) feeding typed Next.js App Router routes. WebGL is isolated in a Web Worker, keeping the main thread unblocked. Three.js scene graphs are memoised and reused across route transitions.',
      visual:'Near-black grounds, warm amber type, a single editorial image per page. Typography does the heavy lifting — Bebas Neue at 18vw for headers, DM Serif for emotional anchors. Motion is choreographed, not decorative.',
      out:{perf:'98',lcp:'0.8s',bounce:'−34%'}
    },
    cherished: {
      title:'CHERISHED', sub:'UI/UX Design & Engineering', year:'2024',
      client:'Cherished Memories Ltd.', role:'Full-Stack Creative Engineer', dur:'3 Months',
      tags:['UI/UX Design','Next.js','GSAP','Framer Motion','Prisma','PostgreSQL'],
      img:'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop',
      overview:'A platform for preserving family histories through interactive timelines, media galleries, and AI-assisted narrative generation. The product needed to feel simultaneously modern and emotionally resonant — technology in service of memory.',
      challenge:'Balancing feature density with emotional clarity. Every interaction had to be intuitive and warm — even for users unfamiliar with digital archives. The data model was complex: nested family trees, multi-format media, and real-time collaborative editing across time zones.',
      strategy:'Restraint-first design — remove everything non-essential before adding. Six user-testing rounds before writing a line of production CSS. Every feature pressure-tested: does this serve memory, or just the product?',
      engineering:'Next.js App Router with React Server Components for sub-second first paints. Custom gesture library for timeline scrubbing at 60fps. Image processing on-edge via Cloudflare Workers. Real-time collaboration via Yjs CRDTs over WebSocket.',
      visual:'Soft cream backgrounds, hand-drawn typographic accents, deliberate absence of sharp edges. Design language borrows from archival print — aged paper, analogue imperfection, deliberate margins.',
      out:{perf:'96',lcp:'1.1s',bounce:'−41%'}
    },
    meridian: {
      title:'MERIDIAN', sub:'Brand Identity & Three.js Experience', year:'2023',
      client:'Meridian Capital Partners', role:'Creative Director & Developer', dur:'6 Months',
      tags:['Brand Identity','Three.js','TypeScript','GLSL','Blender','Sanity'],
      img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2560&auto=format&fit=crop',
      overview:'Meridian required a complete digital identity — a brand system and web presence communicating global authority while feeling distinctly forward-looking. A WebGL-first site built around a bespoke 3D typographic sculpture responding to scroll velocity in real-time.',
      challenge:'Financial services audiences are sceptical of creative excess. Every visual decision needed to communicate precision, substance, and earned confidence. Creativity had to function as evidence of capability — not decoration.',
      strategy:'Lead with competence, signal ambition through craft. The 3D type sculpture is not decoration — it is proof of technical capability deployed deliberately as a brand asset. Every interaction tested against one question: does this increase or decrease institutional trust?',
      engineering:'A custom GLSL vertex shader drives typographic distortion responding to scroll velocity. Three.js scene post-processed with custom toon-shading pipeline. TypeScript strict mode throughout — zero runtime type errors in production.',
      visual:'Near-black ground. A single brand colour — cooled gold. Condensed grotesque type at architectural scale. White space used as a signal of confidence, not absence of content.',
      out:{perf:'97',lcp:'0.9s',bounce:'−28%'}
    }
  };

  /* ─── HELPERS ───────────────────────────────────────── */
  function qs(s,c)  { return (c||document).querySelector(s);  }
  function qsa(s,c) { return Array.from((c||document).querySelectorAll(s)); }
  function hasG()   { return typeof gsap !== 'undefined'; }
  function hasL()   { return typeof Lenis !== 'undefined'; }
  function hasST()  { return hasG() && typeof ScrollTrigger !== 'undefined'; }

  function show(el) {
    if (!el) return;
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.style.visibility = 'visible';
  }
  function showAll(sel) { qsa(sel).forEach(show); }

  /* ─── STATE ─────────────────────────────────────────── */
  var lenis = null;
  var lastFocusedElement = null; // For modal accessibility

  /* ─── 0. DYNAMIC YEAR ───────────────────────────────── */
  function initDynamicYear() {
    var year = new Date().getFullYear();
    qsa('.current-year').forEach(function(el) { el.textContent = year; });
    qsa('.current-year-short').forEach(function(el) { el.textContent = year.toString().slice(-2); });
  }

  /* ─── 1. LENIS ──────────────────────────────────────── */
  function initLenis() {
    if (!hasL() || !hasG()) return;
    try {
      lenis = new Lenis({
        duration: 1.3,
        easing: function(t){ return Math.min(1, 1.001 - Math.pow(2, -10*t)); },
        smooth: true,
        touchMultiplier: 2
      });
      if (hasST()) lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function(t){ lenis.raf(t*1000); });
      gsap.ticker.lagSmoothing(0,0);
    } catch(e) {
      console.warn('Lenis init failed:', e);
      lenis = null;
    }
  }

  /* ─── 2. GSAP REGISTER ──────────────────────────────── */
  function initGsap() {
    if (hasG() && hasST()) gsap.registerPlugin(ScrollTrigger);
  }

  /* ─── 3. CURSOR ─────────────────────────────────────── */
  function initCursor() {
    var isMouse = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    var cur = qs('#cursor');
    if (!isMouse || !cur) return;

    var mx = innerWidth/2, my = innerHeight/2, cx = mx, cy = my;
    window.addEventListener('mousemove', function(e){ mx=e.clientX; my=e.clientY; }, {passive:true});

    (function loop(){
      cx += (mx-cx)*0.12;
      cy += (my-cy)*0.12;
      cur.style.transform = 'translate3d('+cx+'px,'+cy+'px,0)';
      requestAnimationFrame(loop);
    })();

    qsa('a,button').forEach(function(el){
      el.addEventListener('mouseenter', function(){ cur.classList.add('is-link'); });
      el.addEventListener('mouseleave', function(){ cur.classList.remove('is-link'); });
    });

    qsa('.project-item').forEach(function(el){
      el.addEventListener('mouseenter', function(){
        cur.classList.remove('is-link');
        cur.classList.add('is-view');
      });
      el.addEventListener('mouseleave', function(){ cur.classList.remove('is-view'); });
    });
  }

  /* ─── 4. PRELOADER ──────────────────────────────────── */
  function runPreloader(done) {
    var numEl  = qs('#pre-num');
    var fillEl = qs('#pre-fill');
    var pct = 0;
    var t = setInterval(function(){
      pct = Math.min(100, pct + Math.floor(Math.random()*17) + 4);
      if (numEl)  numEl.textContent  = pct;
      if (fillEl) fillEl.style.width = pct+'%';
      if (pct >= 100) { clearInterval(t); setTimeout(done, 150); }
    }, 50);
  }

  /* ─── 5. HERO ENTRY ─────────────────────────────────── */
  function heroEntry(done) {
    var nav = qs('#nav');
    if (!hasG()) {
      var pre = qs('#preloader');
      if (pre) { pre.style.display='none'; }
      showAll('.hw,.hs,.hero-portrait,.hero-meta,.hero-scroll,.hero-rule');
      if (nav) nav.classList.add('is-visible');
      if (done) done();
      return;
    }

    gsap.timeline({
      onComplete: function(){
        document.body.classList.add('page-ready');
        if (done) done();
      }
    })
    .to('.pre-curtain', { scaleX:1, duration:0.78, ease:'power4.inOut' })
    .set('#preloader',  { autoAlpha:0 })
    .to('.hero-rule', { scaleX:1, duration:1.5, ease:'power3.inOut' }, '-=0.2')
    .to('.hero-portrait', { autoAlpha:1, duration:1.3, ease:'power3.out' }, '-=1.3')
    .to('.hw, .hs', {
      y: '0%', autoAlpha: 1, duration: 1.45, ease: 'power4.out', stagger: 0.1
    }, '-=1.1')
    .to('.hero-meta, .hero-scroll', {
      y: 0, autoAlpha: 1, duration: 1.0, ease: 'power3.out', stagger: 0.09
    }, '-=0.85')
    .add(function(){ if(nav) nav.classList.add('is-visible'); }, '-=0.5');
  }

  /* ─── 6. NAV HIDE/SHOW ───────────────────────────────── */
  function initNav() {
    var nav = qs('#nav');
    if (!nav) return;
    var lastY = 0, ticking = false;
    function upd(){
      var y = window.scrollY;
      if (y > 90 && y > lastY) nav.classList.add('is-hidden');
      else                      nav.classList.remove('is-hidden');
      lastY = y; ticking = false;
    }
    window.addEventListener('scroll', function(){
      if (!ticking){ requestAnimationFrame(upd); ticking=true; }
    }, {passive:true});
  }

  /* ─── 7. SCROLL ANIMATIONS ───────────────────────────── */
  function initScrollAnims() {
    if (!hasG() || !hasST()) {
      showAll('.anim-fade,.anim-up,.anim-project,.manifesto-heading .mask>span,.works-title .mask>span,.process-title .mask>span,.footer-cta .mask>span,.footer-eyebrow');
      initCountersIO();
      return;
    }

    var T = 'top 86%';

    qsa('.anim-fade').forEach(function(el){
      gsap.to(el, { opacity:1, duration:0.9, ease:'power2.out', scrollTrigger:{ trigger:el, start:T } });
    });

    qsa('.anim-up').forEach(function(el){
      var d = parseFloat(getComputedStyle(el).getPropertyValue('--sd')) || 0;
      gsap.to(el, { y:0, opacity:1, duration:1.05, ease:'power3.out', delay:d, scrollTrigger:{ trigger:el, start:T } });
    });

    qsa('.anim-project').forEach(function(el){
      gsap.to(el, { y:0, opacity:1, duration:1.15, ease:'power3.out', scrollTrigger:{ trigger:el, start:T } });
    });

    qsa('.manifesto-heading .mask>span').forEach(function(span, i){
      gsap.to(span, { y:'0%', duration:1.3, ease:'power4.out', delay:i*0.065, scrollTrigger:{ trigger:'.manifesto-heading', start:'top 82%' } });
    });

    qsa('.works-title .mask>span').forEach(function(span){
      gsap.to(span, { y:'0%', duration:1.15, ease:'power4.out', scrollTrigger:{ trigger:'.works-title', start:T } });
    });

    qsa('.process-title .mask>span').forEach(function(span,i){
      gsap.to(span, { y:'0%', duration:1.15, ease:'power4.out', delay:i*0.07, scrollTrigger:{ trigger:'.process-title', start:T } });
    });

    gsap.to('.footer-eyebrow', { opacity:1, y:0, duration:0.9, ease:'power3.out', scrollTrigger:{ trigger:'.footer-top', start:'top 85%' } });

    qsa('.footer-cta .mask>span').forEach(function(span,i){
      gsap.to(span, { y:'0%', duration:1.4, ease:'power4.out', delay:i*0.1, scrollTrigger:{ trigger:'.footer-cta', start:'top 90%' } });
    });

    gsap.to('.hero-portrait', { yPercent:18, ease:'none', scrollTrigger:{ trigger:'#hero', start:'top top', end:'bottom top', scrub:1.4 } });

    qsa('[data-count]').forEach(function(el){
      var target = parseInt(el.dataset.count, 10);
      var suffix = el.dataset.suffix || '';
      var proxy  = {val:0};
      ScrollTrigger.create({ trigger:el, start:'top 82%', once:true,
        onEnter:function(){
          gsap.to(proxy, { val:target, duration:1.85, ease:'power2.out',
            onUpdate:function(){ el.textContent = Math.round(proxy.val)+suffix; } });
        }
      });
    });
  }

  function initCountersIO() {
    if (!('IntersectionObserver' in window)) {
      qsa('[data-count]').forEach(function(el){ el.textContent = el.dataset.count + (el.dataset.suffix||''); });
      return;
    }
    var io = new IntersectionObserver(function(entries, obs){
      entries.forEach(function(entry){
        if (!entry.isIntersecting) return;
        var el=entry.target, tgt=parseInt(el.dataset.count,10), sfx=el.dataset.suffix||'';
        var dur=1600, t0=performance.now();
        (function step(now){
          var p=Math.min((now-t0)/dur,1), e=1-Math.pow(1-p,3);
          el.textContent = Math.round(tgt*e)+sfx;
          if(p<1) requestAnimationFrame(step);
        })(t0);
        obs.unobserve(el);
      });
    }, {threshold:0.3});
    qsa('[data-count]').forEach(function(el){ io.observe(el); });
  }

  /* ─── 8. MODAL (With Accessibility Focus) ────────────── */
  function buildModal(p) {
    var tags = p.tags.map(function(t){ return '<span class="m-tech">'+t+'</span>'; }).join('');
    return (
      '<div id="modal-body">'+
      '<p class="m-eyebrow">'+p.sub+' — '+p.year+'</p>'+
      '<h2 class="m-title">'+p.title+'</h2>'+
      '<div class="m-hero-img"><img src="'+p.img+'" alt="'+p.title+'" loading="lazy" width="1200" height="675"></div>'+
      '<div class="m-grid">'+
        '<aside>'+
          '<div class="m-sidebar-item"><span class="m-sidebar-label">Client</span><span class="m-sidebar-val">'+p.client+'</span></div>'+
          '<div class="m-sidebar-item"><span class="m-sidebar-label">Role</span><span class="m-sidebar-val">'+p.role+'</span></div>'+
          '<div class="m-sidebar-item"><span class="m-sidebar-label">Duration</span><span class="m-sidebar-val">'+p.dur+'</span></div>'+
          '<div class="m-sidebar-item"><span class="m-sidebar-label">Stack</span><div class="m-tech-list">'+tags+'</div></div>'+
        '</aside>'+
        '<div>'+
          '<h3 class="m-section-title">OVERVIEW</h3><p class="m-text">'+p.overview+'</p>'+
          '<h3 class="m-section-title">THE CHALLENGE</h3><p class="m-text">'+p.challenge+'</p>'+
          '<blockquote class="m-quote">"The best interfaces are invisible.<br>The best engineering is quiet.<br>Both require the courage to remove."</blockquote>'+
          '<h3 class="m-section-title">STRATEGY</h3><p class="m-text">'+p.strategy+'</p>'+
          '<h3 class="m-section-title">ENGINEERING</h3><p class="m-text">'+p.engineering+'</p>'+
          '<h3 class="m-section-title">VISUAL SYSTEM</h3><p class="m-text">'+p.visual+'</p>'+
          '<div class="m-outcome">'+
            '<p class="m-outcome-title">MEASURABLE OUTCOMES</p>'+
            '<div class="m-outcome-stats">'+
              '<div><div class="m-stat-num">'+p.out.perf+'</div><p class="m-stat-label">Lighthouse Score</p></div>'+
              '<div><div class="m-stat-num">'+p.out.lcp+'</div><p class="m-stat-label">LCP</p></div>'+
              '<div><div class="m-stat-num">'+p.out.bounce+'</div><p class="m-stat-label">Bounce Rate</p></div>'+
            '</div>'+
          '</div>'+
        '</div>'+
      '</div>'+
      '</div>'
    );
  }

  function initModal() {
    var modal   = qs('#modal');
    var closeBtn= qs('#modal-close');
    if (!modal || !closeBtn) return;

    function open(key) {
      var p = PROJECTS[key]; if (!p) return;
      
      // Save currently focused element for accessibility
      lastFocusedElement = document.activeElement;
      
      modal.innerHTML = closeBtn.outerHTML + buildModal(p);
      var newClose = qs('#modal-close', modal);
      if (newClose) newClose.addEventListener('click', close);

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden','false');
      
      var cl = qs('.modal-close', modal);
      if (cl) cl.classList.add('is-visible');

      if (lenis) lenis.stop();
      document.body.style.overflow = 'hidden';
      modal.scrollTop = 0;
      
      // Shift focus to the modal wrapper
      modal.focus();
    }

    function close() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden','true');
      if (lenis) lenis.start();
      document.body.style.overflow = '';
      
      // Return focus to the original element
      if (lastFocusedElement) {
        lastFocusedElement.focus();
      }
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

  /* ─── 9. LIVE NEPAL TIME ─────────────────────────────── */
  function initTime() {
    var el = qs('#live-time'); if (!el) return;
    var fmt = new Intl.DateTimeFormat('en-GB',{
      timeZone:'Asia/Kathmandu',
      hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false
    });
    function tick(){ el.textContent = fmt.format(new Date()); }
    tick(); setInterval(tick, 1000);
  }

  /* ─── BOOT ───────────────────────────────────────────── */
  function boot() {
    initDynamicYear();
    initGsap();
    initLenis();
    initCursor();
    initTime();
    runPreloader(function(){
      heroEntry(function(){
        document.body.classList.add('page-ready');
        initScrollAnims();
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
