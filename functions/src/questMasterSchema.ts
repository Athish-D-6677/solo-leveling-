import { z } from 'zod'

export const QuestCategorySchema = z.enum([
  'Fitness',
  'Programming',
  'DSA',
  'Technical learning',
  'Career',
  'Communication',
  'Productivity',
  'Recovery',
  'Personal development',
])

export const QuestDifficultySchema = z.enum(['Easy', 'Normal', 'Hard', 'Extreme'])

export const AttributeSchema = z.enum(['STR', 'VIT', 'AGI', 'INT', 'SEN'])

export const GeneratedQuestSchema = z.object({
  id: z.string(),
  title: z.string().min(5),
  description: z.string().min(10),
  category: QuestCategorySchema,
  difficulty: QuestDifficultySchema,
  targetAttribute: AttributeSchema,
  estimatedMinutes: z.number().int().min(5).max(180),
  xpReward: z.number().int().min(10).max(200),
  statReward: z.object({
    attribute: AttributeSchema,
    points: z.number().int().min(1).max(5),
  }),
  completionCriteria: z.string().min(10),
  recommendationReason: z.string().min(10),
  deadline: z.string().default('23:59'),
  status: z.enum(['PENDING', 'COMPLETED', 'SKIPPED', 'FAILED']).default('PENDING'),
  questType: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'BONUS']).default('DAILY'),
})

export const QuestMasterPlanSchema = z.object({
  dailyFocus: z.string().min(5),
  motivationalMessage: z.string().min(10),
  totalEstimatedMinutes: z.number().int().min(10),
  quests: z.array(GeneratedQuestSchema).min(3).max(6),
})

export type GeneratedQuest = z.infer<typeof GeneratedQuestSchema>
export type QuestMasterPlan = z.infer<typeof QuestMasterPlanSchema>

