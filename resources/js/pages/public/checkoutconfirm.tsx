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
            
            <div className="min-h-screen bg-gradient-to-br from-gray-200 to-secondary">
                <Header />

                <div className="container mx-auto px-4 py-8">
                    {/* Back Button */}
                    <div className="mb-6">
                        <Link href={route('event.detail', eventId || mockEventData.id)}>
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
                            <Card className="bg-white border-gray-200 shadow-lg">
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
                                                src={mockEventData.image}
                                                alt={mockEventData.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-foreground mb-2">{mockEventData.title}</h3>
                                            <div className="flex items-center space-x-4 text-foreground/80 text-sm">
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="w-4 h-4 text-primary" />
                                                    <span>
                                                        {mockEventData.date} • {mockEventData.time}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <MapPin className="w-4 h-4 text-pink-500" />
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
                                                        className="bg-white border-gray-300 text-foreground placeholder:text-gray-400"
                                                        placeholder="Tu nombre"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="lastName" className="text-foreground">
                                                        Apellido *
                                                    </Label>
                                                    <Input
                                                        id="lastName"
                                                        value={billingInfo.lastName}
                                                        onChange={(e) => setBillingInfo((prev) => ({ ...prev, lastName: e.target.value }))}
                                                        className="bg-white border-gray-300 text-foreground placeholder:text-gray-400"
                                                        placeholder="Tu apellido"
                                                        required
                                                    />
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
                                                        className="bg-white border-gray-300 text-foreground placeholder:text-gray-400"
                                                        placeholder="tu@email.com"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone" className="text-foreground">
                                                        Teléfono *
                                                    </Label>
                                                    <Input
                                                        id="phone"
                                                        value={billingInfo.phone}
                                                        onChange={(e) => setBillingInfo((prev) => ({ ...prev, phone: e.target.value }))}
                                                        className="bg-white border-gray-300 text-foreground placeholder:text-gray-400"
                                                        placeholder="+54 11 1234-5678"
                                                        required
                                                    />
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
                                                        className="bg-white border-gray-300 text-foreground placeholder:text-gray-400"
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
                                                                setPaymentInfo((prev) => ({ ...prev, expiryDate: formatExpiryDate(e.target.value) }))
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
                                    {mockEventData.selectedTickets.map((ticket) => (
                                        <div key={ticket.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex-1">
                                                <h4 className="text-foreground font-semibold">{ticket.type}</h4>
                                                <p className="text-foreground/60 text-sm">{ticket.description}</p>
                                                <p className="text-foreground/80 text-sm">Cantidad: {ticket.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-foreground font-bold">${(ticket.price * ticket.quantity).toLocaleString()}</p>
                                                <p className="text-foreground/60 text-sm">${ticket.price.toLocaleString()} c/u</p>
                                            </div>
                                        </div>
                                    ))}

                                    <Separator className="bg-gray-200" />

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-foreground/80">
                                            <span>Subtotal ({getTotalTickets()} tickets)</span>
                                            <span>${getTotalPrice().toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-foreground/80">
                                            <span>Cargo por servicio</span>
                                            <span>${getServiceFee().toLocaleString()}</span>
                                        </div>
                                        <Separator className="bg-gray-200" />
                                        <div className="flex justify-between text-foreground text-xl font-bold">
                                            <span>Total</span>
                                            <span>${getFinalTotal().toLocaleString()} ARS</span>
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
        </>
    );
}