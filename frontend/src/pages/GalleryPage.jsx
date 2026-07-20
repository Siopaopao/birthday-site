import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Toast from '../components/Toast'

const API = import.meta.env.VITE_API_URL

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ photos, index, onClose }) {
  const [current, setCurrent] = useState(index)

  const prev = useCallback(() => setCurrent(i => (i - 1 + photos.length) % photos.length), [photos.length])
  const next = useCallback(() => setCurrent(i => (i + 1) % photos.length), [photos.length])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape')     onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prev, next, onClose])

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const photo = photos[current]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 20, right: 24,
          background: 'rgba(255,255,255,.15)', border: 'none',
          color: '#fff', fontSize: '1.5rem', width: 44, height: 44,
          borderRadius: '50%', cursor: 'pointer', zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >✕</button>

      {/* Prev button */}
      {photos.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); prev() }}
          style={{
            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,.15)', border: 'none',
            color: '#fff', fontSize: '1.8rem', width: 48, height: 48,
            borderRadius: '50%', cursor: 'pointer', zIndex: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >‹</button>
      )}

      {/* Photo */}
      <motion.div
        key={current}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '90vw', maxHeight: '90vh',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}
      >
        <img
          src={`${API}${photo.photo_url}`}
          alt={photo.caption || ''}
          style={{
            maxWidth: '85vw', maxHeight: '75vh',
            objectFit: 'contain', borderRadius: 12,
            boxShadow: '0 20px 60px rgba(0,0,0,.5)',
          }}
        />
        {photo.caption && (
          <p style={{
            color: '#fff', fontSize: '1rem', textAlign: 'center',
            fontFamily: 'var(--font-head)', fontStyle: 'italic',
            maxWidth: 500, lineHeight: 1.6,
          }}>
            "{photo.caption}"
          </p>
        )}
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.8rem' }}>
          {current + 1} / {photos.length}
        </p>
      </motion.div>

      {/* Next button */}
      {photos.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); next() }}
          style={{
            position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,.15)', border: 'none',
            color: '#fff', fontSize: '1.8rem', width: 48, height: 48,
            borderRadius: '50%', cursor: 'pointer', zIndex: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >›</button>
      )}
    </motion.div>
  )
}

