"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeQuest = exports.getOrCreateDailyQuests = void 0;
const functions = __importStar(require("firebase-functions/v2"));
const admin = __importStar(require("firebase-admin"));
const questMasterAgent_1 = require("./questMasterAgent");
admin.initializeApp();
const db = admin.firestore();
// Helper: Get local date string YYYY-MM-DD
function getLocalDateString(tz) {
    try {
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: tz,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
        return formatter.format(new Date());
    }
    catch {
        return new Date().toISOString().slice(0, 10);
    }
}
// XP curve
function getRequiredXpForNextLevel(level) {
    return 100 + (level - 1) * 50;
}
function calculateRankFromLevel(level) {
    if (level >= 60)
        return 'National Level';
    if (level >= 45)
        return 'S';
    if (level >= 30)
        return 'A';
    if (level >= 20)
        return 'B';
    if (level >= 10)
        return 'C';
    if (level >= 5)
        return 'D';
    return 'E';
}
/**
 * 1. getOrCreateDailyQuests (Callable)
 * Idempotent: generates once per local calendar date, checks Firestore first
 */
exports.getOrCreateDailyQuests = functions.https.onCall({ secrets: ['OPENAI_API_KEY'], cors: true }, async (request) => {
    if (!request.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Hunter authentication required.');
    }
    const uid = request.auth.uid;
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Hunter profile not initialized.');
    }
    const profile = userSnap.data() || {};
    const timezone = profile.basic?.timezone || 'Asia/Kolkata';
    const todayDate = getLocalDateString(timezone);
    const dailyQuestDocRef = userRef.collection('dailyQuests').doc(todayDate);
    // Check if plan already exists for today
    const existingSnap = await dailyQuestDocRef.get();
    if (existingSnap.exists) {
        const data = existingSnap.data();
        return {
            date: todayDate,
            timezone,
            dailyFocus: data.dailyFocus,
            motivationalMessage: data.motivationalMessage,
            totalEstimatedMinutes: data.totalEstimatedMinutes,
            quests: data.quests,
            isNewDay: false,
            source: 'CACHED',
        };
    }
    // Determine Rest Day
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long', timeZone: timezone });
    const isRestDay = (profile.routine?.restDays || []).includes(dayOfWeek);
    // Fetch previous 7 days of quest history for adaptive scaling
    const historyQuery = await userRef
        .collection('dailyQuests')
        .orderBy('date', 'desc')
        .limit(7)
        .get();
    const history7Days = historyQuery.docs.map((d) => d.data());
    let plan;
    let source = 'RULE_ENGINE';
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
        try {
            plan = await (0, questMasterAgent_1.runQuestMasterAgent)({
                uid,
                date: todayDate,
                timezone,
                profile,
                history7Days,
                isRestDay,
            }, apiKey);
            source = 'AI_AGENT';
        }
        catch (err) {
            console.warn('Falling back to deterministic plan:', err);
            plan = generateFallbackPlan(uid, todayDate, profile, isRestDay);
        }
    }
    else {
        plan = generateFallbackPlan(uid, todayDate, profile, isRestDay);
    }
    // Save to Firestore idempotently
    await dailyQuestDocRef.set({
        date: todayDate,
        timezone,
        dailyFocus: plan.dailyFocus,
        motivationalMessage: plan.motivationalMessage,
        totalEstimatedMinutes: plan.totalEstimatedMinutes,
        quests: plan.quests,
        status: 'ACTIVE',
        source,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return {
        date: todayDate,
        timezone,
        ...plan,
        isNewDay: true,
        source,
    };
});
/**
 * 2. completeQuest (Callable)
 * Validates quest ownership, ensures XP is awarded only once via Firestore transaction
 */
