import type React from "react"
import { toast } from "sonner" // Added toast import

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { BillingInfo } from "@/pages/public/newcheckoutconfirm"

interface BillingInfoStepProps {
  billingInfo: BillingInfo
  setBillingInfo: React.Dispatch<React.SetStateAction<BillingInfo>>
  onNext: () => void
  disabled?: boolean
}

export default function BillingInfoStep({ billingInfo, setBillingInfo, onNext, disabled }: BillingInfoStepProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof BillingInfo, string>>>({})

  const validateFields = () => {
    const newErrors: Partial<Record<keyof BillingInfo, string>> = {}

    if (!billingInfo.firstName.trim()) {
      newErrors.firstName = "El nombre es obligatorio."
    }

    if (!billingInfo.lastName.trim()) {
      newErrors.lastName = "El apellido es obligatorio."
    }

    if (!billingInfo.email.trim()) {
      newErrors.email = "El email es obligatorio."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingInfo.email)) {
      newErrors.email = "El formato del email no es válido."
    }

    if (!billingInfo.phone.trim()) {
      newErrors.phone = "El teléfono es obligatorio."
    }

    if (!billingInfo.documentNumber.trim()) {
      newErrors.documentNumber = "El número de documento es obligatorio."
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      toast.error("Por favor completa todos los campos obligatorios")
    }

    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateFields()) {
      onNext()
    }
  }

  const handleInputChange = (field: keyof BillingInfo, value: string) => {
    setBillingInfo((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Card className="bg-white border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-foreground text-xl">Información de Facturación</CardTitle>
        <p className="text-foreground/80">Completa tus datos para la facturación</p>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            handleNext()
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-foreground">
                Nombre *
              </Label>
              <Input
                id="firstName"
                value={billingInfo.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className={`bg-white border-gray-300 text-foreground placeholder:text-gray-400 ${
                  errors.firstName ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
                placeholder="Tu nombre"
                disabled={disabled}
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-foreground">
                Apellido *
              </Label>
              <Input
                id="lastName"
                value={billingInfo.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className={`bg-white border-gray-300 text-foreground placeholder:text-gray-400 ${
                  errors.lastName ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
                placeholder="Tu apellido"
                disabled={disabled}
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={billingInfo.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`bg-white border-gray-300 text-foreground placeholder:text-gray-400 ${
                  errors.email ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
                placeholder="tu@email.com"
                disabled={disabled}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">
                Teléfono *
              </Label>
              <Input
                id="phone"
                value={billingInfo.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={`bg-white border-gray-300 text-foreground placeholder:text-gray-400 ${
                  errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
                placeholder="+54 11 1234-5678"
                disabled={disabled}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="documentType" className="text-foreground">
                Tipo de Documento *
              </Label>
              <Select
                value={billingInfo.documentType}
                onValueChange={(value) => handleInputChange("documentType", value)}
                disabled={disabled}
              >
                <SelectTrigger className="bg-white border-gray-300 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  <SelectItem value="DNI">DNI</SelectItem>
                  <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                  <SelectItem value="Cedula">Cédula</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentNumber" className="text-foreground">
                Número de Documento *
              </Label>
              <Input
                id="documentNumber"
                value={billingInfo.documentNumber}
                onChange={(e) => handleInputChange("documentNumber", e.target.value)}
                className={`bg-white border-gray-300 text-foreground placeholder:text-gray-400 ${
                  errors.documentNumber ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
                placeholder="12345678"
                disabled={disabled}
              />
              {errors.documentNumber && <p className="text-red-500 text-xs mt-1">{errors.documentNumber}</p>}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
