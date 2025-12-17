import Link from "next/link";

export default function Home() {
  return (
    <>
    <div style={{ width: '100%' }}>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
        borderRadius: '1rem',
        color: 'white',
        marginBottom: '3rem'
      }}>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          marginBottom: '1rem',
          fontWeight: '700',
          lineHeight: '1.2'
        }}>
          Welcome to PhotoGallery
        </h1>
        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          marginBottom: '2rem',
          opacity: 0.95,
          maxWidth: '600px',
          margin: '0 auto 2rem'
        }}>
          Organize, manage, and showcase your photoshoots with professional-grade tools
        </p>
        <Link
          href="/photoshoots"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'white',
            color: 'var(--primary)',
            padding: '1rem 2rem',
            borderRadius: '0.75rem',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '1.125rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
          View Photoshoots
        </Link>
      </section>

      {/* Features Section */}
      <section>
        <h2 style={{
          fontSize: '2.5rem',
          marginBottom: '2rem',
          textAlign: 'center',
          color: 'var(--foreground)'
        }}>
          Key Features
        </h2>
        <div className="grid-container">
          <div className="card" style={{
            background: 'var(--card-bg)',
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid var(--border)'
          }}>
            <div style={{
              background: 'var(--primary)',
              width: '60px',
              height: '60px',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              marginBottom: '0.75rem',
              color: 'var(--foreground)'
            }}>
              Organize Photoshoots
            </h3>
            <p style={{
              color: '#64748b',
              lineHeight: '1.6'
            }}>
              Create and manage multiple photoshoots with custom details, dates, and locations.
            </p>
          </div>

          <div className="card" style={{
            background: 'var(--card-bg)',
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid var(--border)'
          }}>
            <div style={{
              background: 'var(--secondary)',
              width: '60px',
              height: '60px',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              marginBottom: '0.75rem',
              color: 'var(--foreground)'
            }}>
              Photo Management
            </h3>
            <p style={{
              color: '#64748b',
              lineHeight: '1.6'
            }}>
              Upload, categorize, and manage your photos with an intuitive interface.
            </p>
          </div>

          <div className="card" style={{
            background: 'var(--card-bg)',
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid var(--border)'
          }}>
            <div style={{
              background: 'var(--accent)',
              width: '60px',
              height: '60px',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              marginBottom: '0.75rem',
              color: 'var(--foreground)'
            }}>
              Collaboration
            </h3>
            <p style={{
              color: '#64748b',
              lineHeight: '1.6'
            }}>
              Add comments and feedback to photos for seamless team collaboration.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        marginTop: '4rem',
        padding: '3rem',
        background: 'var(--card-bg)',
        borderRadius: '1rem',
        textAlign: 'center',
        border: '2px solid var(--border)'
      }}>
        <h2 style={{
          fontSize: '2rem',
          marginBottom: '1rem',
          color: 'var(--foreground)'
        }}>
          Ready to Get Started?
        </h2>
        <p style={{
          color: '#64748b',
          marginBottom: '2rem',
          fontSize: '1.125rem'
        }}>
          Join professional photographers managing their work efficiently
        </p>
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link
            href="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--primary)',
              color: 'white',
              padding: '0.875rem 1.75rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Sign In
          </Link>
          <Link
            href="/photoshoots"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'white',
              color: 'var(--primary)',
              padding: '0.875rem 1.75rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600',
              border: '2px solid var(--primary)'
            }}
          >
            Browse Gallery
          </Link>
        </div>
      </section>
    </div>
    </>
  );
}
