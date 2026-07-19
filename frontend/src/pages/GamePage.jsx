import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getQuizQuestions, checkAnswer, submitScore, getLeaderboard } from '../api'

const OPTION_KEYS = ['option_a', 'option_b', 'option_c', 'option_d']
const OPTION_LABELS = ['A', 'B', 'C', 'D']

// ── Single question card ──────────────────────────────────────────────────────
function QuestionCard({ question, qIndex, total, onAnswer }) {
  const [selected, setSelected]   = useState(null)
  const [result, setResult]       = useState(null)  // { correct, correct_answer, fun_fact }
  const [loading, setLoading]     = useState(false)

  const choose = async (option) => {
    if (selected || loading) return
    setSelected(option)
    setLoading(true)
    try {
      const res = await checkAnswer(question.id, option)
      setResult(res)
    } catch {
      setResult({ correct: false, correct_answer: '—', fun_fact: null })
    } finally {
      setLoading(false)
    }
  }

  const next = () => {
    onAnswer(result?.correct ? 1 : 0)
    setSelected(null)
    setResult(null)
  }

  const optionColor = (opt) => {
    if (!result) return selected === opt ? '#e0d7ff' : '#fff'
    if (opt === result.correct_answer) return '#d1fae5'
    if (opt === selected && !result.correct) return '#fee2e2'
    return '#fff'
  }
  const optionBorder = (opt) => {
    if (!result) return selected === opt ? 'var(--purple)' : '#e5e7eb'
    if (opt === result.correct_answer) return 'var(--green)'
    if (opt === selected && !result.correct) return '#ef4444'
    return '#e5e7eb'
  }

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      style={{ maxWidth: 600, margin: '0 auto' }}
    >
      {/* Progress bar */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', color: '#888', marginBottom: 6 }}>
          <span>Question {qIndex + 1} of {total}</span>
          <span>{Math.round(((qIndex) / total) * 100)}%</span>
        </div>
        <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${((qIndex) / total) * 100}%` }}
            transition={{ duration: 0.5 }}
            style={{ height: '100%', background: 'linear-gradient(90deg, var(--pink-d), var(--purple))', borderRadius: 3 }}
          />
        </div>
      </div>

      {/* Question */}
      <div style={{
        background: 'linear-gradient(135deg, #fdf2f8, #f5f3ff)',
        borderRadius: 20, padding: '28px 24px', marginBottom: 20,
        border: '1.5px solid var(--pink-l)',
      }}>
        <p style={{ fontFamily: 'var(--font-head)', fontSize: '1.25rem', color: '#1a1a2e', lineHeight: 1.5 }}>
          {question.question}
        </p>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {OPTION_KEYS.map((key, i) => {
          const opt = question[key]
          return (
            <button
              key={key}
              onClick={() => choose(opt)}
              disabled={!!selected || loading}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px', borderRadius: 14,
                background: optionColor(opt),
                border: `2px solid ${optionBorder(opt)}`,
                cursor: selected ? 'default' : 'pointer',
                textAlign: 'left', width: '100%',
                transition: 'all .2s', fontFamily: 'var(--font-body)',
                fontSize: '.95rem', color: '#1a1a2e',
                transform: !selected && !loading ? undefined : 'none',
              }}
              onMouseEnter={e => { if (!selected) e.currentTarget.style.transform = 'translateX(4px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
            >
              <span style={{
                width: 30, height: 30, borderRadius: '50%',
                background: optionBorder(opt) === '#e5e7eb' ? '#f3f4f6' : optionBorder(opt),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '.85rem', color: '#fff', flexShrink: 0,
              }}>
                {OPTION_LABELS[i]}
              </span>
              {opt}
            </button>
          )
        })}
      </div>

      {/* Result feedback */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 20, padding: '16px 20px', borderRadius: 14,
              background: result.correct ? '#d1fae5' : '#fee2e2',
              border: `1.5px solid ${result.correct ? 'var(--green)' : '#ef4444'}`,
            }}
          >
            <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: result.fun_fact ? 6 : 0 }}>
              {result.correct ? '🎉 Correct!' : `❌ Not quite — it's "${result.correct_answer}"`}
            </p>
            {result.fun_fact && (
              <p style={{ fontSize: '.88rem', color: '#555', lineHeight: 1.6 }}>
                💡 {result.fun_fact}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {result && (
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={next}
          className="btn btn-pink"
          style={{ width: '100%', justifyContent: 'center', marginTop: 16, fontSize: '1rem' }}
        >
          {qIndex + 1 < total ? 'Next question →' : 'See my score 🎊'}
        </motion.button>
      )}
    </motion.div>
  )
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
function Leaderboard({ scores }) {
  const medals = ['🥇', '🥈', '🥉']
  return (
    <div style={{ maxWidth: 500, margin: '32px auto 0' }}>
      <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', textAlign: 'center', marginBottom: 16 }}>
        🏆 Leaderboard
      </h3>
      {scores.length === 0
        ? <p style={{ textAlign: 'center', color: '#aaa' }}>No scores yet — be the first!</p>
        : scores.map((s, i) => (
          <div key={s.id} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '12px 18px', marginBottom: 10, borderRadius: 12,
            background: i === 0 ? '#fffbeb' : '#fff',
            border: i === 0 ? '1.5px solid var(--yellow)' : '1.5px solid #f3f4f6',
            boxShadow: '0 2px 8px rgba(0,0,0,.05)',
          }}>
            <span style={{ fontSize: '1.4rem', width: 30 }}>{medals[i] || `#${i + 1}`}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, color: '#1a1a2e' }}>{s.player_name}</p>
              <p style={{ fontSize: '.78rem', color: '#aaa' }}>
                {new Date(s.played_at).toLocaleDateString()}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 700, color: 'var(--pink-d)', fontSize: '1.1rem' }}>
                {s.score}/{s.total}
              </p>
              <p style={{ fontSize: '.78rem', color: '#aaa' }}>
                {Math.round((s.score / s.total) * 100)}%
              </p>
            </div>
          </div>
        ))
      }
    </div>
  )
}

