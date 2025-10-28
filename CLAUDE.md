# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the Digital Humanities Craft Excellence repository - a Jekyll-based static website combining a blog, system prompts for AI models, and a collection of "Promptotyping" web application implementations.

**IMPORTANT:** This repository is a **subsite** of the main dhcraft.org site:
- Main site: https://github.com/DigitalHumanitiesCraft/digitalhumanitiescraft.github.io
- This subsite URL: https://dhcraft.org/excellence
- The `assets/` directory is in `.gitignore` - it only exists for local testing
- All actual assets (CSS, JS, images, fonts) are served from the parent site at https://dhcraft.org
- When deployed, this content integrates into the parent site's structure

## Development Commands

### Jekyll Site (Blog Only)

**Important:** Jekyll is ONLY used for processing blog markdown posts (`blog/*.md`). Everything else (index.html, promptotyping projects, system_prompts) is static and doesn't need Jekyll.

```bash
# Install dependencies (first time setup)
bundle install

# Run development server (for testing blog posts locally)
# Use --baseurl "" to override the /excellence base path for local testing
bundle exec jekyll serve --baseurl ""

# Build the site for production
bundle exec jekyll build

# The site will be generated in the _site/ directory
# Only _site/blog/ contains Jekyll-processed content
```

**What Jekyll processes:**
- `blog/*.md` files → converted to HTML with the `post` layout
- Generates blog post pages at `_site/blog/{post-title}/index.html`
- Creates RSS feed and sitemap

**What Jekyll does NOT process (excluded in _config.yml):**
- `promptotyping/` - Static web apps pulled directly by parent site
- `system_prompts/` - Documentation files
- `index.html` and `blog/index.html` - Static HTML files
- `assets/` - Served from parent site
- Documentation files (README.md, CLAUDE.md, etc.)

### Python Scripts (Promptotyping Projects)

Several promptotyping projects contain Python scripts for data processing:

```bash
# Example: Subject-verb inversion finder
python promptotyping/subject-verb-inversion-finder/subject-verb-inversion-finder.py

# Example: Disco invert analysis
python promptotyping/disco-invert/scripts/analyse_fisher.py
```

## Architecture Overview

### Site Structure

The repository uses **minimal Jekyll** - only for blog post processing. Most content is static HTML/JS.

```
excellence/
├── _config.yml              # Jekyll config - excludes most directories!
├── _layouts/                # Jekyll layouts (default, post) - for blog only
├── _includes/               # Reusable components (navigation, head)
├── assets/                  # LOCAL ONLY - in .gitignore, not deployed
├── blog/
│   ├── *.md                 # JEKYLL PROCESSES THESE → HTML
│   ├── index.html           # Static HTML - manually curated blog list
│   └── img/                 # Blog post images
├── system_prompts/          # Static markdown - Jekyll excluded
├── promptotyping/           # Static web apps - Jekyll excluded
├── index.html               # Static HTML - Jekyll excluded
└── default.html             # Static HTML - Jekyll excluded
```

**Jekyll Processing (Minimal):**
- **ONLY processes:** `blog/*.md` files with YAML front matter
- **Generates:** `_site/blog/{post-title}/index.html` using the `post` layout
- **Everything else is excluded** in `_config.yml` to avoid unnecessary processing

**Asset Management:**
- All asset references in HTML use absolute paths like `/assets/css/theme.min.css`
- These resolve to the parent site (digitalhumanitiescraft.github.io) when deployed
- For local testing, maintain a local copy of assets/ directory
- Never commit changes to assets/ directory - they belong to the parent site

**GitHub Pages Deployment Architecture:**
- **Parent site:** https://github.com/DigitalHumanitiesCraft/digitalhumanitiescraft.github.io
  - Pure static HTML/CSS/JS, NO Jekyll
  - Deployed at https://dhcraft.org
  - Contains all shared assets (CSS, JS, images, fonts)

