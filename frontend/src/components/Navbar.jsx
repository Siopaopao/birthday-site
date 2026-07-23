import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const links = [
  { to: '/',        label: 'Home',     emoji: '🏠' },
  { to: '/wall',    label: 'Messages', emoji: '💚' },
  { to: '/gallery', label: 'Gallery',  emoji: '🌿' },
  { to: '/cake',    label: 'Cake',     emoji: '🎂' },
  { to: '/private', label: 'Private',  emoji: '🔒' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav className="navbar">
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--g-400), var(--g-600))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem',
          }}>
            🌿
          </div>
          <span style={{
            fontFamily: 'var(--font-head)',
            fontSize: '1.1rem',
            color: 'var(--g-600)',
            fontWeight: 700,
          }}>
            Diane's Birthday
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="navbar-links" style={{ display: 'flex', gap: 4 }}>
          {links.map(l => {
            const active = pathname === l.to
            return (
              <li key={l.to} style={{ listStyle: 'none' }}>
                <Link
                  to={l.to}
                  style={{
                    textDecoration: 'none',
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '7px 14px',
                    borderRadius: 50,
                    fontSize: '.88rem',
                    fontWeight: active ? 600 : 400,
                    color: active ? '#fff' : 'var(--g-500)',
                    background: active ? 'var(--g-500)' : 'transparent',
                    transition: 'all .2s',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.background = 'var(--g-100)'
                      e.currentTarget.style.color = 'var(--g-600)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'var(--g-500)'
                    }
                  }}
                >
                  <span>{l.emoji}</span>
                  <span>{l.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(o => !o)}
          className="hamburger"
          style={{
            display: 'none',
            background: 'none', border: 'none',
            fontSize: '1.4rem', cursor: 'pointer',
            color: 'var(--g-500)', padding: 4,
          }}
          aria-label="Toggle menu"
        >
          {open ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {open && (
        <div style={{
          position: 'fixed', inset: 0, top: 64,
          background: 'rgba(242,248,243,.97)',
          zIndex: 99,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 8,
        }}>
          {links.map(l => {
            const active = pathname === l.to
            return (
              <Link
                key={l.to} to={l.to}
                onClick={() => setOpen(false)}
                style={{
                  textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '14px 32px',
                  borderRadius: 50,
                  fontSize: '1.15rem',
                  fontWeight: active ? 700 : 400,
                  color: active ? '#fff' : 'var(--g-600)',
                  background: active ? 'var(--g-500)' : 'transparent',
                  width: 220, justifyContent: 'center',
                }}
              >
                <span>{l.emoji}</span>
                <span>{l.label}</span>
              </Link>
            )
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .navbar-links { display: none !important; }
          .hamburger    { display: block !important; }
        }
      `}</style>
    </>
  )
}