// ── Results screen ────────────────────────────────────────────────────────────
function Results({ score, total, playerName, onRestart }) {
  const [leaderboard, setLeaderboard] = useState([])
  const pct = Math.round((score / total) * 100)

  const msg =
    pct === 100 ? "Perfect score! You know her better than anyone 💖" :
    pct >= 80   ? "Wow, you really know her well! 🌟" :
    pct >= 60   ? "Pretty good! There's still more to discover 😊" :
    pct >= 40   ? "Hmm, room to grow! Spend more time with her 😄" :
                  "Looks like you two have a lot to talk about! 😅"

  useEffect(() => {
    getLeaderboard().then(setLeaderboard).catch(() => {})
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}
    >
      <div style={{
        background: 'linear-gradient(135deg, #fdf2f8, #ede9fe)',
        borderRadius: 24, padding: '40px 32px', marginBottom: 24,
        border: '1.5px solid var(--pink-l)',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: 12 }}>
          {pct === 100 ? '🏆' : pct >= 80 ? '⭐' : pct >= 60 ? '😊' : '😅'}
        </div>
        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', marginBottom: 6 }}>
          {score} / {total}
        </h2>
        <p style={{ fontSize: '1.1rem', color: 'var(--pink-d)', fontWeight: 500, marginBottom: 8 }}>
          {pct}% — {msg}
        </p>
        <p style={{ color: '#888', fontSize: '.9rem' }}>Playing as: {playerName}</p>
      </div>

      <button onClick={onRestart} className="btn btn-pink" style={{ fontSize: '1rem', marginBottom: 8 }}>
        🔄 Play again
      </button>

      <Leaderboard scores={leaderboard} />
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function GamePage() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading]     = useState(true)
  const [phase, setPhase]         = useState('name')  // name | playing | done
  const [playerName, setPlayerName] = useState('')
  const [nameError, setNameError]   = useState('')
  const [qIndex, setQIndex]         = useState(0)
  const [score, setScore]           = useState(0)

  const loadQ = useCallback(() => {
    getQuizQuestions()
      .then(setQuestions)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadQ() }, [loadQ])

  const startGame = () => {
    if (!playerName.trim()) { setNameError('Please enter your name first!'); return }
    setNameError('')
    setPhase('playing')
    setQIndex(0)
    setScore(0)
  }

  const handleAnswer = async (points) => {
    const newScore = score + points
    const newIndex = qIndex + 1
    setScore(newScore)

    if (newIndex >= questions.length) {
      // Submit to leaderboard
      try { await submitScore(playerName, newScore, questions.length) } catch {}
      setPhase('done')
    } else {
      setQIndex(newIndex)
    }
  }

  const restart = () => {
    setPhase('name')
    setPlayerName('')
    setScore(0)
    setQIndex(0)
  }

  return (
    <div style={{ paddingTop: 80 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #eff6ff, #fdf2f8)',
        padding: '56px 24px 48px', textAlign: 'center',
      }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="section-title" style={{ marginBottom: 8 }}
        >
          How Well Do You Know Her? 🎮
        </motion.h1>
        <p style={{ color: '#888', fontSize: '1.05rem' }}>
          {questions.length} questions about Diane — prove you know her best!
        </p>
      </div>

      <div className="section" style={{ paddingTop: 48 }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#aaa', padding: '60px 0' }}>
            Loading questions… 🎲
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {phase === 'name' && (
              <motion.div
                key="name"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ maxWidth: 420, margin: '0 auto', textAlign: 'center' }}
              >
                <div style={{
                  background: '#fff', borderRadius: 24, padding: '36px 32px',
                  boxShadow: '0 4px 24px rgba(244,114,182,.15)',
                  border: '1.5px solid var(--pink-l)',
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎯</div>
                  <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.6rem', marginBottom: 8 }}>
                    Ready to play?
                  </h2>
                  <p style={{ color: '#888', marginBottom: 24, fontSize: '.93rem' }}>
                    Answer {questions.length} questions about Diane and see where you rank on the leaderboard!
                  </p>
                  <div className="form-group" style={{ marginBottom: 18 }}>
                    <label className="form-label">Your name</label>
                    <input
                      className="input"
                      value={playerName}
                      onChange={e => setPlayerName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && startGame()}
                      placeholder="e.g. Alex"
                      style={{ textAlign: 'center', fontSize: '1rem' }}
                    />
                    {nameError && <span style={{ color: '#dc2626', fontSize: '.82rem' }}>{nameError}</span>}
                  </div>
                  <button onClick={startGame} className="btn btn-pink" style={{ width: '100%', justifyContent: 'center', fontSize: '1rem' }}>
                    Let's go! 🚀
                  </button>
                </div>
              </motion.div>
            )}

            {phase === 'playing' && questions[qIndex] && (
              <AnimatePresence mode="wait">
                <QuestionCard
                  key={questions[qIndex].id}
                  question={questions[qIndex]}
                  qIndex={qIndex}
                  total={questions.length}
                  onAnswer={handleAnswer}
                />
              </AnimatePresence>
            )}

            {phase === 'done' && (
              <Results
                key="done"
                score={score}
                total={questions.length}
                playerName={playerName}
                onRestart={restart}
              />
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
