# Device-Specific Breakpoint Reference

**Last Updated:** April 1, 2026  
**Purpose:** Comprehensive responsive design breakpoints for top mobile devices

---

## Supported Devices

### Top 5 iPhones (by market share 2024-2026)

| Device | Viewport Width | Breakpoint Range | Spacing |
|--------|---------------|------------------|---------|
| iPhone SE (3rd gen) | 375px | 361px - 375px | 14px |
| iPhone 14 | 390px | 376px - 390px | 16px |
| iPhone 15 Pro | 393px | 391px - 393px | 16px |
| iPhone 14 Pro Max | 430px | 413px - 430px | 20px |
| iPhone 15 Pro Max | 430px | 413px - 430px | 20px |

### Top 5 Android Phones (by market share 2024-2026)

| Device | Viewport Width | Breakpoint Range | Spacing |
|--------|---------------|------------------|---------|
| Samsung Galaxy S24 | 360px | ≤360px | 12px |
| Samsung Galaxy A54 | 360px | ≤360px | 12px |
| Google Pixel 7a | 412px | 394px - 412px | 18px |
| Google Pixel 8 Pro | 412px | 394px - 412px | 18px |
| Samsung Galaxy S24 Ultra | 412px | 394px - 412px | 18px |

---

## Breakpoint System

### 📱 Breakpoint 1: 360px and smaller
**Devices:** Samsung Galaxy S24, Galaxy A54

```css
@media (max-width: 360px) {
  .dashboard-container { padding: 0.75rem; }      /* 12px */
  .section-gap { margin-bottom: 0.875rem; }       /* 14px */
  .card-premium { padding: 0.75rem; }             /* 12px */
  .activity-grid-responsive { gap: 0.625rem; }    /* 10px */
}
```

**Rationale:** Smallest flagship Android devices need maximum space efficiency

---

### 📱 Breakpoint 2: 361px - 375px
**Devices:** iPhone SE (3rd gen)

```css
@media (min-width: 361px) and (max-width: 375px) {
  .dashboard-container { padding: 0.875rem; }     /* 14px */
  .section-gap { margin-bottom: 1rem; }           /* 16px */
  .card-premium { padding: 0.875rem; }            /* 14px */
  .activity-grid-responsive { gap: 0.75rem; }     /* 12px */
}
```

**Rationale:** iPhone SE gets compact but comfortable spacing, iOS-optimized

---

### 📱 Breakpoint 3: 376px - 390px
**Devices:** iPhone 14

```css
@media (min-width: 376px) and (max-width: 390px) {
  .dashboard-container { padding: 1rem; }         /* 16px */
  .section-gap { margin-bottom: 1.125rem; }       /* 18px */
  .card-premium { padding: 1rem; }                /* 16px */
  .activity-grid-responsive { gap: 0.875rem; }    /* 14px */
}
```

**Rationale:** Standard iPhone 14 size, uses iOS native 16px spacing

---

### 📱 Breakpoint 4: 391px - 393px
**Devices:** iPhone 15 Pro

```css
@media (min-width: 391px) and (max-width: 393px) {
  .dashboard-container { padding: 1rem; }         /* 16px */
  .section-gap { margin-bottom: 1.125rem; }       /* 18px */
  .card-premium { padding: 1rem; }                /* 16px */
  .activity-grid-responsive { gap: 0.875rem; }    /* 14px */
}
```

**Rationale:** Similar to iPhone 14, slight viewport increase

---

### 📱 Breakpoint 5: 394px - 412px
**Devices:** Samsung S24 Ultra, Pixel 8 Pro, Pixel 7a

```css
@media (min-width: 394px) and (max-width: 412px) {
  .dashboard-container { padding: 1.125rem; }     /* 18px */
  .section-gap { margin-bottom: 1.25rem; }        /* 20px */
  .card-premium { padding: 1.125rem; }            /* 18px */
  .activity-grid-responsive { gap: 1rem; }        /* 16px */
}
```

**Rationale:** Flagship Android devices get generous spacing for premium feel

---

### 📱 Breakpoint 6: 413px - 430px
**Devices:** iPhone 14 Pro Max, iPhone 15 Pro Max

