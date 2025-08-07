import { useState, useEffect } from 'react';
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
import { Head, Link, router } from '@inertiajs/react';

// Mock data - esto vendría del backend
const mockEventData = {
    id: 1,
    title: "Festival de Música Electrónica 2024",
    image: "/placeholder.svg?height=200&width=300",
    date: "15 Mar 2024",
    time: "20:00",
    location: "Estadio Nacional",
    city: "Buenos Aires",
    selectedTickets: [
        {
            id: 1,
            type: "General",
            price: 8500,
            quantity: 2,
            description: "Acceso general al festival",
        },
        {
            id: 2,
            type: "VIP",
            price: 15000,
            quantity: 1,
            description: "Acceso VIP con área exclusiva",
        },
    ],
};

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

interface CheckoutConfirmProps {
    eventId?: string;
}

export default function CheckoutConfirm({ eventId }: CheckoutConfirmProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showCVV, setShowCVV] = useState(false);

    const [billingInfo, setBillingInfo] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        documentType: "DNI",
        documentNumber: "",
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
        return mockEventData.selectedTickets.reduce((total, ticket) => total + ticket.price * ticket.quantity, 0);
    };

    const getTotalTickets = () => {
        return mockEventData.selectedTickets.reduce((total, ticket) => total + ticket.quantity, 0);
    };

    const getServiceFee = () => {
        return Math.round(getTotalPrice() * 0.05); // 5% service fee
    };

    const getFinalTotal = () => {
        return getTotalPrice() + getServiceFee();
    };

    const handleNextStep = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmitPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreements.terms || !agreements.privacy) {
            alert("Debes aceptar los términos y condiciones y la política de privacidad");
            return;
        }

        setIsLoading(true);
        // Simulate payment processing
        setTimeout(() => {
            setIsLoading(false);
            router.visit(route('checkout.success'));
        }, 3000);
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

    const formatExpiryDate = (value: string) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        if (v.length >= 2) {
            return v.substring(0, 2) + "/" + v.substring(2, 4);
        }
        return v;
    };

    return (
        <>
            <Head title="Confirmar Compra - TicketMax" />
            
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <Header />

                <div className="container mx-auto px-4 py-8">
                    {/* Back Button */}
                    <div className="mb-6">
                        <Link href={route('event.detail', eventId || mockEventData.id)}>
                            <Button variant="ghost" size="sm" className="text-white hover:text-cyan-400">
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
                                                ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                                                : "bg-white/20 text-white/60"
                                        }`}
                                    >
                                        {step < currentStep ? <Check className="w-5 h-5" /> : step}
                                    </div>
                                    {step < 3 && (
                                        <div
                                            className={`w-16 h-1 mx-2 transition-all duration-300 ${
                                                step < currentStep ? "bg-gradient-to-r from-cyan-500 to-purple-500" : "bg-white/20"
                                            }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center space-x-8 text-sm text-white/80">
                            <span className={currentStep >= 1 ? "text-cyan-400" : ""}>Información</span>
                            <span className={currentStep >= 2 ? "text-cyan-400" : ""}>Pago</span>
                            <span className={currentStep >= 3 ? "text-cyan-400" : ""}>Confirmación</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Event Summary */}
                            <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center space-x-3">
                                        <Ticket className="w-6 h-6 text-cyan-400" />
                                        <span>Resumen del Evento</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center space-x-4">
                                        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                            <img
                                                src={mockEventData.image}
                                                alt={mockEventData.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-white mb-2">{mockEventData.title}</h3>
                                            <div className="flex items-center space-x-4 text-white/80 text-sm">
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>
                                                        {mockEventData.date} • {mockEventData.time}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>
                                                        {mockEventData.location}, {mockEventData.city}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Step 1: Billing Information */}
                            {currentStep === 1 && (
                                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                    <CardHeader>
                                        <CardTitle className="text-white text-xl">Información de Facturación</CardTitle>
                                        <p className="text-white/80">Completa tus datos para la facturación</p>
                                    </CardHeader>
                                    <CardContent>
                                        <form className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="firstName" className="text-white">
                                                        Nombre *
                                                    </Label>
                                                    <Input
                                                        id="firstName"
                                                        value={billingInfo.firstName}
                                                        onChange={(e) => setBillingInfo((prev) => ({ ...prev, firstName: e.target.value }))}
                                                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                                                        placeholder="Tu nombre"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="lastName" className="text-white">
                                                        Apellido *
                                                    </Label>
                                                    <Input
                                                        id="lastName"
                                                        value={billingInfo.lastName}
                                                        onChange={(e) => setBillingInfo((prev) => ({ ...prev, lastName: e.target.value }))}
                                                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                                                        placeholder="Tu apellido"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="email" className="text-white">
                                                        Email *
                                                    </Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={billingInfo.email}
                                                        onChange={(e) => setBillingInfo((prev) => ({ ...prev, email: e.target.value }))}
                                                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                                                        placeholder="tu@email.com"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone" className="text-white">
                                                        Teléfono *
                                                    </Label>
                                                    <Input
                                                        id="phone"
                                                        value={billingInfo.phone}
                                                        onChange={(e) => setBillingInfo((prev) => ({ ...prev, phone: e.target.value }))}
                                                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                                                        placeholder="+54 11 1234-5678"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="documentType" className="text-white">
                                                        Tipo de Documento *
                                                    </Label>
                                                    <Select
                                                        value={billingInfo.documentType}
                                                        onValueChange={(value) => setBillingInfo((prev) => ({ ...prev, documentType: value }))}
                                                    >
                                                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="DNI">DNI</SelectItem>
                                                            <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                                                            <SelectItem value="Cedula">Cédula</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="documentNumber" className="text-white">
                                                        Número de Documento *
                                                    </Label>
                                                    <Input
                                                        id="documentNumber"
                                                        value={billingInfo.documentNumber}
                                                        onChange={(e) => setBillingInfo((prev) => ({ ...prev, documentNumber: e.target.value }))}
                                                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                                                        placeholder="12345678"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Step 2: Payment Method */}
                            {currentStep === 2 && (
                                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                    <CardHeader>
                                        <CardTitle className="text-white text-xl">Método de Pago</CardTitle>
                                        <p className="text-white/80">Selecciona tu método de pago preferido</p>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <RadioGroup
                                            value={paymentInfo.method}
                                            onValueChange={(value) => setPaymentInfo((prev) => ({ ...prev, method: value }))}
                                        >
                                            {paymentMethods.map((method) => (
                                                <div key={method.id} className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg">
                                                    <RadioGroupItem value={method.id} id={method.id} />
                                                    <div
                                                        className={`w-10 h-10 bg-gradient-to-r ${method.color} rounded-lg flex items-center justify-center`}
                                                    >
                                                        <method.icon className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <Label htmlFor={method.id} className="text-white font-medium cursor-pointer">
                                                            {method.name}
                                                        </Label>
                                                        <p className="text-white/60 text-sm">{method.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </RadioGroup>

                                        {(paymentInfo.method === "credit" || paymentInfo.method === "debit") && (
                                            <div className="space-y-4 p-4 bg-white/5 rounded-lg">
                                                <div className="space-y-2">
                                                    <Label htmlFor="cardName" className="text-white">
                                                        Nombre en la Tarjeta *
                                                    </Label>
                                                    <Input
                                                        id="cardName"
                                                        value={paymentInfo.cardName}
                                                        onChange={(e) => setPaymentInfo((prev) => ({ ...prev, cardName: e.target.value }))}
                                                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                                                        placeholder="Nombre como aparece en la tarjeta"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="cardNumber" className="text-white">
                                                        Número de Tarjeta *
                                                    </Label>
                                                    <Input
                                                        id="cardNumber"
                                                        value={paymentInfo.cardNumber}
                                                        onChange={(e) =>
                                                            setPaymentInfo((prev) => ({ ...prev, cardNumber: formatCardNumber(e.target.value) }))
                                                        }
                                                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                                                        placeholder="1234 5678 9012 3456"
                                                        maxLength={19}
                                                        required
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="expiryDate" className="text-white">
                                                            Fecha de Vencimiento *
                                                        </Label>
                                                        <Input
                                                            id="expiryDate"
                                                            value={paymentInfo.expiryDate}
                                                            onChange={(e) =>
                                                                setPaymentInfo((prev) => ({ ...prev, expiryDate: formatExpiryDate(e.target.value) }))
                                                            }
                                                            className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                                                            placeholder="MM/AA"
                                                            maxLength={5}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="cvv" className="text-white">
                                                            CVV *
                                                        </Label>
                                                        <div className="relative">
                                                            <Input
                                                                id="cvv"
                                                                type={showCVV ? "text" : "password"}
                                                                value={paymentInfo.cvv}
                                                                onChange={(e) => setPaymentInfo((prev) => ({ ...prev, cvv: e.target.value }))}
                                                                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 pr-10"
                                                                placeholder="123"
                                                                maxLength={4}
                                                                required
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowCVV(!showCVV)}
                                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
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
                                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                    <CardHeader>
                                        <CardTitle className="text-white text-xl">Confirmación de Compra</CardTitle>
                                        <p className="text-white/80">Revisa tu información antes de confirmar</p>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="terms"
                                                    checked={agreements.terms}
                                                    onCheckedChange={(checked) => setAgreements((prev) => ({ ...prev, terms: checked as boolean }))}
                                                />
                                                <Label htmlFor="terms" className="text-white text-sm">
                                                    Acepto los{" "}
                                                    <Link href='/terms' className="text-cyan-400 hover:text-cyan-300 underline">
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
                                                <Label htmlFor="privacy" className="text-white text-sm">
                                                    Acepto la{" "}
                                                    <Link href='/privacy' className="text-cyan-400 hover:text-cyan-300 underline">
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
                                                <Label htmlFor="marketing" className="text-white text-sm">
                                                    Quiero recibir ofertas y promociones por email
                                                </Label>
                                            </div>
                                        </div>

                                        <div className="bg-white/5 rounded-lg p-4">
                                            <div className="flex items-center space-x-2 text-cyan-400 mb-2">
                                                <AlertCircle className="w-5 h-5" />
                                                <span className="font-semibold">Información Importante</span>
                                            </div>
                                            <ul className="text-white/80 text-sm space-y-1">
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
                                    className="border-white/30 text-white hover:bg-white/20 bg-transparent"
                                    disabled={currentStep === 1}
                                >
                                    Anterior
                                </Button>

                                {currentStep < 3 ? (
                                    <Button
                                        onClick={handleNextStep}
                                        className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8"
                                    >
                                        Siguiente
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleSubmitPayment}
                                        disabled={isLoading || !agreements.terms || !agreements.privacy}
                                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8"
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
                            <Card className="bg-white/10 backdrop-blur-md border-white/20 sticky top-24">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center space-x-2">
                                        <Users className="w-5 h-5 text-cyan-400" />
                                        <span>Resumen de Compra</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {mockEventData.selectedTickets.map((ticket) => (
                                        <div key={ticket.id} className="flex justify-between items-start p-3 bg-white/5 rounded-lg">
                                            <div className="flex-1">
                                                <h4 className="text-white font-semibold">{ticket.type}</h4>
                                                <p className="text-white/60 text-sm">{ticket.description}</p>
                                                <p className="text-white/80 text-sm">Cantidad: {ticket.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white font-bold">${(ticket.price * ticket.quantity).toLocaleString()}</p>
                                                <p className="text-white/60 text-sm">${ticket.price.toLocaleString()} c/u</p>
                                            </div>
                                        </div>
                                    ))}

                                    <Separator className="bg-white/20" />

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-white/80">
                                            <span>Subtotal ({getTotalTickets()} tickets)</span>
                                            <span>${getTotalPrice().toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-white/80">
                                            <span>Cargo por servicio</span>
                                            <span>${getServiceFee().toLocaleString()}</span>
                                        </div>
                                        <Separator className="bg-white/20" />
                                        <div className="flex justify-between text-white text-xl font-bold">
                                            <span>Total</span>
                                            <span>${getFinalTotal().toLocaleString()} ARS</span>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-3 border border-green-500/30">
                                        <div className="flex items-center space-x-2 text-green-400 mb-1">
                                            <Shield className="w-4 h-4" />
                                            <span className="text-sm font-semibold">Compra Protegida</span>
                                        </div>
                                        <p className="text-white/80 text-xs">
                                            Tu compra está protegida por nuestra garantía de satisfacción
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}