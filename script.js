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

  // Sync GSAP with Lenis
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0, 0);

  // 3. Hero Text Reveal Animation
  const heroLines = document.querySelectorAll(".hero-title span");
  gsap.fromTo(heroLines, 
    { y: "100%", opacity: 0 }, 
    { 
      y: "0%", 
      opacity: 1, 
      duration: 1.2, 
      stagger: 0.1, 
      ease: "power4.out",
      delay: 0.2
    }
  );

  // 4. Project Image Parallax/Reveal
  const projects = document.querySelectorAll(".project-row");
  projects.forEach((proj) => {
    const img = proj.querySelector("img");
    
    // Slight parallax on scroll
    gsap.fromTo(img, 
      { yPercent: -10, scale: 1.1 }, 
      {
        yPercent: 10,
        ease: "none",
        scrollTrigger: {
          trigger: proj,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      }
    );
  });

  // 5. Fade Up Sections
  const fadeElements = document.querySelectorAll(".srv-item, .stat");
  fadeElements.forEach((el) => {
    gsap.fromTo(el,
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 1, ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
        }
      }
    );
  });

  // 6. Custom Smooth Cursor (LERP)
  const cursor = document.querySelector('.custom-cursor');
  
  // Only run if the cursor element exists (desktop)
  if (cursor && window.matchMedia("(hover: hover)").matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    
    // Update mouse coordinates
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Animation Loop for Smooth Follow (LERP)
    function renderCursor() {
      // 0.15 is the easing factor. Lower = slower trailing, Higher = faster snapping
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Add Hover States
    
    // State 1: Navigation Links (Exclusive Hollow Ring)
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
      link.addEventListener('mouseenter', () => cursor.classList.add('is-nav'));
      link.addEventListener('mouseleave', () => cursor.classList.remove('is-nav'));
    });

    // State 2: Standard Links and Buttons (Exclude nav links and projects)
    const regularLinks = document.querySelectorAll('a:not(.nav a):not(.proj-link), button');
    regularLinks.forEach(link => {
      link.addEventListener('mouseenter', () => cursor.classList.add('is-link'));
      link.addEventListener('mouseleave', () => cursor.classList.remove('is-link'));
    });

    // State 3: Project Rows (Trigger the giant "VIEW" cursor)
    const projectRows = document.querySelectorAll('.project-row');
    projectRows.forEach(row => {
      row.addEventListener('mouseenter', () => {
        cursor.classList.add('is-view');
      });
      row.addEventListener('mouseleave', () => {
        cursor.classList.remove('is-view');
      });
    });
  }
});
