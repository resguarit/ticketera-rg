import { useEffect, useState } from 'react';
import { Check, Download, Share2, Calendar, MapPin, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/header';
import { Head, Link } from '@inertiajs/react';

const mockPurchaseData = {
    orderId: "TM-2024-001234",
    event: {
        title: "Festival de Música Electrónica 2024",
        image: "/placeholder.svg?height=200&width=300",
        date: "15 Mar 2024",
        time: "20:00",
        location: "Estadio Nacional",
        city: "Buenos Aires",
    },
    tickets: [
        { type: "General", quantity: 2, price: 8500 },
        { type: "VIP", quantity: 1, price: 15000 },
    ],
    total: 32600,
    purchaseDate: new Date().toLocaleDateString(),
};

export default function CheckoutSuccess() {
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <Head title="¡Compra Exitosa! - TicketMax" />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-200 to-secondary relative overflow-hidden">
                {/* Confetti Effect */}
                {showConfetti && (
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(50)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-2 bg-gradient-to-r from-primary to-blue-500 rounded-full animate-bounce"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    animationDuration: `${2 + Math.random() * 2}s`,
                                }}
                            />
                        ))}
                    </div>
                )}

                <Header />

                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-2xl mx-auto">
                        {/* Success Message */}
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                <Check className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mb-4">
                                ¡Compra Exitosa!
                            </h1>
                            <p className="text-foreground/80 text-lg">
                                Tu compra ha sido procesada correctamente. Recibirás un email de confirmación en breve.
                            </p>
                        </div>

                        {/* Order Details */}
                        <Card className="bg-white border-gray-200 shadow-lg mb-6">
                            <CardHeader>
                                <CardTitle className="text-foreground flex items-center justify-between">
                                    <span>Detalles de la Compra</span>
                                    <Badge className="bg-green-500 text-white border-0">
                                        Confirmado
                                    </Badge>
                                </CardTitle>
                                <p className="text-foreground/60">Orden #{mockPurchaseData.orderId}</p>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Event Info */}
                                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src={mockPurchaseData.event.image}
                                            alt={mockPurchaseData.event.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-foreground mb-1">{mockPurchaseData.event.title}</h3>
                                        <div className="flex items-center space-x-4 text-foreground/80 text-sm">
                                            <div className="flex items-center space-x-1">
                                                <Calendar className="w-4 h-4 text-primary" />
                                                <span>
                                                    {mockPurchaseData.event.date} • {mockPurchaseData.event.time}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <MapPin className="w-4 h-4 text-pink-500" />
                                                <span>
                                                    {mockPurchaseData.event.location}, {mockPurchaseData.event.city}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tickets */}
                                <div className="space-y-3">
                                    <h4 className="text-foreground font-semibold">Tickets Comprados:</h4>
                                    {mockPurchaseData.tickets.map((ticket, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div>
                                                <span className="text-foreground font-medium">{ticket.type}</span>
                                                <span className="text-foreground/60 ml-2">x{ticket.quantity}</span>
                                            </div>
                                            <span className="text-foreground font-bold">
                                                ${(ticket.price * ticket.quantity).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-lg border border-primary/30">
                                        <span className="text-foreground font-bold text-lg">Total Pagado</span>
                                        <span className="text-foreground font-bold text-xl">${mockPurchaseData.total.toLocaleString()} ARS</span>
                                    </div>
                                </div>

                                {/* Purchase Date */}
                                <div className="text-center text-foreground/60 text-sm">
                                    Compra realizada el {mockPurchaseData.purchaseDate}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <Button className="bg-primary hover:bg-primary-hover text-white">
                                <Download className="w-4 h-4 mr-2" />
                                Descargar Tickets
                            </Button>
                            <Button
                                variant="outline"
                                className="border-gray-300 text-foreground hover:bg-gray-50"
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Compartir
                            </Button>
                            <Link href={route('my-tickets')}>
                                <Button
                                    variant="outline"
                                    className="w-full border-gray-300 text-foreground hover:bg-gray-50"
                                >
                                    Ver Mis Tickets
                                </Button>
                            </Link>
                        </div>

                        {/* Important Information */}
                        <Card className="bg-orange-50 border-orange-200 shadow-lg">
                            <CardContent className="p-6">
                                <h4 className="text-foreground font-bold mb-4 flex items-center space-x-2">
                                    <Mail className="w-5 h-5 text-orange-500" />
                                    <span>Información Importante</span>
                                </h4>
                                <ul className="text-foreground/80 space-y-2 text-sm">
                                    <li>• Recibirás un email de confirmación con tus tickets en los próximos minutos</li>
                                    <li>• Guarda el código QR de cada ticket para el acceso al evento</li>
                                    <li>• Llega 30 minutos antes del evento para evitar demoras</li>
                                    <li>• Los tickets son intransferibles sin autorización previa</li>
                                    <li>• Para cancelaciones, contacta al soporte hasta 24hs antes del evento</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Support Contact */}
                        <div className="text-center mt-8">
                            <p className="text-foreground/60 mb-4">¿Tienes alguna pregunta sobre tu compra?</p>
                            <div className="flex justify-center space-x-4">
                                <Link href={route('help')}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-gray-300 text-foreground hover:bg-gray-50"
                                    >
                                        Centro de Ayuda
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-gray-300 text-foreground hover:bg-gray-50"
                                >
                                    <Phone className="w-4 h-4 mr-2" />
                                    Contactar Soporte
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}