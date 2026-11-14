import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'
import { HunterProfileData } from '../types/hunter'

const STORAGE_KEY_PREFIX = 'thesystem_profile_'

/**
 * Fetch a hunter's profile from Firestore `users/{uid}`, with offline fallback cache
 */
export async function getHunterProfile(uid: string): Promise<HunterProfileData | null> {
  try {
    const userRef = doc(db, 'users', uid)
    const snapshot = await getDoc(userRef)
    if (snapshot.exists()) {
      const data = snapshot.data() as HunterProfileData
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${uid}`, JSON.stringify(data))
      return data
    }
  } catch (err) {
    console.warn('Firestore fetch failed, checking local cache:', err)
  }

  // Fallback to client cache
  const cached = localStorage.getItem(`${STORAGE_KEY_PREFIX}${uid}`)
  if (cached) {
    try {
      return JSON.parse(cached) as HunterProfileData
    } catch {
      return null
    }
  }

  return null
}

/**
 * Save or update the full hunter profile in Firestore `users/{uid}`
 */
export async function saveHunterProfile(profile: HunterProfileData): Promise<void> {
  // Always update local cache immediately for instantaneous UI updates
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${profile.uid}`, JSON.stringify(profile))

  try {
    const userRef = doc(db, 'users', profile.uid)
    await setDoc(userRef, profile, { merge: true })
  } catch (error) {
    console.warn('Firestore save queued or offline:', error)
  }
}

/**
 * Update partial hunter game status in Firestore
 */
export async function updateHunterGameStatus(
  uid: string,
  updates: Partial<HunterProfileData['hunterStatus']>
): Promise<void> {
  const current = await getHunterProfile(uid)
  if (current) {
    const updated: HunterProfileData = {
      ...current,
      hunterStatus: {
        ...current.hunterStatus,
        ...updates,
      },
      updatedAt: new Date().toISOString(),
    }
    await saveHunterProfile(updated)

    try {
      const userRef = doc(db, 'users', uid)
      await updateDoc(userRef, {
        hunterStatus: updated.hunterStatus,
        updatedAt: new Date().toISOString(),
      })
    } catch (e) {
      console.warn('Firestore game status update error:', e)
    }
  }
}
