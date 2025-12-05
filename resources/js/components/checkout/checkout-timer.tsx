import { useState, useEffect, useRef } from "react"
import { Clock, AlertCircle, Zap } from "lucide-react"
import { router } from "@inertiajs/react"
import { cn } from "@/lib/utils"

interface CheckoutTimerProps {
  lockExpiration: string
  sessionId: string
  eventId: number // ← NUEVO
  onExpire: () => void
}

export default function CheckoutTimer({ 
  lockExpiration, 
  sessionId, 
  eventId, // ← NUEVO
  onExpire 
}: CheckoutTimerProps) {
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
      
      // MEJORADO: Asegurar que se envíe el event_id
      router.post(route("checkout.releaseLocks"), {
        event_id: eventId,
        _method: 'POST'
      }, {
        preserveState: false,
        preserveScroll: false,
        onError: (errors) => {
          console.error('Error liberando locks:', errors)
          // Fallback: redirigir manualmente si falla
          window.location.href = route('event.detail', eventId)
        }
      })
      
      return
    }

    timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [timeLeft, expired, sessionId, eventId, onExpire]) // ← Agregar eventId

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0")
    const s = (seconds % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  // Determinar estado del timer
  const isCritical = timeLeft < 60 && timeLeft > 0
  const isWarning = timeLeft < 180 && timeLeft >= 60
  const isNormal = timeLeft >= 180

  if (expired) {
    return (
      <div className="flex justify-center mb-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-50 via-red-100 to-red-50 border-2 border-red-200 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-red-400/10 via-transparent to-red-400/10 animate-pulse" />
          <div className="relative flex items-center gap-3 px-6 py-4">
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500 rounded-full blur-md opacity-50 animate-pulse" />
                <div className="relative bg-red-500 text-white p-2.5 rounded-full">
                  <AlertCircle className="w-5 h-5" strokeWidth={2.5} />
                </div>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-red-900 font-semibold text-base sm:text-lg">
                Tiempo expirado
              </p>
              <p className="text-red-700 text-sm mt-0.5">
                Los tickets han sido liberados
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center mb-6">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 shadow-lg transition-all duration-300",
          isCritical && "bg-gradient-to-r from-red-50 via-red-100 to-red-50 border-red-300 animate-pulse",
          isWarning && "bg-gradient-to-r from-orange-50 via-orange-100 to-orange-50 border-orange-300",
          isNormal && "bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/30"
        )}
      >
        {/* Animated background */}
        <div
          className={cn(
            "absolute inset-0 opacity-30",
            isCritical && "bg-gradient-to-r from-red-400/20 via-transparent to-red-400/20 animate-pulse",
            isWarning && "bg-gradient-to-r from-orange-400/20 via-transparent to-orange-400/20",
            isNormal && "bg-gradient-to-r from-primary/10 via-transparent to-primary/10"
          )}
        />

        <div className="relative flex items-center gap-4 px-6 py-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div
                className={cn(
                  "absolute inset-0 rounded-full blur-md opacity-60",
                  isCritical && "bg-red-500 animate-pulse",
                  isWarning && "bg-orange-500",
                  isNormal && "bg-primary"
                )}
              />
              <div
                className={cn(
                  "relative text-white p-2.5 rounded-full shadow-lg",
                  isCritical && "bg-gradient-to-br from-red-500 to-red-600",
                  isWarning && "bg-gradient-to-br from-orange-500 to-orange-600",
                  isNormal && "bg-gradient-to-br from-primary to-primary-hover"
                )}
              >
                {isCritical ? (
                  <Zap className="w-5 h-5 animate-pulse" strokeWidth={2.5} />
                ) : (
                  <Clock className="w-5 h-5" strokeWidth={2.5} />
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p
                className={cn(
                  "font-semibold text-sm sm:text-base",
                  isCritical && "text-red-900",
                  isWarning && "text-orange-900",
                  isNormal && "text-primary"
                )}
              >
                <span className="hidden sm:inline">Tiempo restante para completar la compra</span>
                <span className="sm:hidden">Tiempo restante</span>
              </p>
            </div>
            <p
              className={cn(
                "text-xs mt-0.5",
                isCritical && "text-red-700",
                isWarning && "text-orange-700",
                isNormal && "text-primary/70"
              )}
            >
              {isCritical && "¡Apúrate! Tu reserva está por expirar"}
              {isWarning && "Completa tu compra pronto"}
              {isNormal && "Tus entradas están reservadas"}
            </p>
          </div>

          {/* Timer Display */}
          <div className="flex-shrink-0">
            <div
              className={cn(
                "relative px-4 py-2.5 rounded-xl shadow-inner",
                isCritical && "bg-red-700 backdrop-blur-sm",
                isWarning && "bg-orange-600 backdrop-blur-sm",
                isNormal && "bg-primary backdrop-blur-sm"
              )}
            >
              <div
                className={cn(
                  "text-xl sm:text-2xl font-mono font-medium tracking-wider",
                  isCritical && "text-red-50 drop-shadow-glow",
                  isWarning && "text-orange-50",
                  isNormal && "text-white"
                )}
              >
                {formatTime(timeLeft)}
              </div>
              {isCritical && (
                <div className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
          <div
            className={cn(
              "h-full transition-all duration-1000 ease-linear",
              isCritical && "bg-gradient-to-r from-red-500 to-red-600",
              isWarning && "bg-gradient-to-r from-orange-500 to-orange-600",
              isNormal && "bg-gradient-to-r from-primary to-primary-hover"
            )}
            style={{
              width: `${(timeLeft / 600) * 100}%`, // Asumiendo 10 minutos = 600 segundos
            }}
          />
        </div>
      </div>
    </div>
  )
}
