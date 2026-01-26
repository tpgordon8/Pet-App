// Firebase Configuration - Shared across the app

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZeE0mf4ptN0wunDbEFbgMZ29nfWIA4NQ",
  authDomain: "petlog-c4c1e.firebaseapp.com",
  databaseURL: "https://petlog-c4c1e-default-rtdb.firebaseio.com",
  projectId: "petlog-c4c1e",
  storageBucket: "petlog-c4c1e.firebasestorage.app",
  messagingSenderId: "417384966953",
  appId: "1:417384966953:web:8b00d0cac96e2b7ec2a538"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { app, database };
