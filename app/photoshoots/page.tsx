'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Modal from '../components/Modal'

interface Photoshoot {
  id: number
  title: string
  description: string
  location: string
  date: string
  ownerId: number | null
  public: boolean
  sharedWith: number[]
  createdAt: string
  updatedAt: string
}

export default function PhotoshootsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = searchParams.get('view') || 'public' // 'public' or 'my'
  
  const [photoshoots, setPhotoshoots] = useState<Photoshoot[]>([])
  const [sharedPhotoshoots, setSharedPhotoshoots] = useState<Photoshoot[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: ''
  })

  useEffect(() => {
    fetchPhotoshoots()
  }, [view, session])

  const fetchPhotoshoots = async () => {
    setLoading(true)
    try {
      let url = '/api/photoshoots'
      if (view === 'public') {
        url += '?public=true'
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          setPhotoshoots(data)
          setSharedPhotoshoots([])
        }
      } else if (view === 'my' && session?.user?.id) {
        url += `?ownerId=${session.user.id}`
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          const userId = parseInt(session.user.id)
          // Separate owned and shared
          const owned = data.filter((p: Photoshoot) => p.ownerId === userId)
          const shared = data.filter((p: Photoshoot) => p.ownerId !== userId)
          setPhotoshoots(owned)
          setSharedPhotoshoots(shared)
        }
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
        setFormData({ title: '', description: '', date: ''})
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

  const allPhotoshoots = [...photoshoots, ...sharedPhotoshoots]
    .filter(photoshoot => {
      if (searchQuery) {
        return photoshoot.title.toLowerCase().includes(searchQuery.toLowerCase())
      }
      return true
    })

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Minimalist Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border)',
        transition: 'none'
      }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: 'var(--foreground)',
          margin: 0,
          transition: 'none'
        }}>
          Fotosesijos
        </h1>
        
        {session && view === 'my' && (
          <button
            onClick={() => setModalOpen(true)}
            style={{
              background: '#1e293b',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              fontWeight: '500',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            + Sukurti
          </button>
        )}
      </div>

      {/* View Toggle & Search */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{
          display: 'inline-flex',
          gap: '0.5rem',
          padding: '0.25rem',
          background: 'var(--card-bg)',
          borderRadius: '0.5rem',
          border: '1px solid var(--border)'
        }}>
          <button
            onClick={() => router.push('/photoshoots?view=public')}
            style={{
              padding: '0.5rem 1rem',
              background: view === 'public' ? '#1e293b' : 'transparent',
              color: view === 'public' ? 'white' : 'var(--foreground)',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.875rem'
            }}
          >
            Viešos
          </button>
          {session && (
            <button
              onClick={() => router.push('/photoshoots?view=my')}
              style={{
                padding: '0.5rem 1rem',
                background: view === 'my' ? '#1e293b' : 'transparent',
                color: view === 'my' ? 'white' : 'var(--foreground)',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '0.875rem'
              }}
            >
              Mano
            </button>
          )}
        </div>

        <input
          type="text"
          placeholder="Ieškoti..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '0.5rem 0.75rem',
            border: '1px solid var(--border)',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            background: 'var(--card-bg)'
          }}
        />
      </div>

      {/* Minimalist Photoshoot List */}
      {allPhotoshoots.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          color: '#64748b'
        }}>
          <p>Fotosesijų nerasta</p>
          {session && view === 'my' && (
            <button
              onClick={() => setModalOpen(true)}
              style={{
                marginTop: '1rem',
                background: '#1e293b',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              + Sukurti fotosesiją
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          {allPhotoshoots.map((photoshoot) => {
            const isShared = view === 'my' && sharedPhotoshoots.some(s => s.id === photoshoot.id)
            
            return (
              <Link
                key={photoshoot.id}
                href={`/photoshoots/${photoshoot.id}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'block',
                  padding: '1rem',
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.375rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: 'var(--foreground)',
                      marginBottom: '0.25rem'
                    }}>
                      {photoshoot.title}
                      {isShared && (
                        <span style={{
                          marginLeft: '0.5rem',
                          fontSize: '0.75rem',
                          color: '#10b981',
                          fontWeight: '500'
                        }}>
                          • Bendrinama
                        </span>
                      )}
                    </h3>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#64748b',
                      display: 'flex',
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}>
                      <span>{new Date(photoshoot.date).toLocaleDateString('lt-LT', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                      {photoshoot.location && (
                        <>
                          <span>•</span>
                          <span>{photoshoot.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {photoshoot.public && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#64748b',
                      padding: '0.25rem 0.5rem',
                      background: '#f1f5f9',
                      borderRadius: '0.25rem'
                    }}>
                      Vieša
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Create Photoshoot Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Sukurti naują fotosesiją"
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
              Pavadinimas *
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
              placeholder="Įveskite fotosesijos pavadinimą"
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: 'var(--foreground)'
            }}>
              Aprašymas
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
              placeholder="Aprašykite savo fotosesiją"
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: 'var(--foreground)'
            }}>
              Data *
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
              Atšaukti
            </button>
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: '#1e293b',
                color: 'white',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Sukurti
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
