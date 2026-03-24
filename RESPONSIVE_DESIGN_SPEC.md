# Tailr - Responsive Design Specification

**Document Version:** 1.0
**Last Updated:** 2026-03-24
**Designer:** Claude AI (UX/UI Expert Mode)
**Platform:** Cross-device web application (iOS Safari primary)

---

## Device Breakpoints

### Primary Target Devices

| Device | Width | Height | Breakpoint | Notes |
|--------|-------|--------|------------|-------|
| iPhone 12 mini | 375px | 812px | xs | Smallest supported |
| iPhone 12/13/14 | 390px | 844px | xs | Common size |
| iPhone 14/15 Pro | 393px | 852px | xs | Current standard |
| iPhone Pro Max | 428-430px | 926-932px | sm | Large phone |
| iPad / Tablet | 768px | 1024px | md | Tablet |
| iPad Pro | 1024px | 1366px | lg | Large tablet |
| Desktop | 1280px+ | 800px+ | xl | Desktop |

### Tailwind Breakpoints

```css
/* Mobile-first approach */
xs: 0-639px (default, no prefix)
sm: 640px+
md: 768px+
lg: 1024px+
xl: 1280px+
2xl: 1536px+
```

---

## iOS Touch Target Requirements

### Minimum Sizes (Apple Human Interface Guidelines)

- **Primary buttons**: 44x44px minimum
- **Secondary buttons**: 44x44px minimum
- **Clickable elements**: 44x44px minimum
- **Text inputs**: 44px height minimum
- **Select dropdowns**: 44px height minimum

### Font Size Requirements (iOS Safari)

- **Body text**: 16px minimum (prevents auto-zoom)
- **Small text**: 14px minimum (acceptable for labels)
- **Headings**: 18px+ for mobile
- **Interactive element text**: 16px+ (prevents zoom on focus)

---

## Component-Specific Specifications

### 1. CompactContextBar Component

**Desktop (md:+)**
- Layout: Horizontal flex row
- Label font: 14px (0.875rem)
- Select font: 14px (0.875rem)
- Select padding: 8px 32px 8px 12px
- Select min-width: 120px
- Gap between elements: 12px

**Mobile (xs-sm)**
- Layout: Horizontal flex row with wrap
- Label font: 13px (0.8125rem) - compressed
- Select font: **16px (1rem)** - CRITICAL: prevents auto-zoom
- Select padding: **11px 28px 11px 10px** - ensures 44px height
- Select min-width: 110px
- Gap between elements: 8px
- Add Pet button: Icon only, 44x44px minimum

### 2. ActivityButton Component

**Desktop (md:+)**
- Size: 140px min-height, auto width
- Padding: 24px (1.5rem)
- Emoji: 48px (3rem)
- Label: 18px (1.125rem)
- Count badge: 14px (0.875rem)
- Grid: 3 columns

**Mobile (xs-sm)**
- Size: **120px min-height, 44px min-width**
- Padding: **16px (1rem)**
- Emoji: 40px (2.5rem)
- Label: **16px (1rem)** - prevents zoom
- Count badge: 13px (0.8125rem)
- Grid: 2 columns (standard)

**iPhone 12 mini (375px width)**
- Consider stacking to 2 columns with smaller gaps
- Minimum touch target: 44x44px maintained

### 3. TodaysSummary Component

**Desktop (md:+)**
- Stats grid: 3 columns
- Stat card padding: 14px 8px (0.875rem 0.5rem)
- Emoji: 32px (2rem)
- Number: 20px (1.25rem xl)
- Label: 12px (0.75rem xs)

**Mobile (xs-sm)**
- Stats grid: **3 columns** (keeps layout compact)
- Stat card padding: **12px 6px (0.75rem 0.375rem)**
- Emoji: **28px (1.75rem)**
- Number: **18px (1.125rem lg)**
- Label: **11px (0.6875rem) - minimum acceptable**
- Last activity font: 12px (0.75rem xs)

**iPhone 12 mini optimization**
- Stats grid: 3 columns maintained
- Tighter gaps: 8px instead of 12px
- Slightly reduced padding

### 4. DashboardView Layout

