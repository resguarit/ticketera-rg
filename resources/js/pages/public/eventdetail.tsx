import { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Clock, Users, Star, Minus, Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/header';
import { Head, Link } from '@inertiajs/react';

// Mock data - normalmente esto vendría del backend
const eventData = {
    id: 1,
    title: "Festival de Música Electrónica 2024",
    description:
        "El festival de música electrónica más grande de Sudamérica regresa con los mejores DJs internacionales. Una experiencia única con múltiples escenarios, efectos visuales espectaculares y la mejor tecnología de sonido.",
    image: "/placeholder.svg?height=400&width=800",
    date: "15 Mar 2024",
    time: "20:00",
    location: "Estadio Nacional",
    city: "Buenos Aires",
    category: "música",
    rating: 4.8,
    reviews: 1247,
    duration: "8 horas",
    ageRestriction: "18+",
    ticketTypes: [
        {
            id: 1,
            name: "General",
            description: "Acceso general al festival",
            price: 8500,
            available: 150,
            color: "from-blue-500 to-cyan-500",
        },
        {
            id: 2,
            name: "VIP",
            description: "Acceso VIP con área exclusiva y bar premium",
            price: 15000,
            available: 45,
            color: "from-purple-500 to-pink-500",
        },
        {
            id: 3,
            name: "Premium",
            description: "Acceso premium con backstage y meet & greet",
            price: 25000,
            available: 12,
            color: "from-orange-500 to-red-500",
        },
    ],
};

interface EventDetailProps {
    eventId?: string;
}

export default function EventDetail({ eventId }: EventDetailProps) {
    const [selectedTickets, setSelectedTickets] = useState<{ [key: number]: number }>({});
    const [isLoading, setIsLoading] = useState(false);

    const updateTicketQuantity = (ticketId: number, change: number) => {
        setSelectedTickets((prev) => {
            const current = prev[ticketId] || 0;
            const newQuantity = Math.max(0, Math.min(10, current + change));
            if (newQuantity === 0) {
                const { [ticketId]: removed, ...rest } = prev;
                return rest;
            }
            return { ...prev, [ticketId]: newQuantity };
        });
    };

    const getTotalPrice = () => {
        return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
            const ticket = eventData.ticketTypes.find((t) => t.id === Number.parseInt(ticketId));
            return total + (ticket ? ticket.price * quantity : 0);
        }, 0);
    };

    const getTotalTickets = () => {
        return Object.values(selectedTickets).reduce((total, quantity) => total + quantity, 0);
    };

    const handlePurchase = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            // Redirect to payment or show success
        }, 2000);
    };

    return (
        <>
            <Head title={`${eventData.title} - TicketMax`} />
            
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                {/* Header */}
                <Header />

                <div className="container mx-auto px-4 py-8">
                    {/* Back Button */}
                    <div className="mb-6">
                        <Link href={route('events')}>
                            <Button variant="ghost" size="sm" className="text-white hover:text-cyan-400">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Volver a Eventos
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Event Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Hero Image */}
                            <div className="relative h-80 rounded-2xl overflow-hidden">
                                <img 
                                    src={eventData.image} 
                                    alt={eventData.title} 
                                    className="w-full h-full object-cover" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-6 left-6">
                                    <Badge className="mb-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0">
                                        {eventData.category.toUpperCase()}
                                    </Badge>
                                    <h1 className="text-4xl font-bold text-white mb-2">{eventData.title}</h1>
                                    <div className="flex items-center space-x-4 text-white/90">
                                        <div className="flex items-center space-x-1">
                                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                            <span className="font-semibold">{eventData.rating}</span>
                                            <span className="text-sm">({eventData.reviews} reseñas)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Event Info */}
                            <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                <CardHeader>
                                    <CardTitle className="text-white text-2xl">Información del Evento</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-white/80 leading-relaxed">{eventData.description}</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-3 text-white/80">
                                            <Calendar className="w-5 h-5 text-cyan-400" />
                                            <div>
                                                <p className="font-semibold text-white">Fecha</p>
                                                <p>{eventData.date}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 text-white/80">
                                            <Clock className="w-5 h-5 text-purple-400" />
                                            <div>
                                                <p className="font-semibold text-white">Hora</p>
                                                <p>{eventData.time}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 text-white/80">
                                            <MapPin className="w-5 h-5 text-pink-400" />
                                            <div>
                                                <p className="font-semibold text-white">Ubicación</p>
                                                <p>
                                                    {eventData.location}, {eventData.city}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 text-white/80">
                                            <Users className="w-5 h-5 text-orange-400" />
                                            <div>
                                                <p className="font-semibold text-white">Restricción</p>
                                                <p>{eventData.ageRestriction}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Ticket Selection */}
                        <div className="space-y-6">
                            <Card className="bg-white/10 backdrop-blur-md border-white/20 sticky top-24">
                                <CardHeader>
                                    <CardTitle className="text-white text-xl">Seleccionar Entradas</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {eventData.ticketTypes.map((ticket) => (
                                        <div
                                            key={ticket.id}
                                            className={`p-4 rounded-xl bg-gradient-to-r ${ticket.color} bg-opacity-20 border border-white/20`}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-bold text-white text-lg">{ticket.name}</h4>
                                                    <p className="text-white/80 text-sm">{ticket.description}</p>
                                                    <p className="text-white/60 text-xs mt-1">{ticket.available} disponibles</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-white">${ticket.price.toLocaleString()}</p>
                                                    <p className="text-white/60 text-sm">ARS</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => updateTicketQuantity(ticket.id, -1)}
                                                        disabled={!selectedTickets[ticket.id]}
                                                        className="w-8 h-8 p-0 border-white/30 text-white hover:bg-white/20"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </Button>
                                                    <span className="text-white font-semibold w-8 text-center">
                                                        {selectedTickets[ticket.id] || 0}
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => updateTicketQuantity(ticket.id, 1)}
                                                        disabled={(selectedTickets[ticket.id] || 0) >= Math.min(10, ticket.available)}
                                                        className="w-8 h-8 p-0 border-white/30 text-white hover:bg-white/20"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {getTotalTickets() > 0 && (
                                        <>
                                            <Separator className="bg-white/20" />
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-white">
                                                    <span>Total de entradas:</span>
                                                    <span className="font-semibold">{getTotalTickets()}</span>
                                                </div>
                                                <div className="flex justify-between text-white text-xl font-bold">
                                                    <span>Total:</span>
                                                    <span>${getTotalPrice().toLocaleString()} ARS</span>
                                                </div>
                                                <Button
                                                    onClick={handlePurchase}
                                                    disabled={isLoading}
                                                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white py-3 text-lg font-semibold rounded-xl transform hover:scale-105 transition-all duration-200"
                                                >
                                                    {isLoading ? (
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            <span>Procesando...</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center space-x-2">
                                                            <ShoppingCart className="w-5 h-5" />
                                                            <span>Comprar Entradas</span>
                                                        </div>
                                                    )}
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}