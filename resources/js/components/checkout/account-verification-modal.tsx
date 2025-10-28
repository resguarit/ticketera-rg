"use client"

import { useState } from "react"
import { Mail, KeyRound, Loader2, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { BillingInfo } from "@/pages/public/newcheckoutconfirm"
import axios from "axios"

interface AccountVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  billingInfo: BillingInfo
  onSuccess: () => void
}

type VerificationStep = "checking" | "login" | "register"

export default function AccountVerificationModal({ 
  isOpen, 
  onClose, 
  billingInfo, 
  onSuccess 
}: AccountVerificationModalProps) {
  const [step, setStep] = useState<VerificationStep>("checking")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setStep("checking")
      setPassword("")
      setConfirmPassword("")
      setError("")
      setFieldErrors({})
      onClose()
    }
  }

  const validateBillingInfo = (): boolean => {
    const errors: string[] = []

    if (!billingInfo.firstName?.trim()) {
      errors.push("El nombre es obligatorio")
    }
    if (!billingInfo.lastName?.trim()) {
      errors.push("El apellido es obligatorio")
    }
    if (!billingInfo.email?.trim()) {
      errors.push("El email es obligatorio")
    }
    if (!billingInfo.phone?.trim()) {
      errors.push("El teléfono es obligatorio")
    }
    if (!billingInfo.documentNumber?.trim()) {
      errors.push("El número de documento es obligatorio")
    }

    if (errors.length > 0) {
      setError("Por favor completa todos los campos obligatorios en el formulario de facturación antes de continuar:\n" + errors.join(", "))
      return false
    }

    return true
  }

  const checkEmailAccount = async () => {
    if (!validateBillingInfo()) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await axios.get(`/checkout/check-email/${encodeURIComponent(billingInfo.email)}`)

      if (response.data.exists) {
        setStep("login")
      } else {
        setStep("register")
      }
    } catch (err) {
      setError("Error al verificar el email. Por favor intenta de nuevo.")
      console.error("Error checking email:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!password) {
      setError("Por favor ingresa tu contraseña.")
      return
    }

    setIsLoading(true)
    setError("")
    setFieldErrors({})

    try {
      const response = await axios.post("/checkout/login", {
        email: billingInfo.email,
        password,
      })

      if (response.data.success) {
        window.location.reload()
      } else {
        setError(response.data.message || "Error al iniciar sesión.")
        setIsLoading(false)
      }
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        const { data, status } = err.response
        if (status === 401) {
          setError(data.message || "Credenciales incorrectas.")
        } else if (status === 422 && data.errors) {
          setFieldErrors(data.errors)
          setError("Por favor corrige los errores en el formulario.")
        } else {
          setError(data.message || "Error al iniciar sesión.")
        }
      } else {
        setError("Error al iniciar sesión. Por favor intenta de nuevo.")
        console.error("Error:", err)
      }
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!password || !confirmPassword) {
      setError("Por favor completa todos los campos.")
      return
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }

    setIsLoading(true)
    setError("")
    setFieldErrors({})

    try {
      const response = await axios.post("/checkout/register", {
        firstName: billingInfo.firstName,
        lastName: billingInfo.lastName,
        email: billingInfo.email,
        phone: billingInfo.phone,
        documentType: billingInfo.documentType,
        documentNumber: billingInfo.documentNumber,
        password,
        password_confirmation: confirmPassword,
      })

      if (response.data.success) {
        window.location.reload()
      } else {
        setError(response.data.message || "Error al crear la cuenta.")
        setIsLoading(false)
      }
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        const { data, status } = err.response
        if (status === 422 && data.errors) {
          setFieldErrors(data.errors)
          const errorMessages = Object.values(data.errors).flat()
          setError(errorMessages.join(" "))
        } else {
          setError(data.message || "Error al crear la cuenta.")
        }
      } else {
        setError("Error al crear la cuenta. Por favor intenta de nuevo.")
        console.error("Error:", err)
      }
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {step === "checking" && "Verificar Email"}
            {step === "login" && "Iniciar Sesión"}
            {step === "register" && "Crear Cuenta"}
          </DialogTitle>
          <DialogDescription>
            {step === "checking" && "Verificaremos si ya tienes una cuenta asociada a este email."}
            {step === "login" && "Ya tienes una cuenta. Ingresa tu contraseña para continuar."}
            {step === "register" && "Crea una contraseña para tu nueva cuenta y continuar con la compra."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <p className="text-sm text-muted-foreground">Email:</p>
            <p className="font-semibold text-foreground">{billingInfo.email}</p>
          </div>

          {step === "checking" && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Haz clic en continuar para verificar tu email</p>
            </div>
          )}

          {step === "login" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className={fieldErrors.password ? "border-red-500" : ""}
                />
                {fieldErrors.password && (
                  <p className="text-xs text-red-500">{fieldErrors.password[0]}</p>
                )}
              </div>
            </div>
          )}

          {step === "register" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Contraseña</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className={fieldErrors.password ? "border-red-500" : ""}
                />
                {fieldErrors.password && (
                  <p className="text-xs text-red-500">{fieldErrors.password[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === "checking" && (
            <Button onClick={checkEmailAccount} className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Continuar
                </>
              )}
            </Button>
          )}

          {step === "login" && (
            <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Iniciar Sesión
                </>
              )}
            </Button>
          )}

          {step === "register" && (
            <Button onClick={handleRegister} className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Crear Cuenta y Continuar
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

