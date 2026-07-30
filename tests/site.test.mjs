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
