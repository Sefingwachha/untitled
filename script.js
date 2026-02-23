/**
 * SEFIN GWACHHA — Portfolio Script
 * Every getElementById matches index.html exactly.
 * Preloader IDs:  pre-fill, pre-num, pre-wipe
 * Panel IDs:      img-panel, img-panel-inner, img-panel-src, img-panel-title, img-panel-year
 * Body class for ready state: page-ready
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────── */
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }

  var IS_MOUSE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ─────────────────────────────────────────
     GLOBAL MOUSE POSITION
  ───────────────────────────────────────── */
  var mouseX = window.innerWidth / 2;
  var mouseY = window.innerHeight / 2;
  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  /* ─────────────────────────────────────────
     1. PRELOADER
     Uses: #pre-num, #pre-fill, #pre-wipe
     Adds: body.page-ready when done
  ───────────────────────────────────────── */
  var preNum  = document.getElementById('pre-num');
  var preFill = document.getElementById('pre-fill');
  var preWipe = document.getElementById('pre-wipe');
  var pct = 0;

  function showPage() {
    document.body.classList.add('page-ready');
    // Preload archive images after page is visible
    preloadArchiveImages();
  }

  if (!preNum || !preFill) {
    // Safety: if elements missing just show page
    showPage();
  } else {
    var loaderTimer = setInterval(function () {
      pct = Math.min(100, pct + Math.floor(Math.random() * 15) + 5);
      preNum.textContent  = pct;
      preFill.style.width = pct + '%';

      if (pct >= 100) {
        clearInterval(loaderTimer);
        setTimeout(function () {
          if (preWipe) preWipe.style.transform = 'scaleY(1)';
          setTimeout(showPage, preWipe ? 680 : 50);
        }, 120);
      }
    }, 24);
  }

  /* ─────────────────────────────────────────
     2. CHAR SPLITTING
     Targets: .h-word[data-word]
  ───────────────────────────────────────── */
  document.querySelectorAll('.h-word').forEach(function (el) {
    var word = el.getAttribute('data-word') || el.textContent.trim();
    el.setAttribute('aria-label', word);
    el.innerHTML = word.split('').map(function (ch, i) {
      return '<span class="h-char" aria-hidden="true" style="--ci:' + i + '">' +
             (ch === ' ' ? '&nbsp;' : ch) + '</span>';
    }).join('');
  });

  /* ─────────────────────────────────────────
     3. CUSTOM CURSOR
     ID: cursor
  ───────────────────────────────────────── */
  var cursorEl = document.getElementById('cursor');

  if (IS_MOUSE && cursorEl) {
    var cx = mouseX, cy = mouseY;

    (function cursorLoop() {
      cx = lerp(cx, mouseX, 0.15);
      cy = lerp(cy, mouseY, 0.15);
      cursorEl.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      requestAnimationFrame(cursorLoop);
    }());

    // Standard links → ring grows
    document.querySelectorAll('a, button').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursorEl.classList.add('is-link'); });
      el.addEventListener('mouseleave', function () { cursorEl.classList.remove('is-link'); });
    });
  } else {
    if (cursorEl) cursorEl.style.display = 'none';
  }

  /* ─────────────────────────────────────────
     4. IMAGE HOVER PANEL  ← the key feature
     Panel ID:    img-panel
     Inner ID:    img-panel-inner
     Image ID:    img-panel-src
     Title ID:    img-panel-title
     Year  ID:    img-panel-year
     Active class: is-on  (added to #img-panel)
  ───────────────────────────────────────── */
  var panel      = document.getElementById('img-panel');
  var panelImg   = document.getElementById('img-panel-src');
  var panelTitle = document.getElementById('img-panel-title');
  var panelYear  = document.getElementById('img-panel-year');

  if (IS_MOUSE && panel && panelImg) {
    var px = mouseX, py = mouseY;  // panel position (lerped)
    var tilt = 0, prevMX = mouseX; // velocity tilt
    var panelOn = false;
    var panelInner = document.getElementById('img-panel-inner');

    /* Slow lerp loop — panel lags behind cursor */
    (function panelLoop() {
      px    = lerp(px, mouseX, 0.08);
      py    = lerp(py, mouseY, 0.08);
      tilt  = lerp(tilt, clamp((mouseX - prevMX) * 0.4, -10, 10), 0.09);
      prevMX = mouseX;

      panel.style.left = px + 'px';
      panel.style.top  = py + 'px';

      /* Override CSS rotate with velocity tilt (JS is more precise here) */
      if (panelInner) {
        if (panelOn) {
          panelInner.style.transform = 'translate(-50%,-60%) scale(1) rotate(' + (tilt * 0.35) + 'deg)';
        } else {
          panelInner.style.transform = 'translate(-50%,-60%) scale(0.82) rotate(-5deg)';
        }
      }

      requestAnimationFrame(panelLoop);
    }());

    /* Preload images for instant display */
    function preloadArchiveImages() {
      document.querySelectorAll('.archive-row[data-img]').forEach(function (row) {
        var src = row.getAttribute('data-img');
        if (src) { var img = new Image(); img.src = src; }
      });
    }
    window.preloadArchiveImages = preloadArchiveImages;

    /* Hook up each archive row */
    document.querySelectorAll('.archive-row').forEach(function (row) {

      row.addEventListener('mouseenter', function () {
        var src   = this.getAttribute('data-img')   || '';
        var title = this.getAttribute('data-title') || '';
        var year  = this.getAttribute('data-year')  || '';

        /* Set image source — browser cache makes repeats instant */
        if (src) panelImg.src = src;

        /* Update info text */
        if (panelTitle) panelTitle.textContent = title;
        if (panelYear)  panelYear.textContent  = year;

        /* Snap panel position to current mouse before animating in */
        px = mouseX; py = mouseY;
        panel.style.left = px + 'px';
        panel.style.top  = py + 'px';

        /* Show panel */
        panelOn = true;
        panel.classList.add('is-on');

        /* Cursor → VIEW mode */
        if (cursorEl) { cursorEl.classList.remove('is-link'); cursorEl.classList.add('is-view'); }
      });

      row.addEventListener('mouseleave', function () {
        panelOn = false;
        panel.classList.remove('is-on');
        if (cursorEl) { cursorEl.classList.remove('is-view'); cursorEl.classList.add('is-link'); }
      });

      row.addEventListener('mouseleave', function () {
        // Reset cursor fully after leaving
        if (cursorEl) cursorEl.classList.remove('is-link');
      });

      /* 3-D perspective tilt per row */
      row.addEventListener('mousemove', function (e) {
        var r   = this.getBoundingClientRect();
        var ry  = (e.clientX - r.left  - r.width  / 2) / r.width;
        var rx  = (e.clientY - r.top   - r.height / 2) / r.height;
        this.style.transform = 'perspective(1400px) rotateX(' + (-rx * 2.5) + 'deg) rotateY(' + (ry * 2.5) + 'deg)';
      });
      row.addEventListener('mouseleave', function () { this.style.transform = ''; });
    });

  } else {
    // On touch devices: hide panel
    if (panel) panel.style.display = 'none';
  }

  function preloadArchiveImages() {
    document.querySelectorAll('.archive-row[data-img]').forEach(function (row) {
      var src = row.getAttribute('data-img');
      if (src) { var img = new Image(); img.src = src; }
    });
  }

  /* ─────────────────────────────────────────
     5. MAGNETIC ELEMENTS
     Targets: [data-mag]
  ───────────────────────────────────────── */
  if (IS_MOUSE) {
    document.querySelectorAll('[data-mag]').forEach(function (el) {
      var strength = parseFloat(el.getAttribute('data-mag') || '0.3');
      el.addEventListener('mousemove', function (e) {
        var r  = this.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width  / 2) * strength;
        var dy = (e.clientY - r.top  - r.height / 2) * strength;
        this.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        this.style.transition = 'transform 0.8s cubic-bezier(0.16,1,0.3,1)';
        this.style.transform = '';
        var self = this;
        setTimeout(function () { self.style.transition = ''; }, 800);
      });
    });
  }

  /* ─────────────────────────────────────────
     6. SCROLL REVEALS
     Classes: .mask (text lines), .reveal-up, .reveal-lines, .footer-eyebrow
     JS adds: .visible
  ───────────────────────────────────────── */
  var revealObserver = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;

      /* Headline: stagger each .mask child */
      if (el.classList.contains('reveal-lines')) {
        el.querySelectorAll('.mask').forEach(function (m, i) {
          m.style.transitionDelay = (i * 0.085) + 's';
          m.classList.add('visible');
        });
      }

      /* Individual mask line */
      if (el.classList.contains('mask')) el.classList.add('visible');

      /* Generic up-reveal */
      if (el.classList.contains('reveal-up')) el.classList.add('visible');

      /* Footer eyebrow */
      if (el.classList.contains('footer-eyebrow')) el.classList.add('visible');

      /* Stagger archive rows */
      if (el.classList.contains('archive')) {
        el.querySelectorAll('.reveal-up').forEach(function (row, i) {
          row.style.transitionDelay = (i * 0.1) + 's';
          row.classList.add('visible');
        });
      }

      obs.unobserve(el);
    });
  }, { rootMargin: '0px 0px -5% 0px', threshold: 0 });

  document.querySelectorAll('.mask, .reveal-up, .reveal-lines, .footer-eyebrow, .archive').forEach(function (el) {
    revealObserver.observe(el);
  });

  /* Footer CTA lines */
  var footerCta = document.querySelector('.footer-cta');
  if (footerCta) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        footerCta.querySelectorAll('.cta-line').forEach(function (line, i) {
          setTimeout(function () { line.classList.add('visible'); }, i * 150);
        });
      });
    }, { threshold: 0.2 }).observe(footerCta);
  }

  /* ─────────────────────────────────────────
     7. SCROLL PHYSICS
     Badge spin, nav hide/show, archive skew
  ───────────────────────────────────────── */
  var lastScrollY = window.pageYOffset;
  var badgeDeg    = 0;
  var skewVal     = 0;
  var navHidden   = false;
  var skewTimer;

  var badgeWheel = document.getElementById('badge-wheel');
  var navEl      = document.getElementById('nav');
  var archiveEl  = document.getElementById('archive');

  window.addEventListener('scroll', function () {
    requestAnimationFrame(function () {
      var y  = window.pageYOffset;
      var dy = y - lastScrollY;

      /* Badge spin */
      if (badgeWheel) {
        badgeDeg += dy * 0.13;
        badgeWheel.style.transform = 'rotate(' + badgeDeg + 'deg)';
      }

      /* Nav: hide on scroll down, show on scroll up */
      if (dy > 6 && y > 100 && !navHidden) {
        if (navEl) navEl.classList.add('nav-up');
        navHidden = true;
      } else if (dy < -4 && navHidden) {
        if (navEl) navEl.classList.remove('nav-up');
        navHidden = false;
      }

      /* Archive list: subtle skew on scroll */
      if (archiveEl && window.innerWidth >= 768) {
        skewVal = lerp(skewVal, clamp(dy * 0.05, -3.5, 3.5), 0.2);
        archiveEl.style.transform = 'skewY(' + skewVal + 'deg)';
        clearTimeout(skewTimer);
        skewTimer = setTimeout(function () {
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
  if (IS_MOUSE) {
    var heroTitle = document.querySelector('.hero-title');
    var heroEye   = document.querySelector('.hero-eyebrow');

    if (heroTitle) {
      var hx = 0, hy = 0;
      (function heroLoop() {
        var nx = mouseX / window.innerWidth  - 0.5;
        var ny = mouseY / window.innerHeight - 0.5;
        hx = lerp(hx, nx * 20, 0.055);
        hy = lerp(hy, ny * 11, 0.055);
        heroTitle.style.transform = 'translate(' + hx + 'px,' + hy + 'px)';
        if (heroEye) heroEye.style.transform = 'translate(' + (hx * 0.4) + 'px,' + (hy * 0.4) + 'px)';
        requestAnimationFrame(heroLoop);
      }());
    }
  }

  /* ─────────────────────────────────────────
     9. MARQUEE: pause / reverse on hover
  ───────────────────────────────────────── */
  var marqueeEl = document.querySelector('.marquee');
  if (marqueeEl) {
    marqueeEl.addEventListener('mouseenter', function () {
      this.querySelectorAll('.marquee-row').forEach(function (r) {
        r.style.animationDirection = 'reverse';
        r.style.animationDuration  = '13s';
      });
    });
    marqueeEl.addEventListener('mouseleave', function () {
      this.querySelectorAll('.marquee-row').forEach(function (r) {
        r.style.animationDirection = 'normal';
        r.style.animationDuration  = '26s';
      });
    });
  }

  /* ─────────────────────────────────────────
     10. LIVE NEPAL TIME
     ID: live-time
  ───────────────────────────────────────── */
  var timeEl = document.getElementById('live-time');
  if (timeEl) {
    var timeFmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kathmandu',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    });
    function updateTime() { timeEl.textContent = timeFmt.format(new Date()) + ' NPT'; }
    updateTime();
    setInterval(updateTime, 1000);
  }

  /* ─────────────────────────────────────────
     11. SECURITY (right-click / devtools)
  ───────────────────────────────────────── */
  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  document.addEventListener('keydown', function (e) {
    if (e.keyCode === 123 ||
       (e.ctrlKey && e.shiftKey && e.keyCode === 73) ||
       (e.ctrlKey && e.keyCode === 85)) {
      e.preventDefault();
    }
  });

}());
