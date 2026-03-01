document.addEventListener("DOMContentLoaded", () => {
  
  // 1. Initialize Lenis Smooth Scrolling
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // 2. Register GSAP ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0, 0);

  // 3. Hero Text Reveal
  const heroLines = document.querySelectorAll(".hero-title span");
  gsap.fromTo(heroLines, 
    { y: "100%", opacity: 0 }, 
    { y: "0%", opacity: 1, duration: 1.2, stagger: 0.1, ease: "power4.out", delay: 0.2 }
  );

  // Cinematic Hero Image Parallax
  const heroImg = document.querySelector(".hero-img-parallax");
  if (heroImg) {
    gsap.to(heroImg, {
      yPercent: -20, ease: "none",
      scrollTrigger: { trigger: ".hero-media", start: "top bottom", end: "bottom top", scrub: true }
    });
  }

  // 4. Project Image Parallax
  const projects = document.querySelectorAll(".project-row");
  projects.forEach((proj) => {
    const img = proj.querySelector("img");
    gsap.fromTo(img, 
      { yPercent: -10, scale: 1.1 }, 
      {
        yPercent: 10, ease: "none",
        scrollTrigger: { trigger: proj, start: "top bottom", end: "bottom top", scrub: true }
      }
    );
  });

  // 5. Fade Up Sections
  const fadeElements = document.querySelectorAll(".srv-item, .h-col, .contact-info");
  fadeElements.forEach((el) => {
    gsap.fromTo(el,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" } }
    );
  });

  // 6. Custom Smooth Cursor (LERP)
  const cursor = document.querySelector('.custom-cursor');
  if (cursor && window.matchMedia("(hover: hover)").matches) {
    let mouseX = window.innerWidth / 2; let mouseY = window.innerHeight / 2;
    let cursorX = mouseX; let cursorY = mouseY;
    
    window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });

    function renderCursor() {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Cursor Hover States
    document.querySelectorAll('.nav a').forEach(link => {
      link.addEventListener('mouseenter', () => cursor.classList.add('is-nav'));
      link.addEventListener('mouseleave', () => cursor.classList.remove('is-nav'));
    });

    document.querySelectorAll('a:not(.nav a):not(.proj-link), button').forEach(link => {
      link.addEventListener('mouseenter', () => cursor.classList.add('is-link'));
      link.addEventListener('mouseleave', () => cursor.classList.remove('is-link'));
    });

    document.querySelectorAll('.project-row').forEach(row => {
      row.addEventListener('mouseenter', () => cursor.classList.add('is-view'));
      row.addEventListener('mouseleave', () => cursor.classList.remove('is-view'));
    });

    // Hide Custom Cursor over Form Inputs
    document.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('mouseenter', () => cursor.style.display = 'none');
      input.addEventListener('mouseleave', () => cursor.style.display = 'flex');
    });
  }

  // 7. Contact Form Logic
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  const formSubmitBtn = document.querySelector('.submit-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault(); 
      const originalText = formSubmitBtn.innerHTML;
      formSubmitBtn.innerHTML = '<span>SENDING...</span>';
      
      setTimeout(() => {
        formSuccess.classList.remove('is-hidden');
        contactForm.reset();
        formSubmitBtn.innerHTML = originalText;
        setTimeout(() => { formSuccess.classList.add('is-hidden'); }, 5000);
      }, 1500);
    });
  }

  // 8. Project Data & Modal Logic
  const PROJECTS = {
    euphoria: {
      title: 'EUPHORIA', client: 'Confidential', role: 'Lead Engineer', duration: '4 Months',
      tags: ['Platform Architecture', 'WebGL', 'React', 'GSAP'],
      img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
      overview: 'Euphoria is an immersive digital platform redefining how audiences discover and experience contemporary music. The brief demanded a site that felt less like a product and more like an environment.',
      challenge: 'The core tension was performance versus expressivity. WebGL shaders and real-time audio visualisations needed to coexist with a sub-100ms LCP.',
      execution: 'We built a bespoke rendering pipeline prioritising perceptual performance. Architecture separates presentation from data using a headless CMS feeding typed Next.js App Router routes. WebGL is isolated in a Web Worker.'
    },
    cherished: {
      title: 'CHERISHED', client: 'Cherished Memories Ltd.', role: 'Full-Stack Engineer', duration: '3 Months',
      tags: ['UI/UX Design', 'Next.js', 'PostgreSQL'],
      img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop',
      overview: 'A platform for preserving family histories through interactive timelines, media galleries, and AI-assisted narrative generation.',
      challenge: 'Balancing feature density with emotional clarity. Every interaction had to be intuitive and warm — even for users unfamiliar with digital archives.',
      execution: 'Next.js App Router with React Server Components for sub-second first paints. Custom gesture library for timeline scrubbing at 60fps. Image processing on-edge via Cloudflare Workers.'
    }
  };

  const modal = document.getElementById('project-modal');
  const modalLoader = document.getElementById('modal-loader');
  const modalBody = document.getElementById('modal-body');
  const modalClose = document.getElementById('modal-close');
  let lastFocusedElement = null;

  function openModal(projectId) {
    const data = PROJECTS[projectId];
    if (!data) return;

    lastFocusedElement = document.activeElement;
    modalLoader.classList.remove('is-hidden');
    modalBody.classList.remove('is-loaded');

    modalBody.innerHTML = `
      <aside class="m-sidebar">
        <h2 class="m-title">${data.title}</h2>
        <span class="m-label">Client</span><p class="m-val">${data.client}</p>
        <span class="m-label">Role</span><p class="m-val">${data.role}</p>
        <span class="m-label">Duration</span><p class="m-val">${data.duration}</p>
        <span class="m-label">Tech Stack</span>
        <div class="m-tags">${data.tags.map(tag => `<span>${tag}</span>`).join('')}</div>
      </aside>
      <main class="m-main">
        <div class="m-hero-img"><img id="modal-image" src="${data.img}" alt="${data.title}"></div>
        <h3 class="m-section-title">OVERVIEW</h3><p class="m-text">${data.overview}</p>
        <h3 class="m-section-title">THE CHALLENGE</h3><p class="m-text">${data.challenge}</p>
        <h3 class="m-section-title">EXECUTION</h3><p class="m-text">${data.execution}</p>
      </main>
    `;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    lenis.stop();
    document.body.style.overflow = 'hidden'; 
    modal.focus();

    const modalImage = document.getElementById('modal-image');
    const handleImageLoad = () => {
      setTimeout(() => {
        modalLoader.classList.add('is-hidden');
        modalBody.classList.add('is-loaded');
      }, 300); 
    };

    if (modalImage.complete) { handleImageLoad(); } 
    else { modalImage.addEventListener('load', handleImageLoad); modalImage.addEventListener('error', handleImageLoad); }
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    if (lastFocusedElement) lastFocusedElement.focus();
    
    // Delay scroll restoration to match CSS transition
    setTimeout(() => {
      lenis.start();
      document.body.style.overflow = '';
    }, 600);
  }

  document.querySelectorAll('.project-row').forEach(row => {
    row.addEventListener('click', () => openModal(row.dataset.project));
    row.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(row.dataset.project); } });
  });

  modalClose.addEventListener('click', closeModal);
  document.querySelector('.modal-overlay').addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });
});
