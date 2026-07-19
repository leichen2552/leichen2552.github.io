import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, '_site');
const sourcePosts = fs.readdirSync(path.join(root, 'content', 'posts')).filter((name) => name.endsWith('.md'));
const builtPosts = fs.readdirSync(path.join(output, 'post'), { withFileTypes: true }).filter((entry) => entry.isDirectory());
const failures = [];
const knownMissing = new Set([
  'post-images/1582874273999.jpg'
]);

if (sourcePosts.length !== builtPosts.length) {
  failures.push(`post count differs: ${sourcePosts.length} sources, ${builtPosts.length} outputs`);
}

for (const name of sourcePosts) {
  const slug = name.slice(0, -3);
  const file = path.join(output, 'post', slug, 'index.html');
  if (!fs.existsSync(file)) {
    failures.push(`missing post: ${slug}`);
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes('src="https://giscus.app/client.js"')) failures.push(`missing Giscus comments: ${slug}`);
  if (!html.includes('data-mapping="pathname"')) failures.push(`incorrect Giscus mapping: ${slug}`);
}

for (const required of [
  'index.html',
  'archives/index.html',
  'tags/index.html',
  'search/index.html',
  'posts/index.html',
  'atom.xml',
  'CNAME',
  '.nojekyll'
]) {
  if (!fs.existsSync(path.join(output, required))) failures.push(`missing required output: ${required}`);
}

const aboutHtml = fs.readFileSync(path.join(output, 'post', 'about', 'index.html'), 'utf8');
if (!aboutHtml.includes('katex@0.17.0/dist/contrib/auto-render.min.js')) {
  failures.push('About page is missing the KaTeX auto-render script');
}
if (!aboutHtml.includes('renderMathInElement(document.body')) {
  failures.push('About page is missing the KaTeX auto-render initialization');
}

const htmlFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) htmlFiles.push(full);
  }
}
walk(output);

const archiveFiles = [path.join(output, 'archives', 'index.html')];
const archivePageDir = path.join(output, 'archives', 'page');
if (fs.existsSync(archivePageDir)) {
  archiveFiles.push(...fs.readdirSync(archivePageDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d+$/.test(entry.name))
    .sort((a, b) => Number(a.name) - Number(b.name))
    .map((entry) => path.join(archivePageDir, entry.name, 'index.html')));
}

const archiveDates = archiveFiles.flatMap((file) => {
  const html = fs.readFileSync(file, 'utf8');
  return [...html.matchAll(/class=["']archive-item-date["'][^>]*>(\d{4}-\d{2}-\d{2})/g)]
    .map((match) => match[1]);
});
for (let index = 1; index < archiveDates.length; index += 1) {
  if (archiveDates[index] > archiveDates[index - 1]) {
    failures.push(`archive dates are not newest-first: ${archiveDates[index - 1]} before ${archiveDates[index]}`);
    break;
  }
}

function localTarget(raw, sourceFile) {
  if (!raw || raw.startsWith('#') || raw.startsWith('//')) return null;
  if (/^(mailto:|tel:|javascript:|data:)/i.test(raw)) return null;
  let pathname = raw.split(/[?#]/, 1)[0];
  if (/^https?:\/\//i.test(pathname)) {
    let parsed;
    try { parsed = new URL(pathname); } catch { return null; }
    if (parsed.hostname !== 'leichen2552.github.io' && parsed.hostname !== 'c3ll.top') return null;
    pathname = parsed.pathname;
  }
  try { pathname = decodeURI(pathname); } catch {}
  const resolved = pathname.startsWith('/')
    ? path.join(output, pathname)
    : path.resolve(path.dirname(sourceFile), pathname);
  if (pathname.endsWith('/')) return path.join(resolved, 'index.html');
  if (path.extname(resolved)) return resolved;
  if (fs.existsSync(resolved)) return resolved;
  return path.join(resolved, 'index.html');
}

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  if (/(?:[=>"']undefined[<"']|href="undefined|src="undefined)/.test(html)) {
    failures.push(`rendered placeholder found: ${path.relative(output, file)}`);
  }
  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
    const target = localTarget(match[1], file);
    const relativeTarget = target ? path.relative(output, target) : '';
    if (target && !fs.existsSync(target) && !knownMissing.has(relativeTarget)) {
      failures.push(`broken local link in ${path.relative(output, file)}: ${match[1]}`);
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Verified ${builtPosts.length} posts and ${htmlFiles.length} HTML pages.`);
