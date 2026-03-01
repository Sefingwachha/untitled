<div align="center">

# Sefin Gwachha — Creative Engineer Portfolio ✦

**[www.sefin.com.np](https://www.sefin.com.np/)**

*Digital Experiences Engineered to Endure. Bridging the gap between high-end art direction and ruthless technical performance.*

</div>

<br/>

## 🚀 Overview
The personal portfolio and digital archive of Sefin Gwachha, a freelance Web Developer and UI/UX Designer based in Nepal. Built from scratch without templates, this repository demonstrates advanced frontend engineering, custom fluid motion systems, and a brutalist design architecture.

**Live Site:** [sefin.com.np](https://www.sefin.com.np/)

<br/>

## 🛠️ Tech Stack & Architecture
This project prioritizes perceptual performance and DOM-level animation over heavy framework bloat. 

* **Core:** HTML5 (Semantic & Accessible), CSS3 (Custom Properties, Flexbox/Grid), Vanilla JavaScript (ES6+)
* **Motion & Physics:** [GSAP](https://greensock.com/gsap/) (Core, ScrollTrigger), [Lenis](https://lenis.studiofreight.com/) (Smooth Scroll API)
* **API Integration:** [Web3Forms](https://web3forms.com/) (Serverless Contact Form)
* **SEO & Analytics:** JSON-LD Schema Markup, Open Graph, Google Analytics 4

<br/>

## ✨ Key Technical Features

### 1. Custom Physics Cursor (LERP)
Replaced the default OS cursor with a custom DOM element utilizing Linear Interpolation (LERP) for smooth, trailing physics. Features state-based rendering:
* `mix-blend-mode: difference` for high-contrast visibility.
* Hollow-ring expansion on navigation links.
* Massive solid-state expansion with text injection on project hovers.

### 2. Advanced GSAP Motion Systems
* **3D Masked Typography:** Custom JS text-splitter breaks massive headings into individual spans, wrapping them in `overflow: hidden` masks. Letters are animated via `rotationX: -90` and `skewY` for a mechanical, split-flap reveal effect.
* **Parallax Scrubbing:** Images map to the scroll velocity, shifting along the Y-axis as they enter the viewport.

### 3. Brutalist UI/UX Grid
A strict, monochromatic design system relying on stark borders (`1px solid #0a0a0a`), negative letter-spacing, and fluid typography (`clamp()`). The CSS architecture entirely drops media-query breakpoints for padding in favor of fluid CSS variables (`--gap: clamp(1rem, 3vw, 2rem)`).

### 4. Enterprise-Grade SEO & Web Vitals
* **98+ Lighthouse Score:** Lazy loading, `fetchpriority`, and highly optimized WebP assets ensure sub-second LCP.
* **Knowledge Graph Ready:** Injected with comprehensive `application/ld+json` Schema linking the developer identity to Google's Search Graph.
* **Accessibility (a11y):** ARIA labels, focus-trapping inside the custom modal, and keyboard navigability.

<br/>

## 💻 Local Setup
To run this project locally, simply clone the repository and serve it using any local web server. No build step (NPM/Webpack) is required.

```bash
# Clone the repository
git clone https://github.com/Sefingwachha/your-repo-name.git

# Navigate into the directory
cd your-repo-name

# Start a local server (e.g., using Python or VS Code Live Server)
python -m http.server 8000
