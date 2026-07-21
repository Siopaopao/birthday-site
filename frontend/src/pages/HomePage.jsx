import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'

const EMOJIS = ['🎈','🎀','🌸','💖','✨','🎊','🌷','💕']

function FloatingEmoji({ emoji, style }) {
  return (
    <span
      className="animate-float"
      style={{
        position: 'absolute', fontSize: '2rem', userSelect: 'none',
        animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
        animationDelay: `${Math.random() * 2}s`,
        ...style,
      }}
    >
      {emoji}
    </span>
  )
}

const cards = [
  { to: '/wall',    emoji: '💌', label: 'Wall of Messages',    desc: 'Read wishes from everyone who loves you',  color: 'var(--pink)'   },
  { to: '/gallery', emoji: '📸', label: 'Photo Gallery',   desc: 'Beautiful memories captured just for you', color: 'var(--purple)' },
  { to: '/cake',    emoji: '🎂', label: 'Birthday Cake',   desc: 'Blow out the candles and make a wish',     color: 'var(--yellow)' },
  { to: '/private', emoji: '🔒', label: 'Private Notes',   desc: 'Secret messages just for you',             color: 'var(--coral)'  },
]

export default function HomePage() {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true
    const end = Date.now() + 2200
    const frame = () => {
      confetti({ particleCount: 6, spread: 80, origin: { x: Math.random(), y: Math.random() * 0.5 }, colors: ['#f472b6','#fbbf24','#a78bfa','#34d399','#fb7185'] })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    setTimeout(frame, 400)
  }, [])

  return (
    <div style={{ minHeight: '100vh', paddingTop: 80 }}>

      {/* Hero */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        minHeight: '92vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0faf1 0%, #d4edda 40%, #e8f5e9 100%)',
        textAlign: 'center', padding: '60px 24px',
      }}>
        {EMOJIS.map((e, i) => (
          <FloatingEmoji key={i} emoji={e} style={{
            top:  `${10 + (i * 11) % 70}%`,
            left: `${5  + (i * 13) % 90}%`,
            opacity: 0.6,
          }} />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <p style={{ fontSize: '1.1rem', color: 'var(--pink-d)', fontWeight: 500, marginBottom: 8, letterSpacing: 2 }}>
            ✨ HAPPY BIRTHDAY ✨
          </p>
          <h1 style={{
            fontSize: 'clamp(2.8rem, 8vw, 6rem)',
            lineHeight: 1.1,
            background: 'linear-gradient(135deg, #3d7a4a, #2e7d32)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 16,
          }}>
            Happy Birthday,<br />Diane! 🎉
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.35rem)', color: '#555', maxWidth: 560, margin: '0 auto 36px' }}>
            A whole day made just for you.
            You are loved by more people than you know. 💕
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/wall" className="btn btn-pink" style={{ fontSize: '1rem' }}>
              💌 See the message wall
            </Link>
            <Link to="/cake" className="btn btn-outline" style={{ fontSize: '1rem' }}>
              🎂 Blow the candles
            </Link>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ position: 'absolute', bottom: 32, fontSize: '1.5rem', opacity: 0.4 }}
        >
          ↓
        </motion.div>
      </section>

      {/* Feature cards */}
      <section className="section">
        <h2 className="section-title">Everything made for you 🎀</h2>
        <p className="section-sub">Click anything to explore</p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 20,
        }}>
          {cards.map((c, i) => (
            <motion.div
              key={c.to}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={c.to} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: '#fff', borderRadius: 20, padding: '28px 22px',
                  textAlign: 'center', border: '2px solid transparent',
                  boxShadow: '0 2px 16px rgba(0,0,0,.06)',
                  transition: 'transform .2s, box-shadow .2s, border-color .2s',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-6px)'
                    e.currentTarget.style.boxShadow = `0 12px 32px ${c.color}33`
                    e.currentTarget.style.borderColor = c.color
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,.06)'
                    e.currentTarget.style.borderColor = 'transparent'
                  }}
                >
                  <div style={{ fontSize: '2.8rem', marginBottom: 12 }}>{c.emoji}</div>
                  <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.2rem', marginBottom: 6, color: '#1a1a2e' }}>{c.label}</h3>
                  <p style={{ fontSize: '.88rem', color: '#888', lineHeight: 1.5 }}>{c.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center', padding: '48px 24px',
        background: 'linear-gradient(135deg, #f0faf1, #e8f5e9)',
        marginTop: 40,
      }}>
        <p style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', color: 'var(--pink-d)', marginBottom: 8 }}>
          Enjoy your day! 💖
        </p>
        <p style={{ color: '#888', fontSize: '.9rem' }}>Happy Birthday, Diane 🌸</p>
      </footer>
    </div>
  )
}