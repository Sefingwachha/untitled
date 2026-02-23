(function () {
  "use strict";

  // 1. SECURITY
  document.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  document.addEventListener("keydown", function (e) {
    if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && e.keyCode === 73) || (e.ctrlKey && e.shiftKey && e.keyCode === 74) || (e.ctrlKey && e.keyCode === 85)) {
      e.preventDefault();
    }
  });

  // 2. CONSOLE SIGNATURE
  console.log("%c// TRANSMISSION INTERCEPTED: sefin.com.np", "color:#e8e4de; font-family:monospace; font-size:14px; padding:4px 0;");
  console.log("%c// ARCHIVE AUTHOR: Sefin Gwachha — Creative Developer\\n// ENGINEERED WITH: WebGL · Three.js r128 · Vanilla JS", "color:#666; font-family:monospace; font-size:11px;");

  function el(id) { return document.getElementById(id); }

  // 3. PRELOADER
  var pct = 0;
  var pnum = el('pnum');
  var pfill = el('pfill');
  var pwipe = el('pwipe');

  function finishLoader() {
    if (pwipe) pwipe.style.transform = 'scaleY(1)';
    setTimeout(function () {
      document.body.classList.remove("loading");
      document.body.classList.add('loaded'); // Fixed classname here
    }, pwipe ? 700 : 50);
  }

  var loaderInterval = setInterval(function () {
    pct = Math.min(100, pct + Math.floor(Math.random() * 16) + 5);
    if (pnum) pnum.textContent = pct;
    if (pfill) pfill.style.width = pct + '%';
    if (pct >= 100) {
      clearInterval(loaderInterval);
      setTimeout(finishLoader, 120);
    }
  }, 22);

  // 4. THREE.JS — TEMPORAL PRISM
  function initPrism() {
    var canvas = el("prism-canvas");
    if (!canvas || typeof THREE === "undefined") return;

    var vW = window.innerWidth;
    var vH = window.innerHeight;
    var isMobile = vW < 768;
    var DPR = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: !isMobile, powerPreference: "high-performance" });
    renderer.setPixelRatio(DPR);
    renderer.setSize(vW, vH);
    renderer.setClearColor(0x000000, 0);
    renderer.outputEncoding = THREE.sRGBEncoding;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, vW / vH, 0.1, 200);
    camera.position.set(0, 0, 9);

    scene.add(new THREE.AmbientLight(0xffffff, 0.25));
    var dirLight1 = new THREE.DirectionalLight(0xfaf6f0, 2.0); dirLight1.position.set(4, 6, 5); scene.add(dirLight1);
    var dirLight2 = new THREE.DirectionalLight(0xc8c8c8, 0.7); dirLight2.position.set(-5, -2, 2); scene.add(dirLight2);

    var cubeRT = new THREE.WebGLCubeRenderTarget(128, { format: THREE.RGBAFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
    var cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRT);
    scene.add(cubeCamera);

    var prismGeo = new THREE.OctahedronGeometry(2.0, 0);
    var prismMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.0, roughness: 0.0, transmission: 0.92, thickness: 2.5, ior: 1.5, envMap: cubeRT.texture, envMapIntensity: 2.2, transparent: true, side: THREE.FrontSide });
    var prism = new THREE.Mesh(prismGeo, prismMat);
    scene.add(prism);

    var wireGeo = new THREE.WireframeGeometry(prismGeo);
    var wireMat = new THREE.LineBasicMaterial({ color: 0xe8e4de, opacity: 0.07, transparent: true });
    prism.add(new THREE.LineSegments(wireGeo, wireMat));

    var ptCount = isMobile ? 350 : 850;
    var pPos = new Float32Array(ptCount * 3), pAlpha = new Float32Array(ptCount);
    for (var i = 0; i < ptCount; i++) {
      var i3 = i * 3;
      pPos[i3] = (Math.random() - 0.5) * 26; pPos[i3 + 1] = (Math.random() - 0.5) * 16; pPos[i3 + 2] = (Math.random() - 0.5) * 12 - 4;
      pAlpha[i] = Math.random();
    }
    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute("alpha", new THREE.BufferAttribute(pAlpha, 1));
    var pMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uTime: { value: 0.0 } }, vertexShader: "attribute float alpha; varying float vAlpha; uniform float uTime; void main() { vAlpha = alpha; vec3 p = position; p.y += sin(uTime * 0.4 + position.x * 0.55) * 0.15; vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_PointSize = clamp(1.2 * (7.0 / -mv.z), 0.5, 3.0); gl_Position = projectionMatrix * mv; }", fragmentShader: "varying float vAlpha; void main() { vec2 uv = gl_PointCoord - 0.5; if (length(uv) > 0.5) discard; gl_FragColor = vec4(0.91, 0.89, 0.87, (1.0 - length(uv) * 2.0) * vAlpha * 0.4); }" });
    var particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    var mTargetX = 0, mTargetY = 0, mCurrX = 0, mCurrY = 0;
    window.addEventListener("mousemove", function (e) { mTargetX = (e.clientX / window.innerWidth - 0.5) * 1.8; mTargetY = -(e.clientY / window.innerHeight - 0.5) * 1.0; });

    window.addEventListener("resize", function () { vW = window.innerWidth; vH = window.innerHeight; camera.aspect = vW / vH; camera.updateProjectionMatrix(); renderer.setSize(vW, vH); });

    var clock = 0;
    function animate() {
      requestAnimationFrame(animate);
      clock += 0.003;
      mCurrX += (mTargetX - mCurrX) * 0.028; mCurrY += (mTargetY - mCurrY) * 0.028;
      prism.rotation.y = clock * 0.18 + mCurrX * 0.45; prism.rotation.x = Math.sin(clock * 0.42) * 0.12 + mCurrY * 0.28; prism.rotation.z = Math.cos(clock * 0.26) * 0.055;
      particles.rotation.y = clock * 0.035; pMat.uniforms.uTime.value = clock;
      prism.visible = false; cubeCamera.update(renderer, scene); prism.visible = true;
      renderer.render(scene, camera);
    }
    animate();
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", initPrism); } else { initPrism(); }

  // 5. MOUSE, CURSOR & IMAGE REVEAL
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }
  var isMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches && window.innerWidth >= 768;

  // Split characters for Hero Title
  document.querySelectorAll('.big-word').forEach(function (el) {
    var w = el.getAttribute('data-word') || el.textContent.trim();
    el.setAttribute('aria-label', w);
    el.innerHTML = w.split('').map(function (c, i) { return '<span class="ch" style="--ci:' + i + '">' + (c === ' ' ? '&nbsp;' : c) + '</span>'; }).join('');
  });

  var mx = window.innerWidth / 2, my = window.innerHeight / 2;
  window.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });

  var cur = el('cursor');
  var rev = el('reveal'), rinn = el('rev-inner'), rimg = el('rimg'), rname = el('rname'), rrole = el('rrole');

  if (isMouse) {
    var cx = mx, cy = my, rx = mx, ry = my, tilt = 0, pmx = mx, isOn = false;

    (function loop() {
      cx = lerp(cx, mx, 0.15); cy = lerp(cy, my, 0.15);
      if (cur) cur.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';

      if (rev && rinn) {
        rx = lerp(rx, mx, 0.075); ry = lerp(ry, my, 0.075);
        tilt = lerp(tilt, clamp((mx - pmx) * 0.45, -10, 10), 0.09); pmx = mx;
        rev.style.left = rx + 'px'; rev.style.top = ry + 'px';
        rinn.style.transform = isOn ? 'translate(-50%,-50%) scale(1) rotate(' + (tilt * 0.35) + 'deg)' : 'translate(-50%,-50%) scale(0.85) rotate(' + (-5 + tilt * 0.1) + 'deg)';
      }
      requestAnimationFrame(loop);
    }());

    document.querySelectorAll('a, button').forEach(function (el) {
      el.addEventListener('mouseenter', function () { if(cur) cur.classList.add('lnk'); });
      el.addEventListener('mouseleave', function () { if(cur) cur.classList.remove('lnk'); });
    });

    document.querySelectorAll('.proj').forEach(function (row) {
      row.addEventListener('mouseenter', function () {
        var src = this.getAttribute('data-image');
        if (src && rimg) rimg.src = src;
        if (rname) rname.textContent = (this.querySelector('.wnm') || {}).textContent || '';
        if (rrole) rrole.textContent = (this.querySelector('.wrl') || {}).textContent || '';
        isOn = true; if(rev) rev.classList.add('on');
        if(cur) cur.classList.add('viw');
      });
      row.addEventListener('mouseleave', function () {
        isOn = false; if(rev) rev.classList.remove('on');
        if(cur) cur.classList.remove('viw');
      });
      // 3D Tilt on Row Hover
      row.addEventListener('mousemove', function (e) {
        var r = this.getBoundingClientRect();
        this.style.transform = 'perspective(1400px) rotateX(' + (-(e.clientY - r.top - r.height / 2) / r.height * 2.5) + 'deg) rotateY(' + ((e.clientX - r.left - r.width / 2) / r.width * 2.5) + 'deg)';
      });
      row.addEventListener('mouseleave', function () { this.style.transform = ''; });
    });

    // Magnetic buttons
    document.querySelectorAll('[data-mag]').forEach(function (el) {
      var s = parseFloat(el.getAttribute('data-mag') || '0.3');
      el.addEventListener('mousemove', function (e) {
        var r = this.getBoundingClientRect();
        this.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * s) + 'px,' + ((e.clientY - r.top - r.height / 2) * s) + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        this.style.transition = 'transform .85s cubic-bezier(.16,1,.3,1)';
        this.style.transform = '';
        setTimeout(() => { this.style.transition = ''; }, 850);
      });
    });

    // Hero Parallax text
    var ht = document.querySelector('.htitle'), he = document.querySelector('.hero-eye');
    var hx = 0, hy = 0;
    (function hp() {
      hx = lerp(hx, (mx / window.innerWidth - 0.5) * 20, 0.055);
      hy = lerp(hy, (my / window.innerHeight - 0.5) * 11, 0.055);
      if (ht) ht.style.transform = 'translate(' + hx + 'px,' + hy + 'px)';
      if (he) he.style.transform = 'translate(' + (hx * 0.4) + 'px,' + (hy * 0.4) + 'px)';
      requestAnimationFrame(hp);
    })();
  }

  // 6. SCROLL REVEALS
  var io = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      if (el.classList.contains('ahead')) {
        el.querySelectorAll('.lm').forEach(function (lm, i) { lm.style.transitionDelay = (i * 0.085) + 's'; lm.classList.add('vis'); });
      }
      if (el.classList.contains('wlist')) {
        el.querySelectorAll('.ru').forEach(function (r, i) { r.style.transitionDelay = (i * 0.1) + 's'; r.classList.add('vis'); });
      }
      el.classList.add('vis');
      obs.unobserve(el);
    });
  }, { rootMargin: '0px 0px -5% 0px', threshold: 0 });

  document.querySelectorAll('.ru, .lm, .feye, .ahead, .wlist').forEach(function (el) { io.observe(el); });

  var fcta = document.querySelector('.fcta');
  if (fcta) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { fcta.querySelectorAll('.fl').forEach(function (f, i) { setTimeout(function () { f.classList.add('vis'); }, i * 150); }); }
      });
    }, { threshold: 0.2 }).observe(fcta);
  }

  // 7. SCROLL PHYSICS
  var lastY = window.pageYOffset, bdeg = 0, skv = 0, nhid = false, stmr;
  var bdg = el('bdg'), nav = el('nav'), wlist = el('wlist');

  window.addEventListener('scroll', function () {
    requestAnimationFrame(function () {
      var y = window.pageYOffset, dy = y - lastY;
      if (bdg) { bdeg += dy * 0.13; bdg.style.transform = 'rotate(' + bdeg + 'deg)'; }
      if (dy > 6 && y > 100 && !nhid) { if (nav) nav.classList.add('off'); nhid = true; }
      else if (dy < -4 && nhid) { if (nav) nav.classList.remove('off'); nhid = false; }
      
      if (wlist && window.innerWidth >= 768) {
        skv = lerp(skv, clamp(dy * 0.05, -4, 4), 0.2);
        wlist.style.transform = 'skewY(' + skv + 'deg)';
        clearTimeout(stmr); stmr = setTimeout(function () { skv = 0; wlist.style.transform = ''; }, 200);
      }
      lastY = y;
    });
  }, { passive: true });

  // 8. MARQUEE
  var mq = document.querySelector('.mq');
  if (mq) {
    mq.addEventListener('mouseenter', function () { this.querySelectorAll('.mqr').forEach(function (r) { r.style.animationDirection = 'reverse'; r.style.animationDuration = '13s'; }); });
    mq.addEventListener('mouseleave', function () { this.querySelectorAll('.mqr').forEach(function (r) { r.style.animationDirection = 'normal'; r.style.animationDuration = '26s'; }); });
  }

  // 9. LOCAL TIME
  var td = el('tdisp');
  if (td) {
    var fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    function ut() { td.textContent = fmt.format(new Date()) + ' NPT'; } ut(); setInterval(ut, 1000);
  }
})();
