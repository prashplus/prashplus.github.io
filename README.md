# prashplus.github.io

Personal portfolio website for **Prashant Piprotar** — Sr. Software Engineer.

## Tech Stack

- **HTML5** — Semantic markup, no frameworks
- **Vanilla CSS** — Custom dark-mode glassmorphism design system (`assets/css/custom.css`)
- **[Anime.js](https://animejs.com/)** — Canvas-based drone/HUD background animation, scroll-triggered section reveals, interactive hover effects
- **[Typed.js](https://github.com/mattboldt/typed.js/)** — Dynamic typing effect in the hero section
- **[Font Awesome](https://fontawesome.com/)** — Icons (loaded via CDN)

## Project Structure

```
├── index.html              # Main portfolio page
├── 404.html                # Custom 404 page
├── favicon.ico             # Site favicon
├── CNAME                   # GitHub Pages custom domain
├── assets/
│   ├── css/
│   │   └── custom.css      # Complete design system & styles
│   ├── js/
│   │   └── main.js         # All animation logic (canvas, observers, hover)
│   └── images/
│       ├── profile.png     # Profile photo
│       └── projects/       # Project thumbnail images
└── resume/                 # Resume PDFs
```

## Running Locally

```bash
# Any static file server works
python -m http.server 8080
# Then open http://localhost:8080
```

## Deployment

Push to `main` branch — GitHub Pages serves automatically from the root.

## License

See [license.txt](license.txt).
