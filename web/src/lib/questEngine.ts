import { HunterProfileData } from '../types/hunter'
import { Quest } from '../types/quest'

const QUEST_HISTORY_KEY_PREFIX = 'thesystem_quest_history_'
const ACTIVE_QUESTS_KEY_PREFIX = 'thesystem_active_quests_'

/**
 * Returns the current date in YYYY-MM-DD formatted in the user's specific timezone
 */
export function getLocalTodayDateString(timezone?: string): string {
  const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata'
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    return formatter.format(new Date())
  } catch {
    return new Date().toISOString().slice(0, 10)
  }
}

export interface DailyQuestRecord {
  date: string // YYYY-MM-DD
  generatedAt: string
  quests: Quest[]
}

/**
 * Get all past quest records for a user
 */
export function getStoredQuestHistory(uid: string): DailyQuestRecord[] {
  try {
    const raw = localStorage.getItem(`${QUEST_HISTORY_KEY_PREFIX}${uid}`)
    if (raw) {
      return JSON.parse(raw) as DailyQuestRecord[]
    }
  } catch (err) {
    console.error('Failed to parse stored quest history:', err)
  }
  return []
}

/**
 * Save or append daily quest records
 */
export function saveDailyQuestRecord(uid: string, record: DailyQuestRecord): void {
  const history = getStoredQuestHistory(uid)
  const existingIdx = history.findIndex((h) => h.date === record.date)
  if (existingIdx >= 0) {
    history[existingIdx] = record
  } else {
    history.unshift(record)
  }
  localStorage.setItem(`${QUEST_HISTORY_KEY_PREFIX}${uid}`, JSON.stringify(history))
  localStorage.setItem(`${ACTIVE_QUESTS_KEY_PREFIX}${uid}`, JSON.stringify(record))
}

/**
 * Calculate completion rate and difficulty adaptation factor over the past 7 days
 */
export function calculateAdaptiveDifficultyFactor(history: DailyQuestRecord[]): {
  factor: number
  recentCompletionRate: number
} {
  const recent7Days = history.slice(0, 7)
  if (recent7Days.length === 0) {
    return { factor: 1.0, recentCompletionRate: 1.0 }
  }

  let totalQuests = 0
  let completedQuests = 0

  for (const day of recent7Days) {
    for (const q of day.quests) {
      totalQuests++
      if (q.status === 'COMPLETED') {
        completedQuests++
      }
    }
  }

  const completionRate = totalQuests > 0 ? completedQuests / totalQuests : 0.8

  if (completionRate >= 0.9 && recent7Days.length >= 3) {
    return { factor: 1.25, recentCompletionRate: completionRate }
  }
  if (completionRate < 0.5 && recent7Days.length >= 2) {
    return { factor: 0.75, recentCompletionRate: completionRate }
  }

  return { factor: 1.0, recentCompletionRate: completionRate }
}

/**
 * Generates or retrieves daily quests with strict one-generation-per-day enforcement
 */
