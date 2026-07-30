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

test('paper images and the visible Paper control resolve to local paths', () => {
  const html = readFileSync('index.html', 'utf8');
  const rendered = renderedMarkup(html);
  ['overview.png', 'architecture.png', 'qualitative.png', 'spatial-support.png']
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
