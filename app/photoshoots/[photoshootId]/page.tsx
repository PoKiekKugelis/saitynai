'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Modal from '../../components/Modal'

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
}

interface Photoshoot {
  id: number
  title: string
  description: string
  date: string
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
  const [comments, setComments] = useState<Comment[]>([])
  const [caption, setCaption] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [commentText, setCommentText] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (photoshootId) {
      fetchPhotoshoot()
      fetchPhotos()
    }
  }, [photoshootId])

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

    try {
      const response = await fetch(
        `/api/photoshoots/${photoshootId}/photos/${selectedPhoto.id}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: commentText })
        }
      )

      if (response.ok) {
        setCommentText('')
        fetchComments(selectedPhoto.id)
      }
    } catch (error) {
      console.error('Failed to create comment:', error)
    }
  }

  const openPhotoViewer = (photo: Photo) => {
    setSelectedPhoto(photo)
    setViewModalOpen(true)
    fetchComments(photo.id)
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
      <Link href="/photoshoots" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--primary)',
        textDecoration: 'none',
        marginBottom: '1.5rem',
        fontWeight: '600'
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back to Photoshoots
      </Link>

      {/* Photoshoot Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
        padding: '2rem',
        borderRadius: '1rem',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <h1 style={{
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          marginBottom: '1rem',
          fontWeight: '700'
        }}>
          {photoshoot.title}
        </h1>
        <p style={{
          fontSize: '1.125rem',
          marginBottom: '1.5rem',
          opacity: 0.95
        }}>
          {photoshoot.description}
        </p>
        <div style={{
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap',
          fontSize: '0.95rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {formatDate(photoshoot.date)}
          </div>
        </div>
      </div>

      {/* Photos Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h2 style={{
          fontSize: '2rem',
          color: 'var(--foreground)'
        }}>
          Photos ({photos.length})
        </h2>
        {session && (
          <button
            onClick={() => setPhotoModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.25rem',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Photo
          </button>
        )}
      </div>

      {/* Photos Grid */}
      {photos.length === 0 ? (
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
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            No photos yet
          </h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Add your first photo to this photoshoot
          </p>
          {session && (
            <button
              onClick={() => setPhotoModalOpen(true)}
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
              Add Photo
            </button>
          )}
        </div>
      ) : (
        <div className="grid-container">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="card"
              style={{
                background: 'var(--card-bg)',
                borderRadius: '1rem',
                overflow: 'hidden',
                border: '1px solid var(--border)',
                cursor: 'pointer'
              }}
              onClick={() => openPhotoViewer(photo)}
            >
              {/* Photo Image */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                height: '250px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
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
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                )}
              </div>

              {/* Photo Info */}
              <div style={{ padding: '1.25rem' }}>
                {photo.caption && (
                  <p style={{
                    color: '#64748b',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    marginBottom: '1rem'
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
        title="Add New Photo"
      >
        <form onSubmit={handlePhotoSubmit} style={{
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
              Photos *
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
                padding: '0.75rem',
                border: '2px solid var(--border)',
                borderRadius: '0.5rem',
                fontSize: '1rem'
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
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: 'var(--foreground)'
            }}>
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid var(--border)',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                resize: 'vertical'
              }}
              placeholder="Add a caption for these photos..."
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
              onClick={() => {
                setPhotoModalOpen(false)
                setSelectedFiles([])
                setCaption('')
              }}
              style={{
                padding: '0.75rem 1.5rem',
                border: '2px solid var(--border)',
                background: 'white',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || selectedFiles.length === 0}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: uploading || selectedFiles.length === 0 ? '#cbd5e1' : 'var(--accent)',
                color: 'white',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: uploading || selectedFiles.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {uploading ? 'Uploading...' : `Add Photo${selectedFiles.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </Modal>

      {/* Photo Viewer Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={selectedPhoto?.caption || 'Photo'}
      >
        {selectedPhoto && (
          <div style={{ maxWidth: '800px' }}>
            {selectedPhoto.filename ? (
              <img
                src={selectedPhoto.filename}
                alt={""}
                style={{
                  width: '100%',
                  maxHeight: '50vh',
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
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
            )}
            {selectedPhoto.caption && (
              <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                {selectedPhoto.caption}
              </p>
            )}

            {/* Comments Section */}
            <div style={{
              borderTop: '1px solid var(--border)',
              paddingTop: '1.5rem'
            }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: '600' }}>
                Comments ({comments.length})
              </h3>
              
              {/* Comments List */}
              <div style={{
                maxHeight: '250px',
                overflowY: 'auto',
                marginBottom: '1.5rem'
              }}>
                {comments.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                    No comments yet. Be the first to comment!
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
                        <p style={{ marginBottom: '0.5rem', lineHeight: '1.5' }}>
                          {comment.body}
                        </p>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          User #{comment.authorId}
                        </span>
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
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    required
                    rows={3}
                    placeholder="Write a comment..."
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
                      background: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Post Comment
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
