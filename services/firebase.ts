import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, Auth } from "firebase/auth";
import { getDatabase, Database } from "firebase/database";

// Safely access env, defaulting to empty object if undefined (handles the undefined TypeError)
const env = (import.meta as any).env || {};

// Configuration with Fallback to ensure app runs even if env vars are missing
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyAkg3Pj0wPgK3G-qdLSVHOgk2n_4GRjWOw",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "betplusai.firebaseapp.com",
  databaseURL: env.VITE_FIREBASE_DATABASE_URL || `https://${env.VITE_FIREBASE_PROJECT_ID || "betplusai"}-default-rtdb.firebaseio.com`,
  projectId: env.VITE_FIREBASE_PROJECT_ID || "betplusai",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "betplusai.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "236151382844",
  appId: env.VITE_FIREBASE_APP_ID || "1:236151382844:web:bab19231cb42dff61b3439",
  measurementId: "G-TBHYTSS1R9"
};

// Singleton pattern to prevent "Firebase App named '[DEFAULT]' already exists" error
let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);
export const db: Database = getDatabase(app);

// Ensure authentication persistence is enabled
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Firebase Persistence Error:", error);
});

export const seedDatabase = async () => {
   // Seeding mock data is disabled for production/real-time mode.
   return;
};