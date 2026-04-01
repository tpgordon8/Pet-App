# Device-Specific Breakpoint Reference

**Last Updated:** April 1, 2026 (Updated for 2026 current devices)  
**Purpose:** Comprehensive responsive design breakpoints for top mobile devices

---

## Supported Devices

### Top 5 iPhones (Current 2026 models + legacy)

| Device | Viewport Width | Breakpoint Range | Spacing |
|--------|---------------|------------------|---------|
| iPhone 16 Pro Max | 440px | 431px - 440px | 22px |
| iPhone 16 Plus | 430px | 413px - 430px | 20px |
| iPhone 16 Pro | 402px | 394px - 412px | 18px |
| iPhone 16 | 393px | 391px - 393px | 16px |
| iPhone SE (3rd gen) | 375px | 361px - 375px | 14px |

### Top 5 Android Phones (Current 2026 bestsellers)

| Device | Viewport Width | Breakpoint Range | Spacing |
|--------|---------------|------------------|---------|
| Samsung Galaxy S25 Ultra | 412px | 394px - 412px | 18px |
| Google Pixel 9 Pro | 412px | 394px - 412px | 18px |
| Samsung Galaxy S25 | 360px | ≤360px | 12px |
| Samsung Galaxy A16 5G | 360px | ≤360px | 12px |
| Samsung Galaxy A06 4G | 360px | ≤360px | 12px |

---

## Breakpoint System

### 📱 Breakpoint 1: 360px and smaller
**Devices:** Samsung S25, Galaxy A16 5G, Galaxy A06 4G

```css
@media (max-width: 360px) {
  .dashboard-container { padding: 0.75rem; }      /* 12px */
  .section-gap { margin-bottom: 0.875rem; }       /* 14px */
  .card-premium { padding: 0.75rem; }             /* 12px */
  .activity-grid-responsive { gap: 0.625rem; }    /* 10px */
}
```

**Rationale:** Smallest Android devices (including bestselling budget models) need maximum space efficiency

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

**Rationale:** iPhone SE gets compact but comfortable spacing, iOS-optimized (still popular in 2026)

---

### 📱 Breakpoint 3: 376px - 390px
**Devices:** iPhone 14 (previous gen, still widely used)

```css
@media (min-width: 376px) and (max-width: 390px) {
  .dashboard-container { padding: 1rem; }         /* 16px */
  .section-gap { margin-bottom: 1.125rem; }       /* 18px */
  .card-premium { padding: 1rem; }                /* 16px */
  .activity-grid-responsive { gap: 0.875rem; }    /* 14px */
}
```

**Rationale:** Previous gen iPhone, uses iOS native 16px spacing

---

### 📱 Breakpoint 4: 391px - 393px
**Devices:** iPhone 16 (current standard model)

```css
@media (min-width: 391px) and (max-width: 393px) {
  .dashboard-container { padding: 1rem; }         /* 16px */
  .section-gap { margin-bottom: 1.125rem; }       /* 18px */
  .card-premium { padding: 1rem; }                /* 16px */
  .activity-grid-responsive { gap: 0.875rem; }    /* 14px */
}
```

**Rationale:** Current standard iPhone viewport, iOS 16px spacing

---

### 📱 Breakpoint 5: 394px - 412px
**Devices:** iPhone 16 Pro (402px), Samsung S25 Ultra (412px), Pixel 9 Pro (412px)

```css
@media (min-width: 394px) and (max-width: 412px) {
  .dashboard-container { padding: 1.125rem; }     /* 18px */
  .section-gap { margin-bottom: 1.25rem; }        /* 20px */
  .card-premium { padding: 1.125rem; }            /* 18px */
  .activity-grid-responsive { gap: 1rem; }        /* 16px */
}
```

**Rationale:** Current flagship phones (both iOS and Android) get generous spacing for premium feel

---

### 📱 Breakpoint 6: 413px - 430px
**Devices:** iPhone 16 Plus (current large model)

```css
@media (min-width: 413px) and (max-width: 430px) {
  .dashboard-container { padding: 1.25rem; }      /* 20px */
  .section-gap { margin-bottom: 1.375rem; }       /* 22px */
  .card-premium { padding: 1.25rem; }             /* 20px */
  .activity-grid-responsive { gap: 1.125rem; }    /* 18px */
}
```

