# L'ARTISAN RESTAURANT — Interactive Culinary Experience

> An ultra-premium, scroll-driven interactive dining website showcasing culinary craft through deconstruction motion canvases, fluid vertical slat transitions, and responsive editorial typography.

---

## ✨ Features & Highlights

- **🎬 Scroll-Driven Frame Motion Engine**:
  - **Section 1 (Burger Atelier)**: 240-frame 60 FPS deconstruction animation synchronizing the elevation of the golden brioche bun, aged cheddar, seared Angus patty, and fresh produce.
  - **5-Part Vertical Slat Curtain**: Realistic staggered vertical slat transition in studio yellow (`#F5C03E`) bridging the two culinary workshops.
  - **Section 2 (Stone-Fired Pizza Atelier)**: 105-frame scroll deconstruction revealing hand-tossed artisanal crust, San Marzano sauce, pulled Fior di Latte mozzarella, and wood-smoked cured toppings.
- **📐 Adaptive Canvas Subject Framing**:
  - Intelligent aspect-ratio detection (`aspect < 1.25` for portrait/mobile vs. `>= 1.25` for widescreen desktop).
  - Preserves full subject visibility without aggressive cropping on mobile phones, tablets, and desktop displays.
- **✒️ Synchronized Editorial Typography**:
  - Alternating left & right text stages moving gracefully along with the scroll state.
  - Positioned over pure studio yellow backdrop for pristine legibility and high contrast (`#121316` Poppins + `#241c05` Cursive).
- **🌊 "Souvenir de la Table" Wavy Transition**:
  - Seamless SVG wave divider elevating from the bottom into deep emerald and midnight teal dining sections.
  - Philosophy showcase, signature degustation tastings, chef notes, and booking modal.
- **🧭 Floating Luxury Navigation Bar**:
  - Glassmorphic persistent navbar appearing dynamically as the user scrolls into the dining catalog.
  - Direct quick-jump navigation between culinary chapters.
- **⚡ High-Performance Architecture**:
  - Progressive stratified frame preloading with nearest-loaded frame fallbacks.
  - Capped `devicePixelRatio` to prevent frame drops on ultra-high-DPI screens.
  - Python HTTP/1.1 server with persistent Keep-Alive and browser caching.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5 Semantic Architecture, Vanilla Modern CSS3, JavaScript (ES6+).
- **Graphics & Motion**: Canvas 2D Rendering Engine, GreenSock Animation Platform (GSAP).
- **Typography**: Google Fonts (Poppins, Montserrat, Dancing Script, Josefin Sans, Outfit).
- **Local Server**: Python 3 HTTP/1.1 server (`server.py`).

---

## 🚀 Getting Started

### Prerequisites

- Python 3.x installed (optional, for local development server)
- Modern web browser (Chrome, Safari, Edge, Firefox)

### Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Jishnu09-siuu/Interactive-Restaurant-Website-.git
   cd Interactive-Restaurant-Website-
   ```

2. **Start the local server**:
   ```bash
   python server.py
   ```

3. **Open in browser**:
   Navigate to [http://localhost:8080](http://localhost:8080).

---

## 📂 Project Structure

```
.
├── assets/                  # Brand photography, course imagery, and UI icons
├── frames/                  # Section 1: 240 high-definition burger animation frames
├── frames2/                 # Section 2: 105 high-definition pizza animation frames
├── index.html               # Main application markup and section architecture
├── style.css                # Master styling, design tokens, and responsive layout
├── app.js                   # Motion engine, frame interpolation, and canvas renderer
├── server.py                # Fast local static server with Keep-Alive & caching
├── extract_frames.py        # Frame extraction pipeline utility
├── remove_watermark.py      # Asset processing utility
├── .gitignore               # Git ignore rules
└── README.md                # Project documentation
```

---

## 📱 Device Responsiveness

- **Mobile Phones (iOS & Android)**: Adaptive canvas centering, high-contrast headline stages over studio yellow backdrop.
- **Tablets (iPad, Android Tablets)**: Portrait and landscape adaptive scaling.
- **Desktop & Widescreen**: Immersive full-screen cover framing with flanking editorial stages.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
