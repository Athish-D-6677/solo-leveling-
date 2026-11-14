import { httpsCallable } from 'firebase/functions'
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore'
import { functions, db } from './firebase'
import { Quest, DailyPlanResponse } from '../types/quest'
import { HunterProfileData, HunterRank } from '../types/hunter'
import { getOrGenerateDailyQuests as fallbackGenerator, saveDailyQuestRecord } from './questEngine'

/**
 * Fetch or generate today's quests.
 * Tries the Firebase Cloud Function first; falls back gracefully to deterministic client generation.
 */
export async function fetchOrCreateDailyQuests(
  profile: HunterProfileData
): Promise<DailyPlanResponse> {
  try {
    const callable = httpsCallable<any, DailyPlanResponse>(functions, 'getOrCreateDailyQuests')
    const res = await callable({})
    if (res.data && res.data.quests) {
      // Cache locally
      saveDailyQuestRecord(profile.uid, {
        date: res.data.date,
        generatedAt: new Date().toISOString(),
        quests: res.data.quests,
      })
      return res.data
    }
  } catch (err) {
    console.warn('Cloud Function quest generation unavailable, utilizing client engine:', err)
  }

  // Fallback to local rule engine
  const fallback = fallbackGenerator(profile)
  return {
    date: fallback.date,
    timezone: profile.basic?.timezone || 'Asia/Kolkata',
    dailyFocus: `${profile.career.skillsToDevelop[0] || 'Technical Mastery'} & Physical Conditioning`,
    motivationalMessage: 'The System grants power only to those who step through the gate each day.',
    totalEstimatedMinutes: fallback.quests.reduce((acc, q) => acc + q.estimatedMinutes, 0),
    quests: fallback.quests,
    isNewDay: fallback.isNewDay,
    source: 'RULE_ENGINE',
  }
}

/**
 * Complete a quest securely.
 * Calls `completeQuest` Cloud Function with transaction, with client fallback if offline.
 */
export async function submitCompleteQuest(
  uid: string,
  date: string,
  questId: string,
  profile: HunterProfileData,
  currentQuests: Quest[]
): Promise<{
  success: boolean
  questId: string
  xpEarned: number
  hunterStatus: HunterProfileData['hunterStatus']
  attributes: HunterProfileData['attributes']
  leveledUp: boolean
}> {
  try {
    const callable = httpsCallable<any, any>(functions, 'completeQuest')
    const res = await callable({ date, questId })
    if (res.data && res.data.success) {
      return res.data
    }
  } catch (err) {
    console.warn('Backend completeQuest callable unavailable, executing client safety engine:', err)
  }

  // Client fallback
  const targetQuest = currentQuests.find((q) => q.id === questId)
  if (!targetQuest || targetQuest.status === 'COMPLETED') {
    throw new Error('Quest already completed or not found.')
  }

  const xpEarned = targetQuest.xpReward
  let newXp = profile.hunterStatus.xp + xpEarned
  let newLevel = profile.hunterStatus.level
  let nextLevelXp = profile.hunterStatus.nextLevelXp
  let leveledUp = false

  while (newXp >= nextLevelXp) {
    newXp -= nextLevelXp
    newLevel += 1
    nextLevelXp = 100 + (newLevel - 1) * 50
    leveledUp = true
  }

  const newRank: HunterRank =
    newLevel >= 60
      ? 'National Level'
      : newLevel >= 45
      ? 'S'
      : newLevel >= 30
      ? 'A'
      : newLevel >= 20
      ? 'B'
      : newLevel >= 10
      ? 'C'
      : newLevel >= 5
      ? 'D'
      : 'E'

  const statAttr = targetQuest.statReward.attribute
  const statPoints = targetQuest.statReward.points

  const updatedAttributes = {
    ...profile.attributes,
    [statAttr]: (profile.attributes[statAttr] || 10) + statPoints,
  }

  const updatedHunterStatus = {
    ...profile.hunterStatus,
    xp: newXp,
    level: newLevel,
    nextLevelXp,
    rank: newRank,
  }

  return {
    success: true,
    questId,
    xpEarned,
    hunterStatus: updatedHunterStatus,
    attributes: updatedAttributes,
    leveledUp,
  }
}

/**
 * Fetch quest history directly from Firestore `users/{uid}/dailyQuests`
 */
export async function fetchUserDailyQuestHistory(uid: string): Promise<any[]> {
  try {
    const q = query(collection(db, 'users', uid, 'dailyQuests'), orderBy('date', 'desc'), limit(14))
    const snap = await getDocs(q)
    return snap.docs.map((d) => d.data())
  } catch (e) {
    console.warn('Firestore history query error:', e)
    return []
  }
}
