import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Header from "@/components/header"
import { Head, Link, router, usePage } from "@inertiajs/react"
import type { Cuota, SharedData } from "@/types"
import type { Event, EventFunction, Organizer } from "@/types"
import BillingInfoStep from "@/components/checkout/billing-info-step"
import PaymentInfoStep from "@/components/checkout/payment-info-step"
import ConfirmationStep from "@/components/checkout/confirmation-step"
import OrderSummary from "@/components/checkout/order-summary"
import AccountVerificationModal from "@/components/checkout/account-verification-modal"
import CheckoutTimer from "@/components/checkout/checkout-timer"
import { route } from "ziggy-js"
import { toast } from "sonner"
import Footer from "@/components/footer"

interface SelectedTicket {
  id: number
  type: string
  price: number
  quantity: number
  description: string
  is_bundle?: boolean
  bundle_quantity?: number
}

interface EventData extends Event {
  date: string
  time: string
  location: string
  city: string
  province?: string
  full_address?: string
  selectedTickets: SelectedTicket[]
  function?: EventFunction
  organizer?: Organizer
  tax?: number
  cuotas?: Cuota[]
  cuotas_map?: Record<string, number[]>
}

interface CheckoutConfirmProps {
  eventData: EventData
  eventId: number
  sessionId: string
  lockExpiration: string
  ambient: string;
}

export interface BillingInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  documentType: string
  documentNumber: string
  address: string
  city: string
  postalCode: string
  country: string
  state: string
  discountCode: string
}

export interface PaymentInfo {
  paymentMethodId: string
  cardNumber: string
  expiryDate: string
  cvv: string
  cardName: string
  installments: number
  token?: string
  bin?: string
  device_unique_identifier?: string
}

export interface Agreements {
  terms: boolean
  privacy: boolean
  marketing: boolean
}

