import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useAudioVolume } from '../hooks/useAudioVolume'

const TOTAL_CANDLES = 6

const CANDLE_COLORS = [
  { top: '#ff6b9d', bottom: '#c9184a', glow: '#ff6b9d' },
  { top: '#c77dff', bottom: '#7b2ff7', glow: '#c77dff' },
  { top: '#4cc9f0', bottom: '#4361ee', glow: '#4cc9f0' },
  { top: '#f9c74f', bottom: '#f3722c', glow: '#f9c74f' },
  { top: '#43aa8b', bottom: '#277da1', glow: '#43aa8b' },
  { top: '#f8961e', bottom: '#f94144', glow: '#f8961e' },
]

// ── Realistic Flame ───────────────────────────────────────────────────────────
function Flame({ blown, index }) {
  return (
    <AnimatePresence>
      {!blown && (
        <motion.div
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          exit={{ opacity: 0, scaleY: 0, y: -8, transition: { duration: 0.25 } }}
          style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          {/* Outer glow halo */}
          <div style={{
            position: 'absolute',
            width: 28, height: 36,
            borderRadius: '50%',
            background: `radial-gradient(ellipse, ${CANDLE_COLORS[index].glow}55 0%, transparent 70%)`,
            top: -4, left: '50%', transform: 'translateX(-50%)',
            filter: 'blur(4px)',
          }} />

          {/* Main flame body */}
          <motion.div
            animate={{
              scaleX: [1, 1.08, 0.94, 1.05, 0.97, 1],
              scaleY: [1, 0.96, 1.04, 0.93, 1.02, 1],
              x: [0, 1, -1, 0.5, -0.5, 0],
            }}
            transition={{ repeat: Infinity, duration: 0.5 + index * 0.06, ease: 'easeInOut' }}
            style={{
              width: 16, height: 28,
              background: 'linear-gradient(to top, #f94144 0%, #f9c74f 40%, #fff7e6 80%, #fffde7 100%)',
              borderRadius: '50% 50% 35% 35% / 55% 55% 45% 45%',
              boxShadow: `0 0 8px 2px ${CANDLE_COLORS[index].glow}88`,
              position: 'relative',
              zIndex: 2,
            }}
          />

          {/* Inner blue core */}
          <div style={{
            position: 'absolute',
            bottom: 3,
            width: 6, height: 10,
            background: 'linear-gradient(to top, #caf0f8, #90e0ef)',
            borderRadius: '50% 50% 35% 35% / 55% 55% 45% 45%',
            zIndex: 3,
            opacity: 0.85,
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Smoke ─────────────────────────────────────────────────────────────────────
function Smoke({ blown }) {
  return (
    <AnimatePresence>
      {blown && (
        <>
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              initial={{ opacity: 0.6, y: 0, x: 0, scale: 0.5 }}
              animate={{ opacity: 0, y: -40 - i * 10, x: (i - 1) * 6, scale: 1.5 }}
              transition={{ duration: 1.5, delay: i * 0.15, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                width: 8, height: 16,
                background: 'radial-gradient(ellipse, rgba(156,163,175,0.6) 0%, transparent 70%)',
                borderRadius: '50%',
                left: '50%', top: -10,
                transform: 'translateX(-50%)',
                filter: 'blur(3px)',
                pointerEvents: 'none',
              }}
            />
          ))}
        </>
      )}
    </AnimatePresence>
  )
}

// ── Single Candle ─────────────────────────────────────────────────────────────
function Candle({ blown, index }) {
  const color = CANDLE_COLORS[index % CANDLE_COLORS.length]
  const heights = [72, 84, 68, 80, 76, 70]
  const h = heights[index % heights.length]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <Flame blown={blown} index={index % CANDLE_COLORS.length} />

      {/* Wick */}
      <div style={{
        width: 2.5, height: 10,
        background: 'linear-gradient(to bottom, #1a1a2e, #555)',
        borderRadius: '1px 1px 0 0',
        zIndex: 2,
        marginBottom: -1,
      }} />

      {/* Candle body with wax texture */}
      <div style={{
        width: 22, height: h,
        background: `linear-gradient(165deg, ${color.top} 0%, ${color.bottom} 100%)`,
        borderRadius: '4px 4px 3px 3px',
        position: 'relative',
        boxShadow: blown
          ? '2px 2px 6px rgba(0,0,0,0.2)'
          : `2px 2px 6px rgba(0,0,0,0.2), 0 0 12px ${color.glow}55`,
        overflow: 'hidden',
      }}>
        {/* Shine highlight */}
        <div style={{
          position: 'absolute', top: 0, left: '20%',
          width: '25%', height: '100%',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.35), rgba(255,255,255,0.05))',
          borderRadius: 2,
        }} />
        {/* Wax drip 1 */}
        <div style={{
          position: 'absolute', top: 0, left: '15%',
          width: 5, height: h * 0.25,
          background: `${color.top}cc`,
          borderRadius: '0 0 6px 6px',
        }} />
        {/* Wax drip 2 */}
        <div style={{
          position: 'absolute', top: 0, right: '20%',
          width: 4, height: h * 0.15,
          background: `${color.top}99`,
          borderRadius: '0 0 5px 5px',
        }} />
        {/* Melted wax pool at top */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 18, height: 7,
          background: `${color.top}dd`,
          borderRadius: '50%',
        }} />
      </div>

      {/* Smoke overlay */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)' }}>
        <Smoke blown={blown} />
      </div>
    </div>
  )
}

