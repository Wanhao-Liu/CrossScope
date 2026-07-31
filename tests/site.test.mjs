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

function openingTags(html, elementName) {
  return html.match(new RegExp(
    `<${elementName}\\b(?:[^'">]|"[^"]*"|'[^']*')*>`,
    'gi',
  )) ?? [];
}

function hasExactAttribute(tag, attributeName, value) {
  const attributes = tag
    .replace(/^<[^\s/>]+/i, '')
    .replace(/\/?>$/, '');
  const attributePattern = /([^\s"'=<>`]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

  return [...attributes.matchAll(attributePattern)].some((match) => (
    match[1].toLowerCase() === attributeName
    && [match[2], match[3], match[4]].includes(value)
  ));
}

function renderedMarkup(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(
      /<(?:script|style|template)\b(?:[^'">]|"[^"]*"|'[^']*')*>[\s\S]*?<\/(?:script|style|template)\s*>/gi,
      '',
    );
}

function anchors(html) {
  return [...html.matchAll(/(<a\b(?:[^'">]|"[^"]*"|'[^']*')*>)([\s\S]*?)<\/a\s*>/gi)];
}

function visibleText(html) {
  return html.replace(/<[^>]*>/g, ' ');
}

test('CrossScope page has its required local deliverables', () => {
  requiredFiles.forEach((file) => assert.equal(existsSync(file), true, `${file} is missing`));
});

test('CrossScope page retains the approved template contract', () => {
  const html = readFileSync('index.html', 'utf8');
  [
    'CrossScope: A Role-Asymmetric World Model for Joint Dual-Scope Surgical Video Prediction',
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

test('author block identifies co-first and corresponding authors', () => {
  const html = readFileSync('index.html', 'utf8');
  const coFirstAuthors = [
    'Wanhao Liu',
    'Jinsong Lin',
    'Rulin Zhou',
    'CHI KIT NG',
  ];
  const remainingAuthors = [
    'Wenbin Pan',
    'Zhiqing Tang',
    'Dongyue Li',
    'Miao Luo',
    'Wu Yanshen',
    'Panshuo Li',
    'Zhiyong Xiong',
    'Huxin Gao',
    'Tamas Haidegger',
  ];

  coFirstAuthors.forEach((author) => assert.match(
    html,
    new RegExp(`${author}<sup>†</sup>`),
    `${author} should be marked as a co-first author`,
  ));
  remainingAuthors.forEach((author) => assert.equal(html.includes(author), true, `${author} is missing`));
  assert.match(html, /Hongliang Ren<sup>\*<\/sup>/, 'Hongliang Ren should be marked as corresponding author');
  assert.match(html, /<sup>†<\/sup> Equal contribution\. <sup>\*<\/sup> Corresponding author\./, 'author contribution note is missing');
  assert.doesNotMatch(html, /Anonymous Submission/, 'anonymous placeholder should be removed');
});

test('paper images and the visible Paper control resolve to local paths', () => {
  const html = readFileSync('index.html', 'utf8');
  const rendered = renderedMarkup(html);
  ['overview.png', 'architecture.png', 'qualitative.png', 'c2m-cases.png']
    .forEach((file) => assert.equal(
      openingTags(rendered, 'img').some((tag) => hasExactAttribute(
        tag,
        'src',
        `static/images/${file}`,
      )),
      true,
      `<img src="static/images/${file}"> is missing`,
    ));
  assert.equal(
    anchors(rendered).some(([, tag, content]) => (
      hasExactAttribute(tag, 'href', 'static/pdfs/CrossScope.pdf')
      && /\bPaper\b/i.test(visibleText(content))
    )),
    true,
    'visible Paper control with local CrossScope PDF href is missing',
  );
});

test('role storyboard preserves full experiment figures without cropping', () => {
  const html = readFileSync('index.html', 'utf8');
  const css = readFileSync('static/css/index.css', 'utf8');

  [
    'role-example.png',
    'role-pose.png',
    'role-motion.png',
    'role-c2m-support.png',
  ].forEach((file) => {
    assert.equal(existsSync(`static/images/${file}`), true, `${file} is missing`);
    assert.equal(html.includes(`static/images/${file}`), true, `${file} is not referenced`);
  });

  const miniFigureRule = css.match(/\.mini-evidence-card img\s*\{[\s\S]*?\}/)?.[0] ?? '';
  assert.match(miniFigureRule, /object-fit:\s*contain;/, 'mini evidence figures should use contain');
  assert.doesNotMatch(miniFigureRule, /object-fit:\s*cover;/, 'mini evidence figures must not crop');
  assert.match(
    css,
    /\.mini-evidence-card:last-child\s*\{[\s\S]*?grid-column:\s*1\s*\/\s*-1;/,
    'the wide C2M support figure should use a full row',
  );
});

test('role storyboard leaves the main experiment figure unobstructed', () => {
  const html = readFileSync('index.html', 'utf8');
  const css = readFileSync('static/css/index.css', 'utf8');

  assert.doesNotMatch(html, /class="figure-badge"/, 'the main experiment figure must not contain an overlay badge');
  assert.doesNotMatch(css, /\.figure-badge\s*\{/, 'unused overlay badge styling should be removed');
});

test('multi-case C2M and data-coverage figures are local and visible', () => {
  const html = readFileSync('index.html', 'utf8');

  [
    'c2m-cases.png',
    'data-coverage.png',
  ].forEach((file) => {
    assert.equal(existsSync(`static/images/${file}`), true, `${file} is missing`);
    assert.equal(html.includes(`static/images/${file}`), true, `${file} is not referenced`);
  });

  assert.equal(
    html.includes('Dual-scope observations across phantom and real-world settings'),
    true,
    'data coverage section heading is missing',
  );
});

test('below-the-fold experiment figures are lazy-loaded', () => {
  const html = readFileSync('index.html', 'utf8');
  const rendered = renderedMarkup(html);
  const imageTags = openingTags(rendered, 'img');

  assert.equal(
    imageTags.some((tag) => hasExactAttribute(tag, 'src', 'static/images/overview.png')
      && hasExactAttribute(tag, 'loading', 'lazy')),
    false,
    'the first overview figure should not be lazy-loaded',
  );

  [
    'role-example.png',
    'role-pose.png',
    'role-motion.png',
    'role-c2m-support.png',
    'architecture.png',
    'qualitative.png',
    'c2m-cases.png',
    'data-coverage.png',
  ].forEach((file) => {
    assert.equal(
      imageTags.some((tag) => hasExactAttribute(tag, 'src', `static/images/${file}`)
        && hasExactAttribute(tag, 'loading', 'lazy')),
      true,
      `${file} should be lazy-loaded`,
    );
  });
});

test('experiment figures reserve their native aspect ratios before loading', () => {
  const html = readFileSync('index.html', 'utf8');
  const imageTags = openingTags(renderedMarkup(html), 'img');
  const dimensions = {
    'overview.png': [1200, 938],
    'role-example.png': [1860, 932],
    'role-pose.png': [1548, 750],
    'role-motion.png': [1750, 934],
    'role-c2m-support.png': [2466, 704],
    'architecture.png': [2667, 1500],
    'qualitative.png': [1860, 932],
    'c2m-cases.png': [918, 858],
    'data-coverage.png': [1834, 840],
  };

  Object.entries(dimensions).forEach(([file, [width, height]]) => {
    assert.equal(
      imageTags.some((tag) => hasExactAttribute(tag, 'src', `static/images/${file}`)
        && hasExactAttribute(tag, 'width', String(width))
        && hasExactAttribute(tag, 'height', String(height))),
      true,
      `${file} should reserve its native aspect ratio`,
    );
  });
});

test('results table fits its metric headers on desktop before falling back to scrolling', () => {
  const css = readFileSync('static/css/index.css', 'utf8');
  const headerRule = css.match(/\.results-table th\s*\{[\s\S]*?\}/)?.[0] ?? '';

  assert.match(css, /\.results-table\s*\{[\s\S]*?font-size:\s*0\.79rem;/, 'results table should use compact desktop typography');
  assert.match(headerRule, /white-space:\s*normal;/, 'results table headers should be allowed to wrap');
  assert.match(headerRule, /text-align:\s*center;/, 'results table metric headers should stay aligned');
});

test('phantom benchmark includes a Child-scope motion comparison', () => {
  const html = readFileSync('index.html', 'utf8');

  assert.match(html, /Child-scope motion quality/, 'Child-scope motion heading is missing');
  assert.match(html, /Endpoint error \(px\).*Centerline error \(px\)/, 'motion metric headers are missing');
  [
    ['HunyuanVideo-I2V', '36.068', '19.126'],
    ['Cosmos-H-Surgical', '28.880', '15.339'],
    ['Wan2.2', '35.093', '18.544'],
    ['Early-Fusion Wan2.2', '42.590', '21.733'],
    ['Symmetric Cross-Attention MoT', '31.767', '12.414'],
    ['CrossScope', '19.343', '11.238'],
  ].forEach(([model, endpoint, centerline]) => {
    assert.match(
      html,
      new RegExp(`<tr[^>]*>\\s*<td>${model}<\\/td>\\s*<td>${endpoint}<\\/td>\\s*<td>${centerline}<\\/td>\\s*<\\/tr>`),
      `${model} Child motion results are missing`,
    );
  });
});

test('Child-scope motion table fits all columns on mobile', () => {
  const css = readFileSync('static/css/index.css', 'utf8');

  assert.match(css, /\.motion-results \.results-table\s*\{[^}]*font-size:\s*0\.72rem;/, 'motion table should use compact mobile type');
  assert.match(css, /\.motion-results \.results-table th\s*\{[^}]*min-width:\s*3\.6rem;/, 'motion metric columns should shrink on mobile');
  assert.match(
    css,
    /\.motion-results \.results-table th:first-child,\s*\.motion-results \.results-table td:first-child\s*\{[^}]*min-width:\s*8\.7rem;[^}]*white-space:\s*normal;/,
    'motion model column should use a compact mobile width',
  );
});

test('Child-scope motion subtitle is not pulled into its heading', () => {
  const css = readFileSync('static/css/index.css', 'utf8');

  assert.match(
    css,
    /\.motion-results \.subtitle\s*\{[^}]*margin-top:\s*0\s*!important;/,
    'motion subtitle must override Bulma\'s negative title-adjacent margin',
  );
});

test('role evidence cards use the project page radius scale', () => {
  const css = readFileSync('static/css/index.css', 'utf8');

  [
    ['.role-story-visual', '8px'],
    ['.main-evidence-card', '8px'],
    ['.mini-evidence-card', '8px'],
  ].forEach(([selector, radius]) => {
    const escapedSelector = selector.replace('.', '\\.') ;
    assert.match(
      css,
      new RegExp(`${escapedSelector}\\s*\\{[^}]*border-radius:\\s*${radius};`),
      `${selector} should use an ${radius} radius`,
    );
  });
});
