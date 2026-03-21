# Lighthouse Performance Baseline - Tailr Pet Activity Logger

**Date:** 2026-03-21
**Status:** Build metrics documented, manual audit required
**Session:** https://claude.ai/code/session_017CfZdSweXvYneu5A49hDE3

---

## Build Metrics (Production Bundle)

### Bundle Size Analysis
**Build Time:** 12.84s
**Total Modules:** 787

### Critical Bundles

| Component | Uncompressed | Gzipped | Status | Notes |
|-----------|--------------|---------|--------|-------|
| **DashboardView** | 406.95 KB | 132.31 KB | ⚠️ LARGE | Target: <300 KB gzipped |
| Firebase | 337.49 KB | 72.80 KB | ✅ OK | Core dependency |
| Main (index.js) | 310.15 KB | 76.97 KB | ✅ OK | App core |
| html2canvas | 201.48 KB | 48.08 KB | ✅ OK | Lazy loaded |
| WeightTrendChart | 195.91 KB | 65.00 KB | ✅ OK | Lazy loaded |
| Vue/Pinia | 108.82 KB | 42.58 KB | ✅ OK | Framework |

### Lazy-Loaded Components (On-Demand)
- ✅ ActivityFeed: 9.33 KB gzipped
- ✅ ActivityInsights: 4.44 KB gzipped
- ✅ WeightTrendChart: 195.91 KB gzipped (with Chart.js)
- ✅ Modals: 3-6 KB each

### Total Size
- **Uncompressed:** ~1.84 MB
- **Gzipped:** ~522 KB
- **PWA Cache:** 1843.67 KB (35 files)

---

## Lighthouse Audit Instructions

### Manual Audit (Recommended)

**Prerequisites:**
```bash
npm run build && npm run preview
```

**Run Lighthouse:**
1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select all categories
4. Device: Mobile (primary target)
5. Click "Analyze page load"

**Expected Results:**
- Performance: 85+ (target: 90+)
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+
- PWA: Pass

---

## Performance Budget Targets

- **First Contentful Paint (FCP):** <1.8s
- **Largest Contentful Paint (LCP):** <2.5s
- **Total Blocking Time (TBT):** <200ms
- **Cumulative Layout Shift (CLS):** <0.1

---

**Last Updated:** 2026-03-21
**Next Audit:** Run manually in Chrome DevTools after deployment
