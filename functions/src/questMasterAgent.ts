import { OpenAI } from 'openai'
import { QuestMasterPlan, QuestMasterPlanSchema } from './questMasterSchema'

interface AgentContext {
  uid: string
  date: string
  timezone: string
  profile: any
  history7Days: any[]
  isRestDay: boolean
}

/**
 * Solo Leveling Quest Master AI Agent
 * Uses OpenAI with structured JSON outputs and Zod schema validation.
 */
export async function runQuestMasterAgent(
  context: AgentContext,
  apiKey: string
): Promise<QuestMasterPlan> {
  const openai = new OpenAI({ apiKey })

  const systemPrompt = `You are the SOLO LEVELING QUEST MASTER, the omniscient and strict architect of the Hunter progression system.
Your mission is to analyze the Hunter's profile, physical limits, equipment, career objectives, available time, and previous 7-day performance to forge a customized set of daily quests.

DIRECTIVES & RULES:
1. Quest Count: Generate exactly 3 to 5 daily quests + 1 optional weekly challenge.
2. Measurable & Concrete: Avoid generic directives like "learn coding" or "work out". Instead state concrete tasks like "Solve 2 Binary Search problems in Python and document time complexity" or "Complete 3 sets of 15 bodyweight pushups with 60s rest".
3. Respect Rest Days: If isRestDay is true, DO NOT assign intense physical workouts. Assign recovery, mobility, or light reflective learning.
4. Time Allocation: Total estimated minutes must not exceed availableFreeHoursDaily (${context.profile.routine?.availableFreeHoursDaily || 2} hours = ${(context.profile.routine?.availableFreeHoursDaily || 2) * 60} mins).
5. Target Attributes:
   - STR: Strength, heavy calisthenics, gym lifts
   - VIT: Vitality, nutrition, sleep, hydration, recovery
   - AGI: Cardio, agility, consistency, streak discipline
   - INT: Technical coding, DSA, system design, academic study
   - SEN: Mental focus, meditation, uninterrupted deep-work sprints
6. Recommendation Reason: Explain clearly why each quest was assigned based on their specific targets or past weak areas.
7. Tone: The cold, futuristic, slightly encouraging voice of the Solo Leveling System window.`

  const userPrompt = `HUNTER STATUS & CALIBRATION DATA:
- Name: ${context.profile.basic?.fullName || 'Player'}
- Occupation: ${context.profile.basic?.occupation || 'Hunter'}
- Timezone: ${context.timezone}
- Date: ${context.date}
- Is Designated Rest Day: ${context.isRestDay}
- Available Daily Hours: ${context.profile.routine?.availableFreeHoursDaily || 2} hrs
- Equipment Access: ${JSON.stringify(context.profile.physical?.equipment || ['none'])}
- Fitness Experience: ${context.profile.physical?.fitnessExperience || 'beginner'}
- Career Ambition: ${context.profile.career?.targetJobRole || 'Software Engineer'}
- Target Skills: ${JSON.stringify(context.profile.career?.skillsToDevelop || ['DSA'])}
- Programming Languages: ${JSON.stringify(context.profile.career?.programmingLanguages || ['TypeScript'])}
- Hunter Attributes: STR:${context.profile.attributes?.STR || 10}, VIT:${context.profile.attributes?.VIT || 10}, AGI:${context.profile.attributes?.AGI || 10}, INT:${context.profile.attributes?.INT || 10}, SEN:${context.profile.attributes?.SEN || 10}
- Recent 7-Day History: ${context.history7Days.length} past records found.

Provide a valid structured QuestMasterPlan with dailyFocus, motivationalMessage, totalEstimatedMinutes, and quests array.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cost-efficient, high-precision structured model
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    })

    const rawJson = JSON.parse(response.choices[0].message.content || '{}')
    
    // Ensure ids are present
    if (Array.isArray(rawJson.quests)) {
      rawJson.quests = rawJson.quests.map((q: any, i: number) => ({
        ...q,
        id: q.id || `quest-${context.uid}-${context.date}-${i + 1}`,
        status: q.status || 'PENDING',
        questType: q.questType || 'DAILY',
        deadline: q.deadline || '23:59',
      }))
    }

    const validated = QuestMasterPlanSchema.parse(rawJson)
    return validated
  } catch (err) {
    console.warn('AI Quest Master validation failed, falling back to deterministic engine:', err)
    throw err
  }
}

