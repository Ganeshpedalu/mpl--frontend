# Repository Optimization Guide

This document outlines the optimizations applied to reduce repository size and improve build performance.

## Current Optimizations

### 1. Build Configuration (`vite.config.ts`)
- ✅ **Minification**: Terser minification enabled
- ✅ **Console Removal**: All `console.log` statements removed in production
- ✅ **Chunk Splitting**: Code split into vendor chunks for better caching
- ✅ **Asset Inlining**: Small assets (<4KB) are inlined to reduce HTTP requests
- ✅ **Source Maps**: Disabled in production to reduce bundle size

### 2. Git Ignore (`.gitignore`)
- ✅ Excludes `node_modules` (largest folder)
- ✅ Excludes build artifacts (`dist`, `build`)
- ✅ Excludes environment files (`.env`)
- ✅ Excludes editor and OS files
- ✅ Excludes cache and temporary files

### 3. Package Scripts
- ✅ Added `clean` script to remove build artifacts
- ✅ Optimized build process

## File Size Analysis

### Large Files to Optimize

**Videos** (15.7MB total):
- `public/images/gallery/match-action.mp4` - 8.2MB
- `public/images/gallery/trophy-moment.mp4` - 7.5MB

**Recommendations**:
1. **Compress videos**: Use tools like [HandBrake](https://handbrake.fr/) or [FFmpeg](https://ffmpeg.org/)
2. **Host externally**: Upload to YouTube/Vimeo and embed
3. **Use CDN**: Host on Cloudinary, Imgix, or similar services
4. **Convert format**: Use WebM format for better compression

**Images** (1.4MB total):
- All images are relatively small (80KB-353KB)
- Can be further optimized using:
  - [TinyPNG](https://tinypng.com) for JPEG/PNG
  - [Squoosh](https://squoosh.app) for advanced optimization
  - Convert to WebP format for better compression

## Additional Optimization Steps

### 1. Remove Unused Dependencies

Check if all dependencies are used:
```bash
# Check for unused dependencies
npx depcheck
```

**Potential removals** (if not used):
- `@supabase/supabase-js` - Check if actually used in components

### 2. Image Optimization Commands

```bash
# Install image optimization tools
npm install --save-dev sharp-cli

# Optimize all images
npx sharp-cli -i public/images/**/*.{jpg,jpeg,png} -o public/images-optimized
```

### 3. Video Optimization

```bash
# Using FFmpeg (install separately)
ffmpeg -i input.mp4 -vcodec libx264 -crf 28 -preset slow -acodec aac -b:a 192k output.mp4
```

### 4. Bundle Analysis

```bash
# Analyze bundle size
npm run build
npx vite-bundle-visualizer
```

## Expected Results

After optimization:
- **Build size**: ~200-500KB (gzipped)
- **Repository size**: <50MB (excluding node_modules)
- **Load time**: <2 seconds on 3G connection
- **Lighthouse score**: 90+ on all metrics

## Monitoring

### Check Repository Size
```bash
# Check current repository size
du -sh .
du -sh node_modules
du -sh dist
```

### Check Build Size
```bash
npm run build
du -sh dist
```

## Best Practices

1. **Never commit**:
   - `node_modules/`
   - `dist/` or `build/`
   - `.env` files
   - Large media files (>1MB)

2. **Always**:
   - Optimize images before committing
   - Use external hosting for videos
   - Run `npm run clean` before committing
   - Test build locally before pushing

3. **Consider**:
   - Git LFS for large binary files
   - CDN for static assets
   - Lazy loading for images/videos
   - Code splitting for large components

## Current Status

✅ Build configuration optimized
✅ Git ignore comprehensive
✅ Build scripts optimized
✅ Deployment workflow ready
⚠️ Videos need optimization (15.7MB)
⚠️ Images can be further optimized

## Next Steps

1. Optimize video files or move to external hosting
2. Optimize images using tools mentioned above
3. Remove unused dependencies
4. Test build locally: `npm run build`
5. Deploy to GitHub Pages following `DEPLOYMENT.md`

