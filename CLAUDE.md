# CLAUDE.md - AI Assistant Guide for Pet-App (PetLog)

## Project Overview

PetLog is a React Native mobile application built with Expo for tracking pet activities. Users can log their pet's daily activities including bathroom breaks (poop/pee), feeding times, and sleep sessions.

**Current Status:** Early-stage development - single screen app with basic UI, no data persistence yet.

## Tech Stack

- **Framework:** React Native 0.81.5 with Expo SDK 54
- **React Version:** 19.1.0
- **Build System:** Expo managed workflow (no native code)
- **Platforms:** iOS, Android, and Web

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Platform-specific starts
npm run android   # Launch Android emulator
npm run ios       # Launch iOS simulator
npm run web       # Launch web browser
```

## Project Structure

```
Pet-App/
├── App.js              # Main app component (all UI and logic)
├── index.js            # Entry point (registers App)
├── app.json            # Expo configuration
├── package.json        # Dependencies and scripts
├── assets/             # Static images
│   ├── icon.png        # App icon
│   ├── adaptive-icon.png  # Android adaptive icon
│   ├── splash-icon.png    # Splash screen
│   └── favicon.png        # Web favicon
└── CLAUDE.md           # This file
```

## Code Conventions

### React Native Patterns

- **Functional components with hooks** - No class components
- **StyleSheet.create()** - Always use for performance optimization
- **Default exports** - Components use default export pattern

### Styling Guidelines

- Use semantic style names (e.g., `poopButton`, `headerTitle`)
- Apply platform-specific properties:
  - iOS: `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`
  - Android: `elevation`
- Color scheme uses hex values (e.g., `#8B4513` for brown)

### Code Organization

- Comments use emoji markers for visual organization (e.g., `// 📝`, `// 🔘`)
- Clear, descriptive variable names (e.g., `handlePoop`, `handlePee`)
- Handler functions are simple and focused

## Architecture

### Current State

- **Single screen app** - All UI in `App.js`
- **No navigation** - Will need React Navigation or Expo Router when adding screens
- **No state management library** - Using React hooks only
- **No data persistence** - Using Alert API for temporary feedback

### Planned Improvements

- **Firebase integration** - For data persistence (mentioned in code comments)
- **Component extraction** - Refactor buttons into reusable components
- **Navigation structure** - Add when expanding beyond single screen

## Development Guidelines

### When Adding Features

1. Check if feature requires new dependencies - prefer minimal dependencies
2. Maintain cross-platform compatibility (iOS, Android, Web)
3. Use StyleSheet.create() for all new styles
4. Follow existing naming conventions
5. Test on multiple platforms before committing

### When Modifying UI

1. Use existing color scheme or discuss new colors
2. Apply both shadow (iOS) and elevation (Android) for depth effects
3. Use TouchableOpacity for interactive elements
4. Include visual feedback for user actions

### When Adding Data Persistence

- Firebase is the planned backend solution
- Design schemas with activity logging in mind
- Consider offline-first architecture

## Configuration Files

### app.json Key Settings

- `newArchEnabled: true` - New React Native architecture enabled
- `orientation: "portrait"` - Portrait mode only
- `userInterfaceStyle: "light"` - Light theme only (currently)
- iOS: `supportsTablet: true`
- Android: `edgeToEdgeEnabled: true`

### .gitignore Coverage

Excludes: `node_modules/`, `.expo/`, `dist/`, `web-build/`, native build artifacts, secrets, and environment files.

## Build & Deploy

### Development

```bash
npm start        # Starts Expo dev server
                 # Scan QR code with Expo Go app
                 # Or press 'a' for Android, 'i' for iOS, 'w' for web
```

### Production Builds

Use Expo Application Services (EAS) for production builds:
```bash
npx eas build --platform android
npx eas build --platform ios
```

## Testing Notes

- No testing framework currently configured
- Manual testing via Expo Go app recommended
- Test on both iOS and Android before merging changes

## Common Tasks

### Adding a New Activity Button

1. Create handler function following existing pattern
2. Add button with TouchableOpacity in the button container
3. Apply consistent styling with new color
4. Include emoji + text pattern for consistency

### Extracting Components (Recommended Refactor)

When the app grows, extract reusable components:
- `ActivityButton` - Reusable button component
- `Header` - App header component
- Create `components/` directory for organization

## Known Limitations

1. No TypeScript - Plain JavaScript used throughout
2. No linting/formatting config (ESLint/Prettier)
3. No automated tests
4. Single monolithic component file
5. Hard-coded strings (no i18n support)

## Important Reminders

- This is an Expo managed workflow - avoid ejecting unless necessary
- React 19 and RN 0.81 are modern versions - leverage new features
- Cross-platform code affects iOS, Android, and Web simultaneously
- Keep dependencies minimal for easier maintenance
- Firebase integration is planned - design with this in mind
