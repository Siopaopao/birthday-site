import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getMessages, postMessage } from '../api'
import { useWebSocket } from '../hooks/useWebSocket'
import Toast from '../components/Toast'

const COLORS = ['pink', 'yellow', 'blue', 'green', 'purple', 'coral']
const RELATIONSHIPS = ['Friend', 'Best Friend', 'Family', 'Classmate', 'Colleague', 'Partner', 'Other']

function MessageCard({ msg, isNew }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1,    y: 0  }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={`card-${msg.color}`}
      style={{
        borderRadius: 16,
        padding: '20px 18px',
        boxShadow: isNew ? '0 0 0 3px var(--pink)' : '0 2px 12px rgba(0,0,0,.06)',
        transition: 'box-shadow .4s',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {isNew && (
        <span style={{
          position: 'absolute', top: 10, right: 10,
          background: 'var(--pink-d)', color: '#fff',
          fontSize: '.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20,
        }}>NEW ✨</span>
      )}
      {msg.photo_url && (
        <img
          src={msg.photo_url} alt=""
          style={{ width: '100%', borderRadius: 10, marginBottom: 12, objectFit: 'cover', maxHeight: 180 }}
        />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--pink-d), var(--purple))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: '1rem', flexShrink: 0,
        }}>
          {msg.sender_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p style={{ fontWeight: 600, fontSize: '.95rem', color: '#1a1a2e' }}>{msg.sender_name}</p>
          <p style={{ fontSize: '.78rem', color: '#888' }}>{msg.relationship}</p>
        </div>
        <span style={{ marginLeft: 'auto', fontSize: '1.1rem' }}>💕</span>
      </div>
      <p style={{ fontSize: '.93rem', color: '#333', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
        {msg.message}
      </p>
      <p style={{ fontSize: '.75rem', color: '#bbb', marginTop: 10 }}>
        {new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>
    </motion.div>
  )
}

function PostForm({ onSubmitted }) {
  const [form, setForm] = useState({ sender_name: '', relationship: 'Friend', message: '', color: 'pink' })
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

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
      setForm({ sender_name: '', relationship: 'Friend', message: '', color: 'pink' })
      setPhoto(null)
      onSubmitted()
    } catch (err) {
      onSubmitted(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.form
      onSubmit={handle}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#fff', borderRadius: 20, padding: '28px 24px',
        boxShadow: '0 4px 24px rgba(244,114,182,.15)',
        border: '1.5px solid var(--pink-l)',
        maxWidth: 540, margin: '0 auto 56px',
      }}
    >
      <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', marginBottom: 20, textAlign: 'center' }}>
        Leave a wish 💌
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div className="form-group">
          <label className="form-label">Your name *</label>
          <input
            className="input"
            value={form.sender_name}
            onChange={e => setForm(f => ({ ...f, sender_name: e.target.value }))}
            placeholder="e.g. Sarah"
          />
          {errors.sender_name && <span style={{ color: '#dc2626', fontSize: '.8rem' }}>{errors.sender_name}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Relationship</label>
          <select
            className="input"
            value={form.relationship}
            onChange={e => setForm(f => ({ ...f, relationship: e.target.value }))}
            style={{ cursor: 'pointer' }}
          >
            {RELATIONSHIPS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

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
            : <span />
          }
          <span style={{ fontSize: '.78rem', color: '#bbb' }}>{form.message.length}/1000</span>
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
                width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: c === 'pink'   ? 'var(--pink)'   :
                            c === 'yellow' ? 'var(--yellow)' :
                            c === 'blue'   ? 'var(--blue)'   :
                            c === 'green'  ? 'var(--green)'  :
                            c === 'purple' ? 'var(--purple)' : 'var(--coral)',
                outline: form.color === c ? '3px solid #1a1a2e' : 'none',
                outlineOffset: 2,
                transition: 'transform .15s',
                transform: form.color === c ? 'scale(1.2)' : 'scale(1)',
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
          style={{ fontSize: '.88rem', color: '#555' }}
        />
        {photo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <img src={URL.createObjectURL(photo)} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8 }} />
            <button type="button" onClick={() => setPhoto(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '1.1rem' }}>✕</button>
          </div>
        )}
      </div>

      <button type="submit" className="btn btn-pink" disabled={loading} style={{ width: '100%', justifyContent: 'center', fontSize: '1rem' }}>
        {loading ? '💌 Sending…' : '💌 Post your wish'}
      </button>
      <p style={{ textAlign: 'center', fontSize: '.8rem', color: '#aaa', marginTop: 10 }}>
        Messages appear after a quick review ✨
      </p>
    </motion.form>
  )
}

// Simple 3-column masonry
function Masonry({ items, newIds }) {
  // deduplicate by id before rendering
  const seen = new Set()
  const unique = items.filter(m => {
    if (seen.has(m.id)) return false
    seen.add(m.id)
    return true
  })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
      <AnimatePresence>
        {unique.map(msg => (
          <MessageCard key={msg.id} msg={msg} isNew={newIds.has(msg.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

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
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  // WebSocket: prepend newly approved messages
  const handleWsMessage = useCallback((event) => {
    if (event.type === 'new_message') {
      const msg = event.data
      setMessages(prev => {
        // prevent duplicate if message already exists
        if (prev.some(m => m.id === msg.id)) return prev
        return [msg, ...prev]
      })
      setNewIds(prev => new Set([...prev, msg.id]))
      setTimeout(() => setNewIds(prev => { const s = new Set(prev); s.delete(msg.id); return s }), 5000)
    }
  }, [])

  useWebSocket(handleWsMessage)

  const handleSubmitted = (err) => {
    if (err) {
      setToast({ msg: err, type: 'error' })
    } else {
      setToast({ msg: 'Wish sent! It will appear after review 💌', type: 'success' })
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

      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, #fdf2f8, #ede9fe)',
        padding: '56px 24px 48px',
        textAlign: 'center',
      }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="section-title" style={{ marginBottom: 8 }}
        >
          Message Wall 💌
        </motion.h1>
        <p style={{ color: '#888', fontSize: '1.05rem' }}>
          {messages.length} {messages.length === 1 ? 'person has' : 'people have'} written to you
        </p>
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

        {/* Messages */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 180 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>💌</div>
            <p>{search ? 'No messages match your search' : 'Be the first to leave a wish!'}</p>
          </div>
        ) : (
          <Masonry items={filtered} newIds={newIds} />
        )}
      </div>
    </div>
  )
}
