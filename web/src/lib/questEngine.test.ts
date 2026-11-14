import { describe, it, expect, beforeEach } from 'vitest'
import {
  getOrGenerateDailyQuests,
  calculateAdaptiveDifficultyFactor,
  getLocalTodayDateString,
  DailyQuestRecord,
} from './questEngine'
import { HunterProfileData } from '../types/hunter'

describe('Daily Quest Generation Engine', () => {
  const mockProfile: HunterProfileData = {
    uid: 'test-hunter-uid',
    basic: {
      fullName: 'Sung Jin-Woo',
      ageRange: '18-24',
      country: 'Global',
      timezone: 'UTC',
      occupation: 'Shadow Monarch',
    },
    physical: {
      fitnessExperience: 'intermediate',
      activityLevel: 'moderately-active',
      equipment: ['dumbbells'],
    },
    career: {
      educationOrJob: 'Software Engineering',
      technicalSkills: ['TypeScript', 'React'],
      programmingLanguages: ['TypeScript'],
      codingAbility: 'competent',
      targetJobRole: 'Lead Architect',
      skillsToDevelop: ['Algorithms', 'Distributed Systems'],
      learningLevel: 'mid',
    },
    personalDev: {
      communication: 4,
      confidence: 4,
      discipline: 5,
      concentration: 5,
      problemSolving: 5,
    },
    routine: {
      wakeTime: '06:00',
      sleepTime: '23:00',
      workStudyHours: '09:00 - 17:00',
      availableFreeHoursDaily: 3,
      preferredWorkoutTime: 'morning',
      preferredLearningTime: 'evening',
      restDays: ['Sunday'],
    },
    goals: {
      primaryGoals: ['Strength', 'Consistency', 'Programming'],
      customGoals: [],
    },
    attributes: {
      STR: 15,
      VIT: 12,
      AGI: 16,
      INT: 18,
      SEN: 14,
    },
    hunterStatus: {
      rank: 'E',
      level: 1,
      xp: 0,
      nextLevelXp: 100,
      streak: 1,
      longestStreak: 1,
      titles: ['Player'],
    },
    onboardingCompleted: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  beforeEach(() => {
    localStorage.clear()
  })

  it('generates a fresh set of daily quests for the first visit of the day', () => {
    const result = getOrGenerateDailyQuests(mockProfile)
    expect(result.isNewDay).toBe(true)
    expect(result.quests.length).toBeGreaterThanOrEqual(4)
    expect(result.date).toBe(getLocalTodayDateString('UTC'))
  })

  it('returns existing quests without generating duplicate quests when reopened on the same day', () => {
    const firstCall = getOrGenerateDailyQuests(mockProfile)
    expect(firstCall.isNewDay).toBe(true)

    const secondCall = getOrGenerateDailyQuests(mockProfile)
    expect(secondCall.isNewDay).toBe(false)
    expect(secondCall.quests).toEqual(firstCall.quests)
  })

  it('adapts difficulty when user has high completion rate over past 7 days', () => {
    const pastRecords: DailyQuestRecord[] = [
      {
        date: '2026-11-10',
        generatedAt: '2026-11-10T00:00:00.000Z',
        quests: [
          {
            id: 'q1',
            title: 'Q1',
            description: '',
            category: 'Fitness',
            difficulty: 'Normal',
            targetAttribute: 'STR',
            estimatedMinutes: 20,
            xpReward: 30,
            statReward: { attribute: 'STR', points: 1 },
            completionCriteria: 'criteria',
            recommendationReason: 'reason',
            deadline: '23:59',
            status: 'COMPLETED',
            questType: 'DAILY',
          },
          {
            id: 'q2',
            title: 'Q2',
            description: '',
            category: 'DSA',
            difficulty: 'Normal',
            targetAttribute: 'INT',
            estimatedMinutes: 20,
            xpReward: 30,
            statReward: { attribute: 'INT', points: 1 },
            completionCriteria: 'criteria',
            recommendationReason: 'reason',
            deadline: '23:59',
            status: 'COMPLETED',
            questType: 'DAILY',
          },
        ],
      },
      {
        date: '2026-11-11',
        generatedAt: '2026-11-11T00:00:00.000Z',
        quests: [
          {
            id: 'q3',
            title: 'Q3',
            description: '',
            category: 'Fitness',
            difficulty: 'Normal',
            targetAttribute: 'STR',
            estimatedMinutes: 20,
            xpReward: 30,
            statReward: { attribute: 'STR', points: 1 },
            completionCriteria: 'criteria',
            recommendationReason: 'reason',
            deadline: '23:59',
            status: 'COMPLETED',
            questType: 'DAILY',
          },
        ],
      },
      {
        date: '2026-11-12',
        generatedAt: '2026-11-12T00:00:00.000Z',
        quests: [
          {
            id: 'q4',
            title: 'Q4',
            description: '',
            category: 'Fitness',
            difficulty: 'Normal',
            targetAttribute: 'STR',
            estimatedMinutes: 20,
            xpReward: 30,
            statReward: { attribute: 'STR', points: 1 },
            completionCriteria: 'criteria',
            recommendationReason: 'reason',
            deadline: '23:59',
            status: 'COMPLETED',
            questType: 'DAILY',
          },
        ],
      },
    ]

    const { factor, recentCompletionRate } = calculateAdaptiveDifficultyFactor(pastRecords)
    expect(recentCompletionRate).toBe(1.0)
    expect(factor).toBeGreaterThan(1.0)
  })

  it('respects designated rest days and generates recovery directives', () => {
    const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
    const restProfile: HunterProfileData = {
      ...mockProfile,
      routine: {
        ...mockProfile.routine,
        restDays: [todayDayName],
      },
    }

    const result = getOrGenerateDailyQuests(restProfile)
    const physQuest = result.quests.find((q) => q.category === 'Recovery')
    expect(physQuest).toBeDefined()
    expect(physQuest?.title).toContain('Rest Day')
    expect(physQuest?.targetAttribute).toBe('VIT')
  })
})
