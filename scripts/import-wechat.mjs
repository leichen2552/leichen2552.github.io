import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = process.argv[2] ? path.resolve(process.argv[2]) : '';

if (!sourceRoot || !fs.existsSync(sourceRoot)) {
  console.error('Usage: npm run import:wechat -- "/path/to/wechat-export"');
  process.exit(1);
}

const postsDir = path.join(root, 'content', 'posts');
const imagesRoot = path.join(root, 'post-images', 'wechat-ssd');
const articleDirectories = fs.readdirSync(sourceRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^\d{4}-\d{2}-\d{2} /.test(entry.name))
  .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));

function extractDivInner(html, id) {
  const opening = new RegExp(`<div\\b[^>]*\\bid=["']${id}["'][^>]*>`, 'i').exec(html);
  if (!opening) throw new Error(`Cannot find #${id}`);

  const start = opening.index + opening[0].length;
  const divTags = /<\/?div\b[^>]*>/gi;
  divTags.lastIndex = start;
  let depth = 1;
  let match;
  while ((match = divTags.exec(html))) {
    if (/^<\/div/i.test(match[0])) depth -= 1;
    else depth += 1;
    if (depth === 0) return html.slice(start, match.index).trim();
  }
  throw new Error(`Cannot find closing tag for #${id}`);
}

function findAttribute(tag, attribute) {
  const match = new RegExp(`\\b${attribute}=["']([^"']+)["']`, 'i').exec(tag || '');
  return match?.[1] || '';
}

function publicationDate(html, fallbackDate) {
  const match = /id=["']publish_time["'][^>]*>(\d{4})年(\d{2})月(\d{2})日\s+(\d{2}):(\d{2})</i.exec(html);
  if (!match) return `${fallbackDate} 00:00:00`;
  return `${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]}:00`;
}

function yamlString(value) {
  return JSON.stringify(value).replaceAll('\\u2028', '\\u2028').replaceAll('\\u2029', '\\u2029');
}

function copyAsset(articleDir, slug, relativeAsset) {
  const cleanRelative = relativeAsset.split(/[?#]/, 1)[0];
  const source = path.resolve(articleDir, cleanRelative);
  const assetsDir = path.resolve(articleDir, 'assets');
  if (!source.startsWith(`${assetsDir}${path.sep}`) || !fs.existsSync(source)) {
    throw new Error(`Missing or invalid asset: ${relativeAsset}`);
  }
  const destinationDir = path.join(imagesRoot, slug);
  fs.mkdirSync(destinationDir, { recursive: true });
  const destination = path.join(destinationDir, path.basename(source));
  fs.copyFileSync(source, destination);
  return `/post-images/wechat-ssd/${slug}/${path.basename(source)}`;
}

fs.mkdirSync(postsDir, { recursive: true });
fs.mkdirSync(imagesRoot, { recursive: true });

const imported = [];
let copiedImages = 0;

for (const entry of articleDirectories) {
  const articleDir = path.join(sourceRoot, entry.name);
  const htmlPath = path.join(articleDir, 'index.html');
  if (!fs.existsSync(htmlPath)) continue;

  const directoryMatch = /^(\d{4}-\d{2}-\d{2})\s+(.+)$/.exec(entry.name);
  const [, directoryDate, directoryTitle] = directoryMatch;
  const slug = `ssd-${directoryDate}`;
  const html = fs.readFileSync(htmlPath, 'utf8');
  let body = extractDivInner(html, 'js_content');

  const copied = new Map();
  body = body.replace(/\.\/assets\/[^"')\s>]+\.(?:png|jpe?g|gif|webp|svg)(?:\?[^"')\s>]*)?/gi, (asset) => {
    const normalized = asset.replaceAll('&amp;', '&');
    if (!copied.has(normalized)) {
      copied.set(normalized, copyAsset(articleDir, slug, normalized));
      copiedImages += 1;
    }
    return copied.get(normalized);
  });

  const coverTag = /<img\b[^>]*\balt=["']cover_image["'][^>]*>/i.exec(html)?.[0] || '';
  const coverSource = findAttribute(coverTag, 'src');
  let feature = '';
  if (/^\.\/assets\//i.test(coverSource)) {
    const normalized = coverSource.replaceAll('&amp;', '&');
    feature = copied.get(normalized) || copyAsset(articleDir, slug, normalized);
    if (!copied.has(normalized)) copiedImages += 1;
  }

  const markdown = `---\n` +
    `title: ${yamlString(directoryTitle)}\n` +
    `date: ${yamlString(publicationDate(html, directoryDate))}\n` +
    `tags: [SSD, 公众号]\n` +
    `published: true\n` +
    `hideInList: false\n` +
    `feature: ${yamlString(feature)}\n` +
    `---\n` +
    `<div class="wechat-article" style="max-width: 667px; margin: 0 auto;">\n${body}\n</div>\n`;

  fs.writeFileSync(path.join(postsDir, `${slug}.md`), markdown);
  imported.push({ slug, title: directoryTitle, date: publicationDate(html, directoryDate), images: copied.size });
}

if (imported.length !== articleDirectories.length) {
  console.error(`Found ${articleDirectories.length} article directories but imported ${imported.length}.`);
  process.exit(1);
}

for (const post of imported) {
  console.log(`${post.date.slice(0, 10)}  ${post.slug}  ${post.title}  (${post.images} body images)`);
}
console.log(`Imported ${imported.length} WeChat articles and copied ${copiedImages} image files.`);