export function getOrGenerateDailyQuests(
  profile: HunterProfileData,
  forceRegenerate: boolean = false
): { quests: Quest[]; isNewDay: boolean; date: string } {
  const uid = profile.uid
  const userTimezone = profile.basic?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata'
  const localToday = getLocalTodayDateString(userTimezone)

  const history = getStoredQuestHistory(uid)
  const existingToday = history.find((h) => h.date === localToday)

  if (existingToday && !forceRegenerate) {
    return {
      quests: existingToday.quests,
      isNewDay: false,
      date: localToday,
    }
  }

  const { factor } = calculateAdaptiveDifficultyFactor(history)

  const today = new Date()
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long', timeZone: userTimezone })
  const isRestDay = (profile.routine?.restDays || []).includes(dayName)

  const hasGym = profile.physical?.equipment.includes('gym-membership')
  const hasDumbbells = profile.physical?.equipment.includes('dumbbells') || hasGym
  const hasPullupBar = profile.physical?.equipment.includes('pullup-bar') || hasGym
  const freeHours = profile.routine?.availableFreeHoursDaily || 2

  const generatedQuests: Quest[] = []

  // 1. Physical / Recovery
  if (isRestDay) {
    generatedQuests.push({
      id: `quest-${uid}-${localToday}-recovery`,
      title: 'Rest Day: Joint Mobility & System Regeneration',
      description: `Today (${dayName}) is your designated rest day. Refresh joints, decompress spine, and hydrate without intense exertion.`,
      category: 'Recovery',
      difficulty: 'Easy',
      targetAttribute: 'VIT',
      estimatedMinutes: 15,
      xpReward: 20,
      statReward: { attribute: 'VIT', points: 1 },
      completionCriteria: '15 minutes of lower back & hip mobility stretches.',
      recommendationReason: 'Active restoration to prevent musculoskeletal injury on planned rest days.',
      deadline: '23:59',
      status: 'PENDING',
      questType: 'DAILY',
    })
  } else {
    let title = 'Shadow Conditioning: Core & Push Calisthenics'
    let desc = 'Complete 3 sets of 15 push-ups, 20 squats, and a 45s plank hold.'
    let difficulty: Quest['difficulty'] = factor > 1.1 ? 'Hard' : factor < 0.9 ? 'Easy' : 'Normal'
    let xp = Math.round(30 * factor)
    let duration = Math.min(30, freeHours * 15)

    if (hasGym && factor >= 1) {
      title = 'Iron Awakening: Heavy Compound Resistance'
      desc = 'Complete 4 working sets of primary compound resistance (Squat, Press or Deadlift).'
      duration = Math.min(45, freeHours * 20)
    } else if (hasDumbbells) {
      title = 'Dumbbell Hypertrophy & Stability Flow'
      desc = '4 rounds: 12 dumbbell thrusters, 12 rows, and 15 goblet squats.'
    } else if (hasPullupBar) {
      title = 'Ascension Pull: Vertical Pull & Core'
      desc = '4 sets of pull-ups (to fatigue) paired with knee raises.'
    }

    generatedQuests.push({
      id: `quest-${uid}-${localToday}-phys`,
      title,
      description: desc,
      category: 'Fitness',
      difficulty,
      targetAttribute: 'STR',
      estimatedMinutes: duration,
      xpReward: xp,
      statReward: { attribute: 'STR', points: 1 },
      completionCriteria: 'Complete all sets with full range of motion.',
      recommendationReason: 'Foundational strength stimulation matched to current physical ability.',
      deadline: '23:59',
      status: 'PENDING',
      questType: 'DAILY',
    })
  }

  // 2. Technical / Intellect (INT)
  const targetSkill = profile.career?.skillsToDevelop?.[0] || 'Data Structures & Algorithms'
  const targetLang = profile.career?.programmingLanguages?.[0] || 'TypeScript'
  generatedQuests.push({
    id: `quest-${uid}-${localToday}-tech`,
    title: `Monarch's Logic: ${targetSkill} Sprint`,
    description: `Dedicate focused attention practicing ${targetSkill} using ${targetLang}. Solve a problem or study core concepts.`,
    category: 'DSA',
    difficulty: factor > 1.1 ? 'Hard' : 'Normal',
    targetAttribute: 'INT',
    estimatedMinutes: Math.min(45, freeHours * 20),
    xpReward: Math.round(35 * factor),
    statReward: { attribute: 'INT', points: 1 },
    completionCriteria: 'Solve 1 technical challenge or implement 1 architectural pattern.',
    recommendationReason: `Direct technical progress towards your goal: ${profile.career?.targetJobRole || 'Software Engineer'}.`,
    deadline: '23:59',
    status: 'PENDING',
    questType: 'DAILY',
  })

  // 3. Vitality & Health (VIT)
  generatedQuests.push({
    id: `quest-${uid}-${localToday}-vit`,
    title: 'Cellular Restoration: Hydration & Clean Nutrition',
    description: 'Drink 2.5L+ clean water, avoid processed sugary beverages, and consume quality protein with all main meals.',
    category: 'Productivity',
    difficulty: 'Easy',
    targetAttribute: 'VIT',
    estimatedMinutes: 10,
    xpReward: 20,
    statReward: { attribute: 'VIT', points: 1 },
    completionCriteria: 'Drink 2.5L water and log clean nutrition.',
    recommendationReason: 'Fueling systemic energy and cognitive retention throughout the day.',
    deadline: '23:59',
    status: 'PENDING',
    questType: 'DAILY',
  })

  // 4. Mental Sense & Focus (SEN)
  generatedQuests.push({
    id: `quest-${uid}-${localToday}-sen`,
    title: 'Sense Domain: 25-Minute Uninterrupted Focus',
    description: 'Zero notifications, zero browser tabs open to social media. Pure undisturbed execution.',
    category: 'Personal development',
    difficulty: 'Easy',
    targetAttribute: 'SEN',
    estimatedMinutes: 25,
    xpReward: 25,
    statReward: { attribute: 'SEN', points: 1 },
    completionCriteria: 'Complete 25 minutes of deep focus without checking personal devices.',
    recommendationReason: 'Develops deep work capacity and sharpens mental concentration attributes.',
    deadline: '23:59',
    status: 'PENDING',
    questType: 'DAILY',
  })

  // 5. Weekly Dungeon
  const currentWeek = `${today.getFullYear()}-W${Math.ceil(today.getDate() / 7)}`
  generatedQuests.push({
    id: `quest-${uid}-${currentWeek}-boss`,
    title: 'Weekly Gate: The 5-Day Consistency Monarch',
    description: 'Complete all mandatory daily directives on at least 5 days this week.',
    category: 'Productivity',
    difficulty: 'Hard',
    targetAttribute: 'AGI',
    estimatedMinutes: 120,
    xpReward: 100,
    statReward: { attribute: 'AGI', points: 3 },
    completionCriteria: 'Verify 5 full daily clears within the current calendar week.',
    recommendationReason: 'Sustained weekly discipline unlocks hunter rank elevation.',
    deadline: 'Sunday 23:59',
    status: 'PENDING',
    questType: 'WEEKLY',
  })

  const newRecord: DailyQuestRecord = {
    date: localToday,
    generatedAt: new Date().toISOString(),
    quests: generatedQuests,
  }

  saveDailyQuestRecord(uid, newRecord)

  return {
    quests: generatedQuests,
    isNewDay: true,
    date: localToday,
  }
}
