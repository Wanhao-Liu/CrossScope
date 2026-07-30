# CrossScope Project Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a browser-ready CrossScope academic project page that strictly adapts the SurgSLOT `website` template and traces all project content to the supplied anonymous PDF.

**Architecture:** A single static `index.html` follows the SurgSLOT hero and Bulma section hierarchy. It references the same public font/CSS libraries as SurgSLOT, local PDF-rendered figures under `static/images/`, a local downloadable paper under `static/pdfs/`, and a small inherited carousel initializer that is safe when unused.

**Tech Stack:** HTML5, Bulma 0.9.4, Font Awesome 6.4.0, Academicons, static CSS/JavaScript, Python with pdfplumber/Pillow for original-PDF figure rendering, Node's built-in test runner, local Python HTTP server for browser verification.

---

## File structure

- `index.html` — complete SurgSLOT-derived page and CrossScope text/metrics.
- `static/css/index.css` — the SurgSLOT reference CSS, with only styles required by CrossScope image grids and wide tables.
- `static/js/index.js` — the reference carousel initializer unchanged.
- `static/images/overview.png` — rendered Figure 1 overview from PDF page 1.
- `static/images/architecture.png` — rendered CrossScope architecture from PDF page 3.
- `static/images/qualitative.png` — rendered Figure 4 comparison from PDF page 6.
- `static/images/spatial-support.png` — rendered Figure 5 diagnostic from PDF page 7.
- `static/images/favicon.png` — a small non-SurgSLOT icon made by downscaling the overview image.
- `static/pdfs/CrossScope.pdf` — the supplied manuscript, preserved for the Paper link.
- `scripts/extract_paper_assets.py` — deterministic source-asset renderer/cropper.
- `tests/site.test.mjs` — static contract tests for content, assets, links, and absence of copied project content.
- `README.md` — preview command, source-paper notice, and template attribution.

### Task 1: Establish the static-site contract

**Files:**
- Create: `tests/site.test.mjs`
- Test: `tests/site.test.mjs`

- [ ] **Step 1: Write the failing static contract test**

```js
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const requiredFiles = [
  'index.html',
  'static/css/index.css',
  'static/js/index.js',
  'static/images/overview.png',
  'static/images/architecture.png',
  'static/images/qualitative.png',
  'static/images/spatial-support.png',
  'static/images/favicon.png',
  'static/pdfs/CrossScope.pdf',
  'README.md',
];

test('CrossScope page has its required local deliverables', () => {
  requiredFiles.forEach((file) => assert.equal(existsSync(file), true, `${file} is missing`));
});

test('CrossScope page retains the approved template contract', () => {
  const html = readFileSync('index.html', 'utf8');
  [
    'CrossScope: A Role-Asymmetric World Model for Joint Dual-Scope Surgical Video Prediction',
    'Anonymous Submission',
    'static/pdfs/CrossScope.pdf',
    'Role-asymmetric dual-scope future prediction',
    'CrossScope architecture',
    'End-to-end results on the phantom benchmark',
    'Citation',
    'SurgSLOT template',
  ].forEach((needle) => assert.equal(html.includes(needle), true, `${needle} is missing`));
  assert.doesNotMatch(html, /SurgSLOT: Segment Anything in Surgical Videos/i);
  assert.doesNotMatch(html, /iSurg unifies/i);
});

test('paper images and the Paper control resolve to local paths', () => {
  const html = readFileSync('index.html', 'utf8');
  ['overview.png', 'architecture.png', 'qualitative.png', 'spatial-support.png']
    .forEach((file) => assert.match(html, new RegExp(`static/images/${file}`)));
  assert.match(html, /href="static\/pdfs\/CrossScope\.pdf"/);
});
```

- [ ] **Step 2: Run the test to verify it fails before the page exists**

Run: `node --test tests/site.test.mjs`

Expected: FAIL because `index.html` and the required static deliverables do not exist.

- [ ] **Step 3: Keep this test unchanged until Tasks 2–4 provide the delivery contract**

The test intentionally covers only observable static-page requirements: names, assets, paper link, template attribution, and removal of copied SurgSLOT project content.

- [ ] **Step 4: Commit the test scaffold**

```powershell
git add tests/site.test.mjs
git commit -m "test: define CrossScope project page contract"
```

### Task 2: Render original paper media and supply the PDF

**Files:**
- Create: `scripts/extract_paper_assets.py`
- Create: `static/images/overview.png`
- Create: `static/images/architecture.png`
- Create: `static/images/qualitative.png`
- Create: `static/images/spatial-support.png`
- Create: `static/images/favicon.png`
- Create: `static/pdfs/CrossScope.pdf`
- Test: `tests/site.test.mjs`

- [ ] **Step 1: Implement the deterministic PDF renderer and cropper**

