document.addEventListener('DOMContentLoaded', () => {

  /* ─── SECURITY ─── */
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('keydown', e => {
    if (e.keyCode === 123 ||
       (e.ctrlKey && e.shiftKey && e.keyCode === 73) ||
       (e.ctrlKey && e.keyCode === 85) ||
       (e.ctrlKey && e.keyCode === 67)) e.preventDefault();
  });

  /* ─── HELPERS ─── */
  const lerp  = (a, b, t) => a + (b - a) * t;
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  const isMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ═══════════════════════════════════════════════
     1.  CHAR SPLITTING
  ═══════════════════════════════════════════════ */
  document.querySelectorAll('.split-chars').forEach(el => {
    const text = el.getAttribute('data-text') || el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.innerHTML = text.split('').map((ch, i) =>
      `<span class="char" aria-hidden="true" style="--i:${i}">${ch === ' ' ? '&nbsp;' : ch}</span>`
    ).join('');
  });

  /* ═══════════════════════════════════════════════
     2.  PRELOADER  – count up then wipe
  ═══════════════════════════════════════════════ */
  let pct   = 0;
  const numEl  = document.getElementById('pre-num');
  const fillEl = document.getElementById('pre-fill');
  const wipeEl = document.getElementById('pre-wipe');

  const loaderTick = setInterval(() => {
    pct = Math.min(100, pct + Math.floor(Math.random() * 17) + 4);
    if (numEl)  numEl.textContent = pct;
    if (fillEl) fillEl.style.width = pct + '%';

    if (pct >= 100) {
      clearInterval(loaderTick);
      setTimeout(() => {
        if (wipeEl) {
          wipeEl.style.transform = 'scaleY(1)';
          setTimeout(() => {
            document.body.classList.add('loaded');
            document.body.classList.remove('loading');
          }, 700);
        } else {
          document.body.classList.add('loaded');
          document.body.classList.remove('loading');
        }
      }, 200);
    }
  }, 22);

  /* ═══════════════════════════════════════════════
     3.  GLOBAL MOUSE POSITION
  ═══════════════════════════════════════════════ */
  let mouseX = window.innerWidth  / 2;
  let mouseY = window.innerHeight / 2;
  window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });

  /* ═══════════════════════════════════════════════
     4.  KINETIC CURSOR
  ═══════════════════════════════════════════════ */
  const cursor = document.getElementById('cursor');

  if (isMouse && cursor) {
    let cx = mouseX, cy = mouseY;
    (function cursorLoop() {
      cx = lerp(cx, mouseX, 0.16);
      cy = lerp(cy, mouseY, 0.16);
      cursor.style.transform = `translate3d(${cx}px,${cy}px,0)`;
      requestAnimationFrame(cursorLoop);
    })();

    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-link'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-link'));
    });
  } else {
    if (cursor) cursor.style.display = 'none';
  }

  /* ═══════════════════════════════════════════════
     5.  PROJECT IMAGE REVEAL
         – slow lerp keeps panel lagging behind cursor
         – CSS drives ALL entrance transitions (wipe + scale + opacity)
         – JS only: sets src, toggles .active, updates badge text
  ═══════════════════════════════════════════════ */
  const panel      = document.getElementById('img-reveal');
  const panelImg   = document.getElementById('reveal-img');
  const badgeTitle = document.querySelector('.reveal-badge-title');
  const badgeRole  = document.querySelector('.reveal-badge-role');
  const revInner   = panel ? panel.querySelector('.img-reveal-inner') : null;

  if (isMouse && panel && panelImg && revInner) {
    let rx = mouseX, ry = mouseY;
    let tilt = 0, prevMX = mouseX;
    let isActive = false;

    /* ── Silently preload all images ── */
    document.querySelectorAll('.project-item[data-image]').forEach(el => {
      const i = new Image(); i.src = el.getAttribute('data-image');
    });

    /* ── Physics loop: panel drifts slowly behind cursor ── */
    (function revealLoop() {
      rx   = lerp(rx, mouseX, 0.075);
      ry   = lerp(ry, mouseY, 0.075);
      tilt = lerp(tilt, clamp((mouseX - prevMX) * 0.45, -10, 10), 0.09);
      prevMX = mouseX;

      panel.style.left = rx + 'px';
      panel.style.top  = ry + 'px';

      /* Tilt via inline style while CSS handles scale/opacity */
      if (isActive) {
        revInner.style.transform = `translate(-50%,-50%) scale(1) rotate(${tilt * 0.4}deg)`;
      } else {
        revInner.style.transform = `translate(-50%,-50%) scale(0.88) rotate(${-4 + tilt * 0.1}deg)`;
      }

      requestAnimationFrame(revealLoop);
    })();

    /* ── Per-row events ── */
    document.querySelectorAll('.project-item').forEach(row => {

      row.addEventListener('mouseenter', function () {
        const src   = this.getAttribute('data-image') || '';
        const title = this.querySelector('.work-title')?.textContent.trim() || '';
        const role  = this.querySelector('.work-tag')?.textContent.trim()   || '';

        /* Always set src — browser cache makes this instant on repeat hovers */
        if (src) panelImg.src = src;

        /* Update info badge */
        if (badgeTitle) badgeTitle.textContent = title;
        if (badgeRole)  badgeRole.textContent  = role;

        isActive = true;
        panel.classList.add('active');
        if (cursor) cursor.classList.add('is-view');
      });

      row.addEventListener('mouseleave', () => {
        isActive = false;
        panel.classList.remove('active');
        if (cursor) cursor.classList.remove('is-view');
      });

      /* 3-D perspective tilt per row on mousemove */
      row.addEventListener('mousemove', function (e) {
        const r  = this.getBoundingClientRect();
        const ry = (e.clientX - r.left  - r.width  / 2) / r.width;
        const rx = (e.clientY - r.top   - r.height / 2) / r.height;
        this.style.transform =
          `perspective(1400px) rotateX(${-rx * 2.5}deg) rotateY(${ry * 2.5}deg)`;
      });
      row.addEventListener('mouseleave', function () {
        this.style.transform = '';
      });
    });
  }

  /* ═══════════════════════════════════════════════
     6.  MAGNETIC ELEMENTS
  ═══════════════════════════════════════════════ */
  if (isMouse) {
    document.querySelectorAll('.magnetic').forEach(el => {
      const str = parseFloat(el.getAttribute('data-strength') || '0.3');
      el.addEventListener('mousemove', e => {
        const r  = el.getBoundingClientRect();
        el.style.transform = `translate(
          ${(e.clientX - r.left - r.width  / 2) * str}px,
          ${(e.clientY - r.top  - r.height / 2) * str}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform 0.9s cubic-bezier(0.16,1,0.3,1)';
        el.style.transform  = '';
        setTimeout(() => el.style.transition = '', 900);
      });
    });
  }

  /* ═══════════════════════════════════════════════
     7.  SCROLL REVEAL  (single IntersectionObserver)
  ═══════════════════════════════════════════════ */
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;

      /* headline with per-line stagger */
      if (target.classList.contains('about-headline')) {
        target.querySelectorAll('.word-mask').forEach((wm, i) => {
          wm.style.transitionDelay = (i * 0.08) + 's';
          wm.classList.add('is-visible');
        });
      }

      if (target.classList.contains('word-mask'))      target.classList.add('is-visible');
      if (target.classList.contains('reveal-up'))      target.classList.add('is-visible');
      if (target.classList.contains('reveal-line'))    target.classList.add('is-visible');
      if (target.classList.contains('footer-eyebrow')) target.classList.add('is-visible');

      /* stagger children inside services / works-list */
      if (target.classList.contains('services') || target.classList.contains('works-list')) {
        target.querySelectorAll('.reveal-up').forEach((child, i) => {
          child.style.transitionDelay = (i * 0.1) + 's';
          child.classList.add('is-visible');
        });
      }

      obs.unobserve(target);
    });
  }, { rootMargin: '0px 0px -5% 0px', threshold: 0 });

  document.querySelectorAll(
    '.word-mask, .reveal-up, .reveal-line, .footer-eyebrow, .about-headline, .services, .works-list'
  ).forEach(el => io.observe(el));

  /* ═══════════════════════════════════════════════
     8.  SCROLL PHYSICS
  ═══════════════════════════════════════════════ */
  let lastY      = window.pageYOffset;
  let skew       = 0;
  let badgeDeg   = 0;
  let navHidden  = false;
  let skewTimer;

  const badge = document.querySelector('.badge-wheel');
  const nav   = document.getElementById('nav');
  const wList = document.getElementById('works-list');

  const onScroll = () => {
    const y  = window.pageYOffset;
    const dY = y - lastY;

    /* badge rotation */
    if (badge) {
      badgeDeg += dY * 0.14;
      badge.style.transform = `rotate(${badgeDeg}deg)`;
    }

    /* nav hide/reveal */
    if (dY > 6 && y > 100 && !navHidden) { nav?.classList.add('hide'); navHidden = true; }
    if (dY < -4 && navHidden)            { nav?.classList.remove('hide'); navHidden = false; }

    /* works-list skew */
    if (wList && window.innerWidth >= 768) {
      skew = lerp(skew, clamp(dY * 0.05, -4, 4), 0.2);
      wList.style.transform = `skewY(${skew}deg)`;
      clearTimeout(skewTimer);
      skewTimer = setTimeout(() => { skew = 0; wList.style.transform = ''; }, 200);
    }

    lastY = y;
  };
  window.addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });

  /* ═══════════════════════════════════════════════
     9.  HERO PARALLAX  (mouse-driven)
  ═══════════════════════════════════════════════ */
  if (isMouse) {
    const heroTitle = document.querySelector('.hero-title');
    const heroEye   = document.querySelector('.hero-eyebrow');
    if (heroTitle) {
      let hx = 0, hy = 0;
      (function heroParallax() {
        const nx = (mouseX / window.innerWidth  - 0.5);
        const ny = (mouseY / window.innerHeight - 0.5);
        hx = lerp(hx, nx * 22, 0.055);
        hy = lerp(hy, ny * 12, 0.055);
        heroTitle.style.transform = `translate(${hx}px,${hy}px)`;
        if (heroEye) heroEye.style.transform = `translate(${hx * 0.4}px,${hy * 0.4}px)`;
        requestAnimationFrame(heroParallax);
      })();
    }
  }

  /* ═══════════════════════════════════════════════
     10. LIVE TIME  (Nepal Standard Time)
  ═══════════════════════════════════════════════ */
  const timeEl = document.getElementById('time-display');
  if (timeEl) {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kathmandu', hour: '2-digit',
      minute: '2-digit', second: '2-digit', hour12: false
    });
    const tick = () => { timeEl.textContent = fmt.format(new Date()) + ' NPT'; };
    tick(); setInterval(tick, 1000);
  }

  /* ═══════════════════════════════════════════════
     11. CTA FOOTER REVEAL
  ═══════════════════════════════════════════════ */
  const ctaMasks = document.querySelectorAll('.cta-line .word-mask');
  if (ctaMasks.length) {
    const anchor = ctaMasks[0].closest('.cta-massive');
    if (anchor) {
      new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting)
            ctaMasks.forEach((m, i) => setTimeout(() => m.classList.add('is-visible'), i * 140));
        });
      }, { threshold: 0.2 }).observe(anchor);
    }
  }

  /* ═══════════════════════════════════════════════
     12. MARQUEE REVERSE ON HOVER
  ═══════════════════════════════════════════════ */
  const strip = document.querySelector('.marquee-strip');
  if (strip) {
    strip.addEventListener('mouseenter', () =>
      strip.querySelectorAll('.marquee-inner').forEach(m => {
        m.style.animationDirection = 'reverse'; m.style.animationDuration = '14s';
      }));
    strip.addEventListener('mouseleave', () =>
      strip.querySelectorAll('.marquee-inner').forEach(m => {
        m.style.animationDirection = 'normal'; m.style.animationDuration = '28s';
      }));
  }

  /* ═══════════════════════════════════════════════
     13. WORK ROW HOVER  — ghost stroke on title
  ═══════════════════════════════════════════════ */
  document.querySelectorAll('.work-row').forEach(row => {
    const title = row.querySelector('.work-title');
    if (!title) return;
    row.addEventListener('mouseenter', () => title.classList.add('stroke'));
    row.addEventListener('mouseleave', () => title.classList.remove('stroke'));
  });

});
