import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'

const cards = [
  { to: '/wall',    emoji: '💚', label: 'Wall of Messages', desc: 'Read everything people wrote just for you',    color: 'var(--g-400)'  },
  { to: '/gallery', emoji: '🌿', label: 'Photo Gallery',    desc: 'Beautiful memories captured for you',          color: 'var(--g-500)'  },
  { to: '/cake',    emoji: '🎂', label: 'Birthday Cake',    desc: 'Blow out the candles and make a wish',         color: 'var(--gold)'   },
  { to: '/private', emoji: '🔒', label: 'Private Notes',    desc: 'Secret messages only you can read',            color: 'var(--g-600)'  },
]

// Matcha-themed floating elements
const FLOATERS = [
  { symbol: '🌿', delay: 0,    dur: 3.5 },
  { symbol: '✨', delay: 0.5,  dur: 4   },
  { symbol: '🍃', delay: 1,    dur: 3   },
  { symbol: '🌸', delay: 1.5,  dur: 4.5 },
  { symbol: '✨', delay: 0.8,  dur: 3.2 },
  { symbol: '🌿', delay: 2,    dur: 3.8 },
]

export default function HomePage() {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true
    const end = Date.now() + 2500
    const frame = () => {
      confetti({
        particleCount: 5,
        spread: 70,
        origin: { x: Math.random(), y: Math.random() * 0.4 },
        colors: ['#5a9e6a','#8ec49a','#c9a84c','#3d7a4a','#d4e8c2','#c1e0c8'],
        scalar: 0.9,
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    setTimeout(frame, 500)
  }, [])

  return (
    <div style={{ minHeight: '100vh', paddingTop: 80 }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '92vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(160deg, var(--g-50) 0%, var(--matcha-latte) 50%, var(--g-100) 100%)',
        textAlign: 'center',
        padding: 'clamp(48px, 8vw, 80px) 24px',
        position: 'relative', overflow: 'hidden',
      }}>

        {/* Decorative circle blobs */}
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(90,158,106,.12) 0%, transparent 70%)',
          top: '10%', left: '-10%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,.1) 0%, transparent 70%)',
          bottom: '15%', right: '-5%', pointerEvents: 'none',
        }} />

        {/* Floating elements — subtle and consistent */}
        {FLOATERS.map((f, i) => (
          <motion.span
            key={i}
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: f.dur, delay: f.delay, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
              opacity: 0.45,
              top:  `${15 + (i * 14) % 65}%`,
              left: `${5  + (i * 17) % 88}%`,
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            {f.symbol}
          </motion.span>
        ))}

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{ position: 'relative', zIndex: 2 }}
        >
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, letterSpacing: 4 }}
            animate={{ opacity: 1, letterSpacing: 6 }}
            transition={{ duration: 1, delay: 0.3 }}
            style={{
              fontSize: 'clamp(.75rem, 1.5vw, .9rem)',
              color: 'var(--g-500)',
              fontWeight: 600,
              letterSpacing: 6,
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            07/25/2026
          </motion.p>

          {/* Main heading */}
          <h1 style={{
            fontFamily: 'var(--font-head)',
            fontSize: 'clamp(3rem, 9vw, 7rem)',
            lineHeight: 1.05,
            color: 'var(--g-600)',
            marginBottom: 24,
            fontWeight: 700,
          }}>
            Happy Birthday,<br />
            <span style={{
              background: 'linear-gradient(135deg, var(--g-500), var(--gold))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Diane
            </span>{' '}
            <span style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)' }}>🎉</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
            color: 'var(--g-400)',
            maxWidth: 520,
            margin: '0 auto 40px',
            lineHeight: 1.7,
            fontWeight: 400,
          }}>
            A whole day made just for you.
            You are loved by more people than you know. 💚
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/wall" className="btn btn-pink" style={{ fontSize: 'clamp(.9rem, 2vw, 1rem)', padding: '14px 30px' }}>
              💚 See the messages
            </Link>
            <Link to="/cake" className="btn btn-outline" style={{ fontSize: 'clamp(.9rem, 2vw, 1rem)', padding: '14px 30px' }}>
              🎂 Blow the candles
            </Link>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          style={{
            position: 'absolute', bottom: 32,
            fontSize: '1.3rem', opacity: 0.35,
            color: 'var(--g-500)',
          }}
        >
          ↓
        </motion.div>
      </section>

      {/* ── Feature cards ─────────────────────────────────────────────── */}
      <section className="section" style={{ paddingTop: 72 }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-title"
          style={{ marginBottom: 8 }}
        >
          Everything made for you 🌿
        </motion.h2>
        <p className="section-sub">Tap anything to explore</p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 18,
        }}>
          {cards.map((c, i) => (
            <motion.div
              key={c.to}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link to={c.to} style={{ textDecoration: 'none', display: 'block' }}>
                <motion.div
                  whileHover={{ y: -6, boxShadow: `0 16px 40px ${c.color}22` }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: '#fff',
                    borderRadius: 22,
                    padding: '30px 24px',
                    textAlign: 'center',
                    border: '1.5px solid var(--g-100)',
                    boxShadow: '0 2px 16px rgba(30,61,37,.06)',
                    cursor: 'pointer',
                    height: '100%',
                  }}
                >
                  <div style={{
                    width: 60, height: 60, borderRadius: '50%',
                    background: `${c.color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.8rem', margin: '0 auto 16px',
                    border: `1.5px solid ${c.color}33`,
                  }}>
                    {c.emoji}
                  </div>
                  <h3 style={{
                    fontFamily: 'var(--font-head)',
                    fontSize: '1.15rem',
                    color: 'var(--g-600)',
                    marginBottom: 8,
                  }}>
                    {c.label}
                  </h3>
                  <p style={{ fontSize: '.87rem', color: 'var(--g-300)', lineHeight: 1.55 }}>
                    {c.desc}
                  </p>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer style={{
        textAlign: 'center',
        padding: 'clamp(40px, 6vw, 64px) 24px',
        background: 'linear-gradient(160deg, var(--g-50), var(--cream))',
        borderTop: '1px solid var(--g-100)',
        marginTop: 40,
      }}>
        <p style={{
          fontFamily: 'var(--font-head)',
          fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
          color: 'var(--g-500)',
          marginBottom: 8,
        }}>
          Enjoy your day! 💚
        </p>
        <p style={{ color: 'var(--g-300)', fontSize: '.9rem' }}>
          Happy Birthday, Diane 🌿
        </p>
      </footer>
    </div>
  )
}