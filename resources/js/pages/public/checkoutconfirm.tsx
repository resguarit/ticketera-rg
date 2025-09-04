import { useState } from 'react';
import { formatCreditCardExpiry } from '@/lib/creditCardHelpers';
import { formatPrice, formatPriceWithCurrency, formatNumber } from '@/lib/currencyHelpers';
import { ArrowLeft, CreditCard, Shield, Lock, Calendar, MapPin, Users, Ticket, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Header from '@/components/header';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Mail, KeyRound } from 'lucide-react';

import { Event, EventFunction, Organizer } from '@/types';

// Tipos de datos que llegan del backend
interface SelectedTicket {
    id: number;
    type: string;
    price: number;
    quantity: number;
    description: string;
}

interface EventData extends Event {
    date: string;
    time: string;
    location: string;
    city: string;
    province?: string;
    full_address?: string;
    selectedTickets: SelectedTicket[];
    function?: EventFunction;
    organizer?: Organizer;
    tax?: number; // <-- AÑADIR ESTO
}

interface CheckoutConfirmProps {
    eventData: EventData;
    eventId: number;
}

const paymentMethods = [
    {
        id: "credit",
        name: "Tarjeta de Crédito",
        icon: CreditCard,
        description: "Visa, Mastercard, American Express",
        color: "from-blue-500 to-cyan-500",
    },
    {
        id: "debit",
        name: "Tarjeta de Débito",
        icon: CreditCard,
        description: "Débito inmediato",
        color: "from-green-500 to-emerald-500",
    },
    {
        id: "mercadopago",
        name: "MercadoPago",
        icon: CreditCard,
        description: "Pago con MercadoPago",
        color: "from-cyan-500 to-blue-500",
    },
];