exports.completeQuest = functions.https.onCall({ cors: true }, async (request) => {
    if (!request.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Hunter authentication required.');
    }
    const uid = request.auth.uid;
    const { date, questId } = request.data || {};
    if (!date || !questId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing date or questId parameter.');
    }
    const userRef = db.collection('users').doc(uid);
    const dailyQuestRef = userRef.collection('dailyQuests').doc(date);
    return await db.runTransaction(async (transaction) => {
        const dailySnap = await transaction.get(dailyQuestRef);
        const userSnap = await transaction.get(userRef);
        if (!dailySnap.exists) {
            throw new functions.https.HttpsError('not-found', 'Daily quest plan not found.');
        }
        if (!userSnap.exists) {
            throw new functions.https.HttpsError('not-found', 'User profile not found.');
        }
        const planData = dailySnap.data() || {};
        const quests = (planData.quests || []);
        const questIndex = quests.findIndex((q) => q.id === questId);
        if (questIndex === -1) {
            throw new functions.https.HttpsError('not-found', 'Quest not found in daily plan.');
        }
        const quest = quests[questIndex];
        if (quest.status === 'COMPLETED') {
            throw new functions.https.HttpsError('already-exists', 'Quest already completed. Duplicate XP prevented.');
        }
        // Update quest status
        quest.status = 'COMPLETED';
        quest.completedAt = new Date().toISOString();
        quests[questIndex] = quest;
        transaction.update(dailyQuestRef, { quests });
        // Calculate XP, Level and Attribute progression
        const userData = userSnap.data() || {};
        const hunterStatus = userData.hunterStatus || {
            level: 1,
            xp: 0,
            nextLevelXp: 100,
            rank: 'E',
            streak: 1,
        };
        const attributes = userData.attributes || { STR: 10, VIT: 10, AGI: 10, INT: 10, SEN: 10 };
        const xpEarned = Number(quest.xpReward) || 25;
        let newXp = (hunterStatus.xp || 0) + xpEarned;
        let newLevel = hunterStatus.level || 1;
        let nextLevelXp = hunterStatus.nextLevelXp || 100;
        let leveledUp = false;
        while (newXp >= nextLevelXp) {
            newXp -= nextLevelXp;
            newLevel += 1;
            nextLevelXp = getRequiredXpForNextLevel(newLevel);
            leveledUp = true;
        }
        const newRank = calculateRankFromLevel(newLevel);
        const statAttr = quest.targetAttribute || 'STR';
        const statPoints = Number(quest.statReward?.points) || 1;
        attributes[statAttr] = (attributes[statAttr] || 10) + statPoints;
        const updatedHunterStatus = {
            ...hunterStatus,
            xp: newXp,
            level: newLevel,
            nextLevelXp,
            rank: newRank,
        };
        transaction.update(userRef, {
            hunterStatus: updatedHunterStatus,
            attributes,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Record in questHistory
        const questHistRef = userRef.collection('questHistory').doc(questId);
        transaction.set(questHistRef, {
            questId,
            date,
            title: quest.title,
            category: quest.category,
            difficulty: quest.difficulty,
            xpEarned,
            completedAt: quest.completedAt,
        });
        // Record in progressionHistory
        const progHistRef = userRef.collection('progressionHistory').doc();
        transaction.set(progHistRef, {
            questId,
            xpEarned,
            previousXP: hunterStatus.xp,
            newXP: newXp,
            level: newLevel,
            rank: newRank,
            leveledUp,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        return {
            success: true,
            questId,
            xpEarned,
            hunterStatus: updatedHunterStatus,
            attributes,
            leveledUp,
        };
    });
});
/**
 * Fallback Rule-Based Generation when offline or AI call not made
 */
function generateFallbackPlan(uid, date, profile, isRestDay) {
    const freeHours = profile.routine?.availableFreeHoursDaily || 2;
    const targetSkill = profile.career?.skillsToDevelop?.[0] || 'Data Structures';
    const targetLang = profile.career?.programmingLanguages?.[0] || 'Python';
    const quests = [];
    if (isRestDay) {
        quests.push({
            id: `quest-${uid}-${date}-rest`,
            title: 'Active Restoration: Spinal Decompression & Mobility',
            description: 'Scheduled rest day. Practice 15 minutes of guided hip openers and deep breathing.',
            category: 'Recovery',
            difficulty: 'Easy',
            targetAttribute: 'VIT',
            estimatedMinutes: 15,
            xpReward: 20,
            statReward: { attribute: 'VIT', points: 1 },
            completionCriteria: 'Complete 15 minutes of mobility without strenuous fatigue.',
            recommendationReason: 'Today is your planned rest day to preserve musculoskeletal longevity.',
            deadline: '23:59',
            status: 'PENDING',
            questType: 'DAILY',
        });
    }
    else {
        quests.push({
            id: `quest-${uid}-${date}-phys`,
            title: 'Shadow Calisthenics: Push & Core Pyramid',
            description: 'Perform 3 sets of 15 push-ups, 20 squats, and a 45-second plank.',
            category: 'Fitness',
            difficulty: 'Normal',
            targetAttribute: 'STR',
            estimatedMinutes: Math.min(30, freeHours * 15),
            xpReward: 30,
            statReward: { attribute: 'STR', points: 1 },
            completionCriteria: 'Finish all 3 sets with clean form and controlled cadence.',
            recommendationReason: 'Builds foundational upper-body pressing strength and core endurance.',
            deadline: '23:59',
            status: 'PENDING',
            questType: 'DAILY',
        });
    }
    quests.push({
        id: `quest-${uid}-${date}-code`,
        title: `Monarch's Logic: ${targetSkill} Challenge`,
        description: `Solve 1 medium algorithmic problem or build a component in ${targetLang}.`,
        category: 'DSA',
        difficulty: 'Normal',
        targetAttribute: 'INT',
        estimatedMinutes: Math.min(45, freeHours * 20),
        xpReward: 35,
        statReward: { attribute: 'INT', points: 1 },
        completionCriteria: 'Implement clean, working solution with time complexity noted.',
        recommendationReason: `Reinforces technical prowess for target role ${profile.career?.targetJobRole || 'Software Engineer'}.`,
        deadline: '23:59',
        status: 'PENDING',
        questType: 'DAILY',
    });
    quests.push({
        id: `quest-${uid}-${date}-vit`,
        title: 'Hydration & Clean Nutrition Protocol',
        description: 'Consume at least 2.5 liters of clean water and whole foods protein.',
        category: 'Productivity',
        difficulty: 'Easy',
        targetAttribute: 'VIT',
        estimatedMinutes: 10,
        xpReward: 20,
        statReward: { attribute: 'VIT', points: 1 },
        completionCriteria: 'Log 2.5L water consumption and nutritious meals.',
        recommendationReason: 'Maintains optimal cognitive performance and prevents muscle fatigue.',
        deadline: '23:59',
        status: 'PENDING',
        questType: 'DAILY',
    });
    quests.push({
        id: `quest-${uid}-${date}-sen`,
        title: 'Sense Expansion: 25-Minute Deep Focus Sprint',
        description: 'No social media, no notifications. Deep work block on your highest-priority objective.',
        category: 'Personal development',
        difficulty: 'Easy',
        targetAttribute: 'SEN',
        estimatedMinutes: 25,
        xpReward: 25,
        statReward: { attribute: 'SEN', points: 1 },
        completionCriteria: 'Complete 25 minutes of continuous focused study or work.',
        recommendationReason: 'Cultivates high-tier concentration and mental resistance against digital noise.',
        deadline: '23:59',
        status: 'PENDING',
        questType: 'DAILY',
    });
    return {
        dailyFocus: isRestDay ? 'System Recovery & Active Reflection' : `${targetSkill} Mastery & Physical Conditioning`,
        motivationalMessage: isRestDay
            ? 'A true hunter understands when to sharpen the blade. Rest and re-calibrate.'
            : 'The System grants power only to those who step through the gate each day.',
        totalEstimatedMinutes: quests.reduce((acc, q) => acc + q.estimatedMinutes, 0),
        quests,
    };
}
//# sourceMappingURL=index.js.map