```python
from __future__ import annotations

import argparse
from pathlib import Path

import pdfplumber


FIGURES = {
    'overview.png': (0, (315, 125, 610, 415)),
    'architecture.png': (2, (24, 55, 588, 420)),
    'qualitative.png': (5, (20, 45, 592, 345)),
    'spatial-support.png': (6, (260, 230, 590, 525)),
}


def crop_to_pixels(box: tuple[float, float, float, float], scale: float) -> tuple[int, int, int, int]:
    return tuple(round(value * scale) for value in box)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--pdf', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--resolution', type=int, default=200)
    args = parser.parse_args()

    args.out.mkdir(parents=True, exist_ok=True)
    scale = args.resolution / 72
    with pdfplumber.open(args.pdf) as paper:
        for filename, (page_index, box) in FIGURES.items():
            image = paper.pages[page_index].to_image(resolution=args.resolution).original
            image.crop(crop_to_pixels(box, scale)).save(args.out / filename, optimize=True)
    with pdfplumber.open(args.pdf) as paper:
        overview = paper.pages[0].to_image(resolution=72).original
        overview.crop(crop_to_pixels(FIGURES['overview.png'][1], 1)).resize((64, 64)).save(args.out / 'favicon.png')


if __name__ == '__main__':
    main()
```

- [ ] **Step 2: Run the renderer against the supplied article and copy the verified paper**

Run:

```powershell
python scripts/extract_paper_assets.py --pdf "C:/Users/LWH/Desktop/ERCP_CoRL/CrossScope.pdf" --out static/images
Copy-Item -LiteralPath "C:/Users/LWH/Desktop/ERCP_CoRL/CrossScope.pdf" -Destination "static/pdfs/CrossScope.pdf"
```

Expected: Four PNG figures and one favicon are created under `static/images/`; the Paper target exists under `static/pdfs/`.

- [ ] **Step 3: Inspect the figures and correct only crop coordinates that clip the intended manuscript figure**

Run: `python -m http.server 4173 --directory .`

Inspect the four `/static/images/*.png` paths. A valid overview includes Mother/Child views and M2C/C2M arrows; architecture includes the dual-stream transformer diagram; qualitative includes ground truth/Cosmos/CrossScope comparison; spatial support includes the C2M diagnostic.

- [ ] **Step 4: Run the contract test to verify the asset portion now passes**

Run: `node --test tests/site.test.mjs`

Expected: The local-deliverables assertion gets past the asset checks; content assertions still fail until Task 4 creates `index.html`.

- [ ] **Step 5: Commit the paper asset pipeline and rendered assets**

```powershell
git add scripts/extract_paper_assets.py static/images static/pdfs/CrossScope.pdf
git commit -m "assets: add CrossScope paper figures"
```

### Task 3: Bring across SurgSLOT styling and scripts without its project content

**Files:**
- Create: `static/css/index.css`
- Create: `static/js/index.js`
- Test: `tests/site.test.mjs`

- [ ] **Step 1: Copy the exact reference CSS and initializer from the inspected `website` branch**

```powershell
Copy-Item -LiteralPath ".template-reference/index.css" -Destination "static/css/index.css"
Copy-Item -LiteralPath ".template-reference/index.js" -Destination "static/js/index.js"
```

- [ ] **Step 2: Append only the classes required for CrossScope media and result tables**

```css
.paper-figure {
  max-width: 100%;
  height: auto;
  margin: 1.5rem auto 0;
  display: block;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.paper-caption {
  max-width: 960px;
  margin: 0.75rem auto 0;
  color: #4a4a4a;
  font-size: 0.95rem;
  line-height: 1.45;
  text-align: center;
}

.results-table th,
.results-table td {
  vertical-align: middle;
  white-space: nowrap;
}

.results-table .ours td {
  font-weight: 700;
}
```

- [ ] **Step 3: Run the static test to confirm style/script files now satisfy their file existence checks**

Run: `node --test tests/site.test.mjs`

Expected: The only remaining failures concern `index.html` and `README.md`.

- [ ] **Step 4: Commit the inherited presentation layer**

```powershell
git add static/css/index.css static/js/index.js
git commit -m "style: adapt SurgSLOT project page foundation"
```

### Task 4: Implement the CrossScope page in the exact template hierarchy

**Files:**
- Create: `index.html`
- Test: `tests/site.test.mjs`

- [ ] **Step 1: Create the SurgSLOT-compatible document head and hero**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="CrossScope: role-asymmetric dual-scope surgical video prediction.">
  <meta property="og:title" content="CrossScope: A Role-Asymmetric World Model for Joint Dual-Scope Surgical Video Prediction">
  <meta property="og:description" content="Joint future prediction from complementary Mother and Child ERCP views.">
  <meta property="og:image" content="static/images/overview.png">
  <meta name="twitter:card" content="summary_large_image">
  <title>CrossScope: A Role-Asymmetric World Model for Joint Dual-Scope Surgical Video Prediction</title>
  <link rel="icon" type="image/png" href="static/images/favicon.png">
  <link href="https://fonts.googleapis.com/css?family=Google+Sans|Noto+Sans|Castoro" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/jpswalsh/academicons@1/css/academicons.min.css">
  <link rel="stylesheet" href="static/css/index.css">
