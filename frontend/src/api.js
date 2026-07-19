import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// ── Wall Messages ────────────────────────────────────────────────────────────
export const getMessages = () => api.get('/messages').then(r => r.data)

export const postMessage = (formData) =>
  api.post('/messages', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)

// ── Timeline ─────────────────────────────────────────────────────────────────
export const getTimeline = () => api.get('/timeline').then(r => r.data)

// ── Quiz ─────────────────────────────────────────────────────────────────────
export const getQuizQuestions = () => api.get('/quiz/questions').then(r => r.data)

export const checkAnswer = (question_id, selected_answer) =>
  api.post('/quiz/check', { question_id, selected_answer }).then(r => r.data)

export const submitScore = (player_name, score, total) =>
  api.post('/quiz/scores', { player_name, score, total }).then(r => r.data)

export const getLeaderboard = () => api.get('/quiz/leaderboard').then(r => r.data)

// ── Private Messages ─────────────────────────────────────────────────────────
export const sendPrivateMessage = (sender_name, message) =>
  api.post('/private', { sender_name, message }).then(r => r.data)

export const unlockPrivateMessages = (passcode) =>
  api.post('/private/unlock', { passcode }).then(r => r.data)
