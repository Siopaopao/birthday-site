import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useAudioVolume } from '../hooks/useAudioVolume'

const TOTAL_CANDLES = 6

const CANDLE_COLORS = [
  { top: '#a8c5a0', bottom: '#5a9e6a', glow: '#8ec49a' },
  { top: '#e8d5a3', bottom: '#c9a84c', glow: '#e8d5a3' },
  { top: '#c1e0c8', bottom: '#8ec49a', glow: '#c1e0c8' },
  { top: '#a8c5a0', bottom: '#3d7a4a', glow: '#5a9e6a' },
  { top: '#e8d5a3', bottom: '#a07e2e', glow: '#c9a84c' },
  { top: '#c1e0c8', bottom: '#5a9e6a', glow: '#8ec49a' },
]

const CANDLE_HEIGHTS = [58, 70, 54, 64, 60, 56]

// ── Flame ─────────────────────────────────────────────────────────────────────
function Flame({ index }) {
  return (
    <motion.div
      style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      {/* Glow halo */}
      <div style={{
        position: 'absolute', width: 28, height: 36,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(251,191,36,0.45) 0%, transparent 70%)',
        top: -4, left: '50%', transform: 'translateX(-50%)',
        filter: 'blur(4px)',
      }} />
      {/* Outer flame */}
      <motion.div
        animate={{
          scaleX: [1, 1.08, 0.94, 1.05, 0.97, 1],
          scaleY: [1, 0.96, 1.04, 0.93, 1.02, 1],
          x: [0, 1, -1, 0.5, -0.5, 0],
        }}
        transition={{ repeat: Infinity, duration: 0.5 + index * 0.06, ease: 'easeInOut' }}
        style={{
          width: 14, height: 26,
          background: 'linear-gradient(to top, #f59e0b 0%, #fbbf24 40%, #fde68a 80%, #fff9c4 100%)',
          borderRadius: '50% 50% 35% 35% / 55% 55% 45% 45%',
          boxShadow: '0 0 10px 2px rgba(251,191,36,.6)',
          position: 'relative', zIndex: 2,
        }}
      />
      {/* Inner blue core */}
      <div style={{
        position: 'absolute', bottom: 3,
        width: 5, height: 10,
        background: 'linear-gradient(to top, #bfdbfe, #e0f2fe)',
        borderRadius: '50% 50% 35% 35% / 55% 55% 45% 45%',
        zIndex: 3, opacity: 0.85,
      }} />
    </motion.div>
  )
}

// ── Smoke ─────────────────────────────────────────────────────────────────────
function Smoke() {
  return (
    <>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          initial={{ opacity: 0.7, y: 0, x: 0, scale: 0.4 }}
          animate={{ opacity: 0, y: -40 - i * 8, x: (i - 1) * 5, scale: 1.6 }}
          transition={{ duration: 1.4, delay: i * 0.12, ease: 'easeOut' }}
          style={{
            position: 'absolute', width: 8, height: 16,
            background: 'radial-gradient(ellipse, rgba(148,163,184,0.55) 0%, transparent 70%)',
            borderRadius: '50%', left: '50%', top: -8,
            transform: 'translateX(-50%)',
            filter: 'blur(3px)', pointerEvents: 'none',
          }}
        />
      ))}
    </>
  )
}

