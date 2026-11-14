import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { SystemWindow } from '../../components/ui/SystemWindow'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

export function LoginPage() {
  const { signInWithEmail, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmail(email, password)
      navigate('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
      navigate('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <SystemWindow title="Authentication Required">
          <form onSubmit={handleSignIn} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <p className="text-xs text-red-400 border border-red-900/50 bg-red-900/10 rounded p-2">
                {error}
              </p>
            )}
            <Button type="submit" variant="primary" size="md" loading={loading} className="w-full">
              Sign In
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="md"
              loading={googleLoading}
              onClick={handleGoogle}
              className="w-full"
            >
              Sign In with Google
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-gray-500">
            No account?{' '}
            <Link to="/signup" className="text-[#00d4ff] hover:underline">
              Register
            </Link>
          </p>
        </SystemWindow>
      </div>
    </div>
  )
}
