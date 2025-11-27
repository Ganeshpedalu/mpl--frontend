# Quick Start: Deploy to GitHub Pages

## ✅ Repository Optimized!

Your repository has been optimized for GitHub Pages deployment. Here's what was done:

### Optimizations Applied

1. **Build Configuration** (`vite.config.ts`)
   - ✅ Minification enabled (esbuild)
   - ✅ Console logs removed in production
   - ✅ Code splitting for better caching
   - ✅ Asset inlining for small files

2. **Git Ignore** (`.gitignore`)
   - ✅ Excludes `node_modules` (saves ~200MB+)
   - ✅ Excludes build artifacts
   - ✅ Excludes environment files

3. **GitHub Actions** (`.github/workflows/deploy.yml`)
   - ✅ Automated deployment workflow
   - ✅ Builds and deploys on every push

4. **Documentation**
   - ✅ `DEPLOYMENT.md` - Complete deployment guide
   - ✅ `OPTIMIZATION.md` - Optimization details

## 🚀 Deploy in 3 Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Optimized for GitHub Pages deployment"
git push origin main
```

### Step 2: Enable GitHub Pages
1. Go to your repository on GitHub
2. Settings → Pages
3. Source: Select "GitHub Actions"
4. Save

### Step 3: Wait for Deployment
- GitHub Actions will automatically build and deploy
- Your site will be live at: `https://YOUR_USERNAME.github.io/mpl--frontend/`

## ⚠️ Important Notes

### Large Files (15.7MB videos)
The following files should be optimized or moved:
- `public/images/gallery/match-action.mp4` (8.2MB)
- `public/images/gallery/trophy-moment.mp4` (7.5MB)

**Options:**
1. Compress videos using [HandBrake](https://handbrake.fr/)
2. Host on YouTube/Vimeo and embed
3. Use CDN (Cloudinary, etc.)

### Repository Name
The repository name is hardcoded in `vite.config.ts` as `mpl--frontend`. If your GitHub repository name is different, update the file:
```typescript
// In vite.config.ts, line 7
const REPO_NAME = 'your-actual-repo-name';
```

## 📊 Expected Results

- **Build size**: ~200-500KB (gzipped)
- **Repository size**: <50MB (excluding node_modules)
- **Load time**: <2 seconds
- **Lighthouse score**: 90+

## 📚 More Information

- See `DEPLOYMENT.md` for detailed deployment instructions
- See `OPTIMIZATION.md` for optimization details

## 🎉 You're Ready!

Your repository is now optimized and ready for GitHub Pages deployment!