// ── Single candle ─────────────────────────────────────────────────────────────
function Candle({ blown, index }) {
  const c = CANDLE_COLORS[index % CANDLE_COLORS.length]
  const h = CANDLE_HEIGHTS[index % CANDLE_HEIGHTS.length]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      {/* Flame or smoke */}
      <AnimatePresence mode="wait">
        {!blown ? (
          <motion.div
            key="flame"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0, y: -8, transition: { duration: 0.25 } }}
          >
            <Flame index={index} />
          </motion.div>
        ) : (
          <motion.div
            key="smoke"
            style={{ position: 'relative', width: 14, height: 30 }}
          >
            <Smoke />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wick */}
      <div style={{
        width: 2.5, height: 9,
        background: 'linear-gradient(to bottom, #1e3a2f, #64748b)',
        borderRadius: '1px 1px 0 0',
        zIndex: 2, marginBottom: -1,
      }} />

      {/* Candle body */}
      <div style={{
        width: 16, height: h,
        background: `linear-gradient(165deg, ${c.top} 0%, ${c.bottom} 100%)`,
        borderRadius: '3px 3px 2px 2px',
        position: 'relative', overflow: 'hidden',
        boxShadow: blown ? '2px 2px 6px rgba(0,0,0,.1)' : `0 0 12px ${c.glow}88, 2px 2px 6px rgba(0,0,0,.1)`,
        transition: 'box-shadow .4s',
      }}>
        {/* Shine */}
        <div style={{
          position: 'absolute', top: 0, left: '18%',
          width: '22%', height: '100%',
          background: 'linear-gradient(to bottom, rgba(255,255,255,.35), rgba(255,255,255,.05))',
          borderRadius: 2,
        }} />
        {/* Wax drip 1 */}
        <div style={{
          position: 'absolute', top: 0, left: '15%',
          width: 4, height: h * 0.22,
          background: `${c.top}cc`,
          borderRadius: '0 0 5px 5px',
        }} />
        {/* Wax drip 2 */}
        <div style={{
          position: 'absolute', top: 0, right: '18%',
          width: 3, height: h * 0.14,
          background: `${c.top}99`,
          borderRadius: '0 0 4px 4px',
        }} />
        {/* Wax pool at top */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 14, height: 6,
          background: `${c.top}dd`,
          borderRadius: '50%',
        }} />
      </div>
    </div>
  )
}

// ── Frosting drips ────────────────────────────────────────────────────────────
function Drips({ color, count, width }) {
  return (
    <div style={{ position: 'relative', width, height: 20, overflow: 'visible', zIndex: 3 }}>
      {Array.from({ length: count }).map((_, i) => {
        const h = 12 + (i % 3) * 6
        const w = 10 + (i % 2) * 4
        return (
          <div key={i} style={{
            position: 'absolute', bottom: 0,
            left: `${(i / count) * 90 + 3}%`,
            width: w, height: h,
            background: color,
            borderRadius: '0 0 50% 50%',
            transform: 'translateX(-50%)',
          }} />
        )
      })}
    </div>
  )
}

// ── Sprinkles ─────────────────────────────────────────────────────────────────
function Sprinkle({ color, left, top, rotate }) {
  return (
    <div style={{
      position: 'absolute',
      width: 3, height: 8,
      background: color,
      borderRadius: 2,
      left, top,
      transform: `rotate(${rotate}deg)`,
    }} />
  )
}

