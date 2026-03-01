(function () {
    'use strict';

    /* ─────────────────────────────────────────
       HELPERS & STATE
    ───────────────────────────────────────── */
    function lerp(a, b, t) { return a + (b - a) * t; }
    function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }
    const IS_MOUSE_DEVICE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let isPanelTransitioning = false; // Prevents mouse follow during expanding animation
    let lenis;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, { passive: true });

    /* ─────────────────────────────────────────
       1. LENIS SMOOTH SCROLL
    ───────────────────────────────────────── */
    function initSmoothScroll() {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smooth: true,
        });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0, 0);
    }
    initSmoothScroll();

    /* ─────────────────────────────────────────
       2. GSAP SCROLL ANIMATIONS SETUP
    ───────────────────────────────────────── */
    gsap.registerPlugin(ScrollTrigger);

    function initScrollAnimations() {
        // Character Splitting for Hero
        document.querySelectorAll('.h-word').forEach(el => {
            if(!el.querySelector('.h-char')) { // Prevent double splitting
                const word = el.getAttribute('data-word') || el.textContent.trim();
                el.setAttribute('aria-label', word);
                el.innerHTML = word.split('').map((ch, i) =>
                    `<span class="h-char" aria-hidden="true" style="--ci:${i}">${ch === ' ' ? '&nbsp;' : ch}</span>`
                ).join('');
            }
        });

        // Basic Text Reveals (Manifesto, Services)
        gsap.utils.toArray('.gs-reveal').forEach(el => {
            gsap.fromTo(el, 
                { y: 40, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 1, ease: "power3.out",
                  scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" }
                }
            );
        });

        // About Headline Reveal
        gsap.utils.toArray('.about-headline .mask span').forEach((span, i) => {
            gsap.to(span, {
                y: "0%", duration: 1.2, ease: "power4.out", delay: i * 0.08,
                scrollTrigger: { trigger: ".about-headline", start: "top 80%" }
            });
        });

        // Archive Rows Stagger
        ScrollTrigger.batch(".gs-row", {
            start: "top 85%",
            onEnter: batch => gsap.to(batch, {autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.8, ease: "power3.out"}),
        });

        // Hero Parallax Scrub
        gsap.to(".hero-title", {
            yPercent: 30, ease: "none",
            scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
        });
    }

    /* ─────────────────────────────────────────
       3. PRELOADER & INITIAL LOAD HERO ANIMATION
    ───────────────────────────────────────── */
    function finishLoading() {
        const tl = gsap.timeline({
            onComplete: () => {
                document.body.classList.add('page-ready');
            }
        });

        tl.to(".pre-wipe", { scaleY: 1, transformOrigin: "bottom", duration: 0.8, ease: "power4.inOut" })
          .set("#preloader", { autoAlpha: 0 })
          .to(".h-char", { y: "0%", autoAlpha: 1, stagger: 0.04, duration: 1, ease: "power4.out" }, "-=0.2")
          .to(".h-serif", { autoAlpha: 1, duration: 1 }, "-=0.8")
          .to(".hero-eyebrow, .hero-foot", { y: 0, autoAlpha: 1, duration: 0.8 }, "-=0.6");
    }

    // Fake progress for presentation 
    const preNum = document.getElementById('pre-num');
    const preFill = document.getElementById('pre-fill');
    let progress = 0;
    const loadInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 1;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadInterval);
            // We call finishLoading inside Barba's 'once' hook below!
        }
        if (preNum) preNum.textContent = progress;
        if (preFill) preFill.style.width = progress + '%';
    }, 80);

    /* ─────────────────────────────────────────
       4. CUSTOM CURSOR & IMAGE PANEL
    ───────────────────────────────────────── */
    function initInteractiveUI() {
        const cursorEl = document.getElementById('cursor');
        const panel = document.getElementById('img-panel');
        const panelImg = document.getElementById('img-panel-src');
        const panelTitle = document.getElementById('img-panel-title');
        const panelYear = document.getElementById('img-panel-year');
        const panelInner = document.getElementById('img-panel-inner');

        if (IS_MOUSE_DEVICE) {
            let cx = mouseX, cy = mouseY, px = mouseX, py = mouseY;
            let tilt = 0, prevMX = mouseX;
            let panelOn = false;

            // Master Animation Loop for UI
            (function uiLoop() {
                // Cursor
                cx = lerp(cx, mouseX, 0.15);
                cy = lerp(cy, mouseY, 0.15);
                if (cursorEl) cursorEl.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;

                // Panel (Only move if NOT transitioning pages)
                if (!isPanelTransitioning && panel) {
                    px = lerp(px, mouseX, 0.08);
                    py = lerp(py, mouseY, 0.08);
                    tilt = lerp(tilt, clamp((mouseX - prevMX) * 0.4, -10, 10), 0.09);
                    prevMX = mouseX;

                    panel.style.left = `${px}px`;
                    panel.style.top = `${py}px`;

                    if (panelInner && panelOn) {
                        panelInner.style.transform = `translate(-50%, -60%) scale(1) rotate(${tilt * 0.35}deg)`;
                    } else if (panelInner) {
                        panelInner.style.transform = `translate(-50%, -60%) scale(0.82) rotate(-5deg)`;
                    }
                }
                requestAnimationFrame(uiLoop);
            }());

            // Bind Hover Events dynamically
            const bindHovers = () => {
                document.querySelectorAll('a, button').forEach(el => {
                    el.addEventListener('mouseenter', () => cursorEl?.classList.add('is-link'));
                    el.addEventListener('mouseleave', () => cursorEl?.classList.remove('is-link'));
                });

                document.querySelectorAll('.archive-row').forEach(row => {
                    row.addEventListener('mouseenter', function () {
                        if(isPanelTransitioning) return;
                        if (panelImg) panelImg.src = this.getAttribute('data-img') || '';
                        if (panelTitle) panelTitle.textContent = this.getAttribute('data-title') || '';
                        if (panelYear) panelYear.textContent = this.getAttribute('data-year') || '';
                        px = mouseX; py = mouseY;
                        panelOn = true;
                        panel?.classList.add('is-on');
                        cursorEl?.classList.replace('is-link', 'is-view');
                    });
                    row.addEventListener('mouseleave', function () {
                        if(isPanelTransitioning) return;
                        panelOn = false;
                        panel?.classList.remove('is-on');
                        cursorEl?.classList.remove('is-view');
                    });
                });
            };
            bindHovers();

            // Rebind after Barba transitions
            barba.hooks.after(() => { bindHovers(); });
        }
    }
    initInteractiveUI();

    /* ─────────────────────────────────────────
       5. LIVE TIME & MISC INTERACTIONS
    ───────────────────────────────────────── */
    const timeEl = document.getElementById('live-time');
    if (timeEl) {
        setInterval(() => {
            timeEl.textContent = `${new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date())} NPT`;
        }, 1000);
    }

    /* ─────────────────────────────────────────
       6. BARBA.JS PAGE TRANSITIONS
    ───────────────────────────────────────── */
    barba.init({
        sync: true,
        transitions: [
            // IMAGE EXPAND TRANSITION
            {
                name: 'image-expand',
                custom: ({ trigger }) => trigger && trigger.dataset && trigger.dataset.barbaTransition === 'expand',
                async leave(data) {
                    const done = this.async();
                    isPanelTransitioning = true; // Freeze panel movement

                    const panel = document.getElementById('img-panel');
                    const panelInner = document.getElementById('img-panel-inner');
                    const cursorEl = document.getElementById('cursor');
                    
                    panel.classList.add('is-transitioning');
                    if(cursorEl) cursorEl.style.opacity = '0'; // Hide cursor temporarily

                    const tl = gsap.timeline({ onComplete: done });

                    // Expand image to center of viewport
                    tl.to(panelInner, {
                        width: '100vw', height: '100vh', scale: 1, rotate: 0,
                        xPercent: -50, yPercent: -50, top: '50vh', left: '50vw',
                        duration: 1.2, ease: 'expo.inOut'
                    }, 0);

                    // Fade out current page behind it
                    tl.to(data.current.container, { autoAlpha: 0, duration: 0.8, ease: 'power3.inOut' }, 0);
                },
                async enter(data) {
                    // Reset the floating image panel back to default hidden state
                    const panel = document.getElementById('img-panel');
                    const panelInner = document.getElementById('img-panel-inner');
                    const cursorEl = document.getElementById('cursor');

                    gsap.set(panelInner, { clearProps: "all" }); 
                    panel.classList.remove('is-transitioning', 'is-on');
                    isPanelTransitioning = false;
                    if(cursorEl) cursorEl.style.opacity = '1';

                    // Fade in new page content (Assuming the new page has a full screen hero image that matches)
                    gsap.from(data.next.container, { autoAlpha: 0, duration: 1, ease: 'power3.out' });
                }
            },
            // DEFAULT WIPE TRANSITION
            {
                name: 'default-wipe',
                async leave(data) {
                    const done = this.async();
                    await gsap.to('.page-transition', { duration: 0.8, scaleY: 1, transformOrigin: 'bottom left', ease: 'expo.inOut' });
                    done();
                },
                async enter(data) {
                    gsap.to('.page-transition', { duration: 0.8, scaleY: 0, transformOrigin: 'top left', ease: 'expo.inOut', delay: 0.1 });
                },
                async once(data) {
                    // This fires on the very first initial page load
                    initScrollAnimations();
                    // Let the setInterval finish, it will call finishLoading if needed, but for safety:
                    setTimeout(finishLoading, 1000); 
                }
            }
        ]
    });

    // CRITICAL: Refresh scroll & animations when DOM swaps
    barba.hooks.after(() => {
        lenis.scrollTo(0, { immediate: true });
        ScrollTrigger.refresh();
        initScrollAnimations();
    });

})();
