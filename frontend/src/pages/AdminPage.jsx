import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

const api = (password) => axios.create({
  baseURL: '/api',
  headers: { 'x-admin-password': password },
})

export default function AdminPage() {
  const [password, setPassword]   = useState('')
  const [authed, setAuthed]       = useState(false)
  const [messages, setMessages]   = useState([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [filter, setFilter]       = useState('pending')  // pending | approved | all

  const login = async (ev) => {
    ev.preventDefault()
    setLoading(true)
    try {
      const res = await api(password).get('/admin/messages')
      setMessages(res.data)
      setAuthed(true)
      setError('')
    } catch {
      setError('Wrong admin password')
    } finally {
      setLoading(false)
    }
  }

  const reload = async () => {
    try {
      const res = await api(password).get('/admin/messages')
      setMessages(res.data)
    } catch {}
  }

  const approve = async (id) => {
    try {
      await api(password).patch(`/admin/messages/${id}/approve-and-broadcast`)
      setMessages(prev => prev.map(m => m.id === id ? { ...m, approved: true } : m))
    } catch {}
  }

  const reject = async (id) => {
    if (!window.confirm('Delete this message permanently?')) return
    try {
      await api(password).patch(`/admin/messages/${id}/reject`)
      setMessages(prev => prev.filter(m => m.id !== id))
    } catch {}
  }

  const filtered = messages.filter(m =>
    filter === 'all'      ? true :
    filter === 'pending'  ? !m.approved :
                            m.approved
  )

  const pendingCount  = messages.filter(m => !m.approved).length
  const approvedCount = messages.filter(m => m.approved).length

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
            Manage and approve wall messages
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
          <button type="submit" disabled={loading} className="btn btn-pink" style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Checking…' : 'Login'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '2rem' }}>Admin Panel</h1>
            <p style={{ color: '#888', fontSize: '.9rem' }}>
              {pendingCount} pending · {approvedCount} approved
            </p>
          </div>
          <button onClick={reload} className="btn btn-ghost">🔄 Refresh</button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          {[
            { id: 'pending',  label: `⏳ Pending (${pendingCount})` },
            { id: 'approved', label: `✅ Approved (${approvedCount})` },
            { id: 'all',      label: `📋 All (${messages.length})` },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: '8px 18px', borderRadius: 20, border: 'none',
                cursor: 'pointer', fontWeight: 500, fontSize: '.88rem',
                background: filter === f.id ? 'var(--pink-d)' : '#e5e7eb',
                color: filter === f.id ? '#fff' : '#555',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Message cards */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
            <p>Nothing here yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map(msg => (
              <motion.div
                key={msg.id}
                layout
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
                        background: '#f3f4f6', borderRadius: 20, padding: '2px 10px',
                        fontSize: '.75rem', color: '#666',
                      }}>{msg.relationship}</span>
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

                  {!msg.approved && (
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button
                        onClick={() => approve(msg.id)}
                        style={{
                          padding: '8px 16px', borderRadius: 10, border: 'none',
                          background: '#059669', color: '#fff', cursor: 'pointer',
                          fontWeight: 600, fontSize: '.88rem',
                        }}
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => reject(msg.id)}
                        style={{
                          padding: '8px 16px', borderRadius: 10, border: 'none',
                          background: '#dc2626', color: '#fff', cursor: 'pointer',
                          fontWeight: 600, fontSize: '.88rem',
                        }}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
