import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sendPrivateMessage, unlockPrivateMessages } from '../api'
import Toast from '../components/Toast'

// ── Send form ─────────────────────────────────────────────────────────────────
function SendForm({ onSent }) {
  const [form, setForm]   = useState({ sender_name: '', message: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [done, setDone]   = useState(false)

  const validate = () => {
    const e = {}
    if (!form.sender_name.trim()) e.sender_name = 'Name is required'
    if (!form.message.trim())     e.message     = 'Message is required'
    if (form.message.length > 2000) e.message   = 'Max 2000 characters'
    return e
  }

  const handle = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setLoading(true)
    try {
      await sendPrivateMessage(form.sender_name, form.message)
      setDone(true)
      onSent()
    } catch (err) {
      onSent(err.response?.data?.detail || 'Failed to send')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        style={{
          background: 'linear-gradient(135deg, #fdf2f8, #ede9fe)',
          borderRadius: 20, padding: '36px 28px', textAlign: 'center',
          border: '1.5px solid var(--pink-l)',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>💌</div>
        <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', marginBottom: 8 }}>
          Message sent!
        </h3>
        <p style={{ color: '#888', fontSize: '.93rem' }}>
          Your private message is safely stored. Only Diane can read it with her special passcode. 🔒
        </p>
        <button
          onClick={() => { setDone(false); setForm({ sender_name: '', message: '' }) }}
          className="btn btn-outline"
          style={{ marginTop: 20 }}
        >
          Write another 💕
        </button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handle} style={{
      background: '#fff', borderRadius: 20, padding: '28px 24px',
      boxShadow: '0 4px 24px rgba(244,114,182,.12)',
      border: '1.5px solid var(--pink-l)',
    }}>
      <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', marginBottom: 6, textAlign: 'center' }}>
        Write a private note 💌
      </h3>
      <p style={{ textAlign: 'center', color: '#888', fontSize: '.88rem', marginBottom: 22 }}>
        Only Diane can read this — it's locked with her secret passcode
      </p>

      <div className="form-group" style={{ marginBottom: 14 }}>
        <label className="form-label">Your name</label>
        <input
          className="input"
          value={form.sender_name}
          onChange={e => setForm(f => ({ ...f, sender_name: e.target.value }))}
          placeholder="e.g. Sarah"
        />
        {errors.sender_name && <span style={{ color: '#dc2626', fontSize: '.8rem' }}>{errors.sender_name}</span>}
      </div>

      <div className="form-group" style={{ marginBottom: 22 }}>
        <label className="form-label">Your message</label>
        <textarea
          className="textarea"
          rows={6}
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          placeholder="Write something only she should see… 🤫"
        />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {errors.message
            ? <span style={{ color: '#dc2626', fontSize: '.8rem' }}>{errors.message}</span>
            : <span />}
          <span style={{ fontSize: '.78rem', color: '#bbb' }}>{form.message.length}/2000</span>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn btn-pink" style={{ width: '100%', justifyContent: 'center' }}>
        {loading ? '🔒 Sending…' : '🔒 Send privately'}
      </button>
    </form>
  )
}

// ── Unlock / inbox ────────────────────────────────────────────────────────────
function Inbox() {
  const [passcode, setPasscode]     = useState('')
  const [messages, setMessages]     = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [showPass, setShowPass]     = useState(false)

  const unlock = async (ev) => {
    ev.preventDefault()
    if (!passcode.trim()) { setError('Enter the passcode'); return }
    setError('')
    setLoading(true)
    try {
      const data = await unlockPrivateMessages(passcode)
      setMessages(data)
    } catch (err) {
      setError(err.response?.status === 401 ? 'Wrong passcode 💔 Try again' : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (messages !== null) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 24,
        }}>
          <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem' }}>
            Your private messages 💌
          </h3>
          <span style={{
            background: 'var(--pink-l)', color: 'var(--pink-d)',
            borderRadius: 20, padding: '3px 14px', fontWeight: 600, fontSize: '.85rem',
          }}>
            {messages.length} {messages.length === 1 ? 'note' : 'notes'}
          </span>
        </div>

        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
            <p>No private messages yet — but they are on the way! 💕</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{
                  background: 'linear-gradient(135deg, #fdf2f8, #fff)',
                  borderRadius: 16, padding: '20px 22px',
                  border: '1.5px solid var(--pink-l)',
                  boxShadow: '0 2px 12px rgba(244,114,182,.1)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--pink-d), var(--purple))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: '.95rem',
                    }}>
                      {msg.sender_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '.95rem' }}>{msg.sender_name}</p>
                      <p style={{ fontSize: '.75rem', color: '#aaa' }}>
                        {new Date(msg.created_at).toLocaleDateString('en-US', {
                          month: 'long', day: 'numeric', year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  {!msg.viewed && (
                    <span style={{
                      background: 'var(--pink-d)', color: '#fff',
                      fontSize: '.7rem', fontWeight: 700,
                      padding: '2px 8px', borderRadius: 20,
                    }}>NEW</span>
                  )}
                </div>
                <p style={{
                  fontSize: '.93rem', color: '#333', lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                  fontFamily: "'Georgia', serif",
                  fontStyle: 'italic',
                }}>
                  "{msg.message}"
                </p>
              </motion.div>
            ))}
          </div>
        )}

        <button
          onClick={() => { setMessages(null); setPasscode('') }}
          className="btn btn-ghost"
          style={{ marginTop: 24 }}
        >
          🔒 Lock again
        </button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={unlock} style={{
      background: '#fff', borderRadius: 20, padding: '28px 24px',
      boxShadow: '0 4px 24px rgba(244,114,182,.12)',
      border: '1.5px solid var(--pink-l)',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 22 }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🔐</div>
        <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', marginBottom: 6 }}>
          This is for Diane only
        </h3>
        <p style={{ color: '#888', fontSize: '.88rem' }}>
          Enter your secret passcode to read your private messages
        </p>
      </div>

      <div className="form-group" style={{ marginBottom: 18 }}>
        <label className="form-label">Secret passcode</label>
        <div style={{ position: 'relative' }}>
          <input
            className="input"
            type={showPass ? 'text' : 'password'}
            value={passcode}
            onChange={e => setPasscode(e.target.value)}
            placeholder="Enter your passcode…"
            style={{ paddingRight: 48 }}
          />
          <button
            type="button"
            onClick={() => setShowPass(s => !s)}
            style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem',
            }}
          >
            {showPass ? '🙈' : '👁️'}
          </button>
        </div>
        {error && <span style={{ color: '#dc2626', fontSize: '.82rem' }}>{error}</span>}
      </div>

      <button type="submit" disabled={loading} className="btn btn-pink" style={{ width: '100%', justifyContent: 'center' }}>
        {loading ? '🔓 Unlocking…' : '🔓 Unlock my messages'}
      </button>
    </form>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PrivatePage() {
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState('send')   // send | read

  return (
    <div style={{ paddingTop: 80 }}>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #fdf2f8, #fff0f3)',
        padding: '56px 24px 48px', textAlign: 'center',
      }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="section-title" style={{ marginBottom: 8 }}
        >
          Private Notes 🔒
        </motion.h1>
        <p style={{ color: '#888', fontSize: '1.05rem' }}>
          Leave a heartfelt message — only Diane can read it
        </p>
      </div>

      <div className="section" style={{ paddingTop: 40, maxWidth: 680 }}>
        {/* Tab switcher */}
        <div style={{
          display: 'flex', background: '#f3f4f6', borderRadius: 14,
          padding: 4, marginBottom: 32, maxWidth: 400, margin: '0 auto 32px',
        }}>
          {[
            { id: 'send', label: '💌 Write a note' },
            { id: 'read', label: '🔐 Read mine (Diane)' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none',
                cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500,
                fontSize: '.88rem', transition: 'all .2s',
                background: activeTab === tab.id ? '#fff' : 'transparent',
                color: activeTab === tab.id ? 'var(--pink-d)' : '#888',
                boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0,0,0,.08)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'send' ? (
            <motion.div
              key="send"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            >
              <SendForm
                onSent={(err) => {
                  if (err) setToast({ msg: err, type: 'error' })
                  else     setToast({ msg: 'Private message sent! 💌', type: 'success' })
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="read"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            >
              <Inbox />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