**Desktop (lg:+)**
- Max width: 1024px (4xl)
- Container padding: 16px (1rem)
- Section spacing: 24px (1.5rem)
- Card padding: 24px (1.5rem)

**Tablet (md-lg)**
- Max width: 768px (3xl)
- Container padding: 16px (1rem)
- Section spacing: 20px (1.25rem)
- Card padding: 20px (1.25rem)

**Mobile (xs-sm)**
- Max width: 100%
- Container padding: **12px (0.75rem)** - tighter for small screens
- Section spacing: **16px (1rem)** - reduced vertical space
- Card padding: **16px (1rem)** - more content visible

**iPhone 12 mini (375px)**
- Container padding: **12px**
- Optimize header to stack on ultra-small screens
- Reduce gaps between Quick Log buttons

### 5. Search Input & Form Fields

**All Devices**
- Height: **48px minimum** (exceeds 44px requirement)
- Font size: **16px** (prevents auto-zoom on iOS)
- Padding: 12px 40px 12px 12px
- Border radius: 8px (0.5rem)
- Icon size: 18px-20px

**Mobile Specific**
- Ensure autocomplete="off" doesn't trigger zoom
- Use `-webkit-tap-highlight-color: transparent`

### 6. Export Buttons & Secondary Actions

**Desktop**
- Display: Flex with icon + text
- Padding: 8px 16px
- Font: 14px (0.875rem)
- Icon + text visible

**Mobile (xs-sm)**
- Display: Flex with icon + optional text
- Padding: **10px 12px** - ensures 44px touch target
- Font: **16px** - prevents zoom
- Text: Hide on very small screens with `hidden sm:inline`

### 7. Modal Components

**Desktop**
- Width: 500px max
- Padding: 24px
- Title: 20px (1.25rem xl)
- Body text: 16px (1rem)

**Mobile**
- Width: calc(100% - 32px) or 95vw
- Padding: 20px
- Title: 18px (1.125rem lg)
- Body text: 16px (1rem)
- Ensure close button is 44x44px minimum

---

## Spacing System

### Vertical Spacing (gap-y)

| Element | Desktop | Tablet | Mobile | Mini |
|---------|---------|--------|--------|------|
| Page sections | 24px | 20px | 16px | 16px |
| Card sections | 16px | 16px | 12px | 12px |
| Form elements | 16px | 14px | 12px | 12px |
| Button groups | 16px | 14px | 12px | 10px |

### Horizontal Spacing (gap-x)

| Element | Desktop | Tablet | Mobile | Mini |
|---------|---------|--------|--------|------|
| Grid columns | 16px | 14px | 12px | 10px |
| Inline elements | 12px | 10px | 8px | 6px |
| Button groups | 12px | 10px | 8px | 8px |

---

## Typography Scale

### Headings

```css
h1: 24px (1.5rem 2xl) md:32px (2rem 3xl)
h2: 20px (1.25rem xl) md:24px (1.5rem 2xl)
h3: 18px (1.125rem lg) md:20px (1.25rem xl)
h4: 16px (1rem base) md:18px (1.125rem lg)
```

### Body Text

```css
Base: 16px (1rem) - All devices
Small: 14px (0.875rem sm) - Labels, metadata
Extra small: 12px (0.75rem xs) - Badges, timestamps
Minimum: 11px (0.6875rem) - Stat labels only
```

### Interactive Elements

```css
Buttons: 16px (1rem) - Prevents zoom
Inputs: 16px (1rem) - Prevents zoom
Selects: 16px (1rem) mobile, 14px desktop - Prevents zoom
```

---

## Grid Layouts

### Quick Log Buttons

```css
/* Desktop */
grid-cols-3

/* Tablet */
md:grid-cols-3

/* Mobile */
grid-cols-2

/* Mini (375px) - optional enhancement */
@media (max-width: 390px) {
  grid-cols-2 with reduced gap
}
```

### Medical Tracking Buttons

```css
/* Desktop */
md:grid-cols-3

/* Mobile */
grid-cols-1 (stacked for better touch targets)
```

### Stats Grid

