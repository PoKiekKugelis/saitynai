'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  email: string
  username: string | null
  phoneNumber: string | null
  role: string
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/')
    } else if (status === 'authenticated') {
      fetchUsers()
    }
  }, [status, session, router])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchUsers()
      } else {
        alert('Failed to delete user')
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('Failed to delete user')
    }
  }

  if (loading || status === 'loading') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid var(--border)',
          borderTop: '4px solid var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
      <h1 style={{
        fontSize: '1.75rem',
        marginBottom: '0.375rem',
        color: 'var(--foreground)'
      }}>
        Administratoriaus pultas
      </h1>
      <p style={{ color: '#64748b', fontSize: '0.9375rem', marginBottom: '2rem' }}>
        Naudotojų tvarkymas
      </p>

      {/* Users Section */}
      <section>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          <h2 style={{
            fontSize: '1.375rem',
            color: 'var(--foreground)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            margin: 0
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Naudotojai ({users.filter(user => {
              const query = searchQuery.toLowerCase()
              return user.email.toLowerCase().includes(query) ||
                     user.username?.toLowerCase().includes(query) ||
                     user.phoneNumber?.toLowerCase().includes(query) ||
                     user.role.toLowerCase().includes(query)
            }).length})
          </h2>
          
          <div style={{ position: 'relative', width: '300px' }}>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#64748b" 
              strokeWidth="2"
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none'
              }}
            >
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Ieškoti..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                border: '1px solid var(--border)',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                background: 'var(--background)',
                color: 'var(--foreground)'
              }}
            />
          </div>
        </div>

        <div style={{
          background: 'var(--card-bg)',
          borderRadius: '0.75rem',
          border: '1px solid var(--border)',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr',
            padding: '0.75rem 1.125rem',
            background: 'var(--header-bg)',
            color: 'white',
            fontWeight: '600',
            fontSize: '0.8125rem'
          }}>
            <div>El. paštas</div>
            <div>Naudotojo vardas</div>
            <div>Telefono numeris</div>
            <div>Rolė</div>
            <div>Veiksmai</div>
          </div>

          {users.filter(user => {
            const query = searchQuery.toLowerCase()
            return user.email.toLowerCase().includes(query) ||
                   user.username?.toLowerCase().includes(query) ||
                   user.phoneNumber?.toLowerCase().includes(query) ||
                   user.role.toLowerCase().includes(query)
          }).map((user) => (
            <div
              key={user.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr',
                padding: '0.75rem 1.125rem',
                borderBottom: '1px solid var(--border)',
                alignItems: 'center'
              }}
            >
              <div style={{ color: 'var(--foreground)', fontSize: '0.875rem' }}>{user.email}</div>
              <div style={{ color: '#64748b', fontSize: '0.875rem' }}>{user.username || '-'}</div>
              <div style={{ color: '#64748b', fontSize: '0.875rem' }}>{user.phoneNumber || '-'}</div>
              <div>
                <span style={{
                  padding: '0.1875rem 0.625rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.6875rem',
                  fontWeight: '600',
                  background: user.role === 'ADMIN' ? '#dbeafe' : '#f1f5f9',
                  color: user.role === 'ADMIN' ? '#1e40af' : '#475569'
                }}>
                  {user.role}
                </span>
              </div>
              <div>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  disabled={user.id === parseInt(session?.user?.id || '0')}
                  style={{
                    background: user.id === parseInt(session?.user?.id || '0') ? '#e2e8f0' : '#fee2e2',
                    color: user.id === parseInt(session?.user?.id || '0') ? '#94a3b8' : '#dc2626',
                    border: 'none',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '0.25rem',
                    cursor: user.id === parseInt(session?.user?.id || '0') ? 'not-allowed' : 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: '600'
                  }}
                >
                  Naikinti
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
