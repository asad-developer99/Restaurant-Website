# L'Artisan — Interactive Restaurant Experience

An ultra-premium, scroll-driven interactive dining website showcasing culinary craft through deconstruction motion canvases, fluid vertical slat transitions, and responsive editorial typography.

---
## ✨ LIVE PRIVIEW:
https://restaurant-website-three-ivory.vercel.app/
---


## ✨ Features & Highlights

- **🎬 Scroll-Driven Frame Motion Engine**
  - **Section 1 (Burger Atelier)**: 240-frame deconstruction animation synchronizing the elevation of the golden brioche bun, aged cheddar, seared Angus patty, and fresh produce.
  - **5-Part Vertical Slat Curtain**: Staggered vertical slat transition in studio yellow (`#F5C03E`) bridging the two culinary workshops.
  - **Section 2 (Stone-Fired Pizza Atelier)**: 105-frame scroll deconstruction revealing hand-tossed artisanal crust, San Marzano sauce, pulled Fior di Latte mozzarella, and wood-smoked cured toppings.
- **📐 Adaptive Canvas Subject Framing**
  - Intelligent aspect-ratio detection (`aspect < 1.25` for portrait/mobile vs. `>= 1.25` for widescreen desktop).
  - Preserves full subject visibility without aggressive cropping across devices.
- **✒️ Synchronized Editorial Typography**
  - Alternating left & right text stages moving in sync with scroll position.
  - Positioned over studio yellow backdrop for high-contrast legibility.
- **🌊 "Souvenir de la Table" Wavy Transition**
  - Seamless SVG wave divider elevating into deep emerald and midnight teal dining sections.
  - Philosophy showcase, signature degustation tastings, chef notes, and a live booking modal.
- **🧭 Floating Luxury Navigation Bar**
  - Glassmorphic persistent navbar that appears dynamically as the user scrolls into the dining catalog.
  - Direct quick-jump navigation between culinary chapters.
- **📅 Interactive Reservation System**
  - Modal-based booking flow with guest details, party size, and confirmation summary view.
- **⚡ High-Performance Architecture**
  - Progressive stratified frame preloading with nearest-loaded frame fallbacks.
  - Capped `devicePixelRatio` to prevent frame drops on ultra-high-DPI screens.
  - Python HTTP/1.1 local server with persistent Keep-Alive and asset caching.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla CSS3, JavaScript (ES6+)
- **Graphics & Motion**: Canvas 2D rendering engine for scroll-driven frame animation
- **Typography**: Google Fonts
- **Local Dev Server**: Python 3 HTTP/1.1 server (`server.py`) with custom cache headers

---

## 🚀 Getting Started

### Prerequisites

- Python 3.x installed (for the local development server)
- A modern web browser (Chrome, Safari, Edge, Firefox)

### Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/asad-developer99/Restaurant-Website.git
   cd Restaurant-Website
   ```

2. **Start the local server:**
   ```bash
   python server.py
   ```

3. **Open in browser:**
   Navigate to [http://localhost:8080](http://localhost:8080)

---

## 📂 Project Structure

```text
Restaurant-Website/
├── assets/                  # Brand photography, dish imagery, and UI icons
├── frames/                  # Section 1: 240 burger animation frames
├── frames2/                 # Section 2: 105 pizza animation frames
├── index.html               # Main application markup and section architecture
├── style.css                # Master styling, design tokens, and responsive layout
├── app.js                   # Motion engine, frame interpolation, and canvas renderer
├── server.py                # Local static server with Keep-Alive & caching
├── extract_frames.py        # Frame extraction pipeline utility
├── remove_watermark.py      # Asset processing utility
├── .gitignore                # Git ignore rules
└── README.md                # Project documentation
```

---

## 📱 Device Responsiveness

- **Mobile Phones**: Adaptive canvas centering, high-contrast headline stages over studio yellow backdrop.
- **Tablets**: Portrait and landscape adaptive scaling.
- **Desktop & Widescreen**: Immersive full-screen cover framing with flanking editorial stages.

---

## 📄 License

No license has been specified for this project yet. All rights are reserved by default unless a license is added.
