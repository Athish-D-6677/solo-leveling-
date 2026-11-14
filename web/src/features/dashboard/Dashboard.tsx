import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../auth/useAuth'
import { SystemWindow } from '../../components/ui/SystemWindow'
import { XPBar } from '../../components/ui/XPBar'
import { StatBar } from '../../components/ui/StatBar'
import { Button } from '../../components/ui/Button'
import { HunterProfileData } from '../../types/hunter'
import { Quest, DailyPlanResponse } from '../../types/quest'
import { getHunterProfile, saveHunterProfile } from '../../lib/hunterService'
import {
  fetchOrCreateDailyQuests,
  submitCompleteQuest,
} from '../../lib/questMasterService'
import { getStoredQuestHistory, DailyQuestRecord } from '../../lib/questEngine'

export function Dashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<HunterProfileData | null>(null)
  const [dailyPlan, setDailyPlan] = useState<DailyPlanResponse | null>(null)
  const [quests, setQuests] = useState<Quest[]>([])
  const [historyRecords, setHistoryRecords] = useState<DailyQuestRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [systemPhase, setSystemPhase] = useState<string>('QUEST MASTER INITIALIZING...')
  const [filter, setFilter] = useState<'ALL' | 'DAILY' | 'WEEKLY' | 'HISTORY'>('ALL')
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string | null>(null)
  const [levelUpEvent, setLevelUpEvent] = useState<{ newLevel: number; newRank: string } | null>(null)
  const [submittingQuestId, setSubmittingQuestId] = useState<string | null>(null)

  // 1. Load Hunter status & generate AI/Deterministic directives
  useEffect(() => {
    async function loadData() {
      if (!user) return
      setLoading(true)
      setSystemPhase('ANALYZING HUNTER STATUS...')
      try {
        let currentProfile = await getHunterProfile(user.uid)
        if (!currentProfile) {
          currentProfile = {
            uid: user.uid,
            basic: {
              fullName: user.displayName || 'Awakened Player',
              ageRange: '18-24',
              country: 'India',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
              occupation: 'Tech Aspirant',
            },
            physical: {
              fitnessExperience: 'beginner',
              activityLevel: 'lightly-active',
              equipment: ['none'],
            },
            career: {
              educationOrJob: 'Software Engineering',
              technicalSkills: ['TypeScript', 'React'],
              programmingLanguages: ['TypeScript'],
              codingAbility: 'learning-basics',
              targetJobRole: 'Full Stack Engineer',
              skillsToDevelop: ['Algorithms', 'System Design'],
              learningLevel: 'entry',
            },
            personalDev: {
              communication: 3,
              confidence: 3,
              discipline: 4,
              concentration: 4,
              problemSolving: 3,
            },
            routine: {
              wakeTime: '06:30',
              sleepTime: '23:00',
              workStudyHours: '09:00 - 17:00',
              availableFreeHoursDaily: 3,
              preferredWorkoutTime: 'morning',
              preferredLearningTime: 'evening',
              restDays: ['Sunday'],
            },
            goals: {
              primaryGoals: ['Strength', 'Consistency', 'Programming', 'Productivity'],
              customGoals: [],
            },
            attributes: {
              STR: 12,
              VIT: 10,
              AGI: 14,
              INT: 15,
              SEN: 11,
            },
            hunterStatus: {
              rank: 'E',
              level: 1,
              xp: 25,
              nextLevelXp: 100,
              streak: 3,
              longestStreak: 5,
              titles: ['Player', 'Awakened Novice'],
            },
            onboardingCompleted: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          await saveHunterProfile(currentProfile)
        }

        setProfile(currentProfile)
        setSystemPhase('GENERATING DAILY DIRECTIVES...')

        const plan = await fetchOrCreateDailyQuests(currentProfile)
        setDailyPlan(plan)
        setQuests(plan.quests)

        // Load History
        const allHistory = getStoredQuestHistory(user.uid)
        setHistoryRecords(allHistory)

        setSystemPhase('QUEST GENERATION COMPLETE.')
      } catch (err) {
        console.error('Failed to load hunter dashboard:', err)
        setSystemPhase('QUEST GENERATION COMPLETE.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  // 2. Complete Quest via Secure Backend Validation
  const handleCompleteQuest = async (questId: string) => {
    if (!profile || !user || !dailyPlan) return

    setSubmittingQuestId(questId)
    try {
      const result = await submitCompleteQuest(
        user.uid,
        dailyPlan.date,
        questId,
        profile,
        quests
      )

      if (result.success) {
        // Update local quest state
        const nextQuests = quests.map((q) => {
          if (q.id === questId) {
            return {
              ...q,
              status: 'COMPLETED' as const,
              completedAt: new Date().toISOString(),
            }
          }
          return q
        })
        setQuests(nextQuests)

        // Update profile in state and storage
        const updatedProfile: HunterProfileData = {
          ...profile,
          hunterStatus: result.hunterStatus,
          attributes: result.attributes,
          updatedAt: new Date().toISOString(),
        }
        setProfile(updatedProfile)
        await saveHunterProfile(updatedProfile)

        if (result.leveledUp) {
          setLevelUpEvent({
            newLevel: result.hunterStatus.level,
            newRank: result.hunterStatus.rank,
          })
        }
      }
    } catch (err: any) {
      alert(err.message || 'Quest completion validation failed.')
    } finally {
      setSubmittingQuestId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-[#00d4ff] mx-auto shadow-holo" />
          <div className="p-4 bg-[#0d1326] border border-[#00d4ff]/40 rounded shadow-holo space-y-2">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">
              SYSTEM INITIALIZATION PROTOCOL
            </span>
            <p className="font-rajdhani text-lg font-bold text-[#00d4ff] tracking-widest animate-pulse">
              {systemPhase}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const completedCount = quests.filter((q) => q.status === 'COMPLETED').length
  const totalCount = quests.length
  const completionPercentage = totalCount ? Math.round((completedCount / totalCount) * 100) : 0
  const dailyXpEarned = quests
    .filter((q) => q.status === 'COMPLETED')
    .reduce((sum, q) => sum + q.xpReward, 0)

  const filteredQuests =
    filter === 'ALL'
      ? quests
      : quests.filter((q) => (filter === 'DAILY' ? q.questType === 'DAILY' : q.questType !== 'DAILY'))

  const totalAttributePoints = profile?.attributes
    ? Number(profile.attributes.STR) +
      Number(profile.attributes.VIT) +
      Number(profile.attributes.AGI) +
      Number(profile.attributes.INT) +
      Number(profile.attributes.SEN)
    : 0

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Level-Up Celebration Modal */}
      <AnimatePresence>
        {levelUpEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8 }}
              className="bg-[#0d1326] border-2 border-[#00d4ff] p-8 max-w-md w-full text-center rounded shadow-holo space-y-4"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-[#00d4ff]/20 border-2 border-[#00d4ff] flex items-center justify-center text-3xl font-rajdhani font-bold text-[#00d4ff]">
                ▲
              </div>
              <h2 className="font-rajdhani text-3xl font-bold text-white tracking-widest">
                LEVEL UP!
              </h2>
              <p className="text-sm text-gray-300">
                You have reached <span className="text-[#00d4ff] font-bold">LEVEL {levelUpEvent.newLevel}</span>!
              </p>
              <p className="text-xs text-gold">Rank Assessment: {levelUpEvent.newRank}-Rank Hunter</p>
              <Button
                variant="gold"
                size="md"
                className="w-full"
                onClick={() => setLevelUpEvent(null)}
              >
                Accept Growth
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Status Window + Quests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Hunter Attributes & AI System Panel */}
        <div className="lg:col-span-1 space-y-6">
          <SystemWindow title="HUNTER STATUS INTERFACE">
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded bg-[#1a2035] border-2 border-[#00d4ff] flex items-center justify-center font-rajdhani text-2xl font-bold text-[#00d4ff] shadow-holo">
                  {profile?.basic.fullName[0]?.toUpperCase() || 'P'}
                </div>
                <div>
                  <h2 className="font-rajdhani text-xl font-bold text-white tracking-wider">
                    {profile?.basic.fullName || 'Awakened Player'}
                  </h2>
                  <p className="text-xs text-[#00d4ff] tracking-widest uppercase">
                    Rank: {profile?.hunterStatus.rank}
                  </p>
                  <p className="text-xs text-gray-400">
                    Occupation: {profile?.basic.occupation}
                  </p>
                </div>
              </div>

              {/* XP and Level Bar */}
              <XPBar
                current={profile?.hunterStatus.xp || 0}
                max={profile?.hunterStatus.nextLevelXp || 100}
                level={profile?.hunterStatus.level || 1}
                rank={profile?.hunterStatus.rank || 'E'}
              />

              {/* System Attributes */}
              <div className="border-t border-[#00d4ff]/20 pt-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="tracking-widest text-[#00d4ff] uppercase font-bold">ATTRIBUTES</span>
                  <span className="text-gray-400 text-[10px]">TOTAL: {totalAttributePoints} PTS</span>
                </div>
                <StatBar stat="STR" value={profile?.attributes.STR || 10} />
                <StatBar stat="VIT" value={profile?.attributes.VIT || 10} />
                <StatBar stat="AGI" value={profile?.attributes.AGI || 10} />
                <StatBar stat="INT" value={profile?.attributes.INT || 10} />
                <StatBar stat="SEN" value={profile?.attributes.SEN || 10} />
              </div>

              {/* Quick Status Tiles */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#00d4ff]/20 text-center">
                <div className="p-2 bg-[#0a0e1a] rounded border border-gray-800">
                  <span className="text-[10px] text-gray-400 uppercase">Streak</span>
                  <p className="font-rajdhani text-sm font-bold text-gold">
                    🔥 {profile?.hunterStatus.streak || 1} Days
                  </p>
                </div>
                <div className="p-2 bg-[#0a0e1a] rounded border border-gray-800">
                  <span className="text-[10px] text-gray-400 uppercase">Daily Clear</span>
                  <p className="font-rajdhani text-sm font-bold text-[#00d4ff]">
                    {completionPercentage}%
                  </p>
                </div>
              </div>
            </div>
          </SystemWindow>

          {/* QUEST MASTER AI AGENT PANEL */}
          <SystemWindow title="SOLO LEVELING QUEST MASTER [AI AGENT]">
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#00d4ff]/20">
                <span className="text-gray-400">AGENT STATUS:</span>
                <span className="text-[#00d4ff] font-bold tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00d4ff] animate-ping" />
                  ACTIVE & CALIBRATED
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">
                  TODAY'S SYSTEM DIRECTIVE FOCUS:
                </span>
                <p className="font-rajdhani font-semibold text-sm text-[#00d4ff]">
                  {dailyPlan?.dailyFocus || 'Physical Conditioning & Technical Ascent'}
                </p>
              </div>
              <div className="p-3 bg-[#0a0e1a] border border-[#00d4ff]/30 rounded text-gray-300 italic">
                "{dailyPlan?.motivationalMessage || 'The System grants power only to those who step through the gate each day.'}"
              </div>
              <div className="flex justify-between items-center text-[10px] text-gray-400 pt-1">
                <span>ESTIMATED DURATION:</span>
                <span className="text-white font-bold">{dailyPlan?.totalEstimatedMinutes || 75} Mins</span>
              </div>
            </div>
          </SystemWindow>
        </div>

        {/* Center / Right Column: Daily Quests */}
        <div className="lg:col-span-2 space-y-6">
          <SystemWindow title="DAILY DIRECTIVE: QUEST LOG">
            <div className="space-y-4">
              {/* Daily Refresh Header Bar */}
              <div className="flex flex-wrap justify-between items-center bg-[#0a0e1a] p-3 rounded border border-[#00d4ff]/30 text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-[#00d4ff] font-rajdhani font-bold text-sm tracking-wider">
                    CALENDAR DATE: {dailyPlan?.date || 'TODAY'}
                  </span>
                  <span className="text-gray-400">
                    [{dailyPlan?.timezone || 'Asia/Kolkata'}]
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff] text-[10px] font-bold">
                    {dailyPlan?.source === 'AI_AGENT' ? '⚡ AI GENERATED' : '✓ DIRECTIVE ACTIVE'}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-2 sm:mt-0">
                  <span className="text-gold font-bold">
                    +{dailyXpEarned} XP Earned
                  </span>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex justify-between items-center pb-2 border-b border-[#00d4ff]/20">
                <div className="flex gap-2">
                  {(['ALL', 'DAILY', 'WEEKLY', 'HISTORY'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilter(type)}
                      className={`text-xs px-3 py-1 rounded tracking-wider uppercase font-rajdhani font-semibold transition-all ${
                        filter === type
                          ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-gray-400">
                  {completedCount} / {totalCount} Cleared
                </span>
              </div>

              {/* Active Quests View */}
              {filter !== 'HISTORY' && (
                <div className="space-y-3">
                  {filteredQuests.map((quest) => {
                    const isDone = quest.status === 'COMPLETED'
                    const isSubmitting = submittingQuestId === quest.id
                    return (
                      <div
                        key={quest.id}
                        className={`p-4 rounded border transition-all flex flex-col justify-between gap-3 ${
                          isDone
                            ? 'bg-[#00d4ff]/5 border-[#00d4ff]/40 opacity-75'
                            : 'bg-[#111827]/80 border-[#00d4ff]/20 hover:border-[#00d4ff]/60'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                                quest.difficulty === 'Hard' || quest.difficulty === 'Extreme'
                                  ? 'border-red-500 text-red-400 bg-red-950/20'
                                  : quest.difficulty === 'Normal'
                                  ? 'border-[#00d4ff] text-[#00d4ff] bg-[#00d4ff]/10'
                                  : 'border-green-500 text-green-400 bg-green-950/20'
                              }`}
                            >
                              {quest.difficulty}
                            </span>
                            <span className="text-xs text-gray-400">[{quest.category}]</span>
                            <span className="text-xs text-[#00d4ff] font-bold">
                              +{quest.statReward.points} {quest.targetAttribute}
                            </span>
                            <h4
                              className={`font-rajdhani font-bold text-base ${
                                isDone ? 'line-through text-gray-400' : 'text-white'
                              }`}
                            >
                              {quest.title}
                            </h4>
                          </div>

                          <p className="text-xs text-gray-300">{quest.description}</p>

                          <div className="p-2 rounded bg-[#0a0e1a]/80 border border-gray-800 text-[11px] space-y-1">
                            <p className="text-gray-300">
                              <span className="text-[#00d4ff] font-semibold">Criteria: </span>
                              {quest.completionCriteria}
                            </p>
                            {quest.recommendationReason && (
                              <p className="text-gray-400 italic">
                                <span className="text-gold not-italic font-semibold">Master's Note: </span>
                                {quest.recommendationReason}
                              </p>
                            )}
                          </div>

                          <p className="text-[11px] text-gray-400">
                            Est. Time: {quest.estimatedMinutes} mins • <span className="text-[#00d4ff]">+{quest.xpReward} XP</span>
                          </p>
                        </div>

                        <div className="self-end pt-2">
                          <Button
                            size="sm"
                            variant={isDone ? 'ghost' : 'primary'}
                            disabled={isDone || isSubmitting}
                            loading={isSubmitting}
                            onClick={() => handleCompleteQuest(quest.id)}
                          >
                            {isDone ? '✓ CLEARED' : 'COMPLETE'}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Past Quest History Log */}
              {filter === 'HISTORY' && (
                <div className="space-y-4">
                  <p className="text-xs text-gray-400">
                    Review previously assigned daily directives and performance records across the timeline:
                  </p>

                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {historyRecords.map((record) => (
                      <button
                        key={record.date}
                        onClick={() => setSelectedHistoryDate(record.date)}
                        className={`px-3 py-1.5 rounded border text-xs whitespace-nowrap font-rajdhani font-bold ${
                          selectedHistoryDate === record.date || (!selectedHistoryDate && record.date === dailyPlan?.date)
                            ? 'bg-[#00d4ff]/20 border-[#00d4ff] text-[#00d4ff]'
                            : 'bg-[#0d1326] border-gray-700 text-gray-400 hover:border-gray-500'
                        }`}
                      >
                        {record.date} ({record.quests.filter((q) => q.status === 'COMPLETED').length}/{record.quests.length})
                      </button>
                    ))}
                  </div>

                  {(() => {
                    const activeDate = selectedHistoryDate || dailyPlan?.date
                    const record = historyRecords.find((r) => r.date === activeDate)
                    if (!record) {
                      return <p className="text-xs text-gray-500">No historic directives recorded for this date.</p>
                    }
                    return (
                      <div className="space-y-2">
                        {record.quests.map((q) => (
                          <div
                            key={q.id}
                            className="p-3 bg-[#0a0e1a] rounded border border-gray-800 flex justify-between items-center text-xs"
                          >
                            <div>
                              <p className={`font-rajdhani font-semibold ${q.status === 'COMPLETED' ? 'text-gray-300' : 'text-gray-500'}`}>
                                {q.title}
                              </p>
                              <span className="text-[10px] text-gray-500">
                                [{q.category}] • +{q.xpReward} XP • {q.difficulty}
                              </span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              q.status === 'COMPLETED' ? 'bg-green-950/40 text-green-400' : 'bg-red-950/40 text-red-400'
                            }`}>
                              {q.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* Streak & Penalty Warning */}
              <div className="p-3 bg-navy border border-[#ffd700]/30 rounded text-xs text-gray-300 flex items-start gap-2">
                <span className="text-gold text-base leading-none">⚠️</span>
                <div>
                  <span className="text-gold font-bold">SYSTEM INTEGRITY:</span> All quests and progression updates are authenticated and verified server-side. Duplicate XP awards are prevented by atomic database transactions.
                </div>
              </div>
            </div>
          </SystemWindow>
        </div>
      </div>
    </div>
  )
}
