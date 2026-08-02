# Lazy Music Player Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the broken empty playlist with five licensed quiet instrumental tracks while adding no player or audio requests to the initial article load.

**Architecture:** `site.config.json` owns track metadata and attribution URLs; the existing build copies local audio and player assets through `media/`. The footer renders a tiny fixed launcher and loads vendored APlayer CSS/JavaScript only after the visitor activates it, with `autoplay: false` and `preload: "none"`.

**Tech Stack:** Node.js 22, EJS templates, APlayer 1.10.1, static HTML/CSS/JavaScript, GitHub Pages.

## Global Constraints

- Initial HTML must not statically request APlayer JavaScript, APlayer CSS, a cover image, or an MP3.
- Player resources load only after the first click on the lower-left launcher.
- Audio uses `autoplay: false` and `preload: "none"`.
- MP3 files must come from the five official Scott Buckley track download links and remain locally hosted under `media/audio/`.
- Every track must receive visible attribution with its official page and the CC BY 4.0 license link.
- Existing page content and unrelated theme behavior remain unchanged.

---

### Task 1: Add failing site-integrity checks

**Files:**
- Modify: `scripts/check-site.mjs:5-49`

**Interfaces:**
- Consumes: `site.config.json`, source assets in `media/audio/`, and generated `_site/index.html`.
- Produces: build failures describing invalid playlist metadata, missing audio, eager player loading, unsafe playback defaults, missing attribution, or legacy song references.

- [ ] **Step 1: Write the failing checks**

Load the configuration and define the expected names:

```js
const config = JSON.parse(fs.readFileSync(path.join(root, 'site.config.json'), 'utf8'));
const expectedTracks = ['Cobalt', 'Snowfall', 'A New Year', 'Childhood', 'Life Is'];
const tracks = config.theme?.musics || [];
```

Require exactly those five named local MP3 records, author `Scott Buckley`, empty `pic`, non-empty `source`, and existing source/build files. Check `_site/index.html` contains `id="music-launcher"`, `/media/script/APlayer.min.js`, `/media/css/APlayer.min.css`, `preload: "none"`, `autoplay: false`, `music-attribution`, and no static `<head>` APlayer tags or legacy filenames.

- [ ] **Step 2: Run the check and verify it fails for the empty playlist**

Run: `npm run build && npm run check`

Expected: FAIL with messages for the invalid playlist and missing lazy-player markers.

- [ ] **Step 3: Commit the failing checks**

```bash
git add scripts/check-site.mjs
git commit -m "test: define lazy music player requirements"
```

### Task 2: Add licensed audio and playlist metadata

**Files:**
- Create: `media/audio/cobalt.mp3`
- Create: `media/audio/snowfall.mp3`
- Create: `media/audio/a-new-year.mp3`
- Create: `media/audio/childhood.mp3`
- Create: `media/audio/life-is.mp3`
- Modify: `site.config.json:83-85`
- Modify: `scripts/build.mjs:130-132`
- Delete: `Cat and Mouse.mp3`
- Delete: `简单爱-周杰伦.mp3`

**Interfaces:**
- Consumes: official MP3 downloads from `scottbuckley.com.au`.
- Produces: five `musics` entries with `name`, local `url`, `author`, empty `pic`, and official `source` attribution URL.

- [ ] **Step 1: Download only the five official full mixes**

Use these exact official URLs and save them with the paths above:

```text
https://www.scottbuckley.com.au/library/wp-content/uploads/2017/11/sb_cobalt.mp3
https://www.scottbuckley.com.au/library/wp-content/uploads/2018/12/sb_snowfall.mp3
https://www.scottbuckley.com.au/library/wp-content/uploads/2018/01/sb_anewyear.mp3
https://www.scottbuckley.com.au/library/wp-content/uploads/2019/01/sb_childhood.mp3
https://www.scottbuckley.com.au/library/wp-content/uploads/2017/10/sb_lifeis.mp3
```

- [ ] **Step 2: Verify file types before using the downloads**

Run: `file media/audio/*.mp3 && find media/audio -type f -size 0 -print`

Expected: five MPEG audio files and no output from the zero-byte search.

- [ ] **Step 3: Replace the empty playlist and legacy copy rules**

Use local URLs `/media/audio/<filename>.mp3`, author `Scott Buckley`, empty `pic`, and source URLs `https://www.scottbuckley.com.au/library/<track-slug>/`. Remove the two root MP3 names from `scripts/build.mjs`; `copy('media')` already publishes the new files.

- [ ] **Step 4: Remove the two legacy root MP3 files**

Run: `git rm 'Cat and Mouse.mp3' '简单爱-周杰伦.mp3'`

- [ ] **Step 5: Run the integrity check and confirm only rendering requirements still fail**

Run: `npm run build && npm run check`

