import {
  BasicInfo,
  PhysicalInfo,
  CareerInfo,
  PersonalDevInfo,
  RoutineInfo,
  GoalsSelection,
  HunterAttributes,
  HunterRank,
} from '../types/hunter'

/**
 * Deterministically calculate starting hunter attributes (5 - 20 range)
 * based on the user's comprehensive assessment answers.
 */
export function calculateInitialAttributes(
  _basic: BasicInfo,
  physical: PhysicalInfo,
  career: CareerInfo,
  personalDev: PersonalDevInfo,
  routine: RoutineInfo,
  goals: GoalsSelection
): HunterAttributes {
  // Baseline stats for an Awakened Player
  let str = 5
  let vit = 5
  let agi = 5
  let int = 5
  let sen = 5

  // 1. Physical attributes impact on STR & VIT
  if (physical.fitnessExperience === 'intermediate') {
    str += 3
    vit += 2
  } else if (physical.fitnessExperience === 'advanced') {
    str += 5
    vit += 4
  }

  if (physical.activityLevel === 'moderately-active') {
    vit += 2
    agi += 1
  } else if (physical.activityLevel === 'very-active') {
    vit += 3
    agi += 3
  }

  if (physical.equipment.includes('gym-membership') || physical.equipment.includes('barbell')) {
    str += 2
  }

  // 2. Technical learning & Career impact on INT
  if (career.codingAbility === 'competent') {
    int += 3
  } else if (career.codingAbility === 'expert') {
    int += 5
  } else if (career.codingAbility === 'learning-basics') {
    int += 1
  }

  if (career.programmingLanguages.length >= 3) {
    int += 2
  } else if (career.programmingLanguages.length >= 1) {
    int += 1
  }

  // 3. Personal development impact on SEN, AGI & INT
  // Scores 1-5
  sen += Math.round((personalDev.concentration + personalDev.problemSolving) / 2)
  agi += Math.round(personalDev.discipline * 0.8)
  int += Math.round(personalDev.problemSolving * 0.5)

  // 4. Routine discipline impact on AGI & VIT
  if (routine.availableFreeHoursDaily >= 2) {
    agi += 1
  }
  // Regular sleep cycle gives vitality
  if (routine.restDays.length >= 1 && routine.restDays.length <= 2) {
    vit += 2
  }

  // 5. Goals alignment bonuses
  const allGoals = [...goals.primaryGoals, ...goals.customGoals].map((g) => g.toLowerCase())

  if (allGoals.some((g) => g.includes('muscle') || g.includes('strength'))) {
    str += 2
  }
  if (allGoals.some((g) => g.includes('stamina') || g.includes('consistency') || g.includes('productivity'))) {
    agi += 2
  }
  if (allGoals.some((g) => g.includes('weight') || g.includes('health'))) {
    vit += 2
  }
  if (allGoals.some((g) => g.includes('programming') || g.includes('dsa') || g.includes('aptitude') || g.includes('career'))) {
    int += 2
  }
  if (allGoals.some((g) => g.includes('concentration') || g.includes('discipline') || g.includes('reading') || g.includes('communication'))) {
    sen += 2
  }

  return {
    STR: Math.min(25, Math.max(5, str)),
    VIT: Math.min(25, Math.max(5, vit)),
    AGI: Math.min(25, Math.max(5, agi)),
    INT: Math.min(25, Math.max(5, int)),
    SEN: Math.min(25, Math.max(5, sen)),
  }
}

/**
 * Calculate rank from level
 */
export function calculateRankFromLevel(level: number): HunterRank {
  if (level >= 60) return 'National Level'
  if (level >= 45) return 'S'
  if (level >= 30) return 'A'
  if (level >= 20) return 'B'
  if (level >= 10) return 'C'
  if (level >= 5) return 'D'
  return 'E'
}

/**
 * Standard Solo Leveling XP Curve:
 * 100 base XP + 50 * (level - 1)
 */
export function getRequiredXpForNextLevel(level: number): number {
  return 100 + (level - 1) * 50
}

