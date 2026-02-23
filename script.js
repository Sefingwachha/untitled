/**
* SEFIN GWACHHA — Portfolio Script
* This script is a refined version of the provided prototype code.
* It includes an accurate asset preloader and is organized for maintainability.
*/

(function () {
    'use strict';

    /* ─────────────────────────────────────────
    HELPERS & CONFIG
    ───────────────────────────────────────── */
    function lerp(a, b, t) { return a + (b - a) * t; }
    function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }
    const IS_MOUSE_DEVICE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* ─────────────────────────────────────────
    GLOBAL MOUSE POSITION
    ───────────────────────────────────────── */
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, { passive: true });

    /* ─────────────────────────────────────────
    1. ACCURATE ASSET PRELOADER
    ───────────────────────────────────────── */
    const preNum = document.getElementById('pre-num');
    const preFill = document.getElementById('pre-fill');
    const preWipe = document.getElementById('pre-wipe');

    function showPage() {
        document.body.classList.add('page-ready');
    }

    // Define critical assets to track
    const criticalImages = Array.from(document.querySelectorAll('.archive-row[data-img]'));
    const fontBebas = new FontFaceObserver('Bebas Neue');
    const fontDMSans = new FontFaceObserver('DM Sans');
    const fontDMSerif = new FontFaceObserver('DM Serif Display');

    // Create promises for each asset
    const imagePromises = criticalImages.map(row => new Promise(resolve => {
        const img = new Image();
        img.src = row.getAttribute('data-img');
        img.onload = resolve;
        img.onerror = resolve; // Resolve on error to not block the preloader
    }));

    const fontPromises = [fontBebas.load(), fontDMSans.load(), fontDMSerif.load()];
    const allAssets = [...imagePromises, ...fontPromises];
    const totalAssets = allAssets.length;
    let loadedAssets = 0;

    const updateProgress = () => {
        loadedAssets++;
        const progress = Math.round((loadedAssets / totalAssets) * 100);
        if (preNum) preNum.textContent = progress;
        if (preFill) preFill.style.width = progress + '%';

        if (loadedAssets === totalAssets) {
            // All assets loaded, proceed to show page
            setTimeout(() => {
                if (preWipe) preWipe.style.transform = 'scaleY(1)';
                setTimeout(showPage, preWipe ? 680 : 50);
            }, 120);
        }
    };

    // Attach updateProgress to each promise
    allAssets.forEach(promise => {
        promise.then(updateProgress).catch(updateProgress);
    });

    /* ─────────────────────────────────────────
    2. CHARACTER SPLITTING FOR ANIMATIONS
    ───────────────────────────────────────── */
    document.querySelectorAll('.h-word').forEach(el => {
        const word = el.getAttribute('data-word') || el.textContent.trim();
        el.setAttribute('aria-label', word);
        el.innerHTML = word.split('').map((ch, i) =>
            `<span class="h-char" aria-hidden="true" style="--ci:${i}">${ch === ' ' ? '&nbsp;' : ch}</span>`
        ).join('');
    });

    /* ─────────────────────────────────────────
    3. CUSTOM CURSOR
    ───────────────────────────────────────── */
    const cursorEl = document.getElementById('cursor');
    if (IS_MOUSE_DEVICE && cursorEl) {
        let cx = mouseX, cy = mouseY;
        (function cursorLoop() {
            cx = lerp(cx, mouseX, 0.15);
            cy = lerp(cy, mouseY, 0.15);
            cursorEl.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
            requestAnimationFrame(cursorLoop);
        }());

        document.querySelectorAll('a, button').forEach(el => {
            el.addEventListener('mouseenter', () => cursorEl.classList.add('is-link'));
            el.addEventListener('mouseleave', () => cursorEl.classList.remove('is-link'));
        });
    } else if (cursorEl) {
        cursorEl.style.display = 'none';
    }

    /* ─────────────────────────────────────────
    4. IMAGE HOVER PANEL
    ───────────────────────────────────────── */
    const panel = document.getElementById('img-panel');
    const panelImg = document.getElementById('img-panel-src');
    const panelTitle = document.getElementById('img-panel-title');
    const panelYear = document.getElementById('img-panel-year');

    if (IS_MOUSE_DEVICE && panel && panelImg) {
        let px = mouseX, py = mouseY;
        let tilt = 0, prevMX = mouseX;
        let panelOn = false;
        const panelInner = document.getElementById('img-panel-inner');

        (function panelLoop() {
            px = lerp(px, mouseX, 0.08);
            py = lerp(py, mouseY, 0.08);
            tilt = lerp(tilt, clamp((mouseX - prevMX) * 0.4, -10, 10), 0.09);
            prevMX = mouseX;
            panel.style.left = `${px}px`;
            panel.style.top = `${py}px`;

            if (panelInner) {
                const rotateVal = panelOn ? tilt * 0.35 : -5;
                const scaleVal = panelOn ? 1 : 0.82;
                panelInner.style.transform = `translate(-50%, -60%) scale(${scaleVal}) rotate(${rotateVal}deg)`;
            }
            requestAnimationFrame(panelLoop);
        }());

        document.querySelectorAll('.archive-row').forEach(row => {
            row.addEventListener('mouseenter', function () {
                const src = this.getAttribute('data-img') || '';
                const title = this.getAttribute('data-title') || '';
                const year = this.getAttribute('data-year') || '';

                if (src) panelImg.src = src;
                if (panelTitle) panelTitle.textContent = title;
                if (panelYear) panelYear.textContent = year;

                px = mouseX; py = mouseY;
                panel.style.left = `${px}px`;
                panel.style.top = `${py}px`;

                panelOn = true;
                panel.classList.add('is-on');

                if (cursorEl) {
                    cursorEl.classList.remove('is-link');
                    cursorEl.classList.add('is-view');
                }
            });

            row.addEventListener('mouseleave', function () {
                panelOn = false;
                panel.classList.remove('is-on');
                if (cursorEl) {
                    cursorEl.classList.remove('is-view');
                }
            });

            row.addEventListener('mousemove', function (e) {
                const r = this.getBoundingClientRect();
                const ry = (e.clientX - r.left - r.width / 2) / r.width;
                const rx = (e.clientY - r.top - r.height / 2) / r.height;
                this.style.transform = `perspective(1400px) rotateX(${-rx * 2.5}deg) rotateY(${ry * 2.5}deg)`;
            });

            row.addEventListener('mouseleave', function () {
                this.style.transform = '';
            });
        });
    } else if (panel) {
        panel.style.display = 'none';
    }

    /* ─────────────────────────────────────────
    5. MAGNETIC ELEMENTS
    ───────────────────────────────────────── */
    if (IS_MOUSE_DEVICE) {
        document.querySelectorAll('[data-mag]').forEach(el => {
            const strength = parseFloat(el.getAttribute('data-mag') || '0.3');
            el.addEventListener('mousemove', function (e) {
                const r = this.getBoundingClientRect();
                const dx = (e.clientX - r.left - r.width / 2) * strength;
                const dy = (e.clientY - r.top - r.height / 2) * strength;
                this.style.transform = `translate(${dx}px, ${dy}px)`;
            });
            el.addEventListener('mouseleave', function () {
                this.style.transition = 'transform 0.8s cubic-bezier(0.16,1,0.3,1)';
                this.style.transform = '';
                setTimeout(() => { this.style.transition = ''; }, 800);
            });
        });
    }

    /* ─────────────────────────────────────────
    6. SCROLL REVEAL ANIMATIONS
    ───────────────────────────────────────── */
    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            if (el.classList.contains('reveal-lines')) {
                el.querySelectorAll('.mask').forEach((m, i) => {
                    m.style.transitionDelay = `${i * 0.085}s`;
                    m.classList.add('visible');
                });
            } else if (el.classList.contains('archive')) {
                el.querySelectorAll('.reveal-up').forEach((row, i) => {
                    row.style.transitionDelay = `${i * 0.1}s`;
                    row.classList.add('visible');
                });
            } else {
                el.classList.add('visible');
            }
            obs.unobserve(el);
        });
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0 });

    document.querySelectorAll('.mask, .reveal-up, .reveal-lines, .footer-eyebrow, .archive').forEach(el => {
        revealObserver.observe(el);
    });

    const footerCta = document.querySelector('.footer-cta');
    if (footerCta) {
        new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                footerCta.querySelectorAll('.cta-line .mask').forEach((line, i) => {
                    setTimeout(() => { line.classList.add('visible'); }, i * 150);
                });
            });
        }, { threshold: 0.2 }).observe(footerCta);
    }

    /* ─────────────────────────────────────────
    7. SCROLL-BASED PHYSICS & INTERACTIONS
    ───────────────────────────────────────── */
    let lastScrollY = window.pageYOffset;
    let badgeDeg = 0;
    let skewVal = 0;
    let navHidden = false;
    let skewTimer;
    const badgeWheel = document.getElementById('badge-wheel');
    const navEl = document.getElementById('nav');
    const archiveEl = document.getElementById('archive');

    window.addEventListener('scroll', () => {
        requestAnimationFrame(() => {
            const y = window.pageYOffset;
            const dy = y - lastScrollY;

            if (badgeWheel) {
                badgeDeg += dy * 0.13;
                badgeWheel.style.transform = `rotate(${badgeDeg}deg)`;
            }

            if (navEl) {
                if (dy > 6 && y > 100 && !navHidden) {
                    navEl.classList.add('nav-up');
                    navHidden = true;
                } else if (dy < -4 && navHidden) {
                    navEl.classList.remove('nav-up');
                    navHidden = false;
                }
            }

            if (archiveEl && window.innerWidth >= 768) {
                skewVal = lerp(skewVal, clamp(dy * 0.05, -3.5, 3.5), 0.2);
                archiveEl.style.transform = `skewY(${skewVal}deg)`;
                clearTimeout(skewTimer);
                skewTimer = setTimeout(() => {
                    skewVal = 0;
                    archiveEl.style.transform = '';
                }, 200);
            }
            lastScrollY = y;
        });
    }, { passive: true });

    /* ─────────────────────────────────────────
    8. HERO MOUSE PARALLAX
    ───────────────────────────────────────── */
    if (IS_MOUSE_DEVICE) {
        const heroTitle = document.querySelector('.hero-title');
        const heroEye = document.querySelector('.hero-eyebrow');
        if (heroTitle) {
            let hx = 0, hy = 0;
            (function heroLoop() {
                const nx = (mouseX / window.innerWidth - 0.5);
                const ny = (mouseY / window.innerHeight - 0.5);
                hx = lerp(hx, nx * 20, 0.055);
                hy = lerp(hy, ny * 11, 0.055);
                heroTitle.style.transform = `translate(${hx}px, ${hy}px)`;
                if (heroEye) heroEye.style.transform = `translate(${hx * 0.4}px, ${hy * 0.4}px)`;
                requestAnimationFrame(heroLoop);
            }());
        }
    }

    /* ─────────────────────────────────────────
    9. MARQUEE INTERACTION
    ───────────────────────────────────────── */
    const marqueeEl = document.querySelector('.marquee');
    if (marqueeEl) {
        marqueeEl.addEventListener('mouseenter', function () {
            this.querySelectorAll('.marquee-row').forEach(r => {
                r.style.animationPlayState = 'paused';
            });
        });
        marqueeEl.addEventListener('mouseleave', function () {
            this.querySelectorAll('.marquee-row').forEach(r => {
                r.style.animationPlayState = 'running';
            });
        });
    }

    /* ─────────────────────────────────────────
    10. LIVE NEPAL TIME
    ───────────────────────────────────────── */
    const timeEl = document.getElementById('live-time');
    if (timeEl) {
        const timeFmt = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kathmandu',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        const updateTime = () => {
            timeEl.textContent = `${timeFmt.format(new Date())} NPT`;
        };
        updateTime();
        setInterval(updateTime, 1000);
    }

}());
