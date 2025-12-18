'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Modal from '../../components/Modal'
import { set } from 'zod'

interface Photo {
  id: number
  filename: string
  caption: string | null
  photoshootId: number
  CreatedAt: string
}

interface Comment {
  id: number
  body: string
  authorId: number
  photoId: number
  authorUsername?: string
}

interface User {
  id: number
  email: string
  username: string | null
}

interface Photoshoot {
  id: number
  title: string
  description: string
  date: string
  ownerId: number | null
  public: boolean
  sharedWith: number[]
}

export default function PhotoshootDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const photoshootId = params.photoshootId as string

  const [photoshoot, setPhotoshoot] = useState<Photoshoot | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [photoModalOpen, setPhotoModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [caption, setCaption] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [commentText, setCommentText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editCommentText, setEditCommentText] = useState('')
  const [editPhotoshootModalOpen, setEditPhotoshootModalOpen] = useState(false)
  const [editPhotoModalOpen, setEditPhotoModalOpen] = useState(false)
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null)
  const [editPhotoshootData, setEditPhotoshootData] = useState({
    title: '',
    description: '',
    date: '',
    public: false
  })
  const [editPhotoCaption, setEditPhotoCaption] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const [error, setError] = useState("");

  useEffect(() => {
    if (photoshootId) {
      fetchPhotoshoot()
      fetchPhotos()
      if (session) {
        fetchUsers()
      }
    }
  }, [photoshootId, session])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const fetchPhotoshoot = async () => {
    try {
      const response = await fetch(`/api/photoshoots/${photoshootId}`)
      if (response.ok) {
        const data = await response.json()
        setPhotoshoot(data)
      }
    } catch (error) {
      console.error('Failed to fetch photoshoot:', error)
    }
  }

  const fetchPhotos = async () => {
    try {
      const response = await fetch(`/api/photoshoots/${photoshootId}/photos`)
      if (response.ok) {
        const data = await response.json()
        setPhotos(data)
      }
    } catch (error) {
      console.error('Failed to fetch photos:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (photoId: number) => {
    try {
      const response = await fetch(`/api/photoshoots/${photoshootId}/photos/${photoId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    }
  }

  const handlePhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session || selectedFiles.length === 0) return

    setUploading(true)
    try {
      // Process each file
      for (const file of selectedFiles) {
        // First, create photo entry with placeholder URL to get photo ID
        const createResponse = await fetch(`/api/photoshoots/${photoshootId}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: '/uploads/placeholder.jpg',
            caption: caption,
          })
        })

        if (!createResponse.ok) {
          throw new Error('Failed to create photo entry')
        }

        const photo = await createResponse.json()

        // Then upload file with photo ID
        const uploadFormData = new FormData()
        uploadFormData.append('file', file)
        uploadFormData.append('photoId', photo.id)
        uploadFormData.append('photoshootId', photoshootId)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file')
        }

        const { url } = await uploadResponse.json()

        await fetch(`/api/photoshoots/${photoshootId}/photos/${photo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: url })
        })
      }

      setPhotoModalOpen(false)
      setCaption('')
      setSelectedFiles([])
      fetchPhotos()
    } catch (error) {
      console.error('Failed to create photos:', error)
      alert('Failed to upload photos. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session || !selectedPhoto) return
    setError("");

    try {
      const response = await fetch(
        `/api/photoshoots/${photoshootId}/photos/${selectedPhoto.id}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: commentText })
        }
      )
      const result = await response.json()
      if (!response.ok) {
        console.log(response)
        setError(result.error)
        return;
      }

      if (response.ok) {
        setCommentText('')
        fetchComments(selectedPhoto.id)
      }
    } catch (error) {
      console.error('Failed to create comment:', error)
    }
  }

  const openPhotoViewer = (photo: Photo, index: number) => {
    setSelectedPhoto(photo)
    setSelectedPhotoIndex(index)
    setViewModalOpen(true)
    if (session) {
      fetchComments(photo.id)
    }
  }

  const navigatePhoto = (direction: 'next' | 'prev') => {
    let newIndex = selectedPhotoIndex
    if (direction === 'next' && selectedPhotoIndex < photos.length - 1) {
      newIndex = selectedPhotoIndex + 1
    } else if (direction === 'prev' && selectedPhotoIndex > 0) {
      newIndex = selectedPhotoIndex - 1
    }

    const newPhoto = photos[newIndex]
    if (newPhoto) {
      setSelectedPhoto(newPhoto)
      setSelectedPhotoIndex(newIndex)
      if (session) {
        fetchComments(newPhoto.id)
      }
    }
  }

  const handleEditComment = async (commentId: number) => {
    if (!editCommentText.trim()) return
    setError("");

    try {
      const response = await fetch(
        `/api/photoshoots/${photoshootId}/photos/${selectedPhoto?.id}/comments/${commentId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: editCommentText })
        }
      )
      const result = await response.json()
      if (!response.ok) {
        console.log(response)
        setError(result.error)
        return;
      }

      if (response.ok) {
        setEditingCommentId(null)
        setEditCommentText('')
        if (selectedPhoto) fetchComments(selectedPhoto.id)
      }
    } catch (error) {
      console.error('Failed to edit comment:', error)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Delete this comment?')) return

    try {
      const response = await fetch(
        `/api/photoshoots/${photoshootId}/photos/${selectedPhoto?.id}/comments/${commentId}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        if (selectedPhoto) fetchComments(selectedPhoto.id)
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  const openEditPhotoshootModal = () => {
    if (photoshoot) {
      setEditPhotoshootData({
        title: photoshoot.title,
        description: photoshoot.description,
        date: photoshoot.date ? new Date(photoshoot.date).toISOString().split('T')[0] : '',
        public: photoshoot.public
      })
      setEditPhotoshootModalOpen(true)
    }
  }

  const handleEditPhotoshootSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const dateWithTime = editPhotoshootData.date ? `${editPhotoshootData.date}T10:00:00Z` : null

      const response = await fetch(`/api/photoshoots/${photoshootId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editPhotoshootData.title,
          description: editPhotoshootData.description,
          date: dateWithTime,
          public: editPhotoshootData.public
        })
      })

      const result = await response.json()
      if (!response.ok) {
        console.log(response)
        setError(result.error)
        return;
      }
      if (response.ok) {
        setEditPhotoshootModalOpen(false)
        fetchPhotoshoot()
      }
    } catch (error) {
      console.error('Failed to update photoshoot:', error)
    }
  }

  const openShareModal = () => {
    if (photoshoot) {
      setSelectedUserIds(photoshoot.sharedWith)
      setShareModalOpen(true)
    }
  }

  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch(`/api/photoshoots/${photoshootId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sharedWith: selectedUserIds })
      })

      if (response.ok) {
        setShareModalOpen(false)
        fetchPhotoshoot()
      }
    } catch (error) {
      console.error('Failed to update sharing:', error)
    }
  }

  const openEditPhotoModal = (photo: Photo) => {
    setEditingPhoto(photo)
    setEditPhotoCaption(photo.caption || '')
    setEditPhotoModalOpen(true)
  }

  const handleEditPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPhoto) return

    try {
      const response = await fetch(`/api/photoshoots/${photoshootId}/photos/${editingPhoto.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: editPhotoCaption
        })
      })

      if (response.ok) {
        setEditPhotoModalOpen(false)
        setEditingPhoto(null)
        fetchPhotos()
      }
    } catch (error) {
      console.error('Failed to update photo:', error)
    }
  }

  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm('Delete this photo? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/photoshoots/${photoshootId}/photos/${photoId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchPhotos()
      }
    } catch (error) {
      console.error('Failed to delete photo:', error)
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

  if (!photoshoot) {
    return <div>Photoshoot not found</div>
  }

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          color: '#1e293b',
          background: 'none',
          border: 'none',
          marginBottom: '1.25rem',
          fontWeight: '600',
          cursor: 'pointer',
          fontSize: '0.875rem',
          padding: 0
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Grįžti į fotosesijų sąrašą
      </button>

      {/* Photoshoot Header */}
      <div style={{
        background: 'var(--card-bg)',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        border: '1px solid var(--border)',
        marginBottom: '1.5rem',
        position: 'relative'
      }}>
        {session?.user?.id && photoshoot.ownerId === parseInt(session.user.id) && (
          <button
            onClick={openEditPhotoshootModal}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              padding: '0.5rem 0.875rem',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Redaguoti
          </button>
        )}
        {session?.user?.id && photoshoot.ownerId === parseInt(session.user.id) && (
          <button
            onClick={() => setPhotoModalOpen(true)}
            style={{
              position: 'absolute',
              bottom: '0.75rem',
              right: '1rem',
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              padding: '0.5rem 0.875rem',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}
          >
            Pridėti nuotrauką
          </button>
        )}
        <h1 style={{
          fontSize: '1.5rem',
          marginBottom: '0.5rem',
          fontWeight: '600',
          color: 'var(--foreground)',
          paddingRight: '5rem'
        }}>
          {photoshoot.title}
        </h1>
        {photoshoot.description && (
          <p style={{
            fontSize: '0.875rem',
            marginBottom: '0.75rem',
            color: '#64748b',
            lineHeight: '1.5'
          }}>
            {photoshoot.description}
          </p>
        )}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          fontSize: '0.8125rem',
          color: '#64748b'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {new Date(photoshoot.date).toLocaleDateString('lt-LT', { year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Photos Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
        gap: '0.875rem'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: 'var(--foreground)'
        }}>
          Nuotraukos ({photos.length})
        </h2>
        {session?.user?.id && photoshoot.ownerId === parseInt(session.user.id) && (
          <button
            onClick={() => setPhotoModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: 'none',
              padding: '0.625rem 1rem',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Photo
          </button>
        )}
      </div>

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
          background: 'var(--card-bg)',
          borderRadius: '0.75rem',
          border: '1px dashed var(--border)'
        }}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="2"
            style={{ margin: '0 auto 0.875rem' }}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.375rem', fontWeight: '600' }}>
            Dar nėra nuotraukų
          </h3>
          <p style={{ color: '#64748b', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            Pridėkite pirmąją nuotrauką į šią fotosesiją
          </p>
          {session && (
            <button
              onClick={() => setPhotoModalOpen(true)}
              style={{
                background: '#1e293b',
                color: 'white',
                border: 'none',
                padding: '0.625rem 1.25rem',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Pridėti nuotrauką
            </button>
          )}
        </div>
      ) : (
        <div className="grid-container">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="card"
              style={{
                background: 'var(--card-bg)',
                borderRadius: '0.625rem',
                overflow: 'hidden',
                border: '1px solid var(--border)',
                position: 'relative'
              }}
            >
              {/* Photo Image */}
              <div
                style={{
                  background: '#e2e8f0',
                  height: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  cursor: 'pointer'
                }}
                onClick={() => openPhotoViewer(photo, index)}
              >
                {photo.filename ? (
                  <img
                    src={photo.filename}
                    alt={""}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                )}


                {/* Edit/Delete buttons for owner */}
                {session?.user?.id && photoshoot.ownerId === parseInt(session.user.id) && (
                  <div style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    display: 'flex',
                    gap: '0.375rem'
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditPhotoModal(photo);
                      }}
                      style={{
                        background: 'rgba(255,255,255,0.95)',
                        border: 'none',
                        padding: '0.375rem',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Redaguoti nuotrauką"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhoto(photo.id);
                      }}
                      style={{
                        background: 'rgba(239,68,68,0.95)',
                        border: 'none',
                        padding: '0.375rem',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Ištrinti nuotrauką"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Photo Info */}
              <div style={{ padding: '1rem' }}>
                {photo.caption && (
                  <p style={{
                    color: '#64748b',
                    fontSize: '0.8125rem',
                    lineHeight: '1.4',
                    marginBottom: '0'
                  }}>
                    {photo.caption}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Photo Modal */}
      <Modal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        title="Pridėti naują nuotrauką"
      >
        <form onSubmit={handlePhotoSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          minWidth: '300px',
          maxWidth: '500px'
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.375rem',
              fontWeight: '600',
              fontSize: '0.8125rem',
              color: 'var(--foreground)'
            }}>
              Nuotraukos *
            </label>
            <input
              type="file"
              required
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                setSelectedFiles(files)
              }}
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '2px solid var(--border)',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            />
            {selectedFiles.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      style={{
                        position: 'relative',
                        width: '80px',
                        height: '80px',
                        borderRadius: '0.5rem',
                        overflow: 'hidden',
                        border: '2px solid var(--border)'
                      }}
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
                        }}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: 'rgba(0, 0, 0, 0.7)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          padding: '0'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.375rem',
              fontWeight: '600',
              fontSize: '0.8125rem',
              color: 'var(--foreground)'
            }}>
              Antraštė
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '2px solid var(--border)',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                resize: 'vertical'
              }}
              placeholder="Pridėkite antraštę šioms nuotraukoms..."
            />
          </div>

          <div style={{
            display: 'flex',
            gap: '0.875rem',
            justifyContent: 'flex-end',
            paddingTop: '0.875rem',
            borderTop: '1px solid var(--border)'
          }}>
            <button
              type="button"
              onClick={() => {
                setPhotoModalOpen(false)
                setSelectedFiles([])
                setCaption('')
              }}
              style={{
                padding: '0.625rem 1.125rem',
                border: '1px solid var(--border)',
                background: 'white',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Atšaukti
            </button>
            <button
              type="submit"
              disabled={uploading || selectedFiles.length === 0}
              style={{
                padding: '0.625rem 1.125rem',
                border: 'none',
                background: uploading || selectedFiles.length === 0 ? '#cbd5e1' : '#1e293b',
                color: 'white',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: uploading || selectedFiles.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {uploading ? 'Pridedama...' : selectedFiles.length > 1 ? `Pridėti nuotraukas` : 'Pridėti nuotrauką'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Photo Viewer Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={selectedPhoto?.caption || 'Nuotrauka'}
      >
        {selectedPhoto && (
          <div style={{ maxWidth: '800px' }}>
            <div style={{ position: 'relative' }}>
              {selectedPhoto.filename ? (
                <img
                  src={selectedPhoto.filename}
                  alt={""}
                  style={{
                    width: '100%',
                    maxHeight: 'calc(90vh - 120px)',
                    objectFit: 'contain',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem'
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '400px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}

              {/* Navigation Buttons */}
              {selectedPhotoIndex > 0 && (
                <button
                  onClick={() => navigatePhoto('prev')}
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
              )}
              {selectedPhotoIndex < photos.length - 1 && (
                <button
                  onClick={() => navigatePhoto('next')}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              )}
            </div>

            {selectedPhoto.caption && (
              <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                {selectedPhoto.caption}
              </p>
            )}

            {/* Comments Section - Only visible when logged in */}
            {session && (
              <div style={{
                borderTop: '1px solid var(--border)',
                paddingTop: '1.5rem'
              }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: '600' }}>
                  Komentarai ({comments.length})
                </h3>

                {/* Comments List */}
                <div style={{
                  maxHeight: '250px',
                  overflowY: 'auto',
                  marginBottom: '1.5rem'
                }}>
                  {comments.length === 0 ? (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                      Dar nėra komentarų. Būkite pirmas, kuris parašysite!
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {comments.map((comment) => (
                        <div key={comment.id} style={{
                          padding: '1rem',
                          background: 'var(--card-bg)',
                          borderRadius: '0.5rem',
                          border: '1px solid var(--border)'
                        }}>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: '600', color: '#667eea', fontSize: '0.875rem' }}>
                                {comment.authorUsername || `User #${comment.authorId}`}
                              </span>
                            </div>

                            {session?.user?.id && (comment.authorId === parseInt(session.user.id) || session.user.role === 'ADMIN') && (
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {comment.authorId === parseInt(session.user.id) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingCommentId(comment.id);
                                      setEditCommentText(comment.body);
                                      setError("");1
                                    }}
                                    style={{
                                      background: 'none',
                                      border: '1px solid #cbd5e1',
                                      padding: '0.25rem 0.5rem',
                                      borderRadius: '0.375rem',
                                      cursor: 'pointer',
                                      color: '#475569',
                                      fontSize: '0.75rem'
                                    }}
                                  >
                                    Redaguoti
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteComment(comment.id)}
                                  style={{
                                    background: 'none',
                                    border: '1px solid #ef4444',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '0.375rem',
                                    cursor: 'pointer',
                                    color: '#ef4444',
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  Ištrinti
                                </button>
                              </div>
                            )}
                          </div>

                          {editingCommentId === comment.id ? (
                            <div>
                              {error && (<div className="text-red-500 text-sm text-center">{error}</div>)}
                              <textarea
                                value={editCommentText}
                                onChange={(e) => setEditCommentText(e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '0.75rem',
                                  borderRadius: '0.5rem',
                                  border: '1px solid var(--border)',
                                  fontSize: '0.875rem',
                                  marginBottom: '0.5rem',
                                  minHeight: '80px',
                                  resize: 'vertical',
                                  background: 'white'
                                }}
                              />
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  type="button"
                                  onClick={() => handleEditComment(comment.id)}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem',
                                    border: 'none',
                                    background: '#1e293b',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCommentId(null);
                                    setEditCommentText('');
                                  }}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid var(--border)',
                                    background: 'white',
                                    color: '#475569',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p style={{ marginBottom: '0', lineHeight: '1.5', color: '#334155' }}>
                              {comment.body}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Comment Form */}
                {session && (
                  <form onSubmit={handleCommentSubmit} style={{
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border)'
                  }}>
                    {error && (
                      <div className="text-red-500 text-sm text-center">{error}</div>
                    )}
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      required
                      rows={3}
                      placeholder="Parašykite komentarą..."
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid var(--border)',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        marginBottom: '1rem',
                        resize: 'vertical'
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#1e293b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Paskelbti komentarą
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit Photoshoot Modal */}
      <Modal
        isOpen={editPhotoshootModalOpen}
        onClose={() => setEditPhotoshootModalOpen(false)}
        title="Redaguoti fotosesiją"
      >
        <form onSubmit={handleEditPhotoshootSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          minWidth: '300px',
          maxWidth: '500px'
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.375rem',
              fontWeight: '600',
              fontSize: '0.8125rem',
              color: 'var(--foreground)'
            }}>
              Pavadinimas *
            </label>
            <input
              type="text"
              value={editPhotoshootData.title}
              onChange={(e) => setEditPhotoshootData({ ...editPhotoshootData, title: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '2px solid var(--border)',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.375rem',
              fontWeight: '600',
              fontSize: '0.8125rem',
              color: 'var(--foreground)'
            }}>
              Aprašymas
            </label>
            <textarea
              value={editPhotoshootData.description}
              onChange={(e) => setEditPhotoshootData({ ...editPhotoshootData, description: e.target.value })}
              rows={3}
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '2px solid var(--border)',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                resize: 'vertical'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.375rem',
              fontWeight: '600',
              fontSize: '0.8125rem',
              color: 'var(--foreground)'
            }}>
              Data
            </label>
            <input
              type="date"
              value={editPhotoshootData.date}
              onChange={(e) => setEditPhotoshootData({ ...editPhotoshootData, date: e.target.value })}
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '2px solid var(--border)',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              cursor: 'pointer',
              fontWeight: '600',
              color: 'var(--foreground)'
            }}>
              <input
                type="checkbox"
                checked={editPhotoshootData.public}
                onChange={(e) => setEditPhotoshootData({ ...editPhotoshootData, public: e.target.checked })}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer'
                }}
              />
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {editPhotoshootData.public ? (
                    <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                  ) : (
                    <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
                  )}
                </svg>
                Padaryti fotosesiją viešą
              </span>
            </label>
            <p style={{
              fontSize: '0.75rem',
              color: '#64748b',
              marginTop: '0.375rem',
              marginLeft: '1.5rem'
            }}>
              {editPhotoshootData.public ? 'Bet kas gali peržiūrėti šią fotosesiją' : 'Tik jūs ir bendrinami vartotojai gali peržiūrėti šią fotosesiją'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <button
              type="button"
              onClick={() => {
                setEditPhotoshootModalOpen(false);
                openShareModal();
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(30, 41, 59, 0.1)',
                color: '#1e293b',
                border: '1px solid #1e293b',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              Bendrinti su naudotojais
            </button>
            {error && (<div className="text-red-500 text-sm text-center">{error}</div>)}

            <div style={{ display: 'flex', gap: '0.875rem' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#1e293b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Išsaugoti pakeitimus
              </button>
              <button
                type="button"
                onClick={() => setEditPhotoshootModalOpen(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'var(--card-bg)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Atšaukti
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit Photo Modal */}
      <Modal
        isOpen={editPhotoModalOpen}
        onClose={() => {
          setEditPhotoModalOpen(false);
          setEditingPhoto(null);
        }}
        title="Redaguoti nuotrauką"
      >
        <form onSubmit={handleEditPhotoSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          minWidth: '300px',
          maxWidth: '500px'
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.375rem',
              fontWeight: '600',
              fontSize: '0.8125rem',
              color: 'var(--foreground)'
            }}>
              Antraštė
            </label>
            <textarea
              value={editPhotoCaption}
              onChange={(e) => setEditPhotoCaption(e.target.value)}
              rows={3}
              placeholder="Pridėti antraštę..."
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '2px solid var(--border)',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.875rem' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#1e293b',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Išsaugoti pakeitimus
            </button>
            <button
              type="button"
              onClick={() => {
                setEditPhotoModalOpen(false);
                setEditingPhoto(null);
              }}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: 'var(--card-bg)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Atšaukti
            </button>
          </div>
        </form>
      </Modal>

      {/* Share Modal */}
      <Modal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Bendrinti fotosesiją"
      >
        <form onSubmit={handleShareSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          minWidth: '400px'
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.875rem',
              fontWeight: '600',
              fontSize: '0.8125rem',
              color: 'var(--foreground)'
            }}>
              Pasirinkite vartotojus, su kuriais norite bendrinti:
            </label>
            <div style={{
              maxHeight: '300px',
              overflowY: 'auto',
              border: '1px solid var(--border)',
              borderRadius: '0.375rem',
              padding: '0.375rem'
            }}>
              {users
                .filter(user => user.id !== photoshoot?.ownerId)
                .map((user) => (
                  <label
                    key={user.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                      padding: '0.625rem',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      background: selectedUserIds.includes(user.id) ? '#f0f9ff' : 'transparent'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer'
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--foreground)' }}>
                        {user.username || user.email}
                      </div>
                      {user.username && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {user.email}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.875rem' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#1e293b',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Išsaugoti pakeitimus
            </button>
            <button
              type="button"
              onClick={() => setShareModalOpen(false)}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: 'var(--card-bg)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Atšaukti
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
