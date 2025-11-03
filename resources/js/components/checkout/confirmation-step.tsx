import type React from "react"

import { AlertCircle, Lock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { Agreements } from "@/pages/public/newcheckoutconfirm"

interface ConfirmationStepProps {
  agreements: Agreements
  setAgreements: React.Dispatch<React.SetStateAction<Agreements>>
  onSubmit: () => void
  isLoading: boolean
  disabled?: boolean
}

export default function ConfirmationStep({
  agreements,
  setAgreements,
  onSubmit,
  isLoading,
  disabled,
}: ConfirmationStepProps) {
  return (
    <Card className="bg-white border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-foreground text-xl">Confirmación de Compra</CardTitle>
        <p className="text-foreground/80">Revisa tu información antes de confirmar</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={agreements.terms}
              onCheckedChange={(checked) => setAgreements((prev) => ({ ...prev, terms: checked as boolean }))}
              disabled={disabled}
              className="mt-1"
            />
            <Label htmlFor="terms" className="text-foreground text-sm leading-relaxed cursor-pointer">
              Acepto los{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-hover underline"
              >
                términos y condiciones
              </a>{" "}
              *
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="privacy"
              checked={agreements.privacy}
              onCheckedChange={(checked) => setAgreements((prev) => ({ ...prev, privacy: checked as boolean }))}
              disabled={disabled}
              className="mt-1"
            />
            <Label htmlFor="privacy" className="text-foreground text-sm leading-relaxed cursor-pointer">
              Acepto la{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-hover underline"
              >
                política de privacidad
              </a>{" "}
              *
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="marketing"
              checked={agreements.marketing}
              onCheckedChange={(checked) => setAgreements((prev) => ({ ...prev, marketing: checked as boolean }))}
              disabled={disabled}
              className="mt-1"
            />
            <Label htmlFor="marketing" className="text-foreground text-sm leading-relaxed cursor-pointer">
              Quiero recibir ofertas y promociones por email
            </Label>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-2 text-primary mb-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">Información Importante</span>
          </div>
          <ul className="text-foreground/80 text-sm space-y-1">
            <li>• Los tickets serán enviados a tu email después del pago</li>
            <li>• Puedes cancelar hasta 24 horas antes del evento</li>
            <li>• Los tickets son intransferibles sin autorización</li>
            <li>• Guarda tu código QR para el acceso al evento</li>
          </ul>
        </div>

        <Button
          onClick={onSubmit}
          disabled={isLoading || !agreements.terms || !agreements.privacy || disabled}
          className="w-full bg-green-500 hover:bg-green-600 text-white"
          size="lg"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Procesando Pago...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5" />
              <span>Confirmar Compra</span>
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
