import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const links = [
  { to: '/',        label: '🏠 Home' },
  { to: '/wall',    label: '💌 Wall' },
  { to: '/gallery', label: '📸 Gallery' },
  { to: '/cake',    label: '🎂 Cake' },
  { to: '/private', label: '🔒 Private' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <nav className="navbar">
      <Link to="/" style={{ textDecoration: 'none' }}>
        <span style={{ fontFamily: 'var(--font-head)', fontSize: '1.2rem', color: 'var(--pink-d)' }}>
          🎀 Diane's Birthday
        </span>
      </Link>

      {/* Desktop */}
      <ul className="navbar-links" style={{ display: 'flex' }}>
        {links.map(l => (
          <li key={l.to}>
            <Link
              to={l.to}
              style={{
                color: pathname === l.to ? 'var(--pink-d)' : undefined,
                fontWeight: pathname === l.to ? '600' : undefined,
              }}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'none',
          background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer',
        }}
        className="hamburger"
        aria-label="menu"
      >
        {open ? '✕' : '☰'}
      </button>

      {/* Mobile menu */}
      {open && (
        <div style={{
          position: 'fixed', inset: 0, top: 64, background: 'rgba(255,248,251,.97)',
          zIndex: 99, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 32,
        }}>
          {links.map(l => (
            <Link
              key={l.to} to={l.to}
              onClick={() => setOpen(false)}
              style={{
                fontSize: '1.3rem', textDecoration: 'none',
                color: pathname === l.to ? 'var(--pink-d)' : '#333',
                fontWeight: pathname === l.to ? '700' : '400',
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .navbar-links { display: none !important; }
          .hamburger    { display: block !important; }
        }
      `}</style>
    </nav>
  )
}