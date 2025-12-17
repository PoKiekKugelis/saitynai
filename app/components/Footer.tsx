export default function Footer() {
  return (
    <footer style={{
      background: 'var(--footer-bg)',
      color: '#94a3b8',
      marginTop: 'auto',
      borderTop: '1px solid #334155'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '3rem 2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem'
      }}>
        {/* Company Info */}
        <div>
          <h3 style={{
            color: 'white',
            fontSize: '1.25rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            PhotoGallery
          </h3>
          <p style={{ lineHeight: '1.6', fontSize: '0.875rem' }}>
            Professional photo management platform for photographers and creative professionals.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{
            color: 'white',
            fontSize: '1rem',
            marginBottom: '1rem',
            fontWeight: '600'
          }}>
            Quick Links
          </h4>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <li>
              <a href="/" style={{
                color: '#94a3b8',
                textDecoration: 'none',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
                Home
              </a>
            </li>
            <li>
              <a href="/photoshoots" style={{
                color: '#94a3b8',
                textDecoration: 'none',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
                Photoshoots
              </a>
            </li>
            <li>
              <a href="/login" style={{
                color: '#94a3b8',
                textDecoration: 'none',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
                Login
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{
            color: 'white',
            fontSize: '1rem',
            marginBottom: '1rem',
            fontWeight: '600'
          }}>
            Contact
          </h4>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <li style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              contact@photogallery.com
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              +370 600 00000
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              Kaunas, Lithuania
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{
        borderTop: '1px solid #334155',
        padding: '1.5rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.875rem'
        }}>
          <p style={{ margin: 0 }}>
            © 2025 PhotoGallery. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#" style={{
              color: '#94a3b8',
              textDecoration: 'none'
            }}>
              Privacy Policy
            </a>
            <a href="#" style={{
              color: '#94a3b8',
              textDecoration: 'none'
            }}>
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
