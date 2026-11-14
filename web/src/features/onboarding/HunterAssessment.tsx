import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../auth/useAuth'
import { SystemWindow } from '../../components/ui/SystemWindow'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import {
  BasicInfo,
  PhysicalInfo,
  CareerInfo,
  PersonalDevInfo,
  RoutineInfo,
  GoalsSelection,
  HunterProfileData,
} from '../../types/hunter'
import { calculateInitialAttributes } from '../../lib/attributeEngine'
import { saveHunterProfile } from '../../lib/hunterService'
import { useGameStore } from '../../stores/gameStore'

const STEPS = [
  'Basic Information',
  'Physical Conditioning',
  'Technical & Career',
  'Personal Discipline',
  'Schedule & Routine',
  'Hunter Goals',
  'System Awakening',
]

const POPULAR_GOALS = [
  'Muscle building',
  'Weight management',
  'Strength',
  'Stamina',
  'Programming',
  'DSA',
  'Aptitude',
  'Communication',
  'Career development',
  'Reading',
  'Productivity',
  'Consistency',
]

const EQUIPMENT_OPTIONS = [
  { id: 'none', label: 'Bodyweight Only (No Equipment)' },
  { id: 'dumbbells', label: 'Dumbbells / Resistance Bands' },
  { id: 'pullup-bar', label: 'Pull-up Bar' },
  { id: 'gym-membership', label: 'Full Commercial / Home Gym' },
]

