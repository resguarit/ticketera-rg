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

    if (!billingInfo.address.trim()) {
      newErrors.address = "La dirección es obligatoria."
    }

    if (!billingInfo.city.trim()) {
      newErrors.city = "La ciudad es obligatoria."
    }

    if (!billingInfo.state) {
      newErrors.state = "La provincia es obligatoria."
    }

    if (!billingInfo.postalCode.trim()) {
      newErrors.postalCode = "El código postal es obligatorio."
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
                className={`bg-white border-gray-300 text-foreground placeholder:text-gray-400 ${errors.firstName ? "border-red-500 focus-visible:ring-red-500" : ""
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
                className={`bg-white border-gray-300 text-foreground placeholder:text-gray-400 ${errors.lastName ? "border-red-500 focus-visible:ring-red-500" : ""
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
                className={`bg-white border-gray-300 text-foreground placeholder:text-gray-400 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""
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
                className={`bg-white border-gray-300 text-foreground placeholder:text-gray-400 ${errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                placeholder="+54 11 1234-5678"
                disabled={disabled}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="documentNumber" className="text-foreground">
                Número de Documento *
              </Label>
              <Input
                id="documentNumber"
                value={billingInfo.documentNumber}
                onChange={(e) => handleInputChange("documentNumber", e.target.value)}
                className={`bg-white border-gray-300 text-foreground placeholder:text-gray-400 ${errors.documentNumber ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                placeholder="12345678"
                disabled={disabled}
              />
              {errors.documentNumber && <p className="text-red-500 text-xs mt-1">{errors.documentNumber}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-foreground">
              Dirección *
            </Label>
            <Input
              id="address"
              value={billingInfo.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className={`bg-white border-gray-300 text-foreground placeholder:text-gray-400 ${errors.address ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              placeholder="Av. Siempre Viva 123"
              disabled={disabled}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-foreground">
                Ciudad *
              </Label>
              <Input
                id="city"
                value={billingInfo.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className={`bg-white border-gray-300 text-foreground placeholder:text-gray-400 ${errors.city ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                placeholder="Ciudad"
                disabled={disabled}
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="text-foreground">
                Provincia *
              </Label>
              <Select
                value={billingInfo.state}
                onValueChange={(value) => handleInputChange("state", value)}
                disabled={disabled}
              >
                <SelectTrigger className={`bg-white border-gray-300 text-foreground ${errors.state ? "border-red-500 focus:ring-red-500" : ""}`}>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="C">Ciudad Autónoma de Buenos Aires</SelectItem>
                  <SelectItem value="B">Buenos Aires</SelectItem>
                  <SelectItem value="K">Catamarca</SelectItem>
                  <SelectItem value="H">Chaco</SelectItem>
                  <SelectItem value="U">Chubut</SelectItem>
                  <SelectItem value="X">Córdoba</SelectItem>
                  <SelectItem value="W">Corrientes</SelectItem>
                  <SelectItem value="E">Entre Ríos</SelectItem>
                  <SelectItem value="P">Formosa</SelectItem>
                  <SelectItem value="Y">Jujuy</SelectItem>
                  <SelectItem value="L">La Pampa</SelectItem>
                  <SelectItem value="F">La Rioja</SelectItem>
                  <SelectItem value="M">Mendoza</SelectItem>
                  <SelectItem value="N">Misiones</SelectItem>
                  <SelectItem value="Q">Neuquén</SelectItem>
                  <SelectItem value="R">Río Negro</SelectItem>
                  <SelectItem value="A">Salta</SelectItem>
                  <SelectItem value="J">San Juan</SelectItem>
                  <SelectItem value="D">San Luis</SelectItem>
                  <SelectItem value="Z">Santa Cruz</SelectItem>
                  <SelectItem value="S">Santa Fe</SelectItem>
                  <SelectItem value="G">Santiago del Estero</SelectItem>
                  <SelectItem value="V">Tierra del Fuego</SelectItem>
                  <SelectItem value="T">Tucumán</SelectItem>
                </SelectContent>
              </Select>
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-foreground">
                Código Postal *
              </Label>
              <Input
                id="postalCode"
                value={billingInfo.postalCode}
                onChange={(e) => handleInputChange("postalCode", e.target.value)}
                className={`bg-white border-gray-300 text-foreground placeholder:text-gray-400 ${errors.postalCode ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                placeholder="CP"
                disabled={disabled}
              />
              {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
