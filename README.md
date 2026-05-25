# 🏛️ Golden Pearl - Premium Immersive Showcase

[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub_Pages-gold.svg?style=flat-square&logo=github)](https://ArjunDineshMenon.github.io/construction-portfolio)
[![Design System](https://img.shields.io/badge/Design_System-Obsidian_%26_Gold-d4af37.svg?style=flat-square)](about.html)
[![Aesthetics](https://img.shields.io/badge/Style-Minimalist_Luxury-black.svg?style=flat-square&color=0a0a0a)](index.html)

Welcome to the **Golden Pearl Construction & Trading** digital experience. Imported directly from Google Stitch and polished to perfection, this website is a prestigious, high-fidelity gallery presenting civil construction, heavy industrial engineering, MEP systems, and luxury real estate fit-outs across the Kingdom of Bahrain.

---

## ✨ The Aesthetic: Minimalist Luxury & Brutalism

The design system projects authority, stability, and premium legacy. It is built strictly on the **Obsidian and Gold** design theme.

*   **Palettes**: Obsidian black canvases (`#000000` / `#0e0e0e`) and deep charcoal panels layered together to create deep galleries. Highlighted with luxurious metallic **Brushed Gold** (`#d4af37` / `#f2ca50`) and **Champagne Gold** accents.
*   **Precise Geometry**: Strict **sharp-edged layout constraints** (zero border-radius on cards, buttons, and containers) to reflect architectural rigidity, stone masonry, and permanent engineering structures.
*   **Contrast Philosophy**: High-contrast ratios to ensure gorgeous visual aesthetics while strictly adhering to AA accessibility standards.

---

## 📂 Project Architecture & Pages

The application is structured into four premium, responsive, highly interactive pages:

```
├── index.html            # Home page & scrollytelling brand portal
├── services.html         # Industrial, Civil, MEP & Landscaping Capabilities
├── portfolio.html        # Landmark Portfolio (Industrial, Residential, Retail)
├── about.html            # Core Values, Interactive Pillars & Particle Canvas
├── images/
│   └── luxury_living_room.png # High-fidelity, local generated luxury asset
└── README.md             # Project handbook (this file)
```

### 1. 🏠 Home Page (`index.html`)
The gateway to the Golden Pearl legacy.
*   **Parallax Hero Zoom**: Smooth background camera zoom and translate scroll triggers.
*   **Mission & Vision Scrollytelling**: Full-screen scrolling panels that swap fixed full-screen backdrops, revealing corporate values dynamically.
*   **Zero-Shift Navigation**: A custom, floating sticky header with class-based glassmorphism transitions.

### 2. 🛠️ Services Page (`services.html`)
Capabilities built to sustain national progress.
*   **Sector Highlights**: Expansive breakdowns of heavy Civil Works and mechanical/electrical/plumbing (MEP) designs.
*   **Horizontal Parallax**: Landscape sections with horizontal scroll alignment offsets, creating physical depth as users navigate down.

### 3. 💼 Landmark Portfolio (`portfolio.html`)
A cinematic walkthrough of Gulf-class developments.
*   **Dynamic Sectors**: Showcases major projects like Midal Cables Co., Alba Potline 6 offices, and Al Shaya.
*   **Bento Restaurant Rollout**: Custom retail layouts for high-spec cafes and brands (WOK Station, Godiva, Loop Café).
*   **Asset Optimization**: Leverages locally hosted, high-definition luxury render assets to ensure instantaneous image loading.

### 4. 🏛️ About Page (`about.html`)
The human vision behind the steel.
*   **Interactive Particle Canvas**: A custom Vanilla JS particle engine simulating floating dust motes and premium golden embers behind sections.
*   **Interactive Value Pillars**: Grid layouts for Ethics, Safety, Quality, and Innovation with micro-rotations and 3D card tilt triggers.
*   **Voice of Precision**: A continuous marquee marquee-ribbon translating architectural values infinitely.

---

## ⚡ Technical Highlights

*   **Tailwind CSS JIT**: Seamless utilities paired with curated bespoke theme tokens for smooth responsive scaling across desktop, tablet, and mobile.
*   **Intersection Observer API**: High-performance scroll-reveal system triggers staggered animations for items entering viewports.
*   **Hardware-Accelerated Parallax**: Smooth translations using CSS transform offsets triggered by requestAnimationFrame to prevent layout thrashing.
*   **Pixel-Perfect Consistency**: Shared navigation classes (`main-nav` and `.nav-scrolled`) ensure zero alignment shifting when jumping between pages.

---

## 🚀 Getting Started

### Launching Locally

You can launch a lightweight web server instantly inside the root directory to preview the interactive features:

1.  **Start a Python server**:
    ```bash
    python3 -m http.server 8002
    ```
2.  **Open in your browser**:
    Navigate to **[http://localhost:8002](http://localhost:8002)**.

### Pushing Updates to GitHub

To update your live repository at [github.com/ArjunDineshMenon/construction-portfolio](https://github.com/ArjunDineshMenon/construction-portfolio):

```bash
git add .
git commit -m "Commit message detailing your updates"
git push
```

---

## 🌐 Public Deployment (GitHub Pages)

This static website is pre-configured to be deployed natively on **GitHub Pages**:

1.  Go to your repository settings: [github.com/ArjunDineshMenon/construction-portfolio/settings](https://github.com/ArjunDineshMenon/construction-portfolio/settings).
2.  Click **Pages** under the "Code and automation" section in the left sidebar.
3.  Set **Branch** to `main` and folder to `/ (root)`.
4.  Click **Save**.

Your portfolio will instantly be live at **`https://ArjunDineshMenon.github.io/construction-portfolio/`**!

---

*Architectural Precision & Uncompromising Luxury — Since 2012.*
