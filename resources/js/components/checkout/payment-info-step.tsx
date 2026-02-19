import type React from "react"

import { useEffect, useState } from "react"
import { CreditCard, Eye, EyeOff } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PaymentInfo, BillingInfo } from "@/pages/public/newcheckoutconfirm"
import { formatCreditCardExpiry } from "@/lib/creditCardHelpers"
import { toast } from "sonner"

interface PaymentInfoStepProps {
  paymentInfo: PaymentInfo
  setPaymentInfo: React.Dispatch<React.SetStateAction<PaymentInfo>>
  billingInfo: BillingInfo
  decidirSandbox: any
  onComplete: (tokenizedPaymentInfo: PaymentInfo) => void
  disabled?: boolean
  cuotas?: any[]
  cuotas_map?: Record<string, number[]>
}

const paymentMethods = [
  {
    id: "visa_debito",
    name: "Visa Débito",
    logo: "/images/medios-pago/visa.svg",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "visa_credito",
    name: "Visa Crédito",
    logo: "/images/medios-pago/visa.svg",
    color: "from-blue-600 to-blue-700",
  },
  {
    id: "mastercard_debito",
    name: "Mastercard Débito",
    logo: "/images/medios-pago/mastercard.svg",
    color: "from-orange-500 to-red-500",
  },
  {
    id: "mastercard_credito",
    name: "Mastercard Crédito",
    logo: "/images/medios-pago/mastercard.svg",
    color: "from-red-500 to-red-600",
  },
  {
    id: "amex",
    name: "American Express",
    logo: "/images/medios-pago/american-express.svg",
    color: "from-cyan-500 to-blue-500",
  },
]

