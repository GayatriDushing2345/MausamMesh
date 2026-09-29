# Background Image Slots Directory

Place custom background images in this folder. The app references these filenames through CSS variables defined in `src/app/globals.css`.

## Image Slot Specifications:

1. **`hero.jpg`** — Main Home Page Hero Header (60vh background)
2. **`map.jpg`** — Block → Panchayat GIS Map Header
3. **`advisory.jpg`** — Agricultural Advisory Header
4. **`insights.jpg`** — Model Insights & Reliability Header
5. **`settings.jpg`** — Settings & Configuration Header

## Technical Requirements:
- **Dimensions**: Minimum 1920×1080 resolution.
- **Format**: `.webp` or `.jpg` (compressed under 400 KB for rapid loading).
- **Legibility & Contrast**: Do not worry about bright images — the UI overlays a dark gradient (`linear-gradient(to right, rgba(11, 31, 51, 0.92), rgba(11, 31, 51, 0.7))` in dark mode and high-contrast glass panels) to guarantee WCAG AA contrast for text.
- **Fallback**: If any image file is missing, the application automatically falls back to an ambient deep ink-blue gradient with SVG topographic contour lines and animated rain particles.
