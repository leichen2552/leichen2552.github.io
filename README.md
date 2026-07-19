# CLL's Blog

这是 `leichen2552.github.io` 的可维护源码仓库。站点已从 Gridea 桌面应用迁移为：

- `content/posts/`：104 篇 Markdown 原稿；
- `theme/`：原 Chic 主题模板，保留现有页面样式；
- `scripts/build.mjs`：独立静态站点构建器；
- `.github/workflows/pages.yml`：GitHub Pages 自动构建与发布。

旧的 `/post/.../`、`/tag/.../`、归档分页等 URL 均保持不变。构建结果写入 `_site/`，不会提交到 Git。

## 本地维护

需要 Node.js 22 或更高版本。

```bash
npm ci
npm run build
npm run check
npm run serve
```

浏览器打开 `http://localhost:4000` 即可预览。

## 新增文章

在 `content/posts/` 新建 Markdown 文件，文件名就是文章 URL slug：

```markdown
---
title: '文章标题'
date: 2026-07-19 12:00:00
tags: [STM32]
published: true
hideInList: false
feature:
isTop: false
---

正文内容
```

图片放入 `post-images/`，文章中使用 `/post-images/文件名.png` 引用。

## 发布

合并或推送到 `master` 后，GitHub Actions 会执行依赖安装、构建、完整性检查和 Pages 部署。仓库中不再保存或使用 GitHub Personal Access Token。

首次切换时，需要在仓库 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。这是一次性设置。

## 已知历史问题

转载文章《通信简史：5G通信为什么快于4G》引用的 `post-images/1582874273999.jpg` 在原 Gridea 数据中已经缺失。迁移保持原文引用，没有生成误导性的占位图片。