</head>
<body>
  <section class="hero">
    <div class="hero-body"><div class="container is-max-desktop"><div class="columns is-centered"><div class="column has-text-centered">
      <h1 class="title is-1 publication-title">CrossScope: A Role-Asymmetric World Model for Joint Dual-Scope Surgical Video Prediction</h1>
      <div class="is-size-5 publication-authors"><span class="author-block">Anonymous Submission</span></div>
      <div class="publication-links">
        <span class="link-block"><a href="static/pdfs/CrossScope.pdf" class="external-link button is-normal is-rounded is-dark"><span class="icon"><i class="fas fa-file-pdf"></i></span><span>Paper</span></a></span>
      </div>
      <img class="paper-figure" src="static/images/overview.png" alt="CrossScope overview showing directional Mother-to-Child and Child-to-Mother evidence routing.">
    </div></div></div></div>
  </section>
```

- [ ] **Step 2: Add the manuscript-grounded paper sections under the hero**

Use the exact SurgSLOT section wrapper throughout:

```html
<section class="section hero is-light content-section">
  <div class="container is-max-desktop"><div class="columns is-centered"><div class="column is-four-fifths">
    <h2 class="title is-3">Abstract</h2>
    <div class="content has-text-justified">
      <p>Visual world models typically learn future dynamics from a single observation stream, limiting their ability to model cooperative systems with multiple independently moving observers. We investigate this challenge in Mother-Child endoscopic retrograde cholangiopancreatography (ERCP), where two flexible scopes provide complementary yet role-dependent views without a calibrated stereo relationship.</p>
      <p>We propose <strong>CrossScope</strong>, a dual-stream surgical world model that preserves view-specific experts while enabling target-specific evidence routing through geometry-guided residual interactions. Geometric motion cues from the Mother view guide Child-view future dynamics, while pose-aligned Child appearance supports Mother-view prediction only when valid spatial correspondence is established.</p>
    </div>
  </div></div></div>
</section>

<section class="section content-section"><div class="container is-max-desktop"><div class="columns is-vcentered"><div class="column is-5">
  <h2 class="title is-3">Why role asymmetry?</h2>
  <div class="content"><p>The wide-view Mother duodenoscope provides global spatial context and observes the Child-scope tip. The near-field Child cholangioscope advances into narrow bile ducts to reveal local anatomy. Because the two scopes are independently controlled, their pose, scale, overlap, and visible content vary throughout a procedure.</p></div>
</div><div class="column is-7"><div class="highlight-box"><strong>Routing contract.</strong> M2C passes a geometric motion description to the Child expert. C2M writes observed Child appearance only where predicted Mother-plane correspondence licenses the residual.</div></div></div></div></section>

<section class="section content-section" style="background-color: #fafafa;"><div class="container is-max-desktop has-text-centered">
  <h2 class="title is-3">CrossScope architecture</h2>
  <img class="paper-figure" src="static/images/architecture.png" alt="CrossScope dual-stream world model architecture with M2C geometry and C2M appearance routes.">
  <p class="paper-caption"><strong>Target-specific residual exchange.</strong> The Mother and Child experts retain separate view-specific representations while directional M2C and C2M routes admit only task-valid cross-view evidence.</p>
</div></section>
```

- [ ] **Step 3: Add all Table 1 values and the result, qualitative, ablation, citation, and footer sections**

Build the results table with the following exact CrossScope row and the matching Cosmos-H-Surgical comparison row; include the remaining four baseline rows from Table 1 before them:

```html
<section class="section content-section"><div class="container is-max-desktop">
  <h2 class="title is-3 has-text-centered">End-to-end results on the phantom benchmark</h2>
  <div class="table-container"><table class="table is-fullwidth is-hoverable results-table">
    <thead><tr><th>Model</th><th>Child PSNR</th><th>Child SSIM</th><th>Child FID</th><th>Mother PSNR</th><th>Mother SSIM</th><th>Mother FID</th></tr></thead>
    <tbody>
      <tr><td>Cosmos-H-Surgical</td><td>35.123</td><td>0.943</td><td>17.431</td><td>35.774</td><td>0.969</td><td>33.617</td></tr>
      <tr class="ours"><td>CrossScope</td><td>35.906</td><td>0.951</td><td>17.402</td><td>37.147</td><td>0.973</td><td>28.232</td></tr>
    </tbody>
  </table></div>
  <div class="content has-text-centered"><p>CrossScope also reaches 0.948 Mother mask IoU, 0.839 Child papilla box IoU, 0.927 detection recall, 19.343 px endpoint error, and 11.238 px centerline error.</p></div>
