document.addEventListener('DOMContentLoaded', () => {

  /* ─── SECURITY ─── */
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('keydown', e => {
    if (e.keyCode === 123 ||
        (e.ctrlKey && e.shiftKey && e.keyCode === 73) ||
        (e.ctrlKey && e.keyCode === 85) ||
        (e.ctrlKey && e.keyCode === 67)) {
      e.preventDefault();
    }
  });

  /* ═══════════════════════════════════════
     1. CHAR SPLITTING
  ═══════════════════════════════════════ */
  document.querySelectorAll('.split-chars').forEach(el => {
    const text = el.getAttribute('data-text') || el.textContent;
    el.innerHTML = text.split('').map((ch, i) =>
      `<span class="char" style="transition-delay:${(i * 0.045) + 1.0}s">${ch === ' ' ? '&nbsp;' : ch}</span>`
    ).join('');
  });

  /* ═══════════════════════════════════════
     2. PRELOADER
  ═══════════════════════════════════════ */
  let pct = 0;
  const numEl  = document.getElementById('pre-num');
  const fillEl = document.getElementById('pre-fill');

  const ticker = setInterval(() => {
    const jump = Math.floor(Math.random() * 18) + 4;
    pct = Math.min(100, pct + jump);
    if (numEl)  numEl.textContent = pct;
    if (fillEl) fillEl.style.width = pct + '%';

    if (pct >= 100) {
      clearInterval(ticker);
      setTimeout(() => {
        document.body.classList.add('loaded');
        document.body.classList.remove('loading');
      }, 180);
    }
  }, 20);

  /* ═══════════════════════════════════════
     3. CURSOR
  ═══════════════════════════════════════ */
  const isMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const cursor  = document.getElementById('cursor');

  if (isMouse && cursor) {
    let mx = window.innerWidth / 2,  my = window.innerHeight / 2;
    let cx = mx, cy = my;
    let raf;

    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

    const tick = () => {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursor.style.transform = `translate3d(${cx}px,${cy}px,0)`;
      raf = requestAnimationFrame(tick);
    };
    tick();

    // Link hover
    document.querySelectorAll('a, button, .magnetic, [data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-link'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-link'));
    });

    // Project hover → VIEW mode
    const imgReveal   = document.getElementById('img-reveal');
    const revealImg   = document.getElementById('reveal-img');
    let revX = mx, revY = my;

    const revTick = () => {
      revX += (mx - revX) * 0.09;
      revY += (my - revY) * 0.09;
      if (imgReveal) {
        imgReveal.style.left = revX + 'px';
        imgReveal.style.top  = revY + 'px';
      }
      requestAnimationFrame(revTick);
    };
    revTick();

    document.querySelectorAll('.project-item').forEach(el => {
      el.addEventListener('mouseenter', function () {
        cursor.classList.add('is-view');
        const src = this.getAttribute('data-image');
        if (src && revealImg) { revealImg.src = src; }
        if (imgReveal) imgReveal.classList.add('active');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('is-view');
        if (imgReveal) imgReveal.classList.remove('active');
      });
    });

  } else {
    if (cursor) cursor.style.display = 'none';
  }

  /* ═══════════════════════════════════════
     4. MAGNETIC ELEMENTS
  ═══════════════════════════════════════ */
  if (isMouse) {
    document.querySelectorAll('.magnetic').forEach(el => {
      const strength = parseFloat(el.getAttribute('data-strength') || '0.3');
      el.addEventListener('mousemove', e => {
        const r  = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width  / 2);
        const dy = e.clientY - (r.top  + r.height / 2);
        el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform 0.7s cubic-bezier(0.16,1,0.3,1)';
        el.style.transform  = 'translate(0, 0)';
        setTimeout(() => { el.style.transition = ''; }, 700);
      });
    });
  }

  /* ═══════════════════════════════════════
     5. INTERSECTION OBSERVER (scroll reveals)
  ═══════════════════════════════════════ */
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // word-mask children
        entry.target.querySelectorAll('.word-mask').forEach((wm, i) => {
          const span = wm.querySelector('span');
          if (span) {
            span.style.transitionDelay = (i * 0.07) + 's';
          }
          wm.classList.add('is-visible');
        });

        // self word-mask
        if (entry.target.classList.contains('word-mask')) {
          entry.target.classList.add('is-visible');
        }

        // reveal-up
        if (entry.target.classList.contains('reveal-up')) {
          entry.target.classList.add('is-visible');
        }

        // footer eyebrow
        if (entry.target.classList.contains('footer-eyebrow')) {
          entry.target.classList.add('is-visible');
        }

        obs.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });

  document.querySelectorAll('.word-mask, .reveal-up, .reveal-line, .footer-eyebrow, .about-headline').forEach(el => {
    io.observe(el);
  });

  /* ═══════════════════════════════════════
     6. SCROLL PHYSICS
  ═══════════════════════════════════════ */
  let lastY = window.pageYOffset;
  let badgeRot = 0;
  let scrollTimer;
  const badge = document.querySelector('.badge-wheel');
  const nav   = document.getElementById('nav');
  let navVisible = true;

  function onScroll() {
    const y     = window.pageYOffset;
    const delta = y - lastY;

    // Badge spin with scroll
    if (badge) {
      badgeRot += delta * 0.12;
      badge.style.transform = `rotate(${badgeRot}deg)`;
    }

    // Nav hide/show
    if (delta > 8 && y > 120 && navVisible) {
      nav && nav.classList.add('hide');
      navVisible = false;
    } else if (delta < -4 && !navVisible) {
      nav && nav.classList.remove('hide');
      navVisible = true;
    }

    // Reset skew
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {}, 100);

    lastY = y;
  }

  window.addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });

  /* ═══════════════════════════════════════
     7. LIVE TIME
  ═══════════════════════════════════════ */
  const timeEl = document.getElementById('time-display');
  if (timeEl) {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kathmandu',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    });
    const tick = () => { timeEl.textContent = fmt.format(new Date()) + ' NPT'; };
    tick();
    setInterval(tick, 1000);
  }

  /* ═══════════════════════════════════════
     8. WORKS LIST SKEW ON SCROLL (desktop)
  ═══════════════════════════════════════ */
  if (isMouse) {
    const worksList = document.getElementById('works-list');
    if (worksList) {
      let skew = 0;
      window.addEventListener('scroll', () => {
        const delta = window.pageYOffset - lastY;
        const target = Math.max(-4, Math.min(4, delta * 0.04));
        skew += (target - skew) * 0.1;
        worksList.style.transform = `skewY(${skew}deg)`;
      }, { passive: true });
    }
  }

  /* ═══════════════════════════════════════
     9. CTA massive — word mask trigger
  ═══════════════════════════════════════ */
  const ctaMasks = document.querySelectorAll('.cta-line .word-mask');
  const ctaIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        ctaMasks.forEach((m, i) => {
          setTimeout(() => m.classList.add('is-visible'), i * 120);
        });
      }
    });
  }, { threshold: 0.3 });
  if (ctaMasks.length) ctaIO.observe(ctaMasks[0].closest('.cta-massive') || ctaMasks[0]);

});