- **This repo:** https://github.com/DigitalHumanitiesCraft/excellence
  - **Separate GitHub Pages site** deployed at https://dhcraft.org/excellence
  - GitHub Pages automatically runs Jekyll on push to `main` branch
  - Uses parent site's assets via absolute paths (`/assets/...`)
  - `_site/` is gitignored - GitHub builds it automatically

- **How it works:**
  1. You push to this repo
  2. GitHub Pages automatically runs `jekyll build`
  3. Static files (index.html, promptotyping/, blog/index.html) are served as-is
  4. Blog markdown files (blog/*.md) are converted to HTML using `_layouts/post.html`
  5. Site is live at https://dhcraft.org/excellence
  6. Asset references resolve to parent site (https://dhcraft.org/assets/...)

### Promptotyping Methodology

This repository implements and documents the **Promptotyping methodology** - a systematic approach to LLM-assisted development that combines prompt engineering with rapid prototyping. Each promptotyping project follows this structure:

**Core Documents (Phase 1):**
- `README.md` - Project context, motivation, domain (the "WHY")
- `REQUIREMENTS.md` - Functional and non-functional requirements (the "WHAT")

**Optional Documents (as needed):**
- `DATA.md` - Data structures, APIs, examples (the "USING WHAT")
- `INSTRUCTIONS.md` - Implementation steps (the "HOW")
- `DESIGN.md` - UI/UX requirements
- `CLAUDE.md` - Working memory and code documentation for LLMs
- `LLM.md` - Alternative name for CLAUDE.md in some projects

**Key Principle: Context Compression**
- Provide better information, not more information
- Reduce complex requirements to relevant essence
- Use precise terminology and structured markdown

### Promptotyping Projects

The `promptotyping/` directory contains multiple independent web applications, each demonstrating the Promptotyping methodology:

1. **ChSl** - Historical Document Viewer for PAGE XML transcriptions
2. **crown-dashboard-json-webapp** - Crown Dashboard data visualization
3. **disco-invert** - Discourse analysis tool
4. **hamlet-digital-edition-tei-to-frontend-webapp** - TEI XML to web interface
5. **imareal-room-object-webapp** - IMAREAL room object viewer
6. **subject-verb-inversion-finder** - Linguistic analysis tool
7. **szd-dashboard** - SZD dashboard
8. **szd-annotation-timeline** - Annotation timeline visualization
9. **the-one-snake-vibe-coding** - Lord of the Rings themed snake game
10. **web-diagram-webpage-workflow** - Diagram-to-webpage workflow

Most are **pure JavaScript/HTML/CSS applications** requiring no build process - they can be opened directly in a browser or served with `python -m http.server`.

### Blog Architecture

Blog posts are written in **Markdown** with YAML front matter, following Jekyll conventions. The blog index at `blog/index.html` is a custom HTML page (not Jekyll-generated) that manually lists blog posts with featured images.

**Blog Post Layout:**
- Uses `_layouts/post.html` for individual blog posts
- Includes unified header/footer matching the main excellence site
- Features metadata display: Author, Publication date, License
- Includes "Zurück zur Blogübersicht" button to return to blog index
- Includes "📄 Als PDF drucken" button for academic paper-style PDF export
- APA citation format with one-click copy functionality
- Blog-specific styles in `assets/css/main.scss`

**Print/PDF Functionality:**
Blog posts can be exported as academic paper-style PDFs (similar to arXiv.org papers) with:
- A4 page size with proper margins
- Times New Roman serif font
- Centered title, abstract in bordered box, keywords
- Author information displayed
- Print styles hide navigation but preserve post content
- Use `window.print()` or browser's print dialog to save as PDF

**Important Styling Details:**
- `assets/css/main.scss` - Blog-specific SCSS with print media queries
- Post header uses `position: static !important` to override parent site's absolute positioning
- Metadata uses labeled format with bullet separators
- Citation copy button provides visual feedback (green "Kopiert! ✓" confirmation)

Blog posts cover:
- Advanced prompt engineering techniques
- Promptotyping methodology
- Understanding LLMs and their limitations
- "Vibe Coding" and critical expert review
- System-1.42 mental model for LLMs

### System Prompts

The `system_prompts/` directory contains advanced prompting methodologies:

- **promptotyping-guide.md** - Step-by-step guide to the Promptotyping methodology
- **PRISM.md** - Advanced prompt engineering technique
- **RVPT.md** - Research and validation prompt technique

These are designed to be used as system prompts in AI assistants (Claude, ChatGPT) for research tasks.

## Jekyll Configuration

- **Base URL:** `/excellence` (site hosted at subdirectory)
- **Markdown:** kramdown
- **Highlighter:** rouge
- **Plugins:** jekyll-feed, jekyll-sitemap, jekyll-seo-tag
- **Timezone:** Europe/Vienna
- **Permalink:** `/:categories/:title/`

## Key Concepts for Working in This Repository

### When Working with Blog Posts

1. Blog posts are Markdown files in `blog/` directory
2. The blog index (`blog/index.html`) must be **manually updated** when adding new posts - it's not auto-generated
3. Featured images are stored in `blog/img/`
4. Posts use Jekyll front matter but the blog index doesn't use Jekyll templating

### When Working with Promptotyping Projects

1. Each project is **self-contained** with its own documentation
2. Read the project's README.md and CLAUDE.md/LLM.md first
3. Most projects are static web apps with no build process
4. Follow the "Context Compression" principle - be concise and precise
5. The **Critical Expert Review** phase is essential - always validate LLM-generated solutions

### When Creating New Promptotyping Projects

Follow the 4-phase cycle documented in `system_prompts/promptotyping-guide.md`:

1. **Document Setup** - Create README.md and REQUIREMENTS.md (minimum)
2. **Requirements Engineering** - Structure must-have, nice-to-have, and non-goals
3. **Iterative Development** - Cycle through: Prompt → Prototype → Critical Review → Document
4. **Expert-in-the-Loop** - Continuous validation by domain experts

## Code Style Notes

### HTML/CSS

- Uses Bootstrap-based theme (Front template)
- Custom CSS in `assets/css/custom.css` and `assets/css/custom-excellence.css`
- Responsive design with mobile support
- Bilingual interface (German/English) with JavaScript language switching

### JavaScript (Promptotyping Apps)

- ES6 module imports where applicable
- camelCase for functions/variables, PascalCase for classes
- 4-space indentation
- JSDoc comments for functions
- Grid-based or canvas-based rendering for visualizations

### Python Scripts

- Used for data processing and analysis
- Located in various promptotyping project subdirectories
- No unified Python environment - each project may have different dependencies

## Important Patterns

### Avoiding Common Mistakes

1. **Never commit assets/** - The assets directory is gitignored and belongs to the parent site
2. **Don't auto-generate blog index** - The blog/index.html is manually curated
3. **Check base URL** - All links must account for `/excellence` base path
4. **Asset paths are absolute** - Use `/assets/...` not `../assets/...` (they resolve to parent site)
5. **Validate promptotyping docs** - Each project's documentation should follow the methodology
6. **Test static apps locally** - Use `python -m http.server` in the project directory
7. **Critical review is mandatory** - Never deploy LLM-generated code without expert validation

### Git Workflow

- Main branch: `main`
- Current working branch: `main`
- This repo integrates into parent site: https://github.com/DigitalHumanitiesCraft/digitalhumanitiescraft.github.io
- Only commit content files (HTML, MD, blog posts, promptotyping projects)
- Never commit assets/ directory - it's gitignored for a reason

## Citation

This repository is citable via Zenodo DOI: [10.5281/zenodo.14160876](https://doi.org/10.5281/zenodo.14160876)
