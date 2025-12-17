'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Modal from '../components/Modal'

interface Photoshoot {
  id: number
  title: string
  description: string
  location: string
  date: string
  ownerId: number | null
  createdAt: string
  updatedAt: string
}

export default function PhotoshootsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [photoshoots, setPhotoshoots] = useState<Photoshoot[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [filterByOwner, setFilterByOwner] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    ownerId: ''
  })

  useEffect(() => {
    fetchPhotoshoots()
  }, [filterByOwner])

  const fetchPhotoshoots = async () => {
    try {
      let url = '/api/photoshoots'
      if (filterByOwner && session?.user?.id) {
        url += `?ownerId=${session.user.id}`
      }else if (session?.user?.role !== 'ADMIN'){
        url += `?ownerId=${1}`
      }
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setPhotoshoots(data)
      }
    } catch (error) {
      console.error('Failed to fetch photoshoots:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      router.push('/login')
      return
    }

    try {
      // Convert date to ISO 8601 format with time
      const dateWithTime = formData.date ? `${formData.date}T10:00:00Z` : null

      const response = await fetch('/api/photoshoots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: dateWithTime
        })
      })

      if (response.ok) {
        setModalOpen(false)
        setFormData({ title: '', description: '', date: '', ownerId: ''})
        fetchPhotoshoots()
      }
    } catch (error) {
      console.error('Failed to create photoshoot:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
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
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            marginBottom: '0.5rem',
            color: 'var(--foreground)'
          }}>
            Photoshoots
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.125rem' }}>
            Browse and manage your photoshoots
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {session && (
            <>
              <button
                onClick={() => setFilterByOwner(!filterByOwner)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: filterByOwner ? 'var(--accent)' : 'white',
                  color: filterByOwner ? 'white' : 'var(--foreground)',
                  border: `2px solid ${filterByOwner ? 'var(--accent)' : 'var(--border)'}`,
                  padding: '0.875rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 3h-6l-2 3h-4L8 3H2v18h20V3z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                {filterByOwner ? 'My Photoshoots' : 'Public Photoshoots'}
              </button>
              <button
                onClick={() => setModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  padding: '0.875rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Create Photoshoot
              </button>
            </>
          )}
        </div>
      </div>

      {/* Photoshoots Grid */}
      {photoshoots.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'var(--card-bg)',
          borderRadius: '1rem',
          border: '2px dashed var(--border)'
        }}>
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="2"
            style={{ margin: '0 auto 1rem' }}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--foreground)' }}>
            No photoshoots yet
          </h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Create your first photoshoot to get started
          </p>
          {session && (
            <button
              onClick={() => setModalOpen(true)}
              style={{
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Create Photoshoot
            </button>
          )}
        </div>
      ) : (
        <div className="grid-container">
          {photoshoots.map((photoshoot) => (
            <Link
              key={photoshoot.id}
              href={`/photoshoots/${photoshoot.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="card" style={{
                background: 'var(--card-bg)',
                borderRadius: '1rem',
                overflow: 'hidden',
                border: '1px solid var(--border)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Image Placeholder */}
                <div style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                  height: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  
                </div>

                {/* Content */}
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    marginBottom: '0.5rem',
                    color: 'var(--foreground)',
                    fontWeight: '700'
                  }}>
                    {photoshoot.title}
                  </h3>
                  <p style={{
                    color: '#64748b',
                    marginBottom: '1rem',
                    lineHeight: '1.6',
                    flex: 1
                  }}>
                    {photoshoot.description}
                  </p>

                  {/* Meta Info */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#64748b'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      {photoshoot.location}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      {formatDate(photoshoot.date)}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Photoshoot Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Photoshoot"
      >
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          minWidth: '300px',
          maxWidth: '500px'
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: 'var(--foreground)'
            }}>
              Title *
            </label>
            <input
              type="text"
              required
              minLength={1}
              maxLength={50}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid var(--border)',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontFamily: 'inherit'
              }}
              placeholder="Enter photoshoot title"
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: 'var(--foreground)'
            }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              minLength={6}
              maxLength={100}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid var(--border)',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
              placeholder="Describe your photoshoot"
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: 'var(--foreground)'
            }}>
              Date *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid var(--border)',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border)'
          }}>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              style={{
                padding: '0.75rem 1.5rem',
                border: '2px solid var(--border)',
                background: 'white',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                color: 'var(--foreground)'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: 'var(--primary)',
                color: 'white',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Create Photoshoot
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
