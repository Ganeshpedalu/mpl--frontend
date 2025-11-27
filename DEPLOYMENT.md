# GitHub Pages Deployment Guide

This guide will help you deploy this React application to GitHub Pages for free.

## Prerequisites

- GitHub account
- Git installed on your machine
- Node.js and npm installed

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `mpl-season-2-frontend` (or your preferred name)
3. **Do NOT** initialize with README, .gitignore, or license

## Step 2: Update Repository Name (if different)

The repository name is hardcoded in `vite.config.ts` as `mpl--frontend`. If your repository name is different, update the file:

```typescript
// In vite.config.ts
const REPO_NAME = 'your-repo-name';
```

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Build for Production

```bash
npm run build
```

This will create an optimized `dist` folder with all production files.

## Step 5: Deploy to GitHub Pages

### Option A: Using GitHub Actions (Recommended)

1. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

2. Push to GitHub:
```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mpl-season-2-frontend.git
git push -u origin main
```

3. Enable GitHub Pages:
   - Go to repository Settings → Pages
   - Source: Select "GitHub Actions"
   - Save

### Option B: Manual Deployment

1. Install `gh-pages` package:
```bash
npm install --save-dev gh-pages
```

2. Add deploy script to `package.json`:
```json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}
```

3. Deploy:
```bash
npm run deploy
```

## Step 6: Verify Deployment

After deployment, your site will be available at:
```
https://YOUR_USERNAME.github.io/mpl--frontend/
```

## Optimization Tips

### Image Optimization

Large images and videos should be optimized:

1. **Images**: Use tools like [TinyPNG](https://tinypng.com) or [Squoosh](https://squoosh.app)
2. **Videos**: Consider hosting on YouTube/Vimeo and embedding, or use CDN
3. Current video files (15.7MB total) should be optimized or moved to external hosting

### Build Size Optimization

The build is already optimized with:
- Code minification
- Tree shaking
- Chunk splitting
- Asset inlining for small files

### Environment Variables

If using environment variables, create `.env.production`:
```
VITE_API_URL=https://your-api-url.com
VITE_REPO_NAME=mpl-season-2-frontend
```

## Troubleshooting

### 404 Errors

If you see 404 errors:
1. Check that `base` path in `vite.config.ts` matches your repository name
2. Ensure all routes use relative paths
3. Check browser console for path errors

### Build Failures

1. Clear cache: `npm run clean`
2. Reinstall: `rm -rf node_modules && npm install`
3. Check Node.js version (requires Node 18+)

### Large Repository Size

If repository is too large:
1. Ensure `node_modules` is in `.gitignore`
2. Optimize images before committing
3. Consider using Git LFS for large media files
4. Remove unused dependencies

## Repository Size Optimization

Current optimizations:
- ✅ `.gitignore` excludes `node_modules`, `dist`, and build artifacts
- ✅ Build configuration optimized for production
- ✅ Code minification enabled
- ✅ Chunk splitting for better caching

**Note**: Video files (15.7MB) should be optimized or hosted externally for best performance.