```css
@media (min-width: 413px) and (max-width: 430px) {
  .dashboard-container { padding: 1.25rem; }      /* 20px */
  .section-gap { margin-bottom: 1.375rem; }       /* 22px */
  .card-premium { padding: 1.25rem; }             /* 20px */
  .activity-grid-responsive { gap: 1.125rem; }    /* 18px */
}
```

**Rationale:** Largest iPhones get spacious layout for comfortable viewing

---

### 💻 Breakpoint 7: 431px and larger
**Devices:** Tablets, Desktop browsers

```css
@media (min-width: 431px) {
  .dashboard-container { padding: 1.5rem; }       /* 24px */
  .section-gap { margin-bottom: 1.5rem; }         /* 24px */
  .card-premium { padding: 1.5rem; }              /* 24px */
  .activity-grid-responsive { gap: 1.25rem; }     /* 20px */
}
```

**Rationale:** Desktop/tablet spacing for spacious, premium feel

---

## Spacing Progression

| Device Width | Container | Section Gap | Card | Grid Gap |
|-------------|-----------|-------------|------|----------|
| ≤360px | 12px | 14px | 12px | 10px |
| 361-375px | 14px | 16px | 14px | 12px |
| 376-390px | 16px | 18px | 16px | 14px |
| 391-393px | 16px | 18px | 16px | 14px |
| 394-412px | 18px | 20px | 18px | 16px |
| 413-430px | 20px | 22px | 20px | 18px |
| 431px+ | 24px | 24px | 24px | 20px |

**Pattern:** Progressive 2px increments create smooth scaling across devices

---

## Border Radius Progression

| Device Width | Border Radius |
|-------------|---------------|
| ≤360px | 12px |
| 361-375px | 14px |
| 376-390px | 15px |
| 391-393px | 15px |
| 394-412px | 16px |
| 413-430px | 17px |
| 431px+ | 18px |

**Pattern:** Subtle radius scaling maintains visual harmony

---

## Testing Checklist

- [ ] Samsung Galaxy S24 (360px) - verify maximum space usage
- [ ] Samsung Galaxy A54 (360px) - verify same as S24
- [ ] iPhone SE 3rd gen (375px) - verify comfortable compact layout
- [ ] iPhone 14 (390px) - verify standard iOS spacing
- [ ] iPhone 15 Pro (393px) - verify similar to iPhone 14
- [ ] Samsung S24 Ultra (412px) - verify generous Android spacing
- [ ] Google Pixel 8 Pro (412px) - verify same as S24 Ultra
- [ ] Google Pixel 7a (412px) - verify same as Pixel 8 Pro
- [ ] iPhone 14 Pro Max (430px) - verify spacious large iPhone layout
- [ ] iPhone 15 Pro Max (430px) - verify same as 14 Pro Max
- [ ] iPad Mini (768px+) - verify desktop spacing

---

## Design Philosophy

**Goal:** Each device gets optimal spacing - not too cramped, not too spacious.

**Principles:**
1. **Maximize usability** - Smaller screens maximize content space
2. **Native feel** - Match platform spacing conventions (iOS 16px, Android variable)
3. **Progressive scaling** - Smooth 2px increments feel natural
4. **Touch-friendly** - All targets meet 44px minimum (iOS) / 48px (Android)
5. **Premium polish** - Every device feels crafted for that specific size

**Avoided:**
- One-size-fits-all breakpoints
- Large jumps in spacing (jarring)
- Ignoring platform conventions
- Cramped layouts on small devices
- Wasted space on large devices

---

## Future Devices

When new flagship phones launch, update this chart:

1. Determine viewport width (physical pixels ÷ device pixel ratio)
2. Find closest existing breakpoint
3. Test if existing spacing works well
4. If not, create new breakpoint between existing ones
5. Update this document

**Example:** New 400px device would fit in 394-412px range (no changes needed)

---

## Notes

- All measurements in CSS pixels (viewport width, not physical pixels)
- Viewport width = Physical width ÷ Device pixel ratio
- Landscape mode uses same breakpoints (width-based)
- Dark mode uses same spacing values
- PWA fullscreen uses same spacing values

---

**Reference:** All viewport widths verified via [mydevice.io](https://www.mydevice.io) and manufacturer specs
