import React, { useState, useEffect } from 'react'
import { useAuth } from '../auth/useAuth'
import { SystemWindow } from '../../components/ui/SystemWindow'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { getHunterProfile, saveHunterProfile } from '../../lib/hunterService'
import { HunterProfileData } from '../../types/hunter'

export function ProfilePage() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<HunterProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [savedMessage, setSavedMessage] = useState(false)

  useEffect(() => {
    async function load() {
      if (!user) return
      try {
        const data = await getHunterProfile(user.uid)
        if (data) setProfile(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    await saveHunterProfile(profile)
    setSavedMessage(true)
    setTimeout(() => setSavedMessage(false), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#00d4ff]" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <SystemWindow title="HUNTER ARCHIVE & PROFILE SETTINGS">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-[#00d4ff]/20">
            <div className="w-16 h-16 rounded bg-[#1a2035] border-2 border-[#00d4ff] flex items-center justify-center font-rajdhani text-2xl font-bold text-[#00d4ff]">
              {profile?.basic.fullName[0]?.toUpperCase() || 'P'}
            </div>
            <div>
              <h2 className="font-rajdhani text-2xl font-bold text-white tracking-wide">
                {profile?.basic.fullName || user?.displayName || 'Player'}
              </h2>
              <p className="text-xs text-[#00d4ff] tracking-widest uppercase">
                {profile?.hunterStatus.rank}-Rank Hunter (Level {profile?.hunterStatus.level || 1})
              </p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>

          {savedMessage && (
            <div className="p-3 bg-green-900/30 border border-green-500 rounded text-green-400 text-xs">
              ✓ Hunter parameters successfully updated in System memory.
            </div>
          )}

          {/* Editable Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Hunter Name"
              value={profile?.basic.fullName || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                profile &&
                setProfile({
                  ...profile,
                  basic: { ...profile.basic, fullName: e.target.value },
                })
              }
            />
            <Input
              label="Occupation"
              value={profile?.basic.occupation || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                profile &&
                setProfile({
                  ...profile,
                  basic: { ...profile.basic, occupation: e.target.value },
                })
              }
            />
            <Input
              label="Daily Available Free Hours"
              type="number"
              value={profile?.routine.availableFreeHoursDaily || 2}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                profile &&
                setProfile({
                  ...profile,
                  routine: {
                    ...profile.routine,
                    availableFreeHoursDaily: Number(e.target.value),
                  },
                })
              }
            />
            <Input
              label="Target Role / Ambition"
              value={profile?.career.targetJobRole || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                profile &&
                setProfile({
                  ...profile,
                  career: {
                    ...profile.career,
                    targetJobRole: e.target.value,
                  },
                })
              }
            />
          </div>

          <div className="flex flex-wrap justify-between items-center pt-4 border-t border-[#00d4ff]/20 gap-3">
            <Button variant="primary" size="md" type="submit">
              Save Modifications
            </Button>
            <Button variant="danger" size="md" type="button" onClick={signOut}>
              Terminate Hunter Session (Sign Out)
            </Button>
          </div>
        </form>
      </SystemWindow>
    </div>
  )
}
