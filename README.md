# PetLog - Pet Activity Logger

Track your pet's daily activities with a modern, feature-rich web app. Real-time sync, medical records, and powerful data management tools.

## 🚀 Live App

**Web App:** Deployed on Vercel
**PWA:** Install on any device for app-like experience

## ✨ Features

### 📊 Activity Tracking
- **5 Activity Types:** Poop, Pee, Food, Sleep, Meds
- **Real-time Sync:** Firebase backend syncs across all devices
- **Modern UI:** SVG icons, dark mode, glassmorphic design
- **Notes:** Add optional notes to any activity
- **Pull-to-Refresh:** Swipe down to refresh data

### 🏥 Medical Records
- **Vet Visits:** Track appointments with notes and costs
- **Vaccinations:** Record vaccine names and dates
- **Weight Checks:** Monitor pet weight over time
- **Medical Summary:** Quick view of latest medical activities

### 🐾 Pet Management
- **Multiple Pets:** Manage activities for multiple pets
- **Pet Profiles:** Custom names, species, and icons
- **Per-Pet Views:** Filter activities by pet

### 🔍 Filtering & Search
- **Activity Filter:** Filter by type (Poop, Pee, Food, etc.)
- **Date Range Picker:** View activities from specific dates
- **Quick Presets:** Today, Yesterday, Last 7/30 Days
- **Combined Filters:** Pet + Activity Type + Date Range

### 📤 Data Export
- **CSV Export:** Spreadsheet-ready data export
- **PDF Export:** Professional reports with medical records
- **Bulk Select:** Select multiple activities for batch operations
- **Filtered Exports:** Exports respect current filters

### ✏️ Editing & Management
- **Enhanced Edit Modal:** Edit activity type, timestamp, and notes
- **iOS-Style Swipe Gestures:** Swipe left to reveal edit/delete
- **Bulk Delete:** Select and delete multiple activities
- **Undo Delete:** 5-second undo window for accidental deletions

### 🎨 Design & UX
- **Dark Mode:** Automatic or manual toggle
- **Responsive Design:** Optimized for iOS & Android (last 4 years)
- **Touch-Optimized:** 44px minimum tap targets (Apple HIG)
- **Safe Area Support:** Proper spacing on notched devices
- **PWA Icon:** Custom paw print design with gradient

### 📱 Mobile Optimizations
- **Small Phones:** iPhone SE 3rd gen, compact Android
- **Standard Phones:** iPhone 12-16, Pixel 5-8
- **Large Phones:** iPhone Pro Max, Galaxy S24+
- **Tablets:** Responsive grid layouts
- **Landscape Mode:** Optimized for horizontal viewing
- **OLED Dark Mode:** True black for Pro models

## 🏗️ Tech Stack

- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Backend:** Firebase Realtime Database
- **Icons:** Lucide (React Native) + Custom SVG sprites (Web)
- **PDF Generation:** jsPDF
- **PWA:** Web App Manifest, Service Worker ready
- **Deployment:** Vercel

## 🎯 Getting Started

### Web App
1. Visit the deployed Vercel URL
2. Add your first pet
3. Start logging activities!

### React Native (Future iOS App)
See `FUTURE_IOS_MIGRATION.md` for iOS App Store plans

## 🔐 Security

- Firebase Security Rules configured
- Client-side data validation
- See `FIREBASE_SECURITY.md` for details

## 📁 Project Structure

```
Pet-App/
├── index.html              # Main web app
├── App.js                  # React Native foundation (future iOS app)
├── components/             # React Native components
│   ├── layout/
│   └── pet/
├── contexts/               # React contexts (Theme, Pet)
├── utils/                  # Utility functions
├── manifest.json           # PWA manifest
└── firebase.json           # Firebase configuration
```

## 🚀 Recent Updates

**Phase 1: Polish Pass**
- SVG icons replacing emojis throughout
- Enhanced edit modal with all fields

**Phase 2: Core UX**
- Activity filtering with chips UI
- Date range picker with presets
- iOS-style swipe gestures

**Phase 3: Data Management**
- CSV export functionality
- Bulk select mode with action bar
- Pull-to-refresh

**Phase 4: Professional Features**
- PDF export with medical records
- Responsive design optimization
- Custom PWA icon

## 📝 Development

```bash
# Clone the repository
git clone <repo-url>

# Install dependencies (React Native)
npm install

# Run React Native dev server
npm start

# Web app (static file)
# Just open index.html in a browser
# Or use any static server
```

## 🤝 Contributing

This is a personal pet project, but feel free to fork and adapt for your needs!

## 📄 License

MIT License - feel free to use and modify

---

**Built with ❤️ for pet parents everywhere** 🐾