// ── Frosting Drips ────────────────────────────────────────────────────────────
function FrostingDrips({ color, count, width }) {
  return (
    <div style={{ position: 'relative', width, height: 22, margin: '0 auto', overflow: 'visible', zIndex: 3 }}>
      {Array.from({ length: count }).map((_, i) => {
        const dripH = 14 + (i % 3) * 6
        const dripW = 10 + (i % 2) * 4
        return (
          <div key={i} style={{
            position: 'absolute',
            bottom: 0,
            left: `${(i / count) * 90 + 3}%`,
            width: dripW,
            height: dripH,
            background: color,
            borderRadius: '0 0 50% 50%',
            transform: 'translateX(-50%)',
          }} />
        )
      })}
    </div>
  )
}

// ── Realistic Cake ────────────────────────────────────────────────────────────
function Cake({ children, blownCount, total }) {
  const progress = blownCount / total

  return (
    <div style={{ position: 'relative', display: 'inline-block', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))' }}>

      {/* Candles row */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
        gap: 'clamp(8px, 3vw, 18px)',
        marginBottom: 0, position: 'relative', zIndex: 10,
        paddingBottom: 2,
      }}>
        {children}
      </div>

      {/* ── TOP TIER ── */}
      <div style={{ position: 'relative', margin: '0 auto', width: 'clamp(160px, 38vw, 220px)' }}>
        {/* Frosting top surface */}
        <div style={{
          height: 18,
          background: 'linear-gradient(to bottom, #fff5f9, #ffd6e7)',
          borderRadius: '50% 50% 0 0 / 80% 80% 0 0',
          position: 'relative',
          zIndex: 4,
          boxShadow: '0 -2px 8px rgba(255,105,180,0.2)',
        }}>
          {/* Sprinkles on top */}
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: 3, height: 7,
              background: ['#f472b6','#a78bfa','#60a5fa','#34d399','#fbbf24'][i % 5],
              borderRadius: 2,
              left: `${12 + i * 10}%`,
              top: '20%',
              transform: `rotate(${i * 40}deg)`,
            }} />
          ))}
        </div>

        {/* Cake body top tier */}
        <div style={{
          height: 'clamp(55px, 10vw, 75px)',
          background: 'linear-gradient(170deg, #ffb3c6 0%, #ff85a1 50%, #e63970 100%)',
          position: 'relative', overflow: 'hidden', zIndex: 3,
        }}>
          {/* Texture lines */}
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(255,255,255,0.06) 18px, rgba(255,255,255,0.06) 19px)' }} />
          {/* Side shine */}
          <div style={{ position: 'absolute', top: 0, left: '5%', width: '15%', height: '100%', background: 'linear-gradient(to right, rgba(255,255,255,0.15), transparent)' }} />
          {/* Decorative hearts */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 'clamp(0.7rem, 2vw, 1rem)', opacity: 0.7 }}>
            💗 💗 💗
          </div>
        </div>
        {/* Frosting drips top tier */}
        <FrostingDrips color="#ffd6e7" count={7} width="100%" />
      </div>

      {/* ── MIDDLE TIER ── */}
      <div style={{ position: 'relative', margin: '0 auto', width: 'clamp(210px, 50vw, 290px)', marginTop: -4 }}>
        {/* Frosting surface */}
        <div style={{
          height: 20,
          background: 'linear-gradient(to bottom, #f3f0ff, #d8b4fe)',
          borderRadius: '50% 50% 0 0 / 80% 80% 0 0',
          zIndex: 4, position: 'relative',
          boxShadow: '0 -2px 8px rgba(167,139,250,0.25)',
        }}>
          {/* Sprinkles */}
          {[...Array(10)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: 3, height: 7,
              background: ['#f472b6','#fbbf24','#60a5fa','#34d399','#fb7185'][i % 5],
              borderRadius: 2,
              left: `${8 + i * 8}%`,
              top: '15%',
              transform: `rotate(${i * 35}deg)`,
            }} />
          ))}
        </div>

        {/* Cake body middle tier */}
        <div style={{
          height: 'clamp(65px, 12vw, 88px)',
          background: 'linear-gradient(170deg, #e9d5ff 0%, #c084fc 50%, #9333ea 100%)',
          position: 'relative', overflow: 'hidden', zIndex: 3,
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 21px)' }} />
          <div style={{ position: 'absolute', top: 0, left: '5%', width: '12%', height: '100%', background: 'linear-gradient(to right, rgba(255,255,255,0.18), transparent)' }} />

          {/* "Happy Birthday" text */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: 'var(--font-head)',
              fontSize: 'clamp(0.75rem, 2.5vw, 1.05rem)',
              color: '#fff',
              textShadow: '0 1px 4px rgba(0,0,0,0.3)',
              fontWeight: 700,
              letterSpacing: 1,
              whiteSpace: 'nowrap',
            }}>
              Happy Birthday! 🎀
            </span>
          </div>

          {/* Polka dots decoration */}
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: 8, height: 8, borderRadius: '50%',
              background: 'rgba(255,255,255,0.3)',
              left: `${8 + i * 16}%`,
              bottom: 12,
            }} />
          ))}
        </div>
        <FrostingDrips color="#e9d5ff" count={9} width="100%" />
      </div>

      {/* ── BOTTOM TIER ── */}
      <div style={{ position: 'relative', margin: '0 auto', width: 'clamp(260px, 62vw, 360px)', marginTop: -4 }}>
        {/* Frosting surface */}
        <div style={{
          height: 24,
          background: 'linear-gradient(to bottom, #fff9db, #fde68a)',
          borderRadius: '50% 50% 0 0 / 80% 80% 0 0',
          zIndex: 4, position: 'relative',
          boxShadow: '0 -2px 8px rgba(251,191,36,0.25)',
        }}>
          {[...Array(12)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: 3, height: 7,
              background: ['#f472b6','#a78bfa','#60a5fa','#34d399','#f94144'][i % 5],
              borderRadius: 2,
              left: `${5 + i * 8}%`,
              top: '10%',
              transform: `rotate(${i * 30}deg)`,
            }} />
          ))}
        </div>

        {/* Cake body bottom tier */}
        <div style={{
          height: 'clamp(75px, 14vw, 100px)',
          background: 'linear-gradient(170deg, #fef3c7 0%, #fbbf24 50%, #d97706 100%)',
          position: 'relative', overflow: 'hidden', zIndex: 3,
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg, transparent, transparent 22px, rgba(255,255,255,0.05) 22px, rgba(255,255,255,0.05) 23px)' }} />
          <div style={{ position: 'absolute', top: 0, left: '5%', width: '10%', height: '100%', background: 'linear-gradient(to right, rgba(255,255,255,0.2), transparent)' }} />

          {/* Name on cake */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
            <span style={{
              fontFamily: 'var(--font-head)',
              fontSize: 'clamp(1rem, 3.5vw, 1.4rem)',
              color: '#7c2d12',
              textShadow: '0 1px 3px rgba(0,0,0,0.2)',
              fontWeight: 700,
            }}>
              💖 Diane 💖
            </span>
          </div>

          {/* Star decorations */}
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              fontSize: 'clamp(0.6rem, 1.5vw, 0.9rem)',
              left: `${10 + i * 20}%`,
              top: i % 2 === 0 ? '15%' : '65%',
              opacity: 0.5,
            }}>✨</div>
          ))}
        </div>
        <FrostingDrips color="#fef3c7" count={11} width="100%" />
      </div>

      {/* ── PLATE ── */}
      <div style={{
        width: 'clamp(280px, 68vw, 400px)',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2,
      }}>
        {/* Plate rim */}
        <div style={{
          height: 14,
          background: 'linear-gradient(to bottom, #f1f5f9, #e2e8f0)',
          borderRadius: '0 0 50% 50% / 0 0 100% 100%',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          border: '1px solid #cbd5e1',
        }} />
        {/* Plate shadow */}
        <div style={{
          height: 8,
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          marginTop: 2,
          filter: 'blur(4px)',
        }} />
      </div>

      {/* Ambient glow under cake when candles are lit */}
      {progress < 1 && (
        <div style={{
          position: 'absolute',
          bottom: 20, left: '50%', transform: 'translateX(-50%)',
          width: '80%', height: 40,
          background: 'radial-gradient(ellipse, rgba(251,191,36,0.2) 0%, transparent 70%)',
          filter: 'blur(12px)',
          pointerEvents: 'none',
          opacity: 1 - progress,
        }} />
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CakePage() {
  const [blown, setBlown]             = useState(Array(TOTAL_CANDLES).fill(false))
  const [allBlown, setAllBlown]       = useState(false)
  const [phase, setPhase]             = useState('idle')
  const [volumeLevel, setVolumeLevel] = useState(0)
  const blowingRef    = useRef(false)
  const blownRef      = useRef([...Array(TOTAL_CANDLES).fill(false)])
  const confettiFired = useRef(false)

  const handleBlow = useCallback((rms) => {
    setVolumeLevel(rms)
    if (blowingRef.current) return
    const nextUnblown = blownRef.current.findIndex(b => !b)
    if (nextUnblown === -1) return
    blowingRef.current = true
    blownRef.current[nextUnblown] = true
    setBlown(prev => { const n = [...prev]; n[nextUnblown] = true; return n })
    setTimeout(() => { blowingRef.current = false }, 300)
  }, [])

  // Lower threshold = more sensitive (0.06 picks up gentle blowing easily)
  const { start, stop, listening, error } = useAudioVolume({
    onBlow: handleBlow,
    threshold: 0.06,
    interval: 60,
  })

  useEffect(() => {
    if (blown.every(Boolean) && !allBlown) {
      setAllBlown(true)
      setPhase('done')
      stop()
      if (!confettiFired.current) {
        confettiFired.current = true
        const end = Date.now() + 4500
        const frame = () => {
          confetti({ particleCount: 10, angle: 60,  spread: 65, origin: { x: 0   }, colors: ['#f472b6','#fbbf24','#a78bfa','#34d399'] })
          confetti({ particleCount: 10, angle: 120, spread: 65, origin: { x: 1   }, colors: ['#60a5fa','#fb7185','#fbbf24','#c084fc'] })
          confetti({ particleCount: 6,  angle: 90,  spread: 120, origin: { x: 0.5, y: 0.4 }, colors: ['#fff','#fdf2f8','#ede9fe'] })
          if (Date.now() < end) requestAnimationFrame(frame)
        }
        frame()
      }
    }
  }, [blown, allBlown, stop])

  const handleStartListening = async () => {
    setPhase('listening')
    await start()
  }

  const reset = () => {
    setBlown(Array(TOTAL_CANDLES).fill(false))
    blownRef.current = Array(TOTAL_CANDLES).fill(false)
    setAllBlown(false)
    setPhase('idle')
    confettiFired.current = false
    setVolumeLevel(0)
    stop()
  }

  const blownCount = blown.filter(Boolean).length

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #fffbeb, #fdf2f8)',
        padding: 'clamp(32px, 6vw, 56px) 24px clamp(28px, 5vw, 48px)',
        textAlign: 'center',
      }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: 'var(--font-head)',
            fontSize: 'clamp(1.8rem, 5vw, 3rem)',
            marginBottom: 8,
          }}
        >
          Make a Wish! 🎂
        </motion.h1>
        <p style={{ color: '#888', fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)' }}>
          Blow into your microphone to extinguish the candles
        </p>
      </div>

      <div style={{
        maxWidth: 700, margin: '0 auto',
        padding: 'clamp(24px, 5vw, 48px) clamp(16px, 4vw, 24px)',
        textAlign: 'center',
      }}>

        {/* Volume meter */}
        {listening && !allBlown && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ maxWidth: 320, margin: '0 auto 28px' }}
          >
            <p style={{ fontSize: '.85rem', color: '#888', marginBottom: 8 }}>
              🎤 Listening… blow gently into your mic!
            </p>
            <div style={{ height: 12, background: '#f3f4f6', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
              <motion.div
                animate={{ width: `${Math.min(volumeLevel * 700, 100)}%` }}
                transition={{ duration: 0.04 }}
                style={{
                  height: '100%',
                  background: volumeLevel > 0.06
                    ? 'linear-gradient(90deg, #34d399, #10b981)'
                    : 'linear-gradient(90deg, var(--pink), var(--purple))',
                  borderRadius: 6,
                  transition: 'background 0.2s',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: '.75rem', color: '#bbb' }}>
                {blownCount} / {TOTAL_CANDLES} candles out 🕯️
              </span>
              <span style={{ fontSize: '.75rem', color: volumeLevel > 0.06 ? '#34d399' : '#bbb' }}>
                {volumeLevel > 0.06 ? '💨 Blowing!' : 'Waiting…'}
              </span>
            </div>
          </motion.div>
        )}

        {/* The Cake */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 160, damping: 18 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 'clamp(24px, 5vw, 40px)' }}
        >
          <Cake blownCount={blownCount} total={TOTAL_CANDLES}>
            {Array.from({ length: TOTAL_CANDLES }).map((_, i) => (
              <Candle key={i} blown={blown[i]} index={i} />
            ))}
          </Cake>
        </motion.div>

        {/* Controls */}
        <div>
          {error && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{
                color: '#dc2626', marginBottom: 16,
                fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                background: '#fee2e2', padding: '10px 16px',
                borderRadius: 10, display: 'inline-block',
              }}
            >
              ⚠️ {error} — please allow microphone access in your browser
            </motion.p>
          )}

          {phase === 'idle' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <button
                onClick={handleStartListening}
                className="btn btn-pink"
                style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', padding: '12px 28px' }}
              >
                🎤 Enable microphone & start
              </button>
              <p style={{ color: '#aaa', fontSize: '.82rem', marginTop: 10 }}>
                Your mic is only used locally — nothing is recorded 🔒
              </p>
            </motion.div>
          )}

          {phase === 'listening' && !allBlown && (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  const nextUnblown = blownRef.current.findIndex(b => !b)
                  if (nextUnblown !== -1) {
                    blownRef.current[nextUnblown] = true
                    setBlown(prev => { const n = [...prev]; n[nextUnblown] = true; return n })
                  }
                }}
                className="btn btn-outline"
                style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}
              >
                👆 Tap to blow one
              </button>
              <button onClick={stop} className="btn btn-ghost" style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>
                ⏹ Stop mic
              </button>
            </div>
          )}

          {/* Wish message */}
          <AnimatePresence>
            {allBlown && (
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.85 }}
                animate={{ opacity: 1, y: 0,  scale: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 16, delay: 0.3 }}
                style={{
                  background: 'linear-gradient(135deg, #fdf2f8, #ede9fe)',
                  borderRadius: 24,
                  padding: 'clamp(24px, 5vw, 36px) clamp(20px, 4vw, 32px)',
                  border: '2px solid var(--pink)',
                  maxWidth: 440, margin: '24px auto 0',
                  boxShadow: '0 8px 40px rgba(244,114,182,.3)',
                }}
              >
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', marginBottom: 12 }}
                >
                  🎉
                </motion.div>
                <h2 style={{
                  fontFamily: 'var(--font-head)',
                  fontSize: 'clamp(1.3rem, 4vw, 1.8rem)',
                  marginBottom: 10,
                }}>
                  You blew them all out!
                </h2>
                <p style={{
                  color: '#555',
                  fontSize: 'clamp(0.88rem, 2.5vw, 1rem)',
                  lineHeight: 1.7, marginBottom: 20,
                }}>
                  Close your eyes and make a wish, Chloe. 💖<br />
                  Whatever it is — I hope it comes true.
                </p>
                <button
                  onClick={reset}
                  className="btn btn-outline"
                  style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}
                >
                  🔄 Light them again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}