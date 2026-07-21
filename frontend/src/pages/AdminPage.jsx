import { useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

const api = (password) => axios.create({
  baseURL: API,
  headers: { 'x-admin-password': password },
})

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed]     = useState(false)
  const [messages, setMessages] = useState([])
  const [photos, setPhotos]     = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [tab, setTab]           = useState('messages')

  const login = async (ev) => {
    ev.preventDefault()
    setLoading(true)
    try {
      const res = await api(password).get('/admin/messages')
      setMessages(res.data)
      setAuthed(true)
      setError('')
      loadPhotos(password)
    } catch {
      setError('Wrong admin password')
    } finally {
      setLoading(false)
    }
  }

  const loadPhotos = async (pw) => {
    try {
      const res = await axios.get(`${API}/gallery/admin/all`, {
        headers: { 'x-admin-password': pw || password },
      })
      setPhotos(res.data)
    } catch {}
  }

  const reloadMessages = async () => {
    try {
      const res = await api(password).get('/admin/messages')
      setMessages(res.data)
    } catch {}
  }

  // Approve — broadcasts new message to wall live
  const approve = async (id) => {
    try {
      await api(password).patch(`/admin/messages/${id}/approve-and-broadcast`)
      setMessages(prev => prev.map(m => m.id === id ? { ...m, approved: true } : m))
    } catch {}
  }

  // Delete — broadcasts removal to wall live (no refresh needed)
  const reject = async (id) => {
    if (!window.confirm('Delete this message permanently?')) return
    try {
      await api(password).patch(`/admin/messages/${id}/reject-and-broadcast`)
      setMessages(prev => prev.filter(m => m.id !== id))
    } catch {}
  }

  const approvePhoto = async (id) => {
    try {
      await axios.patch(`${API}/gallery/admin/${id}/approve`, {}, {
        headers: { 'x-admin-password': password },
      })
      setPhotos(prev => prev.map(p => p.id === id ? { ...p, approved: true } : p))
    } catch {}
  }

  const deletePhoto = async (id) => {
    if (!window.confirm('Delete this photo permanently?')) return
    try {
      await axios.delete(`${API}/gallery/admin/${id}`, {
        headers: { 'x-admin-password': password },
      })
      setPhotos(prev => prev.filter(p => p.id !== id))
    } catch {}
  }

  const msgPending  = messages.filter(m => !m.approved).length
  const msgApproved = messages.filter(m => m.approved).length
  const phoPending  = photos.filter(p => !p.approved).length
  const phoApproved = photos.filter(p => p.approved).length

  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#f9fafb', paddingTop: 80,
      }}>
        <form onSubmit={login} style={{
          background: '#fff', borderRadius: 20, padding: '36px 32px',
          boxShadow: '0 4px 24px rgba(0,0,0,.1)', width: '100%', maxWidth: 380,
        }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.6rem', marginBottom: 6, textAlign: 'center' }}>
            🔑 Admin Login
          </h2>
          <p style={{ color: '#888', fontSize: '.88rem', textAlign: 'center', marginBottom: 22 }}>
            Manage messages and photos
          </p>
          <div className="form-group" style={{ marginBottom: 18 }}>
            <label className="form-label">Admin password</label>
            <input
              className="input" type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter admin password"
            />
            {error && <span style={{ color: '#dc2626', fontSize: '.82rem' }}>{error}</span>}
          </div>
          <button type="submit" disabled={loading} className="btn btn-pink"
            style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Checking…' : 'Login'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '2rem' }}>Admin Panel</h1>
            <p style={{ color: '#888', fontSize: '.9rem' }}>
              {msgPending} messages pending · {phoPending} photos pending
            </p>
          </div>
          <button onClick={() => { reloadMessages(); loadPhotos() }} className="btn btn-ghost">
            🔄 Refresh
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex', background: '#f3f4f6', borderRadius: 14,
          padding: 4, marginBottom: 28, maxWidth: 420,
        }}>
          {[
            { id: 'messages', label: `💌 Messages (${messages.length})` },
            { id: 'gallery',  label: `📸 Gallery (${photos.length})` },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none',
                cursor: 'pointer', fontWeight: 500, fontSize: '.88rem',
                fontFamily: 'var(--font-body)', transition: 'all .2s',
                background: tab === t.id ? '#fff' : 'transparent',
                color: tab === t.id ? 'var(--pink-d)' : '#888',
                boxShadow: tab === t.id ? '0 2px 8px rgba(0,0,0,.08)' : 'none',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Messages tab ── */}
        {tab === 'messages' && (
          <>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <span style={{ padding: '8px 18px', borderRadius: 20, background: '#fef3c7', color: '#92400e', fontSize: '.88rem', fontWeight: 500 }}>
                ⏳ Pending: {msgPending}
              </span>
              <span style={{ padding: '8px 18px', borderRadius: 20, background: '#d1fae5', color: '#065f46', fontSize: '.88rem', fontWeight: 500 }}>
                ✅ Approved: {msgApproved}
              </span>
            </div>

            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
                <p>No messages yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {messages.map(msg => (
                  <motion.div
                    key={msg.id} layout
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: '#fff', borderRadius: 16, padding: '18px 20px',
                      border: `1.5px solid ${msg.approved ? '#d1fae5' : '#fde68a'}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,.05)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: '.95rem' }}>{msg.sender_name}</span>
                          <span style={{
                            borderRadius: 20, padding: '2px 10px', fontSize: '.75rem', fontWeight: 600,
                            background: msg.approved ? '#d1fae5' : '#fef3c7',
                            color: msg.approved ? '#065f46' : '#92400e',
                          }}>
                            {msg.approved ? '✅ Approved' : '⏳ Pending'}
                          </span>
                        </div>
                        <p style={{ fontSize: '.92rem', color: '#333', lineHeight: 1.6 }}>{msg.message}</p>
                        <p style={{ fontSize: '.75rem', color: '#aaa', marginTop: 6 }}>
                          {new Date(msg.created_at).toLocaleString()}
                        </p>
                      </div>
                      {/* Approve only for pending, Delete always shown */}
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        {!msg.approved && (
                          <button
                            onClick={() => approve(msg.id)}
                            style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: '#059669', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '.88rem' }}
                          >✅ Approve</button>
                        )}
                        <button
                          onClick={() => reject(msg.id)}
                          style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '.88rem' }}
                        >🗑 Delete</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Gallery tab ── */}
        {tab === 'gallery' && (
          <>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <span style={{ padding: '8px 18px', borderRadius: 20, background: '#fef3c7', color: '#92400e', fontSize: '.88rem', fontWeight: 500 }}>
                ⏳ Pending: {phoPending}
              </span>
              <span style={{ padding: '8px 18px', borderRadius: 20, background: '#d1fae5', color: '#065f46', fontSize: '.88rem', fontWeight: 500 }}>
                ✅ Approved: {phoApproved}
              </span>
            </div>

            {photos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📷</div>
                <p>No photos submitted yet</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 16,
              }}>
                {photos.map(photo => (
                  <motion.div
                    key={photo.id} layout
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    style={{
                      background: '#fff', borderRadius: 16, overflow: 'hidden',
                      border: `1.5px solid ${photo.approved ? '#d1fae5' : '#fde68a'}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,.06)',
                    }}
                  >
                    <img
                      src={`${API}${photo.photo_url}`}
                      alt=""
                      style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
                    />
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: '.9rem' }}>{photo.sender_name}</span>
                        <span style={{
                          borderRadius: 20, padding: '2px 8px', fontSize: '.72rem', fontWeight: 600,
                          background: photo.approved ? '#d1fae5' : '#fef3c7',
                          color: photo.approved ? '#065f46' : '#92400e',
                        }}>
                          {photo.approved ? '✅ Approved' : '⏳ Pending'}
                        </span>
                      </div>
                      {photo.caption && (
                        <p style={{ fontSize: '.82rem', color: '#555', fontStyle: 'italic', marginBottom: 8 }}>
                          "{photo.caption}"
                        </p>
                      )}
                      <p style={{ fontSize: '.72rem', color: '#aaa', marginBottom: 10 }}>
                        {new Date(photo.created_at).toLocaleString()}
                      </p>
                      {/* Approve only for pending, Delete always shown */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        {!photo.approved && (
                          <button
                            onClick={() => approvePhoto(photo.id)}
                            style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', background: '#059669', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '.82rem' }}
                          >✅ Approve</button>
                        )}
                        <button
                          onClick={() => deletePhoto(photo.id)}
                          style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '.82rem' }}
                        >🗑 Delete</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}