export function HunterAssessment() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { setGameData } = useGameStore()

  const [currentStep, setCurrentStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 1. Basic Info State
  const [basic, setBasic] = useState<BasicInfo>({
    fullName: user?.displayName || '',
    ageRange: '18-24',
    country: Intl.DateTimeFormat().resolvedOptions().timeZone.split('/')[0] || 'Unknown',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    occupation: 'Student / Tech Aspirant',
  })

  // 2. Physical Info State
  const [physical, setPhysical] = useState<PhysicalInfo>({
    heightCm: 175,
    weightKg: 70,
    fitnessExperience: 'beginner',
    activityLevel: 'lightly-active',
    equipment: ['none'],
    activitiesToAvoid: '',
    limitations: '',
  })

  // 3. Career Info State
  const [career, setCareer] = useState<CareerInfo>({
    educationOrJob: 'Computer Science / Engineering',
    technicalSkills: ['JavaScript', 'HTML/CSS', 'Git'],
    programmingLanguages: ['TypeScript', 'Python'],
    codingAbility: 'learning-basics',
    targetJobRole: 'Full Stack Software Engineer',
    skillsToDevelop: ['Data Structures & Algorithms', 'System Design', 'React'],
    learningLevel: 'entry',
  })

  // 4. Personal Development State
  const [personalDev, setPersonalDev] = useState<PersonalDevInfo>({
    communication: 3,
    confidence: 3,
    discipline: 3,
    concentration: 3,
    problemSolving: 3,
    customGoalsText: '',
  })

  // 5. Routine State
  const [routine, setRoutine] = useState<RoutineInfo>({
    wakeTime: '06:30',
    sleepTime: '23:00',
    workStudyHours: '09:00 - 17:00',
    availableFreeHoursDaily: 3,
    preferredWorkoutTime: 'morning',
    preferredLearningTime: 'evening',
    restDays: ['Sunday'],
  })

  // 6. Goals State
  const [goals, setGoals] = useState<GoalsSelection>({
    primaryGoals: ['Strength', 'Programming', 'Consistency', 'Productivity'],
    customGoals: [],
  })
  const [newCustomGoal, setNewCustomGoal] = useState('')

  const togglePrimaryGoal = (goal: string) => {
    setGoals((prev) => ({
      ...prev,
      primaryGoals: prev.primaryGoals.includes(goal)
        ? prev.primaryGoals.filter((g) => g !== goal)
        : [...prev.primaryGoals, goal],
    }))
  }

  const addCustomGoal = () => {
    if (!newCustomGoal.trim()) return
    setGoals((prev) => ({
      ...prev,
      customGoals: [...prev.customGoals, newCustomGoal.trim()],
    }))
    setNewCustomGoal('')
  }

  const removeCustomGoal = (goal: string) => {
    setGoals((prev) => ({
      ...prev,
      customGoals: prev.customGoals.filter((g) => g !== goal),
    }))
  }

  const toggleEquipment = (id: string) => {
    setPhysical((prev) => {
      const exists = prev.equipment.includes(id)
      if (exists) {
        const filtered = prev.equipment.filter((item) => item !== id)
        return { ...prev, equipment: filtered.length ? filtered : ['none'] }
      } else {
        return { ...prev, equipment: [...prev.equipment.filter((item) => item !== 'none'), id] }
      }
    })
  }

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleCompleteAwakening = async () => {
    if (!user) return
    setSubmitting(true)
    setError(null)

    try {
      // Deterministically calculate starting attributes
      const initialAttributes = calculateInitialAttributes(
        basic,
        physical,
        career,
        personalDev,
        routine,
        goals
      )

      const profilePayload: HunterProfileData = {
        uid: user.uid,
        basic,
        physical,
        career,
        personalDev,
        routine,
        goals,
        attributes: initialAttributes,
        hunterStatus: {
          rank: 'E',
          level: 1,
          xp: 0,
          nextLevelXp: 100,
          streak: 1,
          longestStreak: 1,
          titles: ['Awakened Player'],
        },
        onboardingCompleted: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await saveHunterProfile(profilePayload)

      // Sync Zustand store
      setGameData({
        level: 1,
        rank: 'E',
        xp: 0,
        streak: 1,
      })

      navigate('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'System initialization failed. Please retry.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy py-12 px-4 relative overflow-hidden">
      <div className="absolute inset-0 scanlines pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10 space-y-6">
        {/* Progress Tracker */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs tracking-widest uppercase">
            <span className="text-[#00d4ff] font-rajdhani font-bold">
              ASSESSMENT PHASE {currentStep + 1} / {STEPS.length}: {STEPS[currentStep]}
            </span>
            <span className="text-gray-400">
              {Math.round(((currentStep + 1) / STEPS.length) * 100)}% CALIBRATED
            </span>
          </div>
          <div className="w-full bg-[#1a2035] h-2 rounded-full overflow-hidden border border-[#00d4ff]/20">
            <motion.div
              className="bg-gradient-to-r from-[#0080ff] to-[#00d4ff] h-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-500 rounded text-red-400 text-xs">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: Basic Information */}
          {currentStep === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <SystemWindow title="HUNTER IDENTIFICATION & TIMEZONE">
                <div className="space-y-4">
                  <p className="text-xs text-gray-300">
                    Enter your baseline identity. The System coordinates daily quest resets based on your local timezone.
                  </p>
                  <Input
                    label="Hunter Name / Moniker"
                    value={basic.fullName}
                    onChange={(e) => setBasic({ ...basic, fullName: e.target.value })}
                    required
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1">
                        Age Range
                      </label>
                      <select
                        className="w-full bg-[#0a0e1a] border border-[#00d4ff]/40 text-gray-200 text-sm rounded-sm p-2.5 focus:border-[#00d4ff] focus:outline-none"
                        value={basic.ageRange}
                        onChange={(e) => setBasic({ ...basic, ageRange: e.target.value as BasicInfo['ageRange'] })}
                      >
                        <option value="under-18">Under 18</option>
                        <option value="18-24">18 - 24 Years</option>
                        <option value="25-34">25 - 34 Years</option>
                        <option value="35-44">35 - 44 Years</option>
                        <option value="45+">45+ Years</option>
                      </select>
                    </div>
                    <Input
                      label="Current Occupation"
                      value={basic.occupation}
                      onChange={(e) => setBasic({ ...basic, occupation: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Country / Region"
                      value={basic.country}
                      onChange={(e) => setBasic({ ...basic, country: e.target.value })}
                    />
                    <Input
                      label="System Timezone"
                      value={basic.timezone}
                      onChange={(e) => setBasic({ ...basic, timezone: e.target.value })}
                    />
                  </div>
                </div>
              </SystemWindow>
            </motion.div>
          )}

          {/* STEP 2: Physical Conditioning */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <SystemWindow title="PHYSICAL CALIBRATION & SAFETY BOUNDARIES">
                <div className="space-y-4">
                  <p className="text-xs text-gray-300">
                    Physical attributes help calculate your initial STR & VIT ratings and ensure exercises do not strain past injuries.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Height (cm)"
                      type="number"
                      value={physical.heightCm || ''}
                      onChange={(e) => setPhysical({ ...physical, heightCm: Number(e.target.value) })}
                    />
                    <Input
                      label="Weight (kg)"
                      type="number"
                      value={physical.weightKg || ''}
                      onChange={(e) => setPhysical({ ...physical, weightKg: Number(e.target.value) })}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1">
                        Fitness Experience
                      </label>
                      <select
                        className="w-full bg-[#0a0e1a] border border-[#00d4ff]/40 text-gray-200 text-sm rounded-sm p-2.5 focus:border-[#00d4ff] focus:outline-none"
                        value={physical.fitnessExperience}
                        onChange={(e) => setPhysical({ ...physical, fitnessExperience: e.target.value as PhysicalInfo['fitnessExperience'] })}
                      >
                        <option value="beginner">Beginner (New / Returning)</option>
                        <option value="intermediate">Intermediate (Consistent 1+ years)</option>
                        <option value="advanced">Advanced (Experienced Athlete)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1">
                        Activity Level
                      </label>
                      <select
                        className="w-full bg-[#0a0e1a] border border-[#00d4ff]/40 text-gray-200 text-sm rounded-sm p-2.5 focus:border-[#00d4ff] focus:outline-none"
                        value={physical.activityLevel}
                        onChange={(e) => setPhysical({ ...physical, activityLevel: e.target.value as PhysicalInfo['activityLevel'] })}
                      >
                        <option value="sedentary">Sedentary (Desk work / Little movement)</option>
                        <option value="lightly-active">Lightly Active (1-3 days light exercise)</option>
                        <option value="moderately-active">Moderately Active (3-5 days exercise)</option>
                        <option value="very-active">Very Active (Heavy training / active work)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
                      Available Exercise Equipment
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {EQUIPMENT_OPTIONS.map((opt) => {
                        const checked = physical.equipment.includes(opt.id)
                        return (
                          <div
                            key={opt.id}
                            onClick={() => toggleEquipment(opt.id)}
                            className={`p-3 rounded border text-xs cursor-pointer transition-all ${
                              checked
                                ? 'bg-[#00d4ff]/10 border-[#00d4ff] text-white'
                                : 'bg-[#0d1326] border-gray-700 text-gray-400 hover:border-gray-500'
                            }`}
                          >
                            <span className="mr-2">{checked ? '✓' : '○'}</span>
                            {opt.label}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <Input
                    label="Physical Limitations or Injuries (Optional)"
                    placeholder="e.g. Lower back stiffness, knee pain on squats"
                    value={physical.limitations || ''}
                    onChange={(e) => setPhysical({ ...physical, limitations: e.target.value })}
                  />
                </div>
              </SystemWindow>
            </motion.div>
          )}

          {/* STEP 3: Career & Learning */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <SystemWindow title="INTELLECT & CAREER FOCUS (INT SCALING)">
                <div className="space-y-4">
                  <p className="text-xs text-gray-300">
                    The System generates dedicated intelligence quests tailored to your engineering and career ambitions.
                  </p>
                  <Input
                    label="Current Field / Degree"
                    value={career.educationOrJob}
                    onChange={(e) => setCareer({ ...career, educationOrJob: e.target.value })}
                  />
                  <Input
                    label="Target Job Role / Career Goal"
                    placeholder="e.g. Senior Frontend Architect, AI Engineer"
                    value={career.targetJobRole}
                    onChange={(e) => setCareer({ ...career, targetJobRole: e.target.value })}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1">
                        Current Coding Ability
                      </label>
                      <select
                        className="w-full bg-[#0a0e1a] border border-[#00d4ff]/40 text-gray-200 text-sm rounded-sm p-2.5 focus:border-[#00d4ff] focus:outline-none"
                        value={career.codingAbility}
                        onChange={(e) => setCareer({ ...career, codingAbility: e.target.value as CareerInfo['codingAbility'] })}
                      >
                        <option value="novice">Novice (Zero to minimal code)</option>
                        <option value="learning-basics">Learning Basics (Syntax & simple scripts)</option>
                        <option value="competent">Competent (Builds full-stack applications)</option>
                        <option value="expert">Expert (Production systems & architecture)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1">
                        Seniority Level
                      </label>
                      <select
                        className="w-full bg-[#0a0e1a] border border-[#00d4ff]/40 text-gray-200 text-sm rounded-sm p-2.5 focus:border-[#00d4ff] focus:outline-none"
                        value={career.learningLevel}
                        onChange={(e) => setCareer({ ...career, learningLevel: e.target.value as CareerInfo['learningLevel'] })}
                      >
                        <option value="student">Student / Self-Taught</option>
                        <option value="entry">Entry Level / Junior</option>
                        <option value="mid">Mid Level</option>
                        <option value="senior">Senior / Lead</option>
                      </select>
                    </div>
                  </div>
                  <Input
                    label="Programming Languages Known (comma separated)"
                    value={career.programmingLanguages.join(', ')}
                    onChange={(e) =>
                      setCareer({
                        ...career,
                        programmingLanguages: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                  />
                  <Input
                    label="Core Skills You Want to Develop (comma separated)"
                    value={career.skillsToDevelop.join(', ')}
                    onChange={(e) =>
                      setCareer({
                        ...career,
                        skillsToDevelop: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                  />
                </div>
              </SystemWindow>
            </motion.div>
          )}

          {/* STEP 4: Personal Discipline */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <SystemWindow title="MINDSET & SENSE MATRIX (SEN / AGI)">
                <div className="space-y-4">
                  <p className="text-xs text-gray-300">
                    Self-rate your internal discipline and focus on a scale of 1 (Lowest) to 5 (Mastery).
                  </p>
                  {[
                    { key: 'discipline', label: 'Discipline & Consistency', desc: 'Ability to follow routines even when unmotivated' },
                    { key: 'concentration', label: 'Concentration & Deep Work', desc: 'Sustained focus without digital distractions' },
                    { key: 'problemSolving', label: 'Problem Solving Grit', desc: 'Resilience when encountering blockers and bugs' },
                    { key: 'communication', label: 'Communication & Expression', desc: 'Clarity in explaining concepts and teamwork' },
                    { key: 'confidence', label: 'Self-Confidence & Decisiveness', desc: 'Confidence in taking on difficult challenges' },
                  ].map((field) => (
                    <div key={field.key} className="p-3 bg-[#0d1326] rounded border border-[#00d4ff]/20 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-rajdhani font-bold text-white uppercase tracking-wider">
                          {field.label}
                        </span>
                        <span className="text-[#00d4ff] font-bold text-sm">
                          {personalDev[field.key as keyof PersonalDevInfo]} / 5
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400">{field.desc}</p>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={personalDev[field.key as keyof PersonalDevInfo]}
                        onChange={(e) =>
                          setPersonalDev({ ...personalDev, [field.key]: Number(e.target.value) })
                        }
                        className="w-full accent-[#00d4ff] cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </SystemWindow>
            </motion.div>
          )}

          {/* STEP 5: Daily Schedule & Routine */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <SystemWindow title="CIRCADIAN RHYTHM & RECOVERY SLOTS">
                <div className="space-y-4">
                  <p className="text-xs text-gray-300">
                    The System respects your rest days and adapts quest duration to your free hours.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Wake-Up Time"
                      type="time"
                      value={routine.wakeTime}
                      onChange={(e) => setRoutine({ ...routine, wakeTime: e.target.value })}
                    />
                    <Input
                      label="Target Sleep Time"
                      type="time"
                      value={routine.sleepTime}
                      onChange={(e) => setRoutine({ ...routine, sleepTime: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Available Free Hours / Day"
                      type="number"
                      value={routine.availableFreeHoursDaily}
                      onChange={(e) =>
                        setRoutine({ ...routine, availableFreeHoursDaily: Number(e.target.value) })
                      }
                    />
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1">
                        Preferred Workout Time
                      </label>
                      <select
                        className="w-full bg-[#0a0e1a] border border-[#00d4ff]/40 text-gray-200 text-sm rounded-sm p-2.5 focus:border-[#00d4ff] focus:outline-none"
                        value={routine.preferredWorkoutTime}
                        onChange={(e) =>
                          setRoutine({
                            ...routine,
                            preferredWorkoutTime: e.target.value as RoutineInfo['preferredWorkoutTime'],
                          })
                        }
                      >
                        <option value="morning">Morning (Early riser energy)</option>
                        <option value="afternoon">Afternoon</option>
                        <option value="evening">Evening (After work / study)</option>
                        <option value="night">Night</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
                      Designated Recovery / Rest Days
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                        (day) => {
                          const active = routine.restDays.includes(day)
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                setRoutine((prev) => ({
                                  ...prev,
                                  restDays: active
                                    ? prev.restDays.filter((d) => d !== day)
                                    : [...prev.restDays, day],
                                }))
                              }}
                              className={`py-2 px-1 text-xs rounded border transition-all text-center ${
                                active
                                  ? 'bg-[#00d4ff]/20 border-[#00d4ff] text-white font-bold'
                                  : 'bg-[#0d1326] border-gray-700 text-gray-400 hover:border-gray-500'
                              }`}
                            >
                              {day.slice(0, 3)}
                            </button>
                          )
                        }
                      )}
                    </div>
                  </div>
                </div>
              </SystemWindow>
            </motion.div>
          )}

          {/* STEP 6: Goals Selection */}
          {currentStep === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <SystemWindow title="TARGET DIRECTIVES & CUSTOM GOALS">
                <div className="space-y-4">
                  <p className="text-xs text-gray-300">
                    Select the key areas where you want to awaken your abilities:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {POPULAR_GOALS.map((goal) => {
                      const selected = goals.primaryGoals.includes(goal)
                      return (
                        <div
                          key={goal}
                          onClick={() => togglePrimaryGoal(goal)}
                          className={`p-2.5 rounded border text-xs cursor-pointer text-center font-rajdhani font-semibold tracking-wider transition-all ${
                            selected
                              ? 'bg-[#00d4ff]/15 border-[#00d4ff] text-[#00d4ff] shadow-holo'
                              : 'bg-[#0d1326] border-gray-700 text-gray-400 hover:border-gray-500'
                          }`}
                        >
                          {selected ? '★ ' : ''}
                          {goal}
                        </div>
                      )
                    })}
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1">
                      Add Custom Goals
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Master LeetCode graph algorithms, Run 5k without stopping"
                        value={newCustomGoal}
                        onChange={(e) => setNewCustomGoal(e.target.value)}
                        className="flex-1 bg-[#0a0e1a] border border-[#00d4ff]/40 text-gray-200 text-sm rounded-sm p-2 focus:border-[#00d4ff] focus:outline-none"
                      />
                      <Button variant="primary" size="sm" type="button" onClick={addCustomGoal}>
                        Add
                      </Button>
                    </div>
                  </div>

                  {goals.customGoals.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {goals.customGoals.map((cg) => (
                        <span
                          key={cg}
                          className="text-xs bg-[#1a2035] border border-[#00d4ff]/40 text-gray-200 px-2 py-1 rounded flex items-center gap-2"
                        >
                          {cg}
                          <button
                            type="button"
                            onClick={() => removeCustomGoal(cg)}
                            className="text-red-400 hover:text-red-200 text-xs font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </SystemWindow>
            </motion.div>
          )}

          {/* STEP 7: Awakening Summary */}
          {currentStep === 6 && (
            <motion.div
              key="step-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <SystemWindow title="CALIBRATION COMPLETE: READY FOR AWAKENING">
                <div className="space-y-6 text-center py-4">
                  <div className="inline-block p-4 rounded-full border-2 border-[#00d4ff] bg-[#00d4ff]/10 shadow-holo">
                    <span className="font-rajdhani text-2xl font-bold text-[#00d4ff]">E-RANK</span>
                  </div>
                  <div>
                    <h2 className="font-rajdhani text-2xl font-bold text-white tracking-widest">
                      AWAKEN AS A PLAYER
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                      The System has processed your physical parameters, career objectives, and routine schedule.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                    <div className="p-3 bg-[#0d1326] border border-[#00d4ff]/30 rounded">
                      <span className="text-[10px] text-gray-400 uppercase">Focus Goals</span>
                      <p className="text-xs font-bold text-[#00d4ff] truncate">
                        {goals.primaryGoals.length + goals.customGoals.length} Directives
                      </p>
                    </div>
                    <div className="p-3 bg-[#0d1326] border border-[#00d4ff]/30 rounded">
                      <span className="text-[10px] text-gray-400 uppercase">Initial Rank</span>
                      <p className="text-xs font-bold text-gray-200">E-Rank Awakened</p>
                    </div>
                    <div className="p-3 bg-[#0d1326] border border-[#00d4ff]/30 rounded">
                      <span className="text-[10px] text-gray-400 uppercase">Free Time/Day</span>
                      <p className="text-xs font-bold text-gray-200">
                        {routine.availableFreeHoursDaily} Hours
                      </p>
                    </div>
                    <div className="p-3 bg-[#0d1326] border border-[#00d4ff]/30 rounded">
                      <span className="text-[10px] text-gray-400 uppercase">Rest Days</span>
                      <p className="text-xs font-bold text-gray-200">
                        {routine.restDays.length ? routine.restDays.join(', ') : 'None'}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-400 italic">
                    "From this moment onward, you will receive daily system quests. Your stats will grow alongside your true effort."
                  </p>
                </div>
              </SystemWindow>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Navigation Controls */}
        <div className="flex justify-between items-center pt-4">
          <Button
            variant="ghost"
            size="md"
            disabled={currentStep === 0 || submitting}
            onClick={handlePrev}
          >
            ← Previous
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button variant="primary" size="md" onClick={handleNext}>
              Proceed Next →
            </Button>
          ) : (
            <Button
              variant="gold"
              size="lg"
              loading={submitting}
              onClick={handleCompleteAwakening}
            >
              ⚡ Accept System Re-Awakening
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