Expected: playlist and audio-file checks pass; lazy-player HTML checks still fail.

- [ ] **Step 6: Commit the licensed playlist assets**

```bash
git add site.config.json scripts/build.mjs media/audio
git commit -m "feat: add licensed instrumental playlist"
```

### Task 3: Implement interaction-only player loading and attribution

**Files:**
- Create: `media/css/APlayer.min.css`
- Modify: `theme/include/head.ejs:49-55`
- Modify: `theme/include/footer.ejs:1-115`
- Modify: `styles/main.css:622`

**Interfaces:**
- Consumes: `site.customConfig.musics` entries from Task 2 and local APlayer assets under `/media/`.
- Produces: `loadMusicPlayer(): Promise<void>`, `#music-launcher`, `#player`, and `.music-attribution`.

- [ ] **Step 1: Vendor the matching APlayer 1.10.1 stylesheet**

Download `https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css` to `media/css/APlayer.min.css` and verify it is non-empty CSS.

- [ ] **Step 2: Remove eager player tags from the document head**

Delete the `music == "on"` block that emits the remote APlayer script and stylesheet from `theme/include/head.ejs`.

- [ ] **Step 3: Render the lightweight launcher and attribution**

When music is enabled, render:

```html
<button id="music-launcher" type="button" aria-controls="player" aria-expanded="false">♫<span>打开音乐</span></button>
<div id="player"></div>
```

Render one compact footer attribution line with links to each `music.source`, Scott Buckley's site, and `https://creativecommons.org/licenses/by/4.0/`.

- [ ] **Step 4: Implement one-time local resource loading**

Serialize playlist data with `JSON.stringify`, attach one click handler, dynamically append `/media/css/APlayer.min.css` and `/media/script/APlayer.min.js`, then initialize:

```js
new APlayer({
  container: document.getElementById('player'),
  fixed: true,
  autoplay: false,
  preload: "none",
  audio: musicList
});
```

Disable the launcher while loading, remove it after success, and replace its label with `音乐加载失败` on error without throwing into unrelated page code.

- [ ] **Step 5: Style only the lightweight launcher and compact attribution**

Add fixed lower-left placement, a 44px minimum hit target, visible focus styles, dark-theme-compatible neutral colors, and small muted attribution text. Do not add background images or fonts.

- [ ] **Step 6: Run the complete static verification**

Run: `npm run build && npm run check`

Expected: PASS with `Verified 134 posts and 179 HTML pages.`

- [ ] **Step 7: Commit the lazy player UI**

```bash
git add media/css/APlayer.min.css theme/include/head.ejs theme/include/footer.ejs styles/main.css
git commit -m "feat: lazy-load the fixed music player"
```

### Task 4: Verify browser behavior and network isolation

**Files:**
- Verify generated files under `_site/`; do not commit them.

**Interfaces:**
- Consumes: built site from Task 3.
- Produces: observed evidence that no player/audio request occurs before interaction and playback works after interaction.

- [ ] **Step 1: Start the local static server**

Run: `npm run serve` and keep the process available on `http://localhost:4000`.

- [ ] **Step 2: Inspect an article before interaction**

Open `http://localhost:4000/post/about/`; confirm article content and the lower-left launcher render, and the browser has made no request containing `APlayer` or `.mp3`.

- [ ] **Step 3: Open the player without playing**

Click `打开音乐`; confirm the fixed APlayer interface appears, the launcher disappears, and no `.mp3` response body is downloaded before pressing play.

- [ ] **Step 4: Verify all five tracks**

Press play on each playlist item and confirm the corresponding local MP3 request returns HTTP 200 with an audio content type and playback advances.

- [ ] **Step 5: Verify failure isolation and responsive layout**

Confirm the article remains readable at desktop and mobile widths and that player console errors, if any, do not prevent ordinary page interaction.

### Task 5: Publish and verify production

**Files:**
- No additional source files unless verification finds a defect.

**Interfaces:**
- Consumes: verified `codex/fix-music-player` commits.
- Produces: merged PR, completed Pages deployment, and verified production player at `https://c3ll.top`.

- [ ] **Step 1: Run final verification from a clean tree**

Run: `npm run build && npm run check && git diff --check && git status --short`

Expected: tests pass and only ignored `_site/`/`node_modules/` artifacts are absent from status.

- [ ] **Step 2: Push the branch and open a ready PR**

Push `codex/fix-music-player`, open a PR summarizing licensing and zero-initial-load behavior, and wait for GitHub checks.

- [ ] **Step 3: Merge after required checks pass**

Merge using the repository's existing PR workflow, then wait for the GitHub Pages deployment to complete successfully.

- [ ] **Step 4: Verify production**

Repeat Task 4 on `https://c3ll.top/post/about/`, confirm all five audio URLs return 200, and confirm attribution links are visible.