// ── The Cake ──────────────────────────────────────────────────────────────────
function Cake({ children, blownCount }) {
  const progress = blownCount / TOTAL_CANDLES

  return (
    <div style={{
      position: 'relative', display: 'inline-block',
      filter: 'drop-shadow(0 20px 48px rgba(46,94,56,.18))',
    }}>

      {/* Candles row */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
        gap: 'clamp(10px, 3vw, 18px)',
        position: 'relative', zIndex: 10, paddingBottom: 2,
      }}>
        {children}
      </div>

      {/* ── Tier 1 — Sage green (top) ── */}
      <div style={{ position: 'relative', margin: '0 auto', width: 'clamp(160px, 36vw, 210px)' }}>
        {/* Frosting surface */}
        <div style={{
          height: 16,
          background: 'linear-gradient(to bottom, #f8fff9, #c1e0c8)',
          borderRadius: '50% 50% 0 0 / 80% 80% 0 0',
          position: 'relative', zIndex: 4,
          boxShadow: '0 -2px 8px rgba(90,158,106,.2)',
        }}>
          <Sprinkle color="#c9a84c" left="12%" top="2px" rotate={30} />
          <Sprinkle color="#fff"    left="28%" top="3px" rotate={-20} />
          <Sprinkle color="#a8c5a0" left="46%" top="2px" rotate={45} />
          <Sprinkle color="#c9a84c" left="64%" top="3px" rotate={-35} />
          <Sprinkle color="#fff"    left="80%" top="2px" rotate={20} />
        </div>

        {/* Body */}
        <div style={{
          height: 'clamp(55px, 10vw, 70px)',
          background: 'linear-gradient(165deg, #c1e0c8 0%, #8ec49a 50%, #5a9e6a 100%)',
          position: 'relative', overflow: 'hidden', zIndex: 3,
        }}>
          <div style={{ position: 'absolute', top: 0, left: '5%', width: '12%', height: '100%', background: 'rgba(255,255,255,.15)' }} />
          {/* Dots */}
          {[12, 30, 50, 68, 84].map((l, i) => (
            <div key={i} style={{ position: 'absolute', width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,.25)', left: `${l}%`, top: '55%' }} />
          ))}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(.7rem, 2vw, .9rem)', opacity: .7 }}>
            🌸 🌸 🌸
          </div>
        </div>
        <Drips color="#c1e0c8" count={7} width="100%" />
      </div>

      {/* ── Tier 2 — Deep matcha (middle) ── */}
      <div style={{ position: 'relative', margin: '0 auto', width: 'clamp(210px, 48vw, 275px)', marginTop: -4 }}>
        <div style={{
          height: 18,
          background: 'linear-gradient(to bottom, #f0faf1, #a8c5a0)',
          borderRadius: '50% 50% 0 0 / 80% 80% 0 0',
          position: 'relative', zIndex: 4,
          boxShadow: '0 -2px 8px rgba(61,122,74,.2)',
        }}>
          <Sprinkle color="#fff"    left="8%"  top="2px" rotate={-15} />
          <Sprinkle color="#c9a84c" left="22%" top="3px" rotate={25} />
          <Sprinkle color="#e8d5a3" left="37%" top="2px" rotate={-40} />
          <Sprinkle color="#fff"    left="53%" top="3px" rotate={20} />
          <Sprinkle color="#c9a84c" left="67%" top="2px" rotate={-25} />
          <Sprinkle color="#e8d5a3" left="82%" top="3px" rotate={35} />
        </div>

        <div style={{
          height: 'clamp(65px, 12vw, 84px)',
          background: 'linear-gradient(165deg, #a8c5a0 0%, #5a9e6a 50%, #3d7a4a 100%)',
          position: 'relative', overflow: 'hidden', zIndex: 3,
        }}>
          <div style={{ position: 'absolute', top: 0, left: '5%', width: '10%', height: '100%', background: 'rgba(255,255,255,.15)' }} />
          {[8, 20, 33, 47, 60, 73, 85].map((l, i) => (
            <div key={i} style={{ position: 'absolute', width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,.2)', left: `${l}%`, bottom: 14 }} />
          ))}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: 'var(--font-head, Georgia, serif)',
              fontSize: 'clamp(.8rem, 2.5vw, 1rem)',
              color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,.25)',
              fontWeight: 700, letterSpacing: 1, whiteSpace: 'nowrap',
            }}>
              Happy Birthday! 🌿
            </span>
          </div>
        </div>
        <Drips color="#a8c5a0" count={9} width="100%" />
      </div>

      {/* ── Tier 3 — Gold / cream (bottom) ── */}
      <div style={{ position: 'relative', margin: '0 auto', width: 'clamp(260px, 60vw, 340px)', marginTop: -4 }}>
        <div style={{
          height: 22,
          background: 'linear-gradient(to bottom, #fdfaf4, #e8d5a3)',
          borderRadius: '50% 50% 0 0 / 80% 80% 0 0',
          position: 'relative', zIndex: 4,
          boxShadow: '0 -2px 8px rgba(201,168,76,.2)',
        }}>
          {[5,14,24,34,45,56,66,77,88].map((l, i) => (
            <Sprinkle key={i}
              color={i % 2 === 0 ? '#5a9e6a' : '#fff'}
              left={`${l}%`} top={i % 2 === 0 ? '2px' : '3px'}
              rotate={i % 2 === 0 ? 20 + i * 5 : -(15 + i * 4)}
            />
          ))}
        </div>

        <div style={{
          height: 'clamp(75px, 14vw, 96px)',
          background: 'linear-gradient(165deg, #e8d5a3 0%, #c9a84c 50%, #a07e2e 100%)',
          position: 'relative', overflow: 'hidden', zIndex: 3,
        }}>
          <div style={{ position: 'absolute', top: 0, left: '5%', width: '9%', height: '100%', background: 'rgba(255,255,255,.18)' }} />
          {/* Leaf accents */}
          {['8%','20%','76%','88%'].map((l, i) => (
            <span key={i} style={{ position: 'absolute', fontSize: 'clamp(.7rem, 1.5vw, .95rem)', left: l, top: '12%', opacity: .5 }}>
              {i % 2 === 0 ? '🌿' : '✨'}
            </span>
          ))}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: 'var(--font-head, Georgia, serif)',
              fontSize: 'clamp(1rem, 3.5vw, 1.3rem)',
              color: '#2e3d1a', textShadow: '0 1px 3px rgba(255,255,255,.3)',
              fontWeight: 700,
            }}>
              💚 Diane 💚
            </span>
          </div>
        </div>
        <Drips color="#e8d5a3" count={11} width="100%" />
      </div>

      {/* ── Plate ── */}
      <div style={{
        width: 'clamp(285px, 66vw, 375px)', margin: '0 auto',
        height: 14,
        background: 'linear-gradient(to bottom, #e8f5e9, #c8e6c9)',
        borderRadius: '0 0 50% 50% / 0 0 100% 100%',
        boxShadow: '0 4px 14px rgba(46,94,56,.15)',
        border: '1px solid #a5d6a7',
      }} />

      {/* Plate shadow */}
      <div style={{
        width: 'clamp(260px, 60vw, 350px)', height: 10, margin: '4px auto 0',
        background: 'radial-gradient(ellipse, rgba(46,94,56,.12) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(4px)',
      }} />

      {/* Ambient glow when candles are lit */}
      {progress < 1 && (
        <div style={{
          position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          width: '80%', height: 40,
          background: 'radial-gradient(ellipse, rgba(251,191,36,.18) 0%, transparent 70%)',
          filter: 'blur(12px)', pointerEvents: 'none',
          opacity: 1 - progress,
        }} />
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CakePage() {
  const [blown, setBlown]           = useState(Array(TOTAL_CANDLES).fill(false))
  const [allBlown, setAllBlown]     = useState(false)
  const [phase, setPhase]           = useState('idle')
  const [volumeLevel, setVolumeLevel] = useState(0)
  const blowingRef    = useRef(false)
  const blownRef      = useRef(Array(TOTAL_CANDLES).fill(false))
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
          confetti({ particleCount: 8, angle: 60,  spread: 65, origin: { x: 0   }, colors: ['#5a9e6a','#c9a84c','#8ec49a','#3d7a4a','#e8d5a3'] })
          confetti({ particleCount: 8, angle: 120, spread: 65, origin: { x: 1   }, colors: ['#a8c5a0','#c9a84c','#5a9e6a','#e8d5a3','#3d7a4a'] })
          confetti({ particleCount: 5, angle: 90,  spread: 120, origin: { x: .5, y: .4 }, colors: ['#fff','#f0faf1','#fdfaf4'] })
          if (Date.now() < end) requestAnimationFrame(frame)
        }
        frame()
      }
    }
  }, [blown, allBlown, stop])

  const handleStart = async () => {
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
        background: 'linear-gradient(160deg, var(--g-50, #f2f8f3), var(--matcha-latte, #d4e8c2))',
        padding: 'clamp(32px, 6vw, 56px) 24px clamp(28px, 5vw, 48px)',
        textAlign: 'center',
        borderBottom: '1px solid var(--g-200, #c1e0c8)',
      }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: 'var(--font-head, Georgia, serif)',
            fontSize: 'clamp(1.8rem, 5vw, 3rem)',
            color: 'var(--g-600, #2e5e38)',
            marginBottom: 8,
          }}
        >
          Make a Wish! 🌿
        </motion.h1>
        <p style={{ color: 'var(--g-400, #5a9e6a)', fontSize: 'clamp(.9rem, 2.5vw, 1.05rem)' }}>
          Blow into your microphone to extinguish the candles
        </p>
      </div>

      <div style={{
        maxWidth: 600, margin: '0 auto',
        padding: 'clamp(28px, 5vw, 48px) clamp(16px, 4vw, 24px)',
        textAlign: 'center',
      }}>

        {/* Volume meter */}
        {listening && !allBlown && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ maxWidth: 300, margin: '0 auto 28px' }}
          >
            <p style={{ fontSize: '.85rem', color: 'var(--g-400, #5a9e6a)', marginBottom: 8 }}>
              🎤 Listening… blow gently into your mic!
            </p>
            <div style={{ height: 10, background: 'var(--g-100, #e0f0e3)', borderRadius: 5, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${Math.min(volumeLevel * 700, 100)}%` }}
                transition={{ duration: 0.04 }}
                style={{
                  height: '100%',
                  background: volumeLevel > 0.06
                    ? 'linear-gradient(90deg, #5a9e6a, #3d7a4a)'
                    : 'linear-gradient(90deg, #c9a84c, #a07e2e)',
                  borderRadius: 5, transition: 'background .2s',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: '.75rem', color: 'var(--g-300, #8ec49a)' }}>
                {blownCount} / {TOTAL_CANDLES} candles out 🕯️
              </span>
              <span style={{ fontSize: '.75rem', color: volumeLevel > 0.06 ? '#5a9e6a' : 'var(--g-300, #8ec49a)' }}>
                {volumeLevel > 0.06 ? '💨 Blowing!' : 'Waiting…'}
              </span>
            </div>
          </motion.div>
        )}

        {/* Cake */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 160, damping: 18 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 'clamp(24px, 5vw, 40px)' }}
        >
          <Cake blownCount={blownCount}>
            {Array.from({ length: TOTAL_CANDLES }).map((_, i) => (
              <Candle key={i} blown={blown[i]} index={i} />
            ))}
          </Cake>
        </motion.div>

        {/* Controls */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              color: '#dc2626', marginBottom: 16,
              fontSize: 'clamp(.8rem, 2vw, .9rem)',
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
              onClick={handleStart}
              style={{
                background: 'var(--g-500, #3d7a4a)',
                color: '#fff', border: 'none',
                padding: '14px 32px', borderRadius: 50,
                fontSize: 'clamp(.9rem, 2.5vw, 1.05rem)',
                fontFamily: 'var(--font-body, Inter, sans-serif)',
                fontWeight: 500, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                boxShadow: '0 4px 20px rgba(61,122,74,.3)',
                letterSpacing: .3,
              }}
            >
              🎤 Enable microphone &amp; start
            </button>
            <p style={{ color: 'var(--g-300, #8ec49a)', fontSize: '.82rem', marginTop: 10 }}>
              🔒 Your mic is only used locally — nothing is recorded
            </p>
          </motion.div>
        )}

        {phase === 'listening' && !allBlown && (
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                const next = blownRef.current.findIndex(b => !b)
                if (next !== -1) {
                  blownRef.current[next] = true
                  setBlown(prev => { const n = [...prev]; n[next] = true; return n })
                }
              }}
              style={{
                background: 'transparent', border: '2px solid var(--g-400, #5a9e6a)',
                color: 'var(--g-500, #3d7a4a)', padding: '11px 22px', borderRadius: 50,
                fontSize: 'clamp(.85rem, 2vw, .95rem)', cursor: 'pointer',
                fontFamily: 'var(--font-body, Inter, sans-serif)', fontWeight: 500,
              }}
            >
              👆 Tap to blow one
            </button>
            <button
              onClick={stop}
              style={{
                background: 'rgba(255,255,255,.8)', border: '1.5px solid var(--g-200, #c1e0c8)',
                color: 'var(--g-600, #2e5e38)', padding: '11px 22px', borderRadius: 50,
                fontSize: 'clamp(.85rem, 2vw, .95rem)', cursor: 'pointer',
                fontFamily: 'var(--font-body, Inter, sans-serif)', fontWeight: 500,
              }}
            >
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
                background: 'linear-gradient(135deg, var(--g-50, #f2f8f3), var(--gold-l, #fdf6e3))',
                borderRadius: 24,
                padding: 'clamp(24px, 5vw, 36px) clamp(20px, 4vw, 32px)',
                border: '1.5px solid var(--g-300, #8ec49a)',
                maxWidth: 420, margin: '24px auto 0',
                boxShadow: '0 8px 40px rgba(61,122,74,.2)',
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
                fontFamily: 'var(--font-head, Georgia, serif)',
                fontSize: 'clamp(1.3rem, 4vw, 1.8rem)',
                color: 'var(--g-600, #2e5e38)', marginBottom: 10,
              }}>
                You blew them all out!
              </h2>
              <p style={{
                color: 'var(--g-500, #3d7a4a)',
                fontSize: 'clamp(.88rem, 2.5vw, 1rem)',
                lineHeight: 1.7, marginBottom: 20,
              }}>
                Close your eyes and make a wish, Diane. 💚<br />
                Whatever it is — I hope it comes true.
              </p>
              <button
                onClick={reset}
                style={{
                  background: 'transparent',
                  border: '2px solid var(--g-400, #5a9e6a)',
                  color: 'var(--g-500, #3d7a4a)',
                  padding: '11px 26px', borderRadius: 50,
                  fontSize: 'clamp(.85rem, 2vw, .95rem)', cursor: 'pointer',
                  fontFamily: 'var(--font-body, Inter, sans-serif)', fontWeight: 500,
                }}
              >
                🔄 Light them again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}