**Rationale:** Large iPhone gets spacious layout for comfortable viewing

---

### 📱 Breakpoint 7: 431px - 440px
**Devices:** iPhone 16 Pro Max (largest current iPhone)

```css
@media (min-width: 431px) and (max-width: 440px) {
  .dashboard-container { padding: 1.375rem; }     /* 22px */
  .section-gap { margin-bottom: 1.5rem; }         /* 24px */
  .card-premium { padding: 1.375rem; }            /* 22px */
  .activity-grid-responsive { gap: 1.1875rem; }   /* 19px */
}
```

**Rationale:** Extra-large flagship gets maximum comfortable spacing before switching to tablet layout

---

### 💻 Breakpoint 8: 441px and larger
**Devices:** Tablets, Desktop browsers

```css
@media (min-width: 441px) {
  .dashboard-container { padding: 1.5rem; }       /* 24px */
  .section-gap { margin-bottom: 1.5rem; }         /* 24px */
  .card-premium { padding: 1.5rem; }              /* 24px */
  .activity-grid-responsive { gap: 1.25rem; }     /* 20px */
}
```

**Rationale:** Desktop/tablet spacing for spacious, premium feel

---

## Spacing Progression

| Device Width | Container | Section Gap | Card | Grid Gap | Border Radius |
|-------------|-----------|-------------|------|----------|---------------|
| ≤360px | 12px | 14px | 12px | 10px | 12px |
| 361-375px | 14px | 16px | 14px | 12px | 14px |
| 376-390px | 16px | 18px | 16px | 14px | 15px |
| 391-393px | 16px | 18px | 16px | 14px | 15px |
| 394-412px | 18px | 20px | 18px | 16px | 16px |
| 413-430px | 20px | 22px | 20px | 18px | 17px |
| 431-440px | 22px | 24px | 22px | 19px | 17.5px |
| 441px+ | 24px | 24px | 24px | 20px | 18px |

**Pattern:** Progressive 2px increments create smooth scaling across devices  
**Note:** New breakpoint added for iPhone 16 Pro Max (440px viewport)


---

## Testing Checklist

### 2026 Current Devices (Priority Testing)
- [ ] iPhone 16 Pro Max (440px) - verify extra spacious layout, new breakpoint
- [ ] iPhone 16 Plus (430px) - verify spacious large iPhone layout
- [ ] iPhone 16 Pro (402px) - verify flagship spacing with other Pro models
- [ ] iPhone 16 (393px) - verify standard iPhone spacing
- [ ] Samsung S25 Ultra (412px) - verify generous Android flagship spacing
- [ ] Samsung S25 (360px) - verify maximum space usage
- [ ] Samsung A16 5G (360px) - verify same as S25
- [ ] Samsung A06 4G (360px) - verify compact budget phone layout
- [ ] Google Pixel 9 Pro (412px) - verify same as S25 Ultra
- [ ] iPhone SE 3rd gen (375px) - verify comfortable compact layout (legacy)

### Desktop/Tablet
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

**Example (2026 Update):** iPhone 16 Pro Max (440px) required new breakpoint (431-440px) as it exceeded previous largest range (413-430px)

**Device Updates Made (April 2026):**
- Added iPhone 16 series (440px, 430px, 402px, 393px) replacing iPhone 15/14 as primary
- Added Samsung S25 series (412px, 360px) replacing S24
- Added bestselling budget Androids: A16 5G (360px), A06 4G (360px)
- Added Google Pixel 9 Pro (412px) as current flagship
- Created new breakpoint (431-440px) for iPhone 16 Pro Max
- Extended desktop breakpoint from 431px+ to 441px+

---

## Notes

- All measurements in CSS pixels (viewport width, not physical pixels)
- Viewport width = Physical width ÷ Device pixel ratio
- Landscape mode uses same breakpoints (width-based)
- Dark mode uses same spacing values
- PWA fullscreen uses same spacing values

---

**Reference:** All viewport widths verified via [mydevice.io](https://www.mydevice.io) and manufacturer specs