// ── Photo grid card ───────────────────────────────────────────────────────────
function PhotoCard({ photo, index, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 6) * 0.07 }}
      onClick={() => onClick(index)}
      style={{
        cursor: 'pointer', borderRadius: 16, overflow: 'hidden',
        background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,.08)',
        transition: 'transform .2s, box-shadow .2s',
        position: 'relative',
      }}
      whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(244,114,182,.2)' }}
    >
      <img
        src={`${API}${photo.photo_url}`}
        alt={photo.caption || ''}
        style={{
          width: '100%', aspectRatio: '4/3',
          objectFit: 'cover', display: 'block',
        }}
        loading="lazy"
      />
      {photo.caption && (
        <div style={{
          padding: '10px 14px',
          background: '#fff',
        }}>
          <p style={{
            fontSize: '.85rem', color: '#555',
            lineHeight: 1.5, fontStyle: 'italic',
          }}>
            "{photo.caption}"
          </p>
        </div>
      )}
      {/* Hover overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(219,39,119,.15), transparent)',
        opacity: 0, transition: 'opacity .2s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
        onMouseLeave={e => e.currentTarget.style.opacity = '0'}
      >
        <span style={{ fontSize: '2rem' }}>🔍</span>
      </div>
    </motion.div>
  )
}

// ── Submit form ───────────────────────────────────────────────────────────────
function SubmitForm({ onSubmitted }) {
  const [name, setName]       = useState('')
  const [caption, setCaption] = useState('')
  const [photo, setPhoto]     = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})
  const [done, setDone]       = useState(false)

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  const validate = () => {
    const e = {}
    if (!photo)        e.photo = 'Please select a photo'
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
      fd.append('sender_name', name.trim())
      fd.append('caption', caption.trim())
      fd.append('photo', photo)

      const res = await fetch(`${API}/gallery`, {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) throw new Error('Failed')
      setDone(true)
      onSubmitted()
    } catch {
      onSubmitted('error')
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
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>📸</div>
        <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', marginBottom: 8 }}>
          Photo submitted!
        </h3>
        <p style={{ color: '#888', fontSize: '.93rem' }}>
          It will appear in the gallery after a quick review 💕
        </p>
        <button
          onClick={() => { setDone(false); setName(''); setCaption(''); setPhoto(null); setPreview(null) }}
          className="btn btn-outline"
          style={{ marginTop: 20 }}
        >
          Submit another 📷
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
        Share a photo with Diane 📸
      </h3>
      <p style={{ textAlign: 'center', color: '#888', fontSize: '.88rem', marginBottom: 22 }}>
        Submit a memory — it will appear after a quick review
      </p>

      <div className="form-group" style={{ marginBottom: 14 }}>
        <label className="form-label">Your name (optional)</label>
        <input
          className="input"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Sarah"
        />
        
      </div>

      <div className="form-group" style={{ marginBottom: 14 }}>
        <label className="form-label">Caption (optional)</label>
        <input
          className="input"
          value={caption}
          onChange={e => setCaption(e.target.value)}
          placeholder="A short note about this photo…"
          maxLength={200}
        />
      </div>

      <div className="form-group" style={{ marginBottom: 22 }}>
        <label className="form-label">Photo *</label>
        <input
          type="file" accept="image/*"
          onChange={handleFile}
          style={{ fontSize: '.88rem', color: '#555' }}
        />
        {errors.photo && <span style={{ color: '#dc2626', fontSize: '.8rem' }}>{errors.photo}</span>}
        {preview && (
          <div style={{ marginTop: 10, position: 'relative', display: 'inline-block' }}>
            <img src={preview} alt="" style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 10 }} />
            <button
              type="button"
              onClick={() => { setPhoto(null); setPreview(null) }}
              style={{
                position: 'absolute', top: -8, right: -8,
                background: '#dc2626', border: 'none', color: '#fff',
                width: 22, height: 22, borderRadius: '50%', cursor: 'pointer',
                fontSize: '.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
          </div>
        )}
      </div>

      <button type="submit" disabled={loading} className="btn btn-pink" style={{ width: '100%', justifyContent: 'center' }}>
        {loading ? '📸 Uploading…' : '📸 Submit photo'}
      </button>
    </form>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function GalleryPage() {
  const [photos, setPhotos]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [lightbox, setLightbox]   = useState(null)  // index or null
  const [toast, setToast]         = useState(null)
  const [showForm, setShowForm]   = useState(false)

  const load = async () => {
    try {
      const res = await fetch(`${API}/gallery`)
      const data = await res.json()
      setPhotos(data)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSubmitted = (err) => {
    if (err) {
      setToast({ msg: 'Something went wrong. Please try again.', type: 'error' })
    } else {
      setToast({ msg: 'Photo submitted! It will appear after review 📸', type: 'success' })
      setShowForm(false)
    }
  }

  return (
    <div style={{ paddingTop: 80 }}>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <AnimatePresence>
        {lightbox !== null && (
          <Lightbox photos={photos} index={lightbox} onClose={() => setLightbox(null)} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #fdf2f8, #ede9fe)',
        padding: 'clamp(32px, 6vw, 56px) 24px clamp(28px, 5vw, 48px)',
        textAlign: 'center',
      }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="section-title" style={{ marginBottom: 8 }}
        >
          Photo Gallery 📸
        </motion.h1>
        <p style={{ color: '#888', fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)' }}>
          Beautiful memories with Diane — {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
        </p>
      </div>

      <div className="section" style={{ paddingTop: 40 }}>

        {/* Submit button / form toggle */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <button
            onClick={() => setShowForm(s => !s)}
            className="btn btn-pink"
            style={{ fontSize: '1rem' }}
          >
            {showForm ? '✕ Close' : '📷 Share a photo with Diane'}
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', maxWidth: 540, margin: '0 auto 48px' }}
            >
              <SubmitForm onSubmitted={handleSubmitted} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Photo grid */}
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16 }} />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>📷</div>
            <p style={{ fontSize: '1rem', marginBottom: 6 }}>No photos yet — be the first!</p>
            <p style={{ fontSize: '.88rem' }}>Submit a memory above 💕</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}>
            {photos.map((photo, i) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                index={i}
                onClick={setLightbox}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}