</div></section>

<section class="section content-section" style="background-color: #fafafa;"><div class="container is-max-desktop has-text-centered">
  <h2 class="title is-3">Qualitative future prediction</h2>
  <img class="paper-figure" src="static/images/qualitative.png" alt="Real-world Mother-view and phantom Child-view qualitative future prediction comparison.">
  <p class="paper-caption">Figure 4 from the manuscript compares ground truth, Cosmos-H-Surgical, and CrossScope for a real-world Mother sequence and a phantom Child sequence.</p>
</div></section>

<section class="section content-section"><div class="container is-max-desktop"><div class="columns is-vcentered"><div class="column is-6">
  <h2 class="title is-3">Geometry-licensed C2M support</h2>
  <div class="content"><p>Current anchor-aligned appearance and strictly causal history are admitted separately. Their support is projected into the Mother plane, allowing a Current-only, History-only, dual-source, or Null write rather than unconditional cross-attention.</p></div>
</div><div class="column is-6"><img class="paper-figure" src="static/images/spatial-support.png" alt="C2M spatial-support diagnostic showing current, causal-history, and final injection-state maps."></div></div></div></section>

<section class="section content-section" style="background-color: #fafafa;"><div class="container is-max-desktop"><h2 class="title is-3 has-text-centered">Citation</h2><pre><code>@misc{crossscope2026,
  title={CrossScope: A Role-Asymmetric World Model for Joint Dual-Scope Surgical Video Prediction},
  author={Anonymous Submission},
  year={2026},
  note={Anonymous submission for review}
}</code></pre></div></section>

<footer class="footer"><div class="content has-text-centered"><p>This project page strictly adapts the <a href="https://github.com/jinlab-imvr/SurgSLOT">SurgSLOT template</a>, itself acknowledging <a href="https://nerfies.github.io/">Nerfies</a>. Template source license: CC BY-SA 4.0.</p></div></footer>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script><script src="static/js/index.js"></script>
</body></html>
```

Populate the four omitted baseline rows with the manuscript's Table 1 values:

| Model | Child PSNR | Child SSIM | Child FID | Mother PSNR | Mother SSIM | Mother FID |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| HunyuanVideo-I2V | 34.332 | 0.942 | 18.213 | 35.112 | 0.953 | 34.324 |
| Wan2.2 | 35.003 | 0.940 | 17.986 | 35.001 | 0.956 | 34.618 |
| Early-Fusion Wan2.2 | 30.790 | 0.915 | 20.190 | 35.432 | 0.966 | 33.378 |
| Symmetric Cross-Attention MoT | 33.326 | 0.931 | 18.369 | 36.298 | 0.966 | 29.019 |

- [ ] **Step 4: Run the contract test**

Run: `node --test tests/site.test.mjs`

Expected: PASS for all three static contract tests.

- [ ] **Step 5: Commit the page markup**

```powershell
git add index.html
git commit -m "feat: add CrossScope project page"
```

### Task 5: Add local-preview instructions and complete browser verification

**Files:**
- Create: `README.md`
- Test: `tests/site.test.mjs`

- [ ] **Step 1: Add the exact local-preview and attribution instructions**

```markdown
# CrossScope Project Page

Static academic project page for the anonymous CrossScope manuscript.

## Preview

```powershell
python -m http.server 4173 --directory .
```

Open `http://localhost:4173/` and verify the Paper button opens `static/pdfs/CrossScope.pdf`.

## Sources and attribution

Paper figures and technical claims are rendered from the supplied `CrossScope.pdf` manuscript. Page structure and styling strictly adapt the SurgSLOT `website` branch, which is released under CC BY-SA 4.0 and acknowledges Nerfies.
```

- [ ] **Step 2: Run the static contract suite**

Run: `node --test tests/site.test.mjs`

Expected: PASS, including the README presence check.

- [ ] **Step 3: Preview with a local HTTP server and inspect resource responses**

Run: `python -m http.server 4173 --directory .`

In the browser, load `http://localhost:4173/`, then verify:

1. The title, anonymous author line, and Paper button match the manuscript.
2. All four `static/images/*.png` responses return HTTP 200 and render without clipping.
3. The Paper button returns the local PDF.
4. The console is free of JavaScript errors; the inherited carousel initializer may find no carousel and must not error.
5. Narrow viewport layout keeps tables horizontally scrollable and images inside their container.

- [ ] **Step 4: Commit docs and final verification state**

```powershell
git add README.md docs/superpowers/plans/2026-07-30-crossscope-project-page.md
git commit -m "docs: add CrossScope page preview instructions"
```
