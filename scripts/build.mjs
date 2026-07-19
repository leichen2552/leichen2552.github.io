import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import ejs from 'ejs';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, '_site');
const contentDir = path.join(root, 'content', 'posts');
const themeDir = path.join(root, 'theme');
const config = JSON.parse(fs.readFileSync(path.join(root, 'site.config.json'), 'utf8'));
const now = Date.now();

const slugify = (text) => text
  .trim()
  .toLowerCase()
  .replace(/<[^>]+>/g, '')
  .replace(/[\s]+/g, '-')
  .replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~，。！？、：“”‘’（）【】]/g, '');

const md = new MarkdownIt({ html: true, linkify: true, typographer: false })
  .use(markdownItAnchor, { slugify });

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function write(relativePath, contents) {
  const destination = path.join(output, relativePath);
  ensureDir(path.dirname(destination));
  fs.writeFileSync(destination, contents);
}

function copy(relativePath) {
  const source = path.join(root, relativePath);
  if (!fs.existsSync(source)) return;
  const destination = path.join(output, relativePath);
  ensureDir(path.dirname(destination));
  fs.cpSync(source, destination, { recursive: true });
}

function escapeXml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function plainText(markdown = '') {
  return markdown
    .replace(/```[^\n]*\n/g, '')
    .replace(/```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_~\-|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function readingStats(markdown) {
  const text = plainText(markdown);
  const han = (text.match(/[\u3400-\u9fff]/g) || []).length;
  const latin = (text.match(/[A-Za-z0-9_]+/g) || []).length;
  const words = han + latin;
  const minutes = Math.max(1, Math.ceil(words / 300));
  return { text: `${minutes} min read`, time: minutes * 60000, words, minutes };
}

function tocFrom(markdown) {
  const tokens = md.parse(markdown, {});
  const headings = [];
  for (let i = 0; i < tokens.length; i += 1) {
    if (tokens[i].type !== 'heading_open') continue;
    const level = Number(tokens[i].tag.slice(1));
    const title = tokens[i + 1]?.content || '';
    headings.push({ level, title, id: slugify(title) });
  }
  if (!headings.length) return '';
  let html = '<ul class="markdownIt-TOC">\n';
  let level = headings[0].level;
  for (const heading of headings) {
    while (heading.level > level) { html += '<ul>\n'; level += 1; }
    while (heading.level < level) { html += '</li>\n</ul>\n'; level -= 1; }
    if (!html.endsWith('>\n')) html += '</li>\n';
    html += `<li><a href="#${encodeURI(heading.id)}">${ejs.escapeXML(heading.title)}</a>`;
  }
  while (level > headings[0].level) { html += '</li>\n</ul>\n'; level -= 1; }
  return `${html}</li>\n</ul>`;
}

function fallbackTagPath(name) {
  return crypto.createHash('sha1').update(name).digest('base64url').slice(0, 11);
}

function render(template, data) {
  return ejs.render(fs.readFileSync(path.join(themeDir, template), 'utf8'), data, {
    filename: path.join(themeDir, template)
  });
}

function pagination(base, page, totalPages) {
  const href = (number) => number === 1 ? `/${base}/` : `/${base}/page/${number}/`;
  return {
    prev: page > 1 ? href(page - 1) : '',
    next: page < totalPages ? href(page + 1) : ''
  };
}

fs.rmSync(output, { recursive: true, force: true });
ensureDir(output);

for (const item of ['media', 'styles', 'images', 'post-images']) copy(item);
for (const item of ['favicon.ico', 'CNAME', 'wechat.jpg', 'alipay.jpg', 'Cat and Mouse.mp3', '简单爱-周杰伦.mp3']) copy(item);
if (fs.existsSync(path.join(root, '404.html'))) copy('404.html');
write('.nojekyll', '');

const rawPosts = fs.readdirSync(contentDir)
  .filter((name) => name.endsWith('.md'))
  .map((name) => {
    const fileName = name.slice(0, -3);
    const source = fs.readFileSync(path.join(contentDir, name), 'utf8');
    const parsed = matter(source);
    const hasInlineToc = /^\s*@\[toc\]/i.test(parsed.content);
    return {
      fileName,
      data: parsed.data,
      hasInlineToc,
      markdown: parsed.content.replace(/^\s*@\[toc\]\s*/i, '')
    };
  })
  .filter((post) => post.data.published !== false)
  .sort((a, b) => String(b.data.date).localeCompare(String(a.data.date)));

const tagNames = [...new Set(rawPosts.flatMap((post) => post.data.tags || []))];
const tags = tagNames.map((name) => {
  const tagPath = config.tagPaths[name] || fallbackTagPath(name);
  return { name, path: tagPath, link: `${config.domain}/tag/${tagPath}/` };
});
const tagsByName = new Map(tags.map((tag) => [tag.name, tag]));

const posts = rawPosts.map((post) => {
  const date = typeof post.data.date === 'string'
    ? post.data.date
    : new Date(post.data.date).toISOString().replace('T', ' ').slice(0, 19);
  const description = plainText(post.markdown);
  const toc = tocFrom(post.markdown);
  return {
    fileName: post.fileName,
    title: post.data.title || post.fileName,
    date,
    dateFormat: date.slice(0, 10),
    tags: (post.data.tags || []).map((name) => tagsByName.get(name)),
    published: post.data.published !== false,
    hideInList: Boolean(post.data.hideInList),
    feature: post.data.feature || '',
    isTop: Boolean(post.data.isTop),
    abstract: '',
    description: description.slice(0, 220),
    content: `${post.hasInlineToc && toc ? `<p>${toc}</p>\n` : ''}${md.render(post.markdown)}`,
    toc,
    stats: readingStats(post.markdown),
    link: `${config.domain}/post/${post.fileName}/`
  };
});

const visiblePosts = posts.filter((post) => !post.hideInList);
for (let index = 0; index < visiblePosts.length; index += 1) {
  visiblePosts[index].prevPost = visiblePosts[index + 1] || null;
  visiblePosts[index].nextPost = visiblePosts[index - 1] || null;
}

const themeConfig = {
  siteName: config.siteName,
  siteDescription: config.siteDescription,
  domain: config.domain,
  showFeatureImage: config.showFeatureImage,
  footerInfo: config.footerInfo
};
const commentSetting = { showComment: false, commentPlatform: '' };
const utils = { now };
const site = {
  posts,
  tags,
  menus: config.menus,
  themeConfig,
  customConfig: config.theme,
  utils
};
const common = {
  site,
  themeConfig,
  customConfig: config.theme,
  menus: config.menus,
  commentSetting
};

for (const post of posts) {
  write(`post/${post.fileName}/index.html`, render('post.ejs', { ...common, post }));
}

const homePages = Math.max(1, Math.ceil(visiblePosts.length / config.postPageSize));
for (let page = 1; page <= homePages; page += 1) {
  const pagePosts = visiblePosts.slice((page - 1) * config.postPageSize, page * config.postPageSize);
  const pageSite = { ...site, posts: pagePosts };
  const html = render('index.ejs', { ...common, site: pageSite, pagination: pagination('', page, homePages) });
  write(page === 1 ? 'index.html' : `page/${page}/index.html`, html);
}

write('posts/index.html', render('posts.ejs', common));
write('tags/index.html', render('tags.ejs', common));
write('friends/index.html', render('friends.ejs', common));
write('search/index.html', render('search.ejs', common));
write('api-info/index.html', render('api-info.ejs', common));
write('api-content/index.html', render('api-content.ejs', common));

const archivePages = Math.max(1, Math.ceil(visiblePosts.length / config.archivesPageSize));
for (let page = 1; page <= archivePages; page += 1) {
  const pagePosts = visiblePosts.slice((page - 1) * config.archivesPageSize, page * config.archivesPageSize);
  const html = render('archives.ejs', {
    ...common,
    posts: pagePosts,
    pagination: pagination('archives', page, archivePages)
  });
  write(page === 1 ? 'archives/index.html' : `archives/page/${page}/index.html`, html);
}

for (const tag of tags) {
  const tagPosts = posts.filter((post) => post.tags.some((item) => item.name === tag.name));
  const pageSize = config.postPageSize;
  const totalPages = Math.max(1, Math.ceil(tagPosts.length / pageSize));
  for (let page = 1; page <= totalPages; page += 1) {
    const pagePosts = tagPosts.slice((page - 1) * pageSize, page * pageSize);
    const base = `tag/${tag.path}`;
    const html = render('tag.ejs', {
      ...common,
      posts: pagePosts,
      tag,
      pagination: pagination(base, page, totalPages)
    });
    write(page === 1 ? `${base}/index.html` : `${base}/page/${page}/index.html`, html);
  }
}

const feedPosts = visiblePosts.slice(0, 10);
const updated = feedPosts[0]?.date.replace(' ', 'T') + '+08:00';
const entries = feedPosts.map((post) => `  <entry>\n    <title>${escapeXml(post.title)}</title>\n    <link href="${escapeXml(post.link)}"/>\n    <id>${escapeXml(post.link)}</id>\n    <updated>${post.date.replace(' ', 'T')}+08:00</updated>\n    <summary>${escapeXml(post.description)}</summary>\n  </entry>`).join('\n');
write('atom.xml', `<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n  <title>${escapeXml(config.siteName)}</title>\n  <link href="${config.domain}/atom.xml" rel="self"/>\n  <link href="${config.domain}/"/>\n  <updated>${updated}</updated>\n  <id>${config.domain}/</id>\n  <author><name>${escapeXml(config.author)}</name></author>\n${entries}\n</feed>\n`);

console.log(`Built ${posts.length} posts, ${tags.length} tags, and ${homePages} index pages into _site.`);