```css
/* All devices */
grid-cols-3 (compact, maintains visual consistency)

/* Adjust with tighter gaps on mobile */
gap-3 (12px) desktop
gap-2 (8px) mobile
```

---

## Critical iOS Safari Fixes

### 1. Prevent Auto-Zoom on Input Focus

```css
/* All text inputs, selects, textareas */
font-size: 16px; /* MINIMUM */
```

### 2. Remove Tap Highlight

```css
-webkit-tap-highlight-color: transparent;
```

### 3. Prevent Text Selection on Buttons

```css
user-select: none;
-webkit-user-select: none;
```

### 4. Safe Area Insets (for notched devices)

```css
padding-bottom: env(safe-area-inset-bottom);
padding-top: env(safe-area-inset-top);
```

### 5. Smooth Scrolling

```css
-webkit-overflow-scrolling: touch;
scroll-behavior: smooth;
```

---

## Accessibility Requirements

### Touch Targets

- ✅ All buttons: 44x44px minimum
- ✅ All links: 44x44px minimum
- ✅ All interactive elements: 44x44px minimum

### Color Contrast

- ✅ Body text: 4.5:1 minimum (WCAG AA)
- ✅ Large text: 3:1 minimum (WCAG AA)
- ✅ Interactive elements: 3:1 minimum

### Focus States

- ✅ Visible focus indicators (ring-2 ring-sage-500)
- ✅ Keyboard navigable (tab order logical)
- ✅ ARIA labels for icon-only buttons

---

## Testing Checklist

### Devices to Test

- [ ] iPhone 12 mini (375px) - Safari
- [ ] iPhone 14 (390px) - Safari
- [ ] iPhone 15 Pro (393px) - Safari
- [ ] iPhone 15 Pro Max (430px) - Safari
- [ ] iPad (768px) - Safari
- [ ] iPad Pro (1024px) - Safari
- [ ] Desktop (1280px+) - Chrome/Firefox

### Features to Test

- [ ] All buttons are tappable (44x44px)
- [ ] Text inputs don't trigger auto-zoom
- [ ] Select dropdowns don't trigger auto-zoom
- [ ] No horizontal scrolling on any screen size
- [ ] Grids reflow properly at each breakpoint
- [ ] Modals are fully visible and scrollable
- [ ] Touch gestures work (swipe, tap, long-press)
- [ ] Dark mode works at all sizes
- [ ] Safe area respected (notched devices)

---

## Implementation Priority

### Phase 1: Critical iOS Fixes (High Priority)
1. ✅ All input/select font-size: 16px minimum
2. ✅ All interactive elements: 44x44px minimum
3. ✅ Remove -webkit-tap-highlight-color
4. ✅ Add safe-area-inset padding

### Phase 2: Spacing Optimization (Medium Priority)
1. ✅ Reduce mobile padding/gaps for better space usage
2. ✅ Optimize grid columns for different breakpoints
3. ✅ Adjust typography scale for mobile

### Phase 3: Enhanced Responsiveness (Medium Priority)
1. ✅ Add specific iPhone mini optimizations
2. ✅ Improve tablet layouts (768-1024px)
3. ✅ Fine-tune desktop layouts (1280px+)

### Phase 4: Polish (Low Priority)
1. ⏳ Add smooth transitions between breakpoints
2. ⏳ Consider landscape mode optimizations
3. ⏳ Add PWA safe area optimizations

---

## Developer Notes

### CSS Strategy

- Use Tailwind utility classes with responsive prefixes
- Add custom `@media` queries only when Tailwind insufficient
- Mobile-first approach (base styles = mobile, use sm:/md:/lg: for larger)
- Group responsive styles logically in component files

### Testing Strategy

- Use Chrome DevTools device emulation
- Test on real iOS device (Safari)
- Use Responsively App for multi-device preview
- Check touch targets with Chrome's "Show rulers" feature

### Common Pitfalls to Avoid

- ❌ Font sizes < 16px on inputs (causes zoom)
- ❌ Touch targets < 44x44px
- ❌ Fixed heights that cut off content
- ❌ Missing safe-area-inset on iOS
- ❌ Forgetting dark mode in responsive styles
- ❌ Not testing on actual devices

---

**End of Specification**
