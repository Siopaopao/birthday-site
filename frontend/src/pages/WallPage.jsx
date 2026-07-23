import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getMessages, postMessage } from '../api'
import { useWebSocket } from '../hooks/useWebSocket'
import Toast from '../components/Toast'

const COLORS = ['pink', 'yellow', 'blue', 'green', 'purple', 'coral']

// ── Pinterest-style masonry using CSS columns ──────────────────────────────
function PinterestGrid({ items, newIds }) {
  const seen = new Set()
  const unique = items.filter(m => {
    if (seen.has(m.id)) return false
    seen.add(m.id)
    return true
  })

  return (
    <div style={{
      columnCount: 3,
      columnGap: 16,
      columnFill: 'balance',
    }}>
      <style>{`
        @media (max-width: 900px) { .pinterest-grid { column-count: 2 !important; } }
        @media (max-width: 560px) { .pinterest-grid { column-count: 1 !important; } }
      `}</style>
      <div className="pinterest-grid" style={{ columnCount: 3, columnGap: 16 }}>
        <AnimatePresence>
          {unique.map((msg, i) => (
            <MessageCard key={msg.id} msg={msg} isNew={newIds.has(msg.id)} index={i} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Single message card ────────────────────────────────────────────────────
function MessageCard({ msg, isNew, index }) {
  const [expanded, setExpanded] = useState(false)
  const PREVIEW_LEN = 180

  const isLong = msg.message.length > PREVIEW_LEN
  const displayText = isLong && !expanded
    ? msg.message.slice(0, PREVIEW_LEN) + '…'
    : msg.message

  const colorMap = {
    pink:   { bg: 'var(--blush-l)',  border: 'var(--blush)',  avatar: 'linear-gradient(135deg, #e8b4b8, #c9a84c)' },
    yellow: { bg: 'var(--gold-l)',   border: 'var(--gold)',   avatar: 'linear-gradient(135deg, #c9a84c, #8ec49a)' },
    blue:   { bg: 'var(--blue-l)',   border: 'var(--blue)',   avatar: 'linear-gradient(135deg, #7eb8b0, #9b8fbf)' },
    green:  { bg: 'var(--g-50)',     border: 'var(--g-400)',  avatar: 'linear-gradient(135deg, #5a9e6a, #3d7a4a)' },
    purple: { bg: 'var(--purple-l)', border: 'var(--purple)', avatar: 'linear-gradient(135deg, #9b8fbf, #7eb8b0)' },
    coral:  { bg: 'var(--coral-l)',  border: 'var(--coral)',  avatar: 'linear-gradient(135deg, #d4856a, #c9a84c)' },
  }
  const c = colorMap[msg.color] || colorMap.green

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.35, delay: (index % 6) * 0.05 }}
      style={{
        breakInside: 'avoid',
        marginBottom: 16,
        display: 'inline-block',
        width: '100%',
        background: c.bg,
        borderRadius: 18,
        padding: '18px 16px',
        border: `1.5px solid ${c.border}`,
        boxShadow: isNew
          ? `0 0 0 3px ${c.border}, 0 4px 20px rgba(0,0,0,.08)`
          : '0 2px 12px rgba(30,61,37,.07)',
        transition: 'box-shadow .3s, transform .2s',
        cursor: isLong ? 'pointer' : 'default',
        position: 'relative',
      }}
      whileHover={{ boxShadow: `0 6px 24px rgba(30,61,37,.12)`, translateY: -2 }}
      onClick={() => isLong && setExpanded(e => !e)}
    >
      {/* NEW badge */}
      {isNew && (
        <span style={{
          position: 'absolute', top: 12, right: 12,
          background: 'var(--g-500)', color: '#fff',
          fontSize: '.68rem', fontWeight: 700,
          padding: '3px 9px', borderRadius: 20,
          letterSpacing: 0.5,
        }}>NEW ✨</span>
      )}

      {/* Photo */}
      {msg.photo_url && (
        <img
          src={msg.photo_url} alt=""
          style={{
            width: '100%', borderRadius: 12,
            marginBottom: 12, objectFit: 'cover',
            maxHeight: 200, display: 'block',
          }}
        />
      )}

      {/* Avatar + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: c.avatar,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: '.95rem', flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,.1)',
        }}>
          {msg.sender_name.charAt(0).toUpperCase()}
        </div>
        <p style={{ fontWeight: 600, fontSize: '.92rem', color: 'var(--g-700)' }}>
          {msg.sender_name}
        </p>
        <span style={{ marginLeft: 'auto', fontSize: '1rem', opacity: 0.7 }}>💚</span>
      </div>

      {/* Message */}
      <p style={{
        fontSize: '.9rem', color: 'var(--g-600)',
        lineHeight: 1.65, whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {displayText}
      </p>

      {/* Read more / less */}
      {isLong && (
        <button
          onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--g-500)', fontSize: '.82rem', fontWeight: 600,
            marginTop: 6, padding: 0,
          }}
        >
          {expanded ? '↑ Show less' : '↓ Read more'}
        </button>
      )}

      {/* Date */}
      <p style={{ fontSize: '.72rem', color: 'var(--g-300)', marginTop: 10 }}>
        {new Date(msg.created_at).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
        })}
      </p>
    </motion.div>
  )
}

