# Reward Images and Compact Music Attribution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the existing Alipay and WeChat reward images and replace the expanded footer music credits with a compact, collapsed attribution control.

**Architecture:** Keep the existing static-site configuration and EJS rendering flow. Extend the existing site checker so it validates generated user-visible behavior, then make only the configuration, footer markup, and footer styles needed to satisfy those checks.

**Tech Stack:** Node.js, EJS, JSON configuration, CSS, static HTML, GitHub Pages.

## Global Constraints

- Use the existing `/alipay.jpg` and `/wechat.jpg` files without modifying their contents.
- Keep the reward button and hover layout unchanged.
- Preserve complete Scott Buckley and CC BY 4.0 attribution, but hide the track list inside a closed native `<details>` element by default.
- Add no JavaScript or third-party dependency for the attribution interaction.
- Preserve the music player's lazy loading and `preload: "none"` behavior.

---

### Task 1: Add failing generated-site regression checks

**Files:**
- Modify: `scripts/check-site.mjs`

**Interfaces:**
- Consumes: `site.config.json`, source reward image files, `_site/post/about/index.html`, and built reward image files.
- Produces: actionable `npm run check` failures for empty reward paths or expanded music attribution.

- [ ] **Step 1: Add reward-image behavior checks**

Read `config.theme.donate_alipay` and `config.theme.donate_wechat`. When donations are enabled, require the literal paths `/alipay.jpg` and `/wechat.jpg`, require their source and built files to exist, and require the generated About page to contain `src="/alipay.jpg"` and `src="/wechat.jpg"`.

- [ ] **Step 2: Add compact-attribution behavior checks**

Require generated home HTML to contain a closed `<details class="music-attribution">`, a `<summary>音乐版权</summary>`, the existing official track and license links, and no `open` attribute on that details element.

- [ ] **Step 3: Run the checks and verify RED**

Run: `npm run build && npm run check`

Expected: build succeeds; check fails because both reward paths are empty and the current music attribution is an always-expanded `<div>`.

- [ ] **Step 4: Commit the failing checks**

```bash
git add scripts/check-site.mjs
git commit -m "test: cover reward images and compact music credits"
```

---

### Task 2: Restore reward paths and collapse music credits

**Files:**
- Modify: `site.config.json`
- Modify: `theme/include/footer.ejs`
- Modify: `styles/main.css`

**Interfaces:**
- Consumes: the existing reward template's `site.customConfig.donate_alipay` and `site.customConfig.donate_wechat` fields and the existing music metadata.
- Produces: valid reward image URLs and a native closed attribution disclosure.

- [ ] **Step 1: Restore reward configuration**

Set `theme.donate_alipay` to `/alipay.jpg` and `theme.donate_wechat` to `/wechat.jpg`.

- [ ] **Step 2: Replace expanded attribution markup**

Change the attribution wrapper from `<div class="music-attribution">` to `<details class="music-attribution">`, add `<summary>音乐版权</summary>`, wrap the existing detailed links in `<div class="music-attribution-details">`, and close both elements. Do not add the `open` attribute.

- [ ] **Step 3: Style the compact disclosure**

Style the summary as a small muted inline control with a pointer cursor and no default list marker. Keep the detailed links readable after expansion and place them on their own compact line.

- [ ] **Step 4: Run build and checks and verify GREEN**

Run: `npm run build && npm run check`

Expected: `Built 134 posts...`; `Verified 134 posts and 179 HTML pages.`; exit code 0.

- [ ] **Step 5: Commit the implementation**

```bash
git add site.config.json theme/include/footer.ejs styles/main.css
git commit -m "fix: restore reward images and collapse music credits"
```

---

### Task 3: Validate the rendered result and publish

**Files:**
- Verify: `_site/post/about/index.html`
- Verify: `_site/alipay.jpg`
- Verify: `_site/wechat.jpg`

**Interfaces:**
- Consumes: the completed static build.
- Produces: browser and HTTP evidence that the user-visible defects are fixed.

- [ ] **Step 1: Run final repository verification**

Run: `git diff --check origin/master...HEAD && npm run build && npm run check`.

Expected: all commands exit 0 and the worktree remains clean.

- [ ] **Step 2: Verify locally in a browser**

Open a generated article page. Confirm the reward images use `/alipay.jpg` and `/wechat.jpg`; confirm only “音乐版权” is visible initially; expand it once and confirm the five tracks, author, mirror links, and CC BY 4.0 link appear.

- [ ] **Step 3: Publish through a ready PR**

Push `codex/fix-reward-images`, create a ready PR against `master`, merge after validation, and wait for the GitHub Pages workflow associated with the merge commit to complete successfully.

- [ ] **Step 4: Verify production**

Check `https://c3ll.top/post/about/`, `https://c3ll.top/alipay.jpg`, and `https://c3ll.top/wechat.jpg`. Confirm the page contains the two non-empty reward paths and the closed music attribution disclosure; confirm both images return HTTP 200 with an image content type.
