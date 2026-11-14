export type QuestCategory =
  | 'Fitness'
  | 'Programming'
  | 'DSA'
  | 'Technical learning'
  | 'Career'
  | 'Communication'
  | 'Productivity'
  | 'Recovery'
  | 'Personal development'

export type QuestDifficulty = 'Easy' | 'Normal' | 'Hard' | 'Extreme'

export type QuestType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'BONUS'

export interface Quest {
  id: string
  title: string
  description: string
  category: QuestCategory
  difficulty: QuestDifficulty
  targetAttribute: 'STR' | 'VIT' | 'AGI' | 'INT' | 'SEN'
  estimatedMinutes: number
  xpReward: number
  statReward: {
    attribute: 'STR' | 'VIT' | 'AGI' | 'INT' | 'SEN'
    points: number
  }
  completionCriteria: string
  recommendationReason: string
  deadline: string
  status: 'PENDING' | 'COMPLETED' | 'SKIPPED' | 'FAILED'
  questType: QuestType
  createdAt?: string
  completedAt?: string
}

export interface DailyPlanResponse {
  date: string // YYYY-MM-DD
  timezone: string
  dailyFocus: string
  motivationalMessage: string
  totalEstimatedMinutes: number
  quests: Quest[]
  isNewDay: boolean
  source: 'AI_AGENT' | 'RULE_ENGINE' | 'CACHED'
}
