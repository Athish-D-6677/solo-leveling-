export type HunterRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'National Level'

export type AttributeKey = 'STR' | 'VIT' | 'AGI' | 'INT' | 'SEN'

export interface HunterAttributes {
  STR: number
  VIT: number
  AGI: number
  INT: number
  SEN: number
}

export interface BasicInfo {
  fullName: string
  ageRange: 'under-18' | '18-24' | '25-34' | '35-44' | '45+'
  country: string
  timezone: string
  occupation: string
}

export interface PhysicalInfo {
  heightCm?: number
  weightKg?: number
  fitnessExperience: 'beginner' | 'intermediate' | 'advanced'
  activityLevel: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active'
  equipment: string[]
  activitiesToAvoid?: string
  limitations?: string
}

export interface CareerInfo {
  educationOrJob: string
  technicalSkills: string[]
  programmingLanguages: string[]
  codingAbility: 'novice' | 'learning-basics' | 'competent' | 'expert'
  targetJobRole: string
  skillsToDevelop: string[]
  learningLevel: 'student' | 'entry' | 'mid' | 'senior'
}

export interface PersonalDevInfo {
  communication: number // 1 to 5
  confidence: number // 1 to 5
  discipline: number // 1 to 5
  concentration: number // 1 to 5
  problemSolving: number // 1 to 5
  customGoalsText?: string
}

export interface RoutineInfo {
  wakeTime: string
  sleepTime: string
  workStudyHours: string
  availableFreeHoursDaily: number
  preferredWorkoutTime: 'morning' | 'afternoon' | 'evening' | 'night'
  preferredLearningTime: 'morning' | 'afternoon' | 'evening' | 'night'
  restDays: string[]
}

export interface GoalsSelection {
  primaryGoals: string[]
  customGoals: string[]
}

export interface HunterProfileData {
  uid: string
  basic: BasicInfo
  physical: PhysicalInfo
  career: CareerInfo
  personalDev: PersonalDevInfo
  routine: RoutineInfo
  goals: GoalsSelection
  attributes: HunterAttributes
  hunterStatus: {
    rank: HunterRank
    level: number
    xp: number
    nextLevelXp: number
    streak: number
    longestStreak: number
    titles: string[]
  }
  onboardingCompleted: boolean
  createdAt: string
  updatedAt: string
}
