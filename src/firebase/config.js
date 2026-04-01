import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { getAnalytics, isSupported } from 'firebase/analytics'

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)
const auth = getAuth(app)
const storage = getStorage(app)

// Initialize Analytics (only in browser, not in SSR)
// Analytics is optional - gracefully handles missing measurementId
let analytics = null
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app)
        console.log('Firebase Analytics initialized successfully')
      } else {
        console.warn('Firebase Analytics not supported in this browser')
      }
    })
    .catch((error) => {
      console.warn('Firebase Analytics initialization failed:', error.message)
    })
} else if (typeof window !== 'undefined') {
  console.info('Firebase Analytics disabled (measurementId not configured)')
}

/**
 * Lazy-load Firestore (only used for email invitations via Firebase Extensions)
 * This keeps the main bundle smaller since Firestore is rarely needed
 * @returns {Promise<Firestore>} Firestore instance
 */
let firestoreInstance = null
export async function getFirestoreInstance() {
  if (firestoreInstance) return firestoreInstance

  const { getFirestore } = await import('firebase/firestore')
  firestoreInstance = getFirestore(app)
  return firestoreInstance
}

export { app, database, auth, storage, analytics }
