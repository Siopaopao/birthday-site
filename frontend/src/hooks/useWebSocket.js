import { useEffect, useRef, useCallback } from 'react'

export function useWebSocket(onMessage) {
  const wsRef = useRef(null)
  const timerRef = useRef(null)
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const ws = new WebSocket(`${protocol}://${window.location.host}/ws/wall`)
    wsRef.current = ws

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        onMessageRef.current(data)
      } catch {}
    }

    ws.onclose = () => {
      // reconnect after 3 s
      timerRef.current = setTimeout(connect, 3000)
    }

    // keep-alive ping every 25 s
    ws.onopen = () => {
      timerRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send('ping')
      }, 25000)
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      clearInterval(timerRef.current)
      clearTimeout(timerRef.current)
      wsRef.current?.close()
    }
  }, [connect])
}
