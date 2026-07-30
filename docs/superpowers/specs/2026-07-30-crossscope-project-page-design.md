# CrossScope Project Page Design

**Status:** Approved by the user on 2026-07-30.

## Goal

Build a static academic project page for *CrossScope: A Role-Asymmetric World Model for Joint Dual-Scope Surgical Video Prediction* by strictly adapting the public SurgSLOT `website` branch template. The resulting site must preserve the template's HTML/Bulma component structure, page rhythm, button treatments, section backgrounds, card layout, local static asset organization, and small carousel initialization while replacing every project-specific item with CrossScope material.

## Source material

- Paper: `C:/Users/LWH/Desktop/ERCP_CoRL/CrossScope.pdf` (anonymous review submission, 16 pages).
- Reference template: `https://github.com/jinlab-imvr/SurgSLOT`, `website` branch.
- Template layout: `index.html`, `static/css/{bulma.min.css,bulma-carousel.min.css,bulma-slider.min.css,fontawesome.all.min.css,index.css}`, and `static/js/{bulma-carousel.min.js,bulma-slider.min.js,index.js}`.

## User-facing page design

### Hero

Use the SurgSLOT hero hierarchy without redesigning it:

- Exact CrossScope title.
- `Anonymous Submission` instead of authors and institutions, because the supplied PDF is anonymized.
- `Paper` button links to the local CrossScope PDF included under `static/pdfs/`.
- Omit the template's Code button rather than invent a repository URL.
- The main visual is a paper-derived CrossScope overview figure.

### Paper narrative

Follow the reference template's alternating white and light-gray `section content-section` rhythm:

1. **Abstract** — adapted verbatim from the supplied manuscript, preserving the role-asymmetric dual-scope claim.
2. **Why role asymmetry?** — compact problem framing: Mother is wide-field global geometry; Child is near-field local anatomy; their evidence cannot be exchanged symmetrically.
3. **CrossScope architecture** — paper-derived method image and a clear caption for M2C geometric motion routing and C2M pose-aligned appearance routing.
4. **Experimental results** — a responsive Bulma table using Table 1's frame-fidelity, task-fidelity, and motion metrics, plus the manuscript's stated relative gains versus Cosmos-H-Surgical.
5. **Qualitative prediction** — paper-derived real-world Mother and phantom Child comparisons, preserving figure/caption context.
6. **Ablation and spatial support** — concise treatment of the M2C/C2M routes and the geometry-licensed C2M placement diagnostic.
7. **Citation** — BibTeX block marked as an anonymous submission to avoid inventing authors, venue, or publication year.

### Visual and interaction rules

- Use the reference template's local Bulma files and CSS classes (`hero`, `section`, `container`, `columns`, `card`, `button is-rounded is-dark`, and `content-section`).
- Preserve the reference footer/acknowledgment pattern, crediting SurgSLOT and Nerfies as template influences and retaining the source template's CC BY-SA 4.0 attribution.
- Do not add a novel navigation bar, animation system, JavaScript framework, external analytics, fabricated videos, author affiliations, code links, or performance claims.
- Assets come only from the supplied PDF. Rendered figures retain their captions and are stored locally under `static/images/`.

## File responsibilities

- `index.html`: Strict SurgSLOT-derived static page with CrossScope content.
- `static/css/`: Required Bulma and reference-template styles; `index.css` holds only CrossScope-safe overrides.
- `static/js/`: Reference carousel/slider dependencies plus the unchanged carousel initializer.
- `static/images/`: PDF-rendered overview, architecture, qualitative, and support-diagnostic graphics.
- `static/pdfs/CrossScope.pdf`: Local downloadable copy of the supplied manuscript.
- `README.md`: Local preview instructions and attribution.

## Error handling and fallbacks

- Every paper-derived image has meaningful alt text and a textual caption; page content remains readable if an image does not load.
- Buttons point only to local, verified files. No unavailable code/demo links are rendered.
- The page is responsive via Bulma's native columns and tables; no custom mobile-only alternate content is needed.

## Acceptance criteria

- A browser can open `index.html` without a build step or network dependency for CSS/JS/images.
- All visible CrossScope claims, metrics, and captions trace to the supplied PDF.
- The page visibly follows SurgSLOT's hero, section, cards/tables, links, citation, and footer conventions.
- No SurgSLOT project name, authors, images, videos, code links, or unrelated claims remain.
- The local Paper button opens the included PDF.
- A local HTTP preview has no console errors or missing static-resource responses.

