/* ──────────────────────────────────────────────
   SEFIN GWACHHA — Portfolio Script
   All IDs match index.html exactly.
   Safe null-checks on every element access.
────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {

  /* ── Security ── */
  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  document.addEventListener('keydown', function (e) {
    if (e.keyCode === 123 ||
       (e.ctrlKey && e.shiftKey && e.keyCode === 73) ||
       (e.ctrlKey && e.keyCode === 85) ||
       (e.ctrlKey && e.keyCode === 67)) {
      e.preventDefault();
    }
  });

  /* ── Helpers ── */
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }
  var isMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ════════════════════════════════════════
     1. CHAR SPLITTING
  ════════════════════════════════════════ */
  document.querySelectorAll('.split-word').forEach(function (el) {
    var text = el.getAttribute('data-word') || el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.innerHTML = text.split('').map(function (ch, i) {
      return '<span class="char" aria-hidden="true" style="--ci:' + i + '">' +
             (ch === ' ' ? '&nbsp;' : ch) + '</span>';
    }).join('');
  });

  /* ════════════════════════════════════════
     2. PRELOADER  ← The critical section
        Uses only IDs that exist in HTML.
  ════════════════════════════════════════ */
  var pct     = 0;
  var numEl   = document.getElementById('pre-num');
  var fillEl  = document.getElementById('pre-fill');
  var wipeEl  = document.getElementById('pre-wipe');

  /* Safety: if elements missing, just show page immediately */
  if (!numEl || !fillEl) {
    document.body.classList.add('loaded');
    document.body.classList.remove('loading');
  } else {
    var loaderInterval = setInterval(function () {
      var jump = Math.floor(Math.random() * 16) + 5;
      pct = Math.min(100, pct + jump);

      numEl.textContent  = pct;
      fillEl.style.width = pct + '%';

      if (pct >= 100) {
        clearInterval(loaderInterval);

        setTimeout(function () {
          /* Animate wipe panel if it exists */
          if (wipeEl) {
            wipeEl.style.transform = 'scaleY(1)';
          }
          /* Show page after brief pause */
          setTimeout(function () {
            document.body.classList.add('loaded');
            document.body.classList.remove('loading');
          }, wipeEl ? 650 : 0);
        }, 150);
      }
    }, 25);
  }

  /* ════════════════════════════════════════
     3. GLOBAL MOUSE
  ════════════════════════════════════════ */
  var mouseX = window.innerWidth  / 2;
  var mouseY = window.innerHeight / 2;

  window.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  /* ════════════════════════════════════════
     4. KINETIC CURSOR
  ════════════════════════════════════════ */
  var cursor = document.getElementById('cursor');

  if (isMouse && cursor) {
    var cx = mouseX, cy = mouseY;

    (function cursorLoop() {
      cx = lerp(cx, mouseX, 0.15);
      cy = lerp(cy, mouseY, 0.15);
      cursor.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      requestAnimationFrame(cursorLoop);
    }());

    /* Link states */
    document.querySelectorAll('a, button').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('is-link'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('is-link'); });
    });
  } else {
    if (cursor) cursor.style.display = 'none';
  }

  /* ════════════════════════════════════════
     5. PROJECT IMAGE REVEAL
        IDs: img-reveal, img-reveal-inner,
             reveal-img, reveal-name, reveal-role
  ════════════════════════════════════════ */
  var panel      = document.getElementById('img-reveal');
  var panelInner = document.getElementById('img-reveal-inner');
  var panelImg   = document.getElementById('reveal-img');
  var revName    = document.getElementById('reveal-name');
  var revRole    = document.getElementById('reveal-role');

  if (isMouse && panel && panelInner && panelImg) {

    var rx = mouseX, ry = mouseY;
    var tilt = 0, prevMX = mouseX;
    var revealActive = false;

    /* Preload all project images silently */
    document.querySelectorAll('.project-item[data-image]').forEach(function (el) {
      var src = el.getAttribute('data-image');
      if (src) { var img = new Image(); img.src = src; }
    });

    /* Slow-lerp loop — panel trails behind cursor */
    (function revealLoop() {
      rx   = lerp(rx, mouseX, 0.075);
      ry   = lerp(ry, mouseY, 0.075);
      tilt = lerp(tilt, clamp((mouseX - prevMX) * 0.45, -10, 10), 0.09);
      prevMX = mouseX;

      panel.style.left = rx + 'px';
      panel.style.top  = ry + 'px';

      /* JS applies velocity tilt; CSS handles scale+opacity */
      if (revealActive) {
        panelInner.style.transform =
          'translate(-50%,-50%) scale(1) rotate(' + (tilt * 0.35) + 'deg)';
      } else {
        panelInner.style.transform =
          'translate(-50%,-50%) scale(0.85) rotate(' + (-5 + tilt * 0.1) + 'deg)';
      }

      requestAnimationFrame(revealLoop);
    }());

    /* Per-row events */
    document.querySelectorAll('.project-item').forEach(function (row) {

      row.addEventListener('mouseenter', function () {
        var src  = this.getAttribute('data-image') || '';
        var name = '';
        var role = '';

        var nameEl = this.querySelector('.w-name');
        var roleEl = this.querySelector('.w-role');
        if (nameEl) name = nameEl.textContent.trim();
        if (roleEl) role = roleEl.textContent.trim();

        /* Set image — cached images are instant */
        if (src) panelImg.src = src;
        if (revName) revName.textContent = name;
        if (revRole) revRole.textContent  = role;

        revealActive = true;
        panel.classList.add('active');
        if (cursor) cursor.classList.add('is-view');
      });

      row.addEventListener('mouseleave', function () {
        revealActive = false;
        panel.classList.remove('active');
        if (cursor) cursor.classList.remove('is-view');
      });

      /* 3-D tilt per row */
      row.addEventListener('mousemove', function (e) {
        var r  = this.getBoundingClientRect();
        var ry = (e.clientX - r.left - r.width  / 2) / r.width;
        var rx = (e.clientY - r.top  - r.height / 2) / r.height;
        this.style.transform =
          'perspective(1400px) rotateX(' + (-rx * 2.5) + 'deg) rotateY(' + (ry * 2.5) + 'deg)';
      });
      row.addEventListener('mouseleave', function () {
        this.style.transform = '';
      });
    });
  }

  /* ════════════════════════════════════════
     6. MAGNETIC PULL
  ════════════════════════════════════════ */
  if (isMouse) {
    document.querySelectorAll('[data-mag]').forEach(function (el) {
      var str = parseFloat(el.getAttribute('data-mag') || '0.3');

      el.addEventListener('mousemove', function (e) {
        var r  = this.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width  / 2) * str;
        var dy = (e.clientY - r.top  - r.height / 2) * str;
        this.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      });

      el.addEventListener('mouseleave', function () {
        this.style.transition = 'transform 0.85s cubic-bezier(0.16,1,0.3,1)';
        this.style.transform  = '';
        var self = this;
        setTimeout(function () { self.style.transition = ''; }, 850);
      });
    });
  }

  /* ════════════════════════════════════════
     7. SCROLL REVEALS
  ════════════════════════════════════════ */
  var revealIO = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;

      /* About headline — stagger each line */
      if (el.classList.contains('js-lines')) {
        el.querySelectorAll('.line').forEach(function (line, i) {
          line.style.transitionDelay = (i * 0.085) + 's';
          line.classList.add('is-visible');
        });
      }

      /* Generic */
      if (el.classList.contains('js-reveal'))    el.classList.add('is-visible');
      if (el.classList.contains('foot-eyebrow')) el.classList.add('is-visible');

      /* Line masks (footer CTA) */
      if (el.classList.contains('js-line-mask')) el.classList.add('is-visible');

      /* Services — stagger children */
      if (el.classList.contains('services')) {
        el.querySelectorAll('.svc').forEach(function (svc, i) {
          svc.style.transitionDelay = (i * 0.12) + 's';
          svc.classList.add('is-visible'); /* svc inherits from js-reveal if needed */
        });
      }

      /* Works list — stagger rows */
      if (el.classList.contains('works-list')) {
        el.querySelectorAll('.js-reveal').forEach(function (row, i) {
          row.style.transitionDelay = (i * 0.1) + 's';
          row.classList.add('is-visible');
        });
      }

      obs.unobserve(el);
    });
  }, { rootMargin: '0px 0px -5% 0px', threshold: 0 });

  document.querySelectorAll(
    '.js-reveal, .js-lines, .foot-eyebrow, .js-line-mask, .services, .works-list'
  ).forEach(function (el) { revealIO.observe(el); });

  /* ════════════════════════════════════════
     8. SCROLL PHYSICS
  ════════════════════════════════════════ */
  var lastY     = window.pageYOffset;
  var badgeDeg  = 0;
  var skewVal   = 0;
  var navHidden = false;
  var skewTimer;

  var badgeWheel = document.getElementById('badge-wheel');
  var nav        = document.getElementById('nav');
  var worksList  = document.getElementById('works-list');

  function onScroll() {
    var y  = window.pageYOffset;
    var dY = y - lastY;

    /* Badge spin */
    if (badgeWheel) {
      badgeDeg += dY * 0.13;
      badgeWheel.style.transform = 'rotate(' + badgeDeg + 'deg)';
    }

    /* Nav hide/show */
    if (dY > 6 && y > 100 && !navHidden) {
      if (nav) nav.classList.add('nav-hide');
      navHidden = true;
    } else if (dY < -4 && navHidden) {
      if (nav) nav.classList.remove('nav-hide');
      navHidden = false;
    }

    /* Works list skew */
    if (worksList && window.innerWidth >= 768) {
      skewVal = lerp(skewVal, clamp(dY * 0.05, -4, 4), 0.2);
      worksList.style.transform = 'skewY(' + skewVal + 'deg)';
      clearTimeout(skewTimer);
      skewTimer = setTimeout(function () {
        skewVal = 0;
        worksList.style.transform = '';
      }, 200);
    }

    lastY = y;
  }

  window.addEventListener('scroll', function () {
    requestAnimationFrame(onScroll);
  }, { passive: true });

  /* ════════════════════════════════════════
     9. HERO MOUSE PARALLAX
  ════════════════════════════════════════ */
  if (isMouse) {
    var heroTitle = document.querySelector('.hero-title');
    var heroEye   = document.querySelector('.hero-eyebrow');

    if (heroTitle) {
      var hx = 0, hy = 0;
      (function heroParallax() {
        var nx = mouseX / window.innerWidth  - 0.5;
        var ny = mouseY / window.innerHeight - 0.5;
        hx = lerp(hx, nx * 20, 0.055);
        hy = lerp(hy, ny * 11, 0.055);
        heroTitle.style.transform = 'translate(' + hx + 'px,' + hy + 'px)';
        if (heroEye) heroEye.style.transform = 'translate(' + (hx * 0.4) + 'px,' + (hy * 0.4) + 'px)';
        requestAnimationFrame(heroParallax);
      }());
    }
  }

  /* ════════════════════════════════════════
     10. FOOTER CTA REVEAL
  ════════════════════════════════════════ */
  var footCta = document.querySelector('.foot-cta');
  if (footCta) {
    var ctaIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        footCta.querySelectorAll('.js-line-mask').forEach(function (m, i) {
          setTimeout(function () { m.classList.add('is-visible'); }, i * 150);
        });
      });
    }, { threshold: 0.2 });
    ctaIO.observe(footCta);
  }

  /* ════════════════════════════════════════
     11. MARQUEE REVERSE ON HOVER
  ════════════════════════════════════════ */
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

  /* ════════════════════════════════════════
     12. LIVE NEPAL TIME
  ════════════════════════════════════════ */
  var timeEl = document.getElementById('time-display');
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

});