export default function CheckoutConfirm({ eventData, eventId, sessionId, lockExpiration, ambient }: CheckoutConfirmProps) {
  const { auth } = usePage<SharedData>().props
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerificationModalOpen, setVerificationModalOpen] = useState(false)
  const [expired, setExpired] = useState(false)

  const decidirSandboxRef = useRef<any>(null)

  useEffect(() => {
    if (!decidirSandboxRef.current) {
      let url = ""
      let key = ""

      if (ambient === 'test') {
        url = "https://developers-ventasonline.payway.com.ar/api/v2"
        key = "2GdQYEHoXH5NXn8nbtniE1Jqo0F3fC8y"
      } else {
        url = "https://live.decidir.com/api/v2"
        key = "9960377671874d4fb71d0a8448642730"
      }

      decidirSandboxRef.current = new (window as any).Decidir(url)
      decidirSandboxRef.current.setPublishableKey(key)
    }

    const savedCode = sessionStorage.getItem('referral_code');
    if (savedCode) {
      console.log("Aplicando codigo de vendedor: ", savedCode);
      setBillingInfo((prev) => ({ ...prev, discountCode: savedCode }));
    }
  }, [])

  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    firstName: auth.user?.person?.name ?? "",
    lastName: auth.user?.person?.last_name ?? "",
    email: auth.user?.email ?? "",
    phone: auth.user?.person?.phone ?? "",
    documentType: "DNI",
    documentNumber: auth.user?.person?.dni ?? "",
    address: "",
    city: "",
    postalCode: "",
    country: "Argentina",
    state: "",
    discountCode: "",
  })

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    paymentMethodId: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    installments: 1,
  })

  const [agreements, setAgreements] = useState<Agreements>({
    terms: false,
    privacy: false,
    marketing: false,
  })

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validar campos obligatorios del billing info
      const requiredFields = {
        firstName: billingInfo.firstName?.trim(),
        lastName: billingInfo.lastName?.trim(),
        email: billingInfo.email?.trim(),
        phone: billingInfo.phone?.trim(),
        documentNumber: billingInfo.documentNumber?.trim(),
        address: billingInfo.address?.trim(),
        city: billingInfo.city?.trim(),
        postalCode: billingInfo.postalCode?.trim(),
        state: billingInfo.state?.trim(),
      }

      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([key]) => {
          const fieldNames: Record<string, string> = {
            firstName: 'Nombre',
            lastName: 'Apellido',
            email: 'Email',
            phone: 'Teléfono',
            documentNumber: 'Número de Documento',
            address: 'Dirección',
            city: 'Ciudad',
            postalCode: 'Código Postal',
            state: 'Provincia',
          }
          return fieldNames[key]
        })

      if (missingFields.length > 0) {
        toast.error(`Por favor completa los siguientes campos: ${missingFields.join(', ')}`)
        return
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(billingInfo.email)) {
        toast.error('Por favor ingresa un email válido')
        return
      }

      if (!auth.user) {
        setVerificationModalOpen(true)
      } else {
        setCurrentStep(2)
      }
    } else if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleVerificationSuccess = () => {
    setVerificationModalOpen(false)
    setCurrentStep(2)
  }

  const handlePaymentStepComplete = async (tokenizedPaymentInfo: PaymentInfo) => {
    setPaymentInfo(tokenizedPaymentInfo)
    setCurrentStep(3)
  }

  const handleBack = () => {
    router.post(route("checkout.releaseLocks"))
    router.get(route("event.detail", eventId))
  }

  const handleSubmitPayment = async () => {
    if (!agreements.terms || !agreements.privacy) {
      toast.error("Debes aceptar los términos y condiciones y la política de privacidad")
      return
    }

    if (!paymentInfo.token) {
      toast.error("Error con la información de pago. Por favor vuelve al paso anterior.")
      return
    }

    setIsLoading(true)

    const formData = {
      event_id: eventId,
      function_id: eventData.function?.id,
      billing_info: billingInfo,
      payment_info: {
        method: paymentInfo.paymentMethodId,
        installments: paymentInfo.installments,
        device_unique_identifier: paymentInfo.device_unique_identifier,
      },
      token: paymentInfo.token,
      bin: paymentInfo.bin,
      selected_tickets: eventData.selectedTickets,
      agreements: agreements,
    }

    try {
      router.post(route("checkout.process"), formData as any, {
        onError: (errors) => {
          console.error("Error procesando el pago:", errors)
          setIsLoading(false)
          toast.error("Error procesando el pago. Por favor intenta de nuevo.")
        },
      })
    } catch (error) {
      console.error("Error procesando el pago:", error)
      setIsLoading(false)
      toast.error("Error procesando el pago. Por favor intenta de nuevo.")
    }
  }

  return (
    <>
      <Head title="Confirmar Compra" />

      <div className="min-h-screen bg-gradient-to-br from-gray-200 to-background">
        <Header />

        <div className="mx-auto px-4 lg:px-16 py-8">
          <div className="w-full flex flex-col lg:flex-row lg:justify-between gap-4">
            {/* Botón - arriba en mobile, izquierda en lg+ */}
            <div className="lg:w-1/2">
              <Button onClick={handleBack} variant="ghost" size="sm" className="text-foreground hover:text-primary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Evento
              </Button>
            </div>

            {/* Timer - debajo en mobile (full width), centro en lg+ */}
            <div className="flex justify-center w-full lg:w-full">
              <CheckoutTimer
                lockExpiration={lockExpiration}
                sessionId={sessionId}
                eventId={eventId}
                onExpire={() => setExpired(true)}
              />
            </div>

            {/* Spacer solo visible en lg+ */}
            <div className="hidden lg:flex lg:w-1/2"></div>
          </div>


          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${step <= currentStep ? "bg-primary text-white" : "bg-gray-300 text-gray-600"
                      }`}
                  >
                    {step < currentStep ? <Check className="w-5 h-5" /> : step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-16 h-1 mx-2 transition-all duration-300 ${step < currentStep ? "bg-primary" : "bg-gray-300"
                        }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-8 text-sm text-foreground/80">
              <span className={currentStep >= 1 ? "text-primary font-semibold" : ""}>Información</span>
              <span className={currentStep >= 2 ? "text-primary font-semibold" : ""}>Pago</span>
              <span className={currentStep >= 3 ? "text-primary font-semibold" : ""}>Confirmación</span>
            </div>
          </div>

          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 order-1 lg:order-2">
              <OrderSummary eventData={eventData} />
            </div>

            <div className="lg:col-span-2 order-2 lg:order-1 flex flex-col gap-6">
              <Card className="bg-white border-gray-200 shadow-lg order-last lg:order-first">
                <CardHeader className="pb-2">
                  <CardTitle className="text-gray-500 font-medium">Resumen del Evento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="relative w-full sm:w-20 h-32 sm:h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={eventData.image_url || "/placeholder.svg?height=200&width=300"}
                        alt={eventData.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <h3 className="text-lg font-bold text-foreground mb-2">{eventData.name}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-foreground/80 text-sm">
                        <span>
                          {eventData.date} {eventData.time && `• ${eventData.time}`}
                        </span>
                        <span>
                          {eventData.location}, {eventData.city}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6 order-first lg:order-last">
                {currentStep === 1 && (
                  <BillingInfoStep
                    billingInfo={billingInfo}
                    setBillingInfo={setBillingInfo}
                    onNext={handleNextStep}
                    disabled={expired}
                  />
                )}

                {currentStep === 2 && (
                  <PaymentInfoStep
                    paymentInfo={paymentInfo}
                    setPaymentInfo={setPaymentInfo}
                    billingInfo={billingInfo}
                    decidirSandbox={decidirSandboxRef.current}
                    onComplete={handlePaymentStepComplete}
                    cuotas={eventData.cuotas || []}
                    cuotas_map={eventData.cuotas_map}
                    disabled={expired}
                  />
                )}

                {currentStep === 3 && (
                  <ConfirmationStep
                    agreements={agreements}
                    setAgreements={setAgreements}
                    onSubmit={handleSubmitPayment}
                    isLoading={isLoading}
                    disabled={expired}
                  />
                )}

                <div className="flex justify-between">
                  <Button
                    onClick={handlePrevStep}
                    variant="outline"
                    className="border-gray-300 text-foreground hover:bg-gray-50 bg-transparent"
                    disabled={currentStep === 1 || expired}
                  >
                    Anterior
                  </Button>

                  {currentStep === 1 && (
                    <Button
                      onClick={handleNextStep}
                      className="bg-primary hover:bg-primary-hover text-white px-8"
                      disabled={expired}
                    >
                      Siguiente
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>

      <AccountVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        billingInfo={billingInfo}
        onSuccess={handleVerificationSuccess}
      />
    </>
  )
}