export default function PaymentInfoStep({
  paymentInfo,
  setPaymentInfo,
  billingInfo,
  decidirSandbox,
  onComplete,
  cuotas,
  cuotas_map,
  disabled,
}: PaymentInfoStepProps) {
  const [showCVV, setShowCVV] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof PaymentInfo, string>>>({})
  const [isTokenizing, setIsTokenizing] = useState(false)
  const [availableCuotas, setAvailableCuotas] = useState<number[]>([])

  const [deviceId, setDeviceId] = useState<string>("");

  useEffect(() => {
    const currentBin = paymentInfo.cardNumber.replace(/\s+/g, "").slice(0, 6)
    let options: number[] = [1];

    if (currentBin.length === 6 && cuotas_map && cuotas_map[currentBin]) {
      const binOptions = cuotas_map[currentBin];
      const allOptions = Array.from(new Set([1, ...binOptions])).sort((a, b) => a - b);
      options = allOptions;
    }

    setAvailableCuotas(options);

    if (!options.includes(paymentInfo.installments)) {
      setPaymentInfo((prev) => ({ ...prev, installments: 1 }));
    }
  }, [paymentInfo.cardNumber, cuotas_map])

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    return parts.length ? parts.join(" ") : v
  }

  const handleInputChange = (field: keyof PaymentInfo, value: string) => {
    setPaymentInfo((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validatePaymentInfo = (): boolean => {
    const newErrors: Partial<Record<keyof PaymentInfo, string>> = {}

    if (!paymentInfo.paymentMethodId) {
      toast.error("Por favor selecciona un método de pago")
      return false
    }

    if (!paymentInfo.cardName.trim()) {
      newErrors.cardName = "El nombre en la tarjeta es obligatorio"
    }

    const cardNumberClean = paymentInfo.cardNumber.replace(/\s+/g, "")
    if (!cardNumberClean) {
      newErrors.cardNumber = "El número de tarjeta es obligatorio"
    } else if (cardNumberClean.length < 13 || cardNumberClean.length > 19) {
      newErrors.cardNumber = "El número de tarjeta no es válido"
    }

    if (!paymentInfo.expiryDate) {
      newErrors.expiryDate = "La fecha de vencimiento es obligatoria"
    } else {
      const [month, year] = paymentInfo.expiryDate.split("/")
      const currentYear = new Date().getFullYear() % 100
      const currentMonth = new Date().getMonth() + 1

      if (!month || !year || Number.parseInt(month) < 1 || Number.parseInt(month) > 12) {
        newErrors.expiryDate = "Fecha de vencimiento inválida"
      } else if (
        Number.parseInt(year) < currentYear ||
        (Number.parseInt(year) === currentYear && Number.parseInt(month) < currentMonth)
      ) {
        newErrors.expiryDate = "La tarjeta está vencida"
      }
    }

    if (!paymentInfo.cvv) {
      newErrors.cvv = "El CVV es obligatorio"
    } else if (paymentInfo.cvv.length < 3 || paymentInfo.cvv.length > 4) {
      newErrors.cvv = "El CVV debe tener 3 o 4 dígitos"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleTokenizeAndContinue = async () => {
    if (!validatePaymentInfo()) {
      return
    }

    if (!billingInfo.documentNumber || !billingInfo.documentType) {
      toast.error("Falta información de documento en los datos de facturación")
      return
    }

    setIsTokenizing(true)

    const phantomForm = document.createElement("form")
    phantomForm.style.display = "none"

    const cardNumberClean = paymentInfo.cardNumber.replace(/\s+/g, "")
    const [expiryMonth, expiryYear] = paymentInfo.expiryDate.split("/").map((s) => s.trim())

    const formFields = [
      { name: "card_number", value: cardNumberClean },
      { name: "security_code", value: paymentInfo.cvv },
      { name: "card_expiration_month", value: expiryMonth },
      { name: "card_expiration_year", value: expiryYear },
      { name: "card_holder_name", value: paymentInfo.cardName },
      { name: "card_holder_doc_type", value: billingInfo.documentType.toLowerCase() },
      { name: "card_holder_doc_number", value: billingInfo.documentNumber },
    ]

    formFields.forEach((field) => {
      const input = document.createElement("input")
      input.type = "hidden"
      input.setAttribute("data-decidir", field.name)
      input.value = field.value
      phantomForm.appendChild(input)
    })

    document.body.appendChild(phantomForm)

    const handleTokenResponse = (status: number, response: any) => {
      console.log("Tokenization response:", { status, response })
      document.body.removeChild(phantomForm)

      if (status !== 200 && status !== 201) {
        console.error("Error en tokenización:", response)
        setIsTokenizing(false)

        if (response?.error?.type === "invalid_request_error") {
          toast.error("Datos de tarjeta inválidos. Por favor verifica la información.")
        } else if (response?.error?.message) {
          toast.error(`Error: ${response.error.message}`)
        } else {
          toast.error(
            "Error al validar los datos de la tarjeta. Por favor, revisa la información e intenta nuevamente.",
          )
        }
        return
      }

      const tokenizedPaymentInfo: PaymentInfo = {
        ...paymentInfo,
        token: response.id,
        bin: response.bin,
      }

      setIsTokenizing(false)
      toast.success("Tarjeta validada correctamente")
      onComplete(tokenizedPaymentInfo)
    }

    try {
      decidirSandbox.createToken(phantomForm, handleTokenResponse)
    } catch (error) {
      console.error("[v0] Error al llamar al SDK de Payway:", error)
      document.body.removeChild(phantomForm)
      setIsTokenizing(false)
      toast.error("Error al procesar la tarjeta. Por favor intenta de nuevo.")
    }
  }

  return (
    <Card className="bg-white border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-foreground text-xl">Método de Pago</CardTitle>
        <p className="text-foreground/80">Selecciona tu método de pago y completa los datos</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-foreground font-medium">Tipo de Tarjeta *</Label>
          <RadioGroup
            value={paymentInfo.paymentMethodId}
            onValueChange={(value) => handleInputChange("paymentMethodId", value)}
            disabled={disabled}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border-2 transition-all cursor-pointer ${paymentInfo.paymentMethodId === method.id
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-gray-300"
                  }`}
                onClick={() => !disabled && handleInputChange("paymentMethodId", method.id)}
              >
                <RadioGroupItem value={method.id} id={method.id} disabled={disabled} />
                <div className="w-14 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 p-2 border border-gray-200">
                  <img
                    src={method.logo}
                    alt={method.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <Label htmlFor={method.id} className="text-foreground font-medium cursor-pointer flex-1">
                  {method.name}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {paymentInfo.paymentMethodId && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="space-y-2">
              <Label htmlFor="cardName" className="text-foreground">
                Nombre del Titular <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cardName"
                value={paymentInfo.cardName}
                onChange={(e) => handleInputChange("cardName", e.target.value)}
                className={`bg-white border-gray-300 text-foreground placeholder:text-gray-400 ${errors.cardName ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                placeholder="Nombre como aparece en la tarjeta"
                disabled={disabled}
              />
              {errors.cardName && <p className="text-red-500 text-xs mt-1">{errors.cardName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber" className="text-foreground">
                Número de Tarjeta <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cardNumber"
                value={paymentInfo.cardNumber}
                onChange={(e) => handleInputChange("cardNumber", formatCardNumber(e.target.value))}
                className={`bg-white border-gray-300 text-foreground placeholder:text-gray-400 ${errors.cardNumber ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                disabled={disabled}
              />
              {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="text-foreground">
                  Fecha de Vencimiento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="expiryDate"
                  value={paymentInfo.expiryDate}
                  onChange={(e) => handleInputChange("expiryDate", formatCreditCardExpiry(e.target.value))}
                  className={`bg-white border-gray-300 text-foreground placeholder:text-gray-400 ${errors.expiryDate ? "border-red-500 focus-visible:ring-red-500" : ""
                    }`}
                  placeholder="MM/AA"
                  maxLength={5}
                  disabled={disabled}
                />
                {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv" className="text-foreground">
                  CVV <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="cvv"
                    type={showCVV ? "text" : "password"}
                    value={paymentInfo.cvv}
                    onChange={(e) => handleInputChange("cvv", e.target.value.replace(/\D/g, ""))}
                    className={`bg-white border-gray-300 text-foreground placeholder:text-gray-400 pr-10 ${errors.cvv ? "border-red-500 focus-visible:ring-red-500" : ""
                      }`}
                    placeholder="123"
                    maxLength={4}
                    disabled={disabled}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCVV(!showCVV)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-foreground"
                    disabled={disabled}
                  >
                    {showCVV ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cuotas" className="text-foreground">
                  Cuotas
                </Label>
                {availableCuotas.length > 1 ? (
                  <Select
                    name="installments"
                    value={paymentInfo.installments.toString()}
                    onValueChange={(value) =>
                      setPaymentInfo((prev) => ({
                        ...prev,
                        installments: parseInt(value, 10),
                      }))
                    }
                    disabled={disabled || isTokenizing}
                  >
                    <SelectTrigger id="cuotas">
                      <SelectValue placeholder="Selecciona las cuotas" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCuotas.map((count) => (
                        <SelectItem key={count} value={count.toString()}>
                          {count} cuota{count > 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-foreground/70">1 cuota</p>
                )}
              </div>
            </div>

            <Button
              onClick={handleTokenizeAndContinue}
              disabled={isTokenizing || disabled}
              className="w-full bg-primary hover:bg-primary-hover text-white mt-4"
              size="lg"
            >
              {isTokenizing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Validando Tarjeta...</span>
                </div>
              ) : (
                "Validar y Continuar"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
