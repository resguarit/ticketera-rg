"use client"

import { useState } from "react"
import { Mail, KeyRound, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react"
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

type VerificationStep = "checking" | "login" | "register" | "forgot_password" | "forgot_password_success"

export default function AccountVerificationModal({
  isOpen,
  onClose,
  billingInfo,
  onSuccess
}: AccountVerificationModalProps) {
  const [step, setStep] = useState<VerificationStep>("checking")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await axios.post(route('password.email'), {
        email: billingInfo.email,
      })

      setStep("forgot_password_success")

    } catch (err: any) {
      setError(err.response?.data?.message || "Error al enviar el enlace.")
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
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
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
            {step === "forgot_password" && "Restablecer Contraseña"}
            {step === "forgot_password_success" && "Enlace Enviado"}
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
                <Label>Contraseña</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className={fieldErrors.password ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                    </span>
                  </Button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-red-500">{fieldErrors.password[0]}</p>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setStep("forgot_password")}
                  className="text-sm text-primary hover:underline focus:outline-none"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>
          )}

          {step === "forgot_password" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Te enviaremos un enlace a <strong>{billingInfo.email}</strong> para que puedas restablecer tu contraseña.
              </p>
            </div>
          )}

          {step === "forgot_password_success" && (
            <div className="space-y-4">
              <div className="rounded-full bg-green-100 p-3 w-12 h-12 mx-auto flex items-center justify-center">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-center">
                <p className="text-sm text-foreground mb-2">
                  Hemos enviado un enlace de recuperación a:
                </p>
                <p className="font-semibold text-foreground mb-4">
                  {billingInfo.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  Por favor revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
                </p>
                <p className="text-sm font-medium text-primary mt-4 bg-primary/10 p-3 rounded-md">
                  Una vez restablecida, vuelve a esta ventana para iniciar sesión y finalizar tu compra.
                </p>
              </div>
            </div>
          )}

          {step === "register" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Contraseña</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="off"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className={fieldErrors.password ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                    </span>
                  </Button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-red-500">{fieldErrors.password[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Confirmar Contraseña</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="off"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                    onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showConfirmPassword ? "Ocultar contraseña" : "Ver contraseña"}
                    </span>
                  </Button>
                </div>
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

          {step === "forgot_password" && (
            <div className="flex flex-col space-y-2 w-full">
              <Button onClick={handleForgotPassword} className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar enlace de restablecimiento"
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setStep("login")}
                disabled={isLoading}
                className="w-full"
              >
                Volver
              </Button>
            </div>
          )}

          {step === "forgot_password_success" && (
            <Button onClick={() => setStep("login")} className="w-full">
              <KeyRound className="mr-2 h-4 w-4" />
              Volver a Iniciar Sesión
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

