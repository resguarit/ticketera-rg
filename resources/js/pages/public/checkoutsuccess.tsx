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
            
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
                {/* Confetti Effect */}
                {showConfetti && (
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(50)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-bounce"
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
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-4">
                                ¡Compra Exitosa!
                            </h1>
                            <p className="text-white/80 text-lg">
                                Tu compra ha sido procesada correctamente. Recibirás un email de confirmación en breve.
                            </p>
                        </div>

                        {/* Order Details */}
                        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center justify-between">
                                    <span>Detalles de la Compra</span>
                                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                                        Confirmado
                                    </Badge>
                                </CardTitle>
                                <p className="text-white/60">Orden #{mockPurchaseData.orderId}</p>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Event Info */}
                                <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src={mockPurchaseData.event.image}
                                            alt={mockPurchaseData.event.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-white mb-1">{mockPurchaseData.event.title}</h3>
                                        <div className="flex items-center space-x-4 text-white/80 text-sm">
                                            <div className="flex items-center space-x-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    {mockPurchaseData.event.date} • {mockPurchaseData.event.time}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <MapPin className="w-4 h-4" />
                                                <span>
                                                    {mockPurchaseData.event.location}, {mockPurchaseData.event.city}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tickets */}
                                <div className="space-y-3">
                                    <h4 className="text-white font-semibold">Tickets Comprados:</h4>
                                    {mockPurchaseData.tickets.map((ticket, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                            <div>
                                                <span className="text-white font-medium">{ticket.type}</span>
                                                <span className="text-white/60 ml-2">x{ticket.quantity}</span>
                                            </div>
                                            <span className="text-white font-bold">
                                                ${(ticket.price * ticket.quantity).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg border border-cyan-500/30">
                                        <span className="text-white font-bold text-lg">Total Pagado</span>
                                        <span className="text-white font-bold text-xl">${mockPurchaseData.total.toLocaleString()} ARS</span>
                                    </div>
                                </div>

                                {/* Purchase Date */}
                                <div className="text-center text-white/60 text-sm">
                                    Compra realizada el {mockPurchaseData.purchaseDate}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white">
                                <Download className="w-4 h-4 mr-2" />
                                Descargar Tickets
                            </Button>
                            <Button
                                variant="outline"
                                className="border-white/30 text-white hover:bg-white/20 bg-transparent"
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Compartir
                            </Button>
                            <Link href={route('my-tickets')}>
                                <Button
                                    variant="outline"
                                    className="w-full border-white/30 text-white hover:bg-white/20 bg-transparent"
                                >
                                    Ver Mis Tickets
                                </Button>
                            </Link>
                        </div>

                        {/* Important Information */}
                        <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md border-orange-500/30">
                            <CardContent className="p-6">
                                <h4 className="text-white font-bold mb-4 flex items-center space-x-2">
                                    <Mail className="w-5 h-5 text-orange-400" />
                                    <span>Información Importante</span>
                                </h4>
                                <ul className="text-white/80 space-y-2 text-sm">
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
                            <p className="text-white/60 mb-4">¿Tienes alguna pregunta sobre tu compra?</p>
                            <div className="flex justify-center space-x-4">
                                <Link href={route('help')}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-white/30 text-white hover:bg-white/20 bg-transparent"
                                    >
                                        Centro de Ayuda
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-white/30 text-white hover:bg-white/20 bg-transparent"
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