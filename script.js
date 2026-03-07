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
    document.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('mouseenter', () => cursor.style.display = 'none');
      input.addEventListener('mouseleave', () => cursor.style.display = 'flex');
    });
  }

  // =====================================================
  // 7. EMAILJS CONTACT FORM LOGIC
  // =====================================================
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  const formSubmitBtn = document.getElementById('submit-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
      event.preventDefault(); 

      const originalText = formSubmitBtn.innerHTML;
      formSubmitBtn.innerHTML = '<span>SENDING...</span>';
      formSubmitBtn.style.pointerEvents = 'none'; 

      // ⚠️ IMPORTANT: REPLACE THESE WITH YOUR ACTUAL IDS FROM EMAILJS ⚠️
      const serviceID = 'YOUR_SERVICE_ID_HERE'; 
      const templateID = 'YOUR_TEMPLATE_ID_HERE'; 

      emailjs.sendForm(serviceID, templateID, this)
        .then(() => {
          formSuccess.classList.remove('is-hidden');
          formSuccess.innerHTML = "<h3>MESSAGE RECEIVED.</h3><p>I will be in touch shortly.</p>";
          contactForm.reset();
          formSubmitBtn.innerHTML = originalText;
          formSubmitBtn.style.pointerEvents = 'auto';
          
          setTimeout(() => { formSuccess.classList.add('is-hidden'); }, 5000);
        }, (error) => {
          console.log('FAILED...', error);
          formSuccess.classList.remove('is-hidden');
          formSuccess.innerHTML = "<h3 style='color:red;'>TRANSMISSION FAILED.</h3><p>Please email me directly at sefingwachha@gmail.com</p>";
          formSubmitBtn.innerHTML = originalText;
          formSubmitBtn.style.pointerEvents = 'auto';
          
          setTimeout(() => { formSuccess.classList.add('is-hidden'); }, 5000);
        });
    });
  }

  // 8. Project Data & Modal Logic
  const PROJECTS = {
    'jyotisha-saas': {
      title: 'Export Service Hub', 
      client: 'Internal SaaS', 
      role: 'Full-Stack Architect', 
      duration: 'Ongoing',
      tags: ['Next.js', 'PostgreSQL', 'Prisma', 'Node.js'],
      img: 'site.webp', 
      overview: 'Architected and deployed a highly scalable Software-as-a-Service (SaaS) platform. The system handles complex business logic including tiered subscription models and secure payment gateway integrations.',
      challenge: 'The primary constraint was ensuring absolute data integrity across complex relational databases while maintaining a sub-100ms Largest Contentful Paint (LCP) for the end user.',
      execution: 'Engineered a high-performance full-stack infrastructure utilizing Next.js, Node.js, and a PostgreSQL database mapped via Prisma ORM. Automated dynamic PDF report generation and containerized deployment with Docker.'
    },
    'temporal-archive': {
      title: 'TEMPORAL ARCHIVE', 
      client: 'Personal Brand', 
      role: 'Creative Developer', 
      duration: '8 Weeks',
      tags: ['WebGL', 'GSAP', 'Core Web Vitals', 'UI/UX'],
      img: 'herobanner.webp', 
      overview: 'An Awwwards-caliber personal developer portfolio focused on bridging the gap between editorial UI/UX design and ruthless technical performance.',
      challenge: 'Balancing heavy, hardware-accelerated WebGL animations and cinematic scroll interactions with the strict Core Web Vitals optimization required for a perfect 100/100 Lighthouse score.',
      execution: 'Implemented advanced frontend engineering techniques including custom shaders and GSAP ScrollTrigger, all sitting on top of a highly optimized, semantic HTML5 structure with comprehensive JSON-LD SEO schema.'
    },
    'enterprise-java': {
      title: 'DATA ANALYSIS & OOP', 
      client: 'Academic Data Project', 
      role: 'Data Analyst & Backend Dev', 
      duration: '12 Weeks',
      tags: ['Machine Learning', 'Java OOP', 'Regression Analysis'],
      img: 'mainframe.webp', 
      overview: 'Conducted advanced data science analysis to generate highly detailed Regression and Classification Analysis Reports for complex AI/ML datasets.',
      challenge: 'Extracting actionable insights from raw datasets while simultaneously engineering a secure, scalable software architecture that adheres to strict academic evaluation standards.',
      execution: 'Leveraged deep expertise in machine learning analysis while engineering robust software architectures using strict Java Object-Oriented Programming (OOP) principles, including advanced polymorphism and secure database interactions.'
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
        <div class="m-hero-img">
          <img id="modal-image" src="${data.img}" alt="${data.title} - Web Development Case Study" width="1200" height="800" loading="lazy">
        </div>
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
    else { 
      modalImage.addEventListener('load', handleImageLoad); 
      modalImage.addEventListener('error', handleImageLoad); 
    }
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    if (lastFocusedElement) lastFocusedElement.focus();
    
    setTimeout(() => {
      lenis.start();
      document.body.style.overflow = '';
    }, 600);
  }

  document.querySelectorAll('.project-row').forEach(row => {
    row.addEventListener('click', () => openModal(row.dataset.project));
    row.addEventListener('keydown', (e) => { 
      if (e.key === 'Enter' || e.key === ' ') { 
        e.preventDefault(); 
        openModal(row.dataset.project); 
      } 
    });
  });

  modalClose.addEventListener('click', closeModal);
  document.querySelector('.modal-overlay').addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => { 
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); 
  });

  // =====================================================
  // 9. GITHUB CONTRIBUTION GRAPH INITIATOR
  // =====================================================
  if (document.querySelector('.calendar')) {
    GitHubCalendar(".calendar", "Sefingwachha", {
      responsive: true,
      tooltips: true,
      global_stats: false 
    }).then(() => {
      gsap.fromTo('.calendar', 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );
    });
  }

});