// ── Post form ──────────────────────────────────────────────────────────────
function PostForm({ onSubmitted }) {
  const [form, setForm]   = useState({ sender_name: '', relationship: 'Friend', message: '', color: 'green' })
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})
  const [open, setOpen]       = useState(false)

  const validate = () => {
    const e = {}
    if (!form.sender_name.trim()) e.sender_name = 'Name is required'
    if (!form.message.trim())     e.message     = 'Message is required'
    if (form.message.length > 1000) e.message   = 'Max 1000 characters'
    return e
  }

  const handle = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('sender_name',  form.sender_name)
      fd.append('relationship', form.relationship)
      fd.append('message',      form.message)
      fd.append('color',        form.color)
      if (photo) fd.append('photo', photo)
      await postMessage(fd)
      setForm({ sender_name: '', relationship: 'Friend', message: '', color: 'green' })
      setPhoto(null)
      setOpen(false)
      onSubmitted()
    } catch (err) {
      onSubmitted(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto 48px' }}>
      {/* Toggle button */}
      {!open ? (
        <motion.button
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          onClick={() => setOpen(true)}
          className="btn btn-pink"
          style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '14px' }}
        >
          💌 Write a message for Diane
        </motion.button>
      ) : (
        <motion.form
          onSubmit={handle}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#fff', borderRadius: 20, padding: '28px 24px',
            boxShadow: '0 4px 32px rgba(61,122,74,.12)',
            border: '1.5px solid var(--g-200)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.3rem', color: 'var(--g-600)' }}>
              Leave a message 💚
            </h3>
            <button
              type="button" onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--g-300)' }}
            >✕</button>
          </div>

          {/* Name */}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Your name *</label>
            <input
              className="input"
              value={form.sender_name}
              onChange={e => setForm(f => ({ ...f, sender_name: e.target.value }))}
              placeholder="e.g. Sarah"
            />
            {errors.sender_name && <span style={{ color: '#dc2626', fontSize: '.8rem' }}>{errors.sender_name}</span>}
          </div>

          {/* Message */}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Your message *</label>
            <textarea
              className="textarea"
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Write something from the heart…"
              rows={4}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {errors.message
                ? <span style={{ color: '#dc2626', fontSize: '.8rem' }}>{errors.message}</span>
                : <span />}
              <span style={{ fontSize: '.78rem', color: 'var(--g-300)' }}>{form.message.length}/1000</span>
            </div>
          </div>

          {/* Color picker */}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Card color</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {COLORS.map(c => (
                <button
                  key={c} type="button"
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  style={{
                    width: 30, height: 30, borderRadius: '50%', border: 'none', cursor: 'pointer',
                    background:
                      c === 'pink'   ? 'var(--blush)'  :
                      c === 'yellow' ? 'var(--gold)'   :
                      c === 'blue'   ? 'var(--blue)'   :
                      c === 'green'  ? 'var(--g-400)'  :
                      c === 'purple' ? 'var(--purple)' : 'var(--coral)',
                    outline: form.color === c ? '3px solid var(--g-600)' : 'none',
                    outlineOffset: 2,
                    transform: form.color === c ? 'scale(1.25)' : 'scale(1)',
                    transition: 'transform .15s',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Photo */}
          <div className="form-group" style={{ marginBottom: 22 }}>
            <label className="form-label">Attach a photo (optional)</label>
            <input
              type="file" accept="image/*"
              onChange={e => setPhoto(e.target.files[0] || null)}
              style={{ fontSize: '.88rem', color: 'var(--g-500)' }}
            />
            {photo && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <img
                  src={URL.createObjectURL(photo)} alt=""
                  style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 10 }}
                />
                <button
                  type="button" onClick={() => setPhoto(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '1.1rem' }}
                >✕</button>
              </div>
            )}
          </div>

          <button
            type="submit" className="btn btn-pink" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', fontSize: '1rem' }}
          >
            {loading ? '💚 Sending…' : '💚 Post message'}
          </button>
          <p style={{ textAlign: 'center', fontSize: '.78rem', color: 'var(--g-300)', marginTop: 10 }}>
            Messages appear after a quick review ✨
          </p>
        </motion.form>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function WallPage() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(true)
  const [newIds, setNewIds]     = useState(new Set())
  const [toast, setToast]       = useState(null)
  const [search, setSearch]     = useState('')

  const load = async () => {
    try {
      const data = await getMessages()
      setMessages(data)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleWsMessage = useCallback((event) => {
    if (event.type === 'new_message') {
      const msg = event.data
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev
        return [msg, ...prev]
      })
      setNewIds(prev => new Set([...prev, msg.id]))
      setTimeout(() => setNewIds(prev => {
        const s = new Set(prev)
        s.delete(msg.id)
        return s
      }), 5000)
    }
    if (event.type === 'delete_message') {
      setMessages(prev => prev.filter(m => m.id !== event.id))
    }
  }, [])

  useWebSocket(handleWsMessage)

  const handleSubmitted = (err) => {
    if (err) {
      setToast({ msg: err, type: 'error' })
    } else {
      setToast({ msg: 'Message sent! It will appear after review 💚', type: 'success' })
    }
  }

  const filtered = search
    ? messages.filter(m =>
        m.sender_name.toLowerCase().includes(search.toLowerCase()) ||
        m.message.toLowerCase().includes(search.toLowerCase()))
    : messages

  return (
    <div style={{ paddingTop: 80 }}>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--g-50), var(--g-100))',
        padding: 'clamp(40px, 6vw, 64px) 24px clamp(32px, 5vw, 48px)',
        textAlign: 'center',
        borderBottom: '1px solid var(--g-200)',
      }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: 'var(--font-head)',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            color: 'var(--g-600)',
            marginBottom: 8,
          }}
        >
          Wall of Messages 💚
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ color: 'var(--g-400)', fontSize: '1.05rem' }}
        >
          {messages.length === 0
            ? 'Be the first to write something for Diane'
            : `${messages.length} ${messages.length === 1 ? 'person has' : 'people have'} written to you`}
        </motion.p>
      </div>

      <div className="section" style={{ paddingTop: 40 }}>
        {/* Post form */}
        <PostForm onSubmitted={handleSubmitted} />

        {/* Search */}
        <div style={{ maxWidth: 400, margin: '0 auto 32px' }}>
          <input
            className="input"
            placeholder="🔍 Search messages…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Messages — Pinterest layout */}
        {loading ? (
          <div style={{ columns: 3, columnGap: 16 }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{
                  height: [160, 220, 140, 200, 180, 240, 150, 190, 170][i],
                  borderRadius: 18,
                  marginBottom: 16,
                  display: 'inline-block',
                  width: '100%',
                }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--g-300)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>💚</div>
            <p style={{ fontSize: '1rem' }}>
              {search ? 'No messages match your search' : 'No messages yet — be the first!'}
            </p>
          </div>
        ) : (
          <div
            className="pinterest-grid"
            style={{ columns: 3, columnGap: 16 }}
          >
            <style>{`
              @media (max-width: 900px) { .pinterest-grid { columns: 2 !important; } }
              @media (max-width: 560px) { .pinterest-grid { columns: 1 !important; } }
            `}</style>
            <AnimatePresence>
              {filtered.map((msg, i) => (
                <MessageCard key={msg.id} msg={msg} isNew={newIds.has(msg.id)} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}