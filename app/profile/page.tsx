'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface User {
  id: number
  email: string
  username: string
  phoneNumber: string
  role: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (session?.user?.id) {
      fetchUser()
    }
  }, [session, status])

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/users/${session?.user?.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user')
      }
      const data = await response.json()
      setUser(data)
      setEmail(data.email)
      setPhoneNumber(data.phoneNumber)
    } catch (err) {
      setError('Nepavyko užkrauti profilio')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const response = await fetch(`/api/users/${session?.user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          phoneNumber,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      const updatedUser = await response.json()
      setUser(updatedUser)
      setSuccess('Profilis sėkmingai atnaujintas!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepavyko atnaujinti profilio')
    } finally {
      setSaving(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '1rem', color: '#64748b' }}>Kraunama...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#64748b' }}>Vartotojas nerastas</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: '550px',
      margin: '0 auto',
      padding: '1.5rem 1rem'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '1.5rem',
        textAlign: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 0.75rem'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '0.375rem',
          color: 'var(--foreground)'
        }}>
          @{user.username}
        </h1>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '0.75rem',
        padding: '1.5rem'
      }}>
        {/* Username (Read-only) */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.375rem',
            fontWeight: '600',
            color: 'var(--foreground)',
            fontSize: '0.8125rem'
          }}>
            Vartotojo vardas
          </label>
          <input
            type="text"
            value={user.username}
            disabled
            style={{
              width: '100%',
              padding: '0.625rem 0.875rem',
              border: '1px solid var(--border)',
              borderRadius: '0.375rem',
              fontSize: '0.9375rem',
              background: '#f1f5f9',
              color: '#94a3b8',
              cursor: 'not-allowed'
            }}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label htmlFor="email" style={{
            display: 'block',
            marginBottom: '0.375rem',
            fontWeight: '600',
            color: 'var(--foreground)',
            fontSize: '0.8125rem'
          }}>
            El. paštas
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={50}
            style={{
              width: '100%',
              padding: '0.625rem 0.875rem',
              border: '1px solid var(--border)',
              borderRadius: '0.375rem',
              fontSize: '0.9375rem',
              background: 'var(--background)',
              color: 'var(--foreground)'
            }}
          />
        </div>

        {/* Phone Number */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label htmlFor="phoneNumber" style={{
            display: 'block',
            marginBottom: '0.375rem',
            fontWeight: '600',
            color: 'var(--foreground)',
            fontSize: '0.8125rem'
          }}>
            Telefono numeris
          </label>
          <input
            id="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            maxLength={20}
            style={{
              width: '100%',
              padding: '0.625rem 0.875rem',
              border: '1px solid var(--border)',
              borderRadius: '0.375rem',
              fontSize: '0.9375rem',
              background: 'var(--background)',
              color: 'var(--foreground)'
            }}
          />
        </div>

        {/* Role (Read-only) */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.375rem',
            fontWeight: '600',
            color: 'var(--foreground)',
            fontSize: '0.8125rem'
          }}>
            Rolė
          </label>
          <div style={{
            padding: '0.625rem 0.875rem',
            border: '1px solid var(--border)',
            borderRadius: '0.375rem',
            background: '#f1f5f9',
            color: '#64748b',
            fontSize: '0.9375rem'
          }}>
            {user.role === 'ADMIN' ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                color: 'var(--accent)'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                Administratorius
              </span>
            ) : (
              <span>Naudotojas</span>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            color: '#dc2626',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div style={{
            padding: '0.75rem 1rem',
            background: '#d1fae5',
            border: '1px solid #a7f3d0',
            borderRadius: '0.5rem',
            color: '#059669',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {success}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: saving ? '#94a3b8' : '#1e293b',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.375rem',
            transition: 'background 0.2s'
          }}
        >
          {saving ? (
            <>
              <div style={{
                width: '14px',
                height: '14px',
                border: '2px solid white',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Išsaugoma...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              Išsaugoti pakeitimus
            </>
          )}
        </button>
      </form>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
