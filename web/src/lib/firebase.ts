import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCXlv9zRcPvxU88UxYe3cRIy81eNbTnS7k",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "solo-leveling-proj.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "solo-leveling-proj",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "solo-leveling-proj.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "11464770722",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:11464770722:web:62f163cdbb3e2a2ded03fb",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-B1Q2XHECWX"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const functions = getFunctions(app)

export let analytics: ReturnType<typeof getAnalytics> | null = null

// Initialize analytics safely
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app)
    }
  }).catch(() => {
    // Blocked or not supported in test/unsupported environments
  })
}

export default app