export default function CheckoutConfirm({ eventData, eventId }: CheckoutConfirmProps) {
    const { auth } = usePage<SharedData>().props;
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showCVV, setShowCVV] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof typeof billingInfo, string>>>({});

    // --- NUEVO: Estados para el modal de verificación ---
    const [isVerificationModalOpen, setVerificationModalOpen] = useState(false);
    const [verificationStep, setVerificationStep] = useState<'prompt' | 'code'>('prompt');
    const [verificationCode, setVerificationCode] = useState('');
    // --- FIN NUEVO ---

    const [billingInfo, setBillingInfo] = useState({
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
    });

    const [paymentInfo, setPaymentInfo] = useState({
        method: "credit",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardName: "",
        installments: "1",
    });

    const [agreements, setAgreements] = useState({
        terms: false,
        privacy: false,
        marketing: false,
    });

    const getTotalPrice = () => {
        return eventData.selectedTickets.reduce((total, ticket) => total + ticket.price * ticket.quantity, 0);
    };

    const getTotalTickets = () => {
        return eventData.selectedTickets.reduce((total, ticket) => total + ticket.quantity, 0);
    };

    const getServiceFeeDetails = () => {
        const taxRate = eventData.tax ? eventData.tax / 100 : 0;
        const fee = getTotalPrice() * taxRate;
        return { fee, taxRate };
    };

    const serviceFeeDetails = getServiceFeeDetails();

    const getFinalTotal = () => {
        return getTotalPrice() + serviceFeeDetails.fee;
    };

    const handleNextStep = () => {
        // --- MODIFICADO: Validación de campos con feedback visual ---
        if (currentStep === 1) {
            const newErrors: Partial<Record<keyof typeof billingInfo, string>> = {};
            if (!billingInfo.firstName) newErrors.firstName = 'El nombre es obligatorio.';
            if (!billingInfo.lastName) newErrors.lastName = 'El apellido es obligatorio.';
            if (!billingInfo.email) {
                newErrors.email = 'El email es obligatorio.';
            } else if (!/\S+@\S+\.\S+/.test(billingInfo.email)) {
                newErrors.email = 'El formato del email no es válido.';
            }
            if (!billingInfo.phone) newErrors.phone = 'El teléfono es obligatorio.';
            if (!billingInfo.documentNumber) newErrors.documentNumber = 'El número de documento es obligatorio.';

            setErrors(newErrors);

            if (Object.keys(newErrors).length > 0) {
                return; // Detener si hay errores
            }

            // Si la validación es exitosa, limpiar errores y continuar
            setErrors({});
            if (!auth.user) {
                setVerificationStep('prompt'); // Reiniciar el modal al estado inicial
                setVerificationModalOpen(true);
            } else {
                setCurrentStep(currentStep + 1);
            }
        } else if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
        // --- FIN MODIFICADO ---
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // --- NUEVO: Manejadores para el modal de verificación ---
    const handleConfirmEmail = () => {
        // Simula el envío de un email y pasa al paso de introducir el código
        setVerificationStep('code');
    };

    const handleVerifyCode = () => {
        // Simula la validación del código. Como es hardcodeado, cualquier valor es válido.
        if (!verificationCode) {
            alert('Por favor, introduce el código de verificación.');
            return;
        }
        // Cierra el modal y avanza al siguiente paso (pago)
        setVerificationModalOpen(false);
        setCurrentStep(2);
    };
    // --- FIN NUEVO ---

    const handleSubmitPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!agreements.terms || !agreements.privacy) {
            alert("Debes aceptar los términos y condiciones y la política de privacidad");
            return;
        }

        setIsLoading(true);

        // Enviar datos al backend incluyendo información de la función
        const formData = {
            event_id: eventId,
            function_id: eventData.function?.id,
            billing_info: billingInfo,
            payment_info: paymentInfo,
            selected_tickets: eventData.selectedTickets,
            agreements: agreements,
        };

        try {
            router.post(route('checkout.process'), formData as any);
        } catch (error) {
            console.error('Error procesando el pago:', error);
            setIsLoading(false);
            alert('Error procesando el pago. Por favor intenta de nuevo.');
        }
    };

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || "";
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(" ");
        } else {
            return v;
        }
    };

    return (
        <>
            <Head title="Confirmar Compra - TicketMax" />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-200 to-background">
                <Header />

                <div className="container mx-auto px-4 py-8">
                    {/* Back Button */}
                    <div className="mb-6">
                        <Link href={route('event.detail', eventId)}>
                            <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Volver al Evento
                            </Button>
                        </Link>
                    </div>

                    {/* Progress Steps */}
                    <div className="mb-8">
                        <div className="flex items-center justify-center space-x-4 mb-4">
                            {[1, 2, 3].map((step) => (
                                <div key={step} className="flex items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                                            step <= currentStep
                                                ? "bg-primary text-white"
                                                : "bg-gray-300 text-gray-600"
                                        }`}
                                    >
                                        {step < currentStep ? <Check className="w-5 h-5" /> : step}
                                    </div>
                                    {step < 3 && (
                                        <div
                                            className={`w-16 h-1 mx-2 transition-all duration-300 ${
                                                step < currentStep ? "bg-primary" : "bg-gray-300"
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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Event Summary */}
                            <Card className="bg-white border-gray-200 shadow-lg gap-2">
                                <CardHeader>
                                    <CardTitle className="text-foreground flex items-center space-x-3">
                                        <Ticket className="w-6 h-6 text-primary" />
                                        <span>Resumen del Evento</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center space-x-4">
                                        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                            <img
                                                src={eventData.image_url || "/placeholder.svg?height=200&width=300"}
                                                alt={eventData.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-foreground mb-2">{eventData.name}</h3>
                                            {/* Mostrar información de la función si existe */}
                                            {eventData.function && (
                                                <div className="mb-2">
                                                    <Badge variant="outline" className="bg-blue-50 border-blue-300 text-blue-700">
                                                        {eventData.function.name}
                                                    </Badge>
                                                    {eventData.function.description && (
                                                        <p className="text-foreground/60 text-xs mt-1">{eventData.function.description}</p>
                                                    )}
                                                </div>
                                            )}
                                            <div className="flex items-center space-x-4 text-foreground/80 text-sm">
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="w-4 h-4 text-primary" />
                                                    <span>
                                                        {eventData.date} {eventData.time && `• ${eventData.time}`}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <MapPin className="w-4 h-4 text-pink-500" />
                                                    <span>
                                                        {eventData.location}, {eventData.city}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Step 1: Billing Information */}
                            {currentStep === 1 && (
                                <Card className="bg-white border-gray-200 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="text-foreground text-xl">Información de Facturación</CardTitle>
                                        <p className="text-foreground/80">Completa tus datos para la facturación</p>
                                    </CardHeader>
                                    <CardContent>
                                        <form className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="firstName" className="text-foreground">
                                                        Nombre *
                                                    </Label>
                                                    <Input
                                                        id="firstName"
                                                        value={billingInfo.firstName}
                                                        onChange={(e) => setBillingInfo((prev) => ({ ...prev, firstName: e.target.value }))}
                                                        className={`bg-white border-gray-300 text-foreground placeholder:text-gray-400 ${errors.firstName ? 'border-red-500' : ''}`}

                                                        placeholder="Tu nombre"
                                                        required
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
                                                        onChange={(e) => setBillingInfo((prev) => ({ ...prev, lastName: e.target.value }))}
                                                        className={`bg-white border-gray-300 text-foreground placeholder:text-gray-400 ${errors.lastName ? 'border-red-500' : ''}`}

                                                        placeholder="Tu apellido"
                                                        required
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
                                                        onChange={(e) => setBillingInfo((prev) => ({ ...prev, email: e.target.value }))}
                                                        className={`bg-white border-gray-300 text-foreground placeholder:text-gray-400 ${errors.email ? 'border-red-500' : ''}`}

                                                        placeholder="tu@email.com"
                                                        required
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
                                                        onChange={(e) => setBillingInfo((prev) => ({ ...prev, phone: e.target.value }))}
                                                        className={`bg-white border-gray-300 text-foreground placeholder:text-gray-400 ${errors.phone ? 'border-red-500' : ''}`}

                                                        placeholder="+54 11 1234-5678"
                                                        required
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
                                                        onValueChange={(value) => setBillingInfo((prev) => ({ ...prev, documentType: value }))}
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
                                                        onChange={(e) => setBillingInfo((prev) => ({ ...prev, documentNumber: e.target.value }))}
                                                        className={`bg-white border-gray-300 text-foreground placeholder:text-gray-400 ${errors.documentNumber ? 'border-red-500' : ''}`}

                                                        placeholder="12345678"
                                                        required
                                                    />
                                                    {errors.documentNumber && <p className="text-red-500 text-xs mt-1">{errors.documentNumber}</p>}
                                                </div>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Step 2: Payment Method */}
                            {currentStep === 2 && (
                                <Card className="bg-white border-gray-200 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="text-foreground text-xl">Método de Pago</CardTitle>
                                        <p className="text-foreground/80">Selecciona tu método de pago preferido</p>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <RadioGroup
                                            value={paymentInfo.method}
                                            onValueChange={(value) => setPaymentInfo((prev) => ({ ...prev, method: value }))}
                                        >
                                            {paymentMethods.map((method) => (
                                                <div key={method.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                    <RadioGroupItem value={method.id} id={method.id} />
                                                    <div
                                                        className={`w-10 h-10 bg-gradient-to-r ${method.color} rounded-lg flex items-center justify-center`}
                                                    >
                                                        <method.icon className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <Label htmlFor={method.id} className="text-foreground font-medium cursor-pointer">
                                                            {method.name}
                                                        </Label>
                                                        <p className="text-foreground/60 text-sm">{method.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </RadioGroup>

                                        {(paymentInfo.method === "credit" || paymentInfo.method === "debit") && (
                                            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="space-y-2">
                                                    <Label htmlFor="cardName" className="text-foreground">
                                                        Nombre en la Tarjeta *
                                                    </Label>
                                                    <Input
                                                        id="cardName"
                                                        value={paymentInfo.cardName}
                                                        onChange={(e) => setPaymentInfo((prev) => ({ ...prev, cardName: e.target.value }))}
                                                        className="bg-white border-gray-300 text-foreground placeholder:text-gray-400"
                                                        placeholder="Nombre como aparece en la tarjeta"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="cardNumber" className="text-foreground">
                                                        Número de Tarjeta *
                                                    </Label>
                                                    <Input
                                                        id="cardNumber"
                                                        value={paymentInfo.cardNumber}
                                                        onChange={(e) =>
                                                            setPaymentInfo((prev) => ({ ...prev, cardNumber: formatCardNumber(e.target.value) }))
                                                        }
                                                        className="bg-white border-gray-300 text-foreground placeholder:text-gray-400"
                                                        placeholder="1234 5678 9012 3456"
                                                        maxLength={19}
                                                        required
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="expiryDate" className="text-foreground">
                                                            Fecha de Vencimiento *
                                                        </Label>
                                                        <Input
                                                            id="expiryDate"
                                                            value={paymentInfo.expiryDate}
                                                            onChange={(e) =>
                                                                setPaymentInfo((prev) => ({ ...prev, expiryDate: formatCreditCardExpiry(e.target.value) }))
                                                            }
                                                            className="bg-white border-gray-300 text-foreground placeholder:text-gray-400"
                                                            placeholder="MM/AA"
                                                            maxLength={5}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="cvv" className="text-foreground">
                                                            CVV *
                                                        </Label>
                                                        <div className="relative">
                                                            <Input
                                                                id="cvv"
                                                                type={showCVV ? "text" : "password"}
                                                                value={paymentInfo.cvv}
                                                                onChange={(e) => setPaymentInfo((prev) => ({ ...prev, cvv: e.target.value }))}
                                                                className="bg-white border-gray-300 text-foreground placeholder:text-gray-400 pr-10"
                                                                placeholder="123"
                                                                maxLength={4}
                                                                required
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowCVV(!showCVV)}
                                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-foreground"
                                                            >
                                                                {showCVV ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Step 3: Confirmation */}
                            {currentStep === 3 && (
                                <Card className="bg-white border-gray-200 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="text-foreground text-xl">Confirmación de Compra</CardTitle>
                                        <p className="text-foreground/80">Revisa tu información antes de confirmar</p>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="terms"
                                                    checked={agreements.terms}
                                                    onCheckedChange={(checked) => setAgreements((prev) => ({ ...prev, terms: checked as boolean }))}
                                                />
                                                <Label htmlFor="terms" className="text-foreground text-sm">
                                                    Acepto los{" "}
                                                    <Link href='/terms' className="text-primary hover:text-primary-hover underline">
                                                        términos y condiciones
                                                    </Link>{" "}
                                                    *
                                                </Label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="privacy"
                                                    checked={agreements.privacy}
                                                    onCheckedChange={(checked) =>
                                                        setAgreements((prev) => ({ ...prev, privacy: checked as boolean }))
                                                    }
                                                />
                                                <Label htmlFor="privacy" className="text-foreground text-sm">
                                                    Acepto la{" "}
                                                    <Link href='/privacy' className="text-primary hover:text-primary-hover underline">
                                                        política de privacidad
                                                    </Link>{" "}
                                                    *
                                                </Label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="marketing"
                                                    checked={agreements.marketing}
                                                    onCheckedChange={(checked) =>
                                                        setAgreements((prev) => ({ ...prev, marketing: checked as boolean }))
                                                    }
                                                />
                                                <Label htmlFor="marketing" className="text-foreground text-sm">
                                                    Quiero recibir ofertas y promociones por email
                                                </Label>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                            <div className="flex items-center space-x-2 text-primary mb-2">
                                                <AlertCircle className="w-5 h-5" />
                                                <span className="font-semibold">Información Importante</span>
                                            </div>
                                            <ul className="text-foreground/80 text-sm space-y-1">
                                                <li>• Los tickets serán enviados a tu email después del pago</li>
                                                <li>• Puedes cancelar hasta 24 horas antes del evento</li>
                                                <li>• Los tickets son intransferibles sin autorización</li>
                                                <li>• Guarda tu código QR para el acceso al evento</li>
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between">
                                <Button
                                    onClick={handlePrevStep}
                                    variant="outline"
                                    className="border-gray-300 text-foreground hover:bg-gray-50"
                                    disabled={currentStep === 1}
                                >
                                    Anterior
                                </Button>

                                {currentStep < 3 ? (
                                    <Button
                                        onClick={handleNextStep}
                                        className="bg-primary hover:bg-primary-hover text-white px-8"
                                    >
                                        Siguiente
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleSubmitPayment}
                                        disabled={isLoading || !agreements.terms || !agreements.privacy}
                                        className="bg-green-500 hover:bg-green-600 text-white px-8"
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
                                )}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <Card className="bg-white border-gray-200 shadow-lg sticky top-24">
                                <CardHeader>
                                    <CardTitle className="text-foreground flex items-center space-x-2">
                                        <Users className="w-5 h-5 text-primary" />
                                        <span>Resumen de Compra</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {eventData.selectedTickets.map((ticket) => (
                                        <div key={ticket.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex-1">
                                                <h4 className="text-foreground font-semibold">{ticket.type}</h4>
                                                <p className="text-foreground/60 text-sm">{ticket.description}</p>
                                                <p className="text-foreground/80 text-sm">Cantidad: {ticket.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-foreground font-bold">{formatNumber(ticket.price * ticket.quantity)}</p>
                                                <p className="text-foreground/60 text-sm">{formatPrice(ticket.price)} c/u</p>
                                            </div>
                                        </div>
                                    ))}

                                    <Separator className="bg-gray-200" />

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-foreground/80">
                                            <span>Subtotal ({getTotalTickets()} tickets)</span>
                                            <span>{formatPrice(getTotalPrice())}</span>
                                        </div>
                                        <div className="flex justify-between text-foreground/80">
                                            <span>Cargo por servicio ({ (serviceFeeDetails.taxRate * 100).toFixed(0) }%)</span>
                                            <span>{formatPrice(serviceFeeDetails.fee)}</span>
                                        </div>
                                        <Separator className="bg-gray-200" />
                                        <div className="flex justify-between text-foreground text-xl font-bold">
                                            <span>Total</span>
                                            <span>{formatPriceWithCurrency(getFinalTotal())}</span>
                                        </div>
                                    </div>

                                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                                        <div className="flex items-center space-x-2 text-green-600 mb-1">
                                            <Shield className="w-4 h-4" />
                                            <span className="text-sm font-semibold">Compra Protegida</span>
                                        </div>
                                        <p className="text-foreground/80 text-xs">
                                            Tu compra está protegida por nuestra garantía de satisfacción
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- NUEVO: Modal de Verificación de Email --- */}
            <Dialog open={isVerificationModalOpen} onOpenChange={setVerificationModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirmar Email</DialogTitle>
                        <DialogDescription>
                            {verificationStep === 'prompt'
                                ? 'Para continuar, necesitamos verificar tu dirección de email. La compra quedará asociada a esta dirección.'
                                : 'Hemos enviado un código a tu email. Introdúcelo a continuación para validar tu cuenta.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {verificationStep === 'prompt' ? (
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Se asociará la compra a:</p>
                                <p className="font-semibold text-lg">{billingInfo.email}</p>
                            </div>
                        ) : (
                            <div>
                                <Label htmlFor="verification-code">Código de Verificación</Label>
                                <Input
                                    id="verification-code"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    placeholder="Escribe cualquier código para continuar"
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        {verificationStep === 'prompt' ? (
                            <Button onClick={handleConfirmEmail} className="w-full">
                                <Mail className="mr-2 h-4 w-4" /> Confirmar Email
                            </Button>
                        ) : (
                            <Button onClick={handleVerifyCode} className="w-full">
                                <KeyRound className="mr-2 h-4 w-4" /> Validar y Continuar
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* --- FIN NUEVO --- */}
        </>
    );
}