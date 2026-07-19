import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getTimeline } from '../api'

const TAG_COLORS = {
  milestone: { bg: '#fdf2f8', border: 'var(--pink)',   icon: '⭐' },
  us:        { bg: '#eff6ff', border: 'var(--blue)',   icon: '💑' },
  travel:    { bg: '#ecfdf5', border: 'var(--green)',  icon: '✈️' },
  family:    { bg: '#f5f3ff', border: 'var(--purple)', icon: '👨‍👩‍👧' },
}

function TimelineCard({ event, index }) {
  const [expanded, setExpanded] = useState(false)
  const isLeft = index % 2 === 0
  const style  = TAG_COLORS[event.tag] || TAG_COLORS.milestone

  return (
    <div style={{
      display: 'flex',
      justifyContent: isLeft ? 'flex-start' : 'flex-end',
      marginBottom: 48,
      position: 'relative',
    }}>
      {/* Dot on the centre line */}
      <div style={{
        position: 'absolute',
        left: '50%', top: 28,
        transform: 'translateX(-50%)',
        width: 18, height: 18,
        borderRadius: '50%',
        background: style.border,
        border: '3px solid #fff',
        boxShadow: `0 0 0 3px ${style.border}44`,
        zIndex: 2,
      }} />

      <motion.div
        initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        style={{ width: 'calc(50% - 36px)' }}
      >
        <div
          onClick={() => setExpanded(e => !e)}
          style={{
            background: style.bg,
            border: `2px solid ${style.border}`,
            borderRadius: 18,
            padding: '20px 22px',
            cursor: 'pointer',
            boxShadow: expanded
              ? `0 8px 32px ${style.border}33`
              : '0 2px 12px rgba(0,0,0,.06)',
            transition: 'box-shadow .25s',
          }}
        >
          {/* Tag + date */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{
              fontSize: '.75rem', fontWeight: 600, textTransform: 'uppercase',
              color: style.border, letterSpacing: 1,
            }}>
              {style.icon} {event.tag}
            </span>
            <span style={{ fontSize: '.8rem', color: '#aaa' }}>
              {new Date(event.event_date).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
              })}
            </span>
          </div>

          <h3 style={{
            fontFamily: 'var(--font-head)',
            fontSize: '1.2rem',
            color: '#1a1a2e',
            marginBottom: expanded ? 12 : 0,
          }}>
            {event.title}
          </h3>

          {/* Photo */}
          {expanded && event.photo_url && (
            <motion.img
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              src={event.photo_url} alt={event.title}
              style={{ width: '100%', borderRadius: 10, marginBottom: 12, objectFit: 'cover', maxHeight: 220 }}
            />
          )}

          {/* Description */}
          {expanded && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              style={{ fontSize: '.92rem', color: '#555', lineHeight: 1.7 }}
            >
              {event.description}
            </motion.p>
          )}

          <p style={{ fontSize: '.8rem', color: '#bbb', marginTop: 10, textAlign: 'right' }}>
            {expanded ? 'Click to collapse ↑' : 'Click to read more ↓'}
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default function TimelinePage() {
  const [events, setEvents]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTimeline()
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ paddingTop: 80 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #ede9fe, #fdf2f8)',
        padding: '56px 24px 48px', textAlign: 'center',
      }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="section-title" style={{ marginBottom: 8 }}
        >
          Our Story 📖
        </motion.h1>
        <p style={{ color: '#888', fontSize: '1.05rem' }}>
          Every moment that led us here — click each card to read more
        </p>

        {/* Tag legend */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
          {Object.entries(TAG_COLORS).map(([tag, s]) => (
            <span key={tag} style={{
              background: s.bg, border: `1.5px solid ${s.border}`,
              borderRadius: 20, padding: '4px 14px', fontSize: '.82rem',
              color: s.border, fontWeight: 600,
            }}>
              {s.icon} {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="section" style={{ paddingTop: 56, position: 'relative' }}>
        {/* Centre line */}
        {!loading && events.length > 0 && (
          <div style={{
            position: 'absolute',
            left: '50%', top: 56, bottom: 40,
            width: 2,
            background: 'linear-gradient(to bottom, var(--pink), var(--purple))',
            transform: 'translateX(-50%)',
            borderRadius: 1,
          }} />
        )}

        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end', marginBottom: 48 }}>
                <div className="skeleton" style={{ width: 'calc(50% - 36px)', height: 100, borderRadius: 18 }} />
              </div>
            ))
          : events.length === 0
            ? <p style={{ textAlign: 'center', color: '#aaa', padding: '60px 0' }}>No events yet 🌸</p>
            : events.map((ev, i) => <TimelineCard key={ev.id} event={ev} index={i} />)
        }
      </div>
    </div>
  )
}
