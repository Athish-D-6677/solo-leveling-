import { create } from 'zustand'

interface Quest {
  id: string
  title: string
  xp: number
  completed: boolean
}

interface GameState {
  level: number | null
  rank: string | null
  xp: number | null
  streak: number | null
  quests: Quest[] | null
  setGameData: (data: Partial<GameState>) => void
}

export const useGameStore = create<GameState>((set) => ({
  level: null,
  rank: null,
  xp: null,
  streak: null,
  quests: null,
  setGameData: (data) => set((state) => ({ ...state, ...data })),
}))
