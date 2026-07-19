import { useRef, useCallback, useState } from 'react'

export function useAudioVolume({ onBlow, threshold = 0.15, interval = 100 }) {
  const streamRef  = useRef(null)
  const contextRef = useRef(null)
  const analyserRef = useRef(null)
  const timerRef   = useRef(null)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState(null)

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      contextRef.current = ctx

      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser

      const source = ctx.createMediaStreamSource(stream)
      source.connect(analyser)

      const data = new Uint8Array(analyser.frequencyBinCount)

      timerRef.current = setInterval(() => {
        analyser.getByteTimeDomainData(data)
        // compute RMS
        let sum = 0
        for (const v of data) {
          const normalized = (v - 128) / 128
          sum += normalized * normalized
        }
        const rms = Math.sqrt(sum / data.length)
        if (rms > threshold) onBlow(rms)
      }, interval)

      setListening(true)
      setError(null)
    } catch (err) {
      setError(err.message || 'Microphone access denied')
    }
  }, [onBlow, threshold, interval])

  const stop = useCallback(() => {
    clearInterval(timerRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    contextRef.current?.close()
    setListening(false)
  }, [])

  return { start, stop, listening, error }
}
