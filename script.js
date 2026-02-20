document.addEventListener("DOMContentLoaded", () => {
    
    // SECURITY: Code Protection Layer
    document.addEventListener('contextmenu', event => event.preventDefault());
    document.addEventListener('keydown', (e) => {
        if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && e.keyCode == 73) || (e.ctrlKey && e.keyCode == 85) || (e.ctrlKey && e.keyCode == 67)) {
            e.preventDefault();
        }
    });

    // 1. PERFORMANCE PRELOADER (LCP Optimized)
    let percent = 0;
    const loaderPercent = document.getElementById("loader-percent");
    
    const loaderInterval = setInterval(() => {
        percent += Math.floor(Math.random() * 20) + 5;
        if (percent > 100) percent = 100;
        if (loaderPercent) loaderPercent.textContent = percent + '%';
        
        if (percent === 100) {
            clearInterval(loaderInterval);
            setTimeout(() => {
                document.body.classList.add("loaded");
                document.body.classList.remove("loading");
            }, 150); 
        }
    }, 15);

    // 2. KINETIC CURSOR & IMAGE REVEAL (Hardware Accelerated)
    const cursorTracker = document.getElementById('cursor-tracker');
    const globalReveal = document.getElementById('image-tracker');
    const globalRevealImg = document.getElementById('global-reveal-img');
    const hoverLinks = document.querySelectorAll('.link-hover');
    const projects = document.querySelectorAll('.project-item');

    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        
        let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
        let dotX = mouseX, dotY = mouseY;
        let revX = mouseX, revY = mouseY;
        let lastMouseX = mouseX;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function renderPhysics() {
            dotX += (mouseX - dotX) * 0.25;
            dotY += (mouseY - dotY) * 0.25;
            
            if (cursorTracker) {
                cursorTracker.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
            }

            revX += (mouseX - revX) * 0.1;
            revY += (mouseY - revY) * 0.1;
            
            const velocityX = mouseX - lastMouseX;
            const tilt = Math.max(-15, Math.min(15, velocityX * 0.2)); 
            lastMouseX = mouseX;

            if (globalReveal) {
                const isActive = globalReveal.classList.contains('active');
                globalReveal.style.transform = `translate(-50%, -50%) scale(${isActive ? 1 : 0.8}) rotate(${tilt}deg)`;
                globalReveal.style.left = `${revX}px`; 
                globalReveal.style.top = `${revY}px`;
            }

            requestAnimationFrame(renderPhysics);
        }
        renderPhysics();

        hoverLinks.forEach(el => {
            el.addEventListener('mouseenter', () => { if (cursorTracker) cursorTracker.classList.add('hovered'); });
            el.addEventListener('mouseleave', () => { if (cursorTracker) cursorTracker.classList.remove('hovered'); });
        });

        projects.forEach(project => {
            project.addEventListener('mouseenter', function() {
                if (cursorTracker) cursorTracker.classList.add('view-mode');
                
                const imgSrc = this.getAttribute('data-image');
                if (imgSrc && globalRevealImg) {
                    globalRevealImg.src = imgSrc;
                    if (globalReveal) globalReveal.classList.add('active');
                }
            });
            project.addEventListener('mouseleave', () => {
                if (cursorTracker) cursorTracker.classList.remove('view-mode');
                if (globalReveal) globalReveal.classList.remove('active');
            });
        });

    } else {
        if (cursorTracker) cursorTracker.style.display = 'none';
        if (globalReveal) globalReveal.style.display = 'none';
    }

    // 3. BULLETPROOF SCROLL REVEALS
    const observerOptions = { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0 };
    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    document.querySelectorAll('.trigger').forEach(el => {
        scrollObserver.observe(el);
    });

    // 4. SCROLL PHYSICS
    const spinningBadge = document.querySelector('.badge-inner');
    const velocityContainer = document.getElementById('velocity-container');
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    let lastScrollY = window.pageYOffset;
    let currentRotation = 0;
    let scrollTimeout;

    function handleScrollAnimations() {
        const currentScrollY = window.pageYOffset;
        const scrollSpeed = currentScrollY - lastScrollY;

        if (spinningBadge) {
            currentRotation += scrollSpeed * 0.15; 
            spinningBadge.style.transform = `rotate(${currentRotation}deg)`;
        }

        if (window.innerWidth >= 768) {
            if (velocityContainer) {
                const skewAmount = Math.max(-5, Math.min(5, scrollSpeed * 0.05));
                velocityContainer.style.transform = `skewY(${skewAmount}deg)`;
            }

            parallaxElements.forEach(el => {
                const speedMultiplier = parseFloat(el.getAttribute('data-parallax'));
                const yPos = currentScrollY * speedMultiplier;
                el.style.transform = `translateY(${yPos}px)`;
            });
        }
        
        lastScrollY = currentScrollY;

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (velocityContainer && window.innerWidth >= 768) {
                velocityContainer.style.transform = `skewY(0deg)`;
            }
        }, 100);
    }

    window.addEventListener('scroll', () => {
        window.requestAnimationFrame(handleScrollAnimations);
    }, { passive: true });

    // 5. LIVE LOCAL TIME
    function updateTime() {
        const timeEl = document.getElementById('time-display');
        if (!timeEl) return;
        const now = new Date();
        const options = { timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        timeEl.textContent = `${new Intl.DateTimeFormat('en-US', options).format(now)} NPT`;
    }
    setInterval(updateTime, 1000);
    updateTime();
});
