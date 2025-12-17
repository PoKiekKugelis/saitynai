"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");
    const username = formData.get("username");
    const phoneNumber = formData.get("phoneNumber");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username, phoneNumber })
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={{
        maxWidth: '400px',
        margin: '0 auto',
        padding: '1.5rem',
        textAlign: 'center'
      }}>
        <div style={{
          background: '#d1fae5',
          border: '1px solid #6ee7b7',
          borderRadius: '0.875rem',
          padding: '1.75rem',
          color: '#065f46'
        }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 0.875rem' }}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <h2 style={{ fontSize: '1.375rem', marginBottom: '0.375rem', fontWeight: '700' }}>
            Registration Successful!
          </h2>
          <p style={{ fontSize: '0.875rem' }}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '400px',
      margin: '0 auto',
      padding: '1.5rem'
    }}>
      {/* Card */}
      <div style={{
        background: 'var(--card-bg)',
        padding: '2rem',
        borderRadius: '0.875rem',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{
            fontSize: '1.625rem',
            marginBottom: '0.375rem',
            color: 'var(--foreground)',
            fontWeight: '700'
          }}>
            Sukurti paskyrą
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Prisijunkite, kad valdytumėte savo fotosesijas
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          {/* Email Field */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.375rem',
              fontWeight: '600',
              color: 'var(--foreground)',
              fontSize: '0.8125rem'
            }}>
              El. paštas
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <input
                name="email"
                type="email"
                required
                placeholder="vardas@pavyzdys.lt"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.875rem 0.75rem 2.5rem',
                  border: '2px solid var(--border)',
                  borderRadius: '0.5rem',
                  fontSize: '0.9375rem',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          {/* Username Field */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.375rem',
              fontWeight: '600',
              color: 'var(--foreground)',
              fontSize: '0.8125rem'
            }}>
              Naudotojo vardas
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <input
                name="username"
                type="text"
                required
                minLength={3}
                maxLength={50}
                placeholder="jūsų vardas"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.875rem 0.75rem 2.5rem',
                  border: '2px solid var(--border)',
                  borderRadius: '0.5rem',
                  fontSize: '0.9375rem',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          {/* Phone Number Field */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.375rem',
              fontWeight: '600',
              color: 'var(--foreground)',
              fontSize: '0.8125rem'
            }}>
              Telefono numeris
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <input
                name="phoneNumber"
                type="tel"
                required
                maxLength={20}
                placeholder="+1234567890"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.875rem 0.75rem 2.5rem',
                  border: '2px solid var(--border)',
                  borderRadius: '0.5rem',
                  fontSize: '0.9375rem',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.375rem',
              fontWeight: '600',
              color: 'var(--foreground)',
              fontSize: '0.8125rem'
            }}>
              Slaptažodis
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <input
                name="password"
                type="password"
                required
                minLength={4}
                placeholder="Įveskite slaptažodį"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.875rem 0.75rem 2.5rem',
                  border: '2px solid var(--border)',
                  borderRadius: '0.5rem',
                  fontSize: '0.9375rem',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            <p style={{ color: '#64748b', fontSize: '0.6875rem', marginTop: '0.25rem' }}>
              Turi būti bent 4 simboliai
            </p>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.375rem',
              fontWeight: '600',
              color: 'var(--foreground)',
              fontSize: '0.8125rem'
            }}>
              Pakartokite slaptažodį
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <input
                name="confirmPassword"
                type="password"
                required
                minLength={4}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.875rem 0.75rem 2.5rem',
                  border: '2px solid var(--border)',
                  borderRadius: '0.5rem',
                  fontSize: '0.9375rem',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '0.75rem',
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              color: '#dc2626',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: loading ? '#94a3b8' : '#1e293b',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '0.9375rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Kuriama paskyra...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
                Sukurti
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: '1.25rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <p style={{ color: '#64748b', fontSize: '0.8125rem' }}>
            Already have an account?{' '}
            <Link href="/login" style={{
              color: '#1e293b',
              fontWeight: '600',
              textDecoration: 'none'
            }}>
              Prisijunkite
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
