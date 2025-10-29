import { useState, useEffect, useRef } from "react"
import { Clock, AlertCircle } from "lucide-react"

interface CheckoutTimerProps {
  lockExpiration: string
  sessionId: string
  onExpire: () => void
}

export default function CheckoutTimer({ lockExpiration, sessionId, onExpire }: CheckoutTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const expires = new Date(lockExpiration).getTime()
    return Math.max(0, Math.floor((expires - Date.now()) / 1000))
  })
  const [expired, setExpired] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (expired) return

    if (timeLeft <= 0) {
      setExpired(true)
      onExpire()
      fetch(`/api/release-locks?session_id=${sessionId}`, { method: "POST" }).catch((err) =>
        console.error("Error releasing locks:", err),
      )
      return
    }

    timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [timeLeft, expired, sessionId, onExpire])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0")
    const s = (seconds % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  return (
    <div className="flex justify-center mb-6">
      {!expired ? (
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-lg ${
            timeLeft < 60
              ? "bg-red-100 border border-red-300 text-red-800"
              : "bg-yellow-100 border border-yellow-300 text-yellow-800"
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="hidden sm:inline">Tiempo restante para completar la compra:</span>
          <span className="sm:hidden">Tiempo restante:</span>
          <span className="ml-2 font-mono">{formatTime(timeLeft)}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded-lg font-semibold text-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm sm:text-base">El tiempo ha expirado. Los tickets han sido liberados.</span>
        </div>
      )}
    </div>
  )
}
