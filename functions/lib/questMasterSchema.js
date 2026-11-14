"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestMasterPlanSchema = exports.GeneratedQuestSchema = exports.AttributeSchema = exports.QuestDifficultySchema = exports.QuestCategorySchema = void 0;
const zod_1 = require("zod");
exports.QuestCategorySchema = zod_1.z.enum([
    'Fitness',
    'Programming',
    'DSA',
    'Technical learning',
    'Career',
    'Communication',
    'Productivity',
    'Recovery',
    'Personal development',
]);
exports.QuestDifficultySchema = zod_1.z.enum(['Easy', 'Normal', 'Hard', 'Extreme']);
exports.AttributeSchema = zod_1.z.enum(['STR', 'VIT', 'AGI', 'INT', 'SEN']);
exports.GeneratedQuestSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string().min(5),
    description: zod_1.z.string().min(10),
    category: exports.QuestCategorySchema,
    difficulty: exports.QuestDifficultySchema,
    targetAttribute: exports.AttributeSchema,
    estimatedMinutes: zod_1.z.number().int().min(5).max(180),
    xpReward: zod_1.z.number().int().min(10).max(200),
    statReward: zod_1.z.object({
        attribute: exports.AttributeSchema,
        points: zod_1.z.number().int().min(1).max(5),
    }),
    completionCriteria: zod_1.z.string().min(10),
    recommendationReason: zod_1.z.string().min(10),
    deadline: zod_1.z.string().default('23:59'),
    status: zod_1.z.enum(['PENDING', 'COMPLETED', 'SKIPPED', 'FAILED']).default('PENDING'),
    questType: zod_1.z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'BONUS']).default('DAILY'),
});
exports.QuestMasterPlanSchema = zod_1.z.object({
    dailyFocus: zod_1.z.string().min(5),
    motivationalMessage: zod_1.z.string().min(10),
    totalEstimatedMinutes: zod_1.z.number().int().min(10),
    quests: zod_1.z.array(exports.GeneratedQuestSchema).min(3).max(6),
});
//# sourceMappingURL=questMasterSchema.js.map