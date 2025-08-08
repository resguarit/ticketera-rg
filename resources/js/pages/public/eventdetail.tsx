import { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Clock, Users, Star, Minus, Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/header';
import { Head, Link, router } from '@inertiajs/react';

interface TicketType {
    id: number;
    name: string;
    description: string;
    price: number;
    available: number;
    color?: string;
}

interface EventData {
    id: number;
    title: string;
    description: string;
    image: string;
    date: string;
    time: string;
    location: string;
    city: string;
    category: string;
    rating: number;
    reviews: number;
    duration: string;
    ageRestriction: string;
    ticketTypes: TicketType[];
}

interface EventDetailProps {
    eventData: EventData;
}

export default function EventDetail({ eventData }: EventDetailProps) {
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
        if (getTotalTickets() === 0) {
            alert('Por favor selecciona al menos una entrada');
            return;
        }

        setIsLoading(true);
        // Simulate redirection to checkout
        setTimeout(() => {
            setIsLoading(false);
            router.visit(route('checkout.confirm', eventData.id));
        }, 1000);
    };

    return (
        <>
            <Head title={`${eventData.title} - TicketMax`} />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-200 to-secondary">
                {/* Header */}
                <Header />

                <div className="container mx-auto px-4 py-8">
                    {/* Back Button */}
                    <div className="mb-6">
                        <Link href={route('events')}>
                            <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Volver a Eventos
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Event Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Hero Image */}
                            <div className="relative h-80 rounded-2xl overflow-hidden shadow-lg">
                                <img 
                                    src={eventData.image} 
                                    alt={eventData.title} 
                                    className="w-full h-full object-cover" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-6 left-6">
                                    <Badge className="mb-2 bg-primary text-white border-0">
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
                            <Card className="bg-white border-gray-200 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-foreground text-2xl">Información del Evento</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-foreground/80 leading-relaxed">{eventData.description}</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-3 text-foreground/80">
                                            <Calendar className="w-5 h-5 text-primary" />
                                            <div>
                                                <p className="font-semibold text-foreground">Fecha</p>
                                                <p>{eventData.date}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 text-foreground/80">
                                            <Clock className="w-5 h-5 text-purple-500" />
                                            <div>
                                                <p className="font-semibold text-foreground">Hora</p>
                                                <p>{eventData.time}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 text-foreground/80">
                                            <MapPin className="w-5 h-5 text-pink-500" />
                                            <div>
                                                <p className="font-semibold text-foreground">Ubicación</p>
                                                <p>
                                                    {eventData.location}, {eventData.city}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 text-foreground/80">
                                            <Users className="w-5 h-5 text-orange-500" />
                                            <div>
                                                <p className="font-semibold text-foreground">Restricción</p>
                                                <p>{eventData.ageRestriction}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Ticket Selection */}
                        <div className="space-y-6">
                            <Card className="bg-white border-gray-200 shadow-lg sticky top-24">
                                <CardHeader>
                                    <CardTitle className="text-foreground text-xl">Seleccionar Entradas</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {eventData.ticketTypes && eventData.ticketTypes.length > 0 ? (
                                        eventData.ticketTypes.map((ticket) => (
                                            <div
                                                key={ticket.id}
                                                className="p-4 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h4 className="font-bold text-foreground text-lg">{ticket.name}</h4>
                                                        <p className="text-foreground/80 text-sm">{ticket.description}</p>
                                                        <p className="text-foreground/60 text-xs mt-1">{ticket.available} disponibles</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold text-foreground">${ticket.price.toLocaleString()}</p>
                                                        <p className="text-foreground/60 text-sm">ARS</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => updateTicketQuantity(ticket.id, -1)}
                                                            disabled={!selectedTickets[ticket.id]}
                                                            className="w-8 h-8 p-0 border-gray-300 text-foreground hover:bg-gray-100"
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </Button>
                                                        <span className="text-foreground font-semibold w-8 text-center">
                                                            {selectedTickets[ticket.id] || 0}
                                                        </span>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => updateTicketQuantity(ticket.id, 1)}
                                                            disabled={(selectedTickets[ticket.id] || 0) >= Math.min(10, ticket.available)}
                                                            className="w-8 h-8 p-0 border-gray-300 text-foreground hover:bg-gray-100"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-foreground/60 mb-4">No hay entradas disponibles para este evento</p>
                                            <Badge variant="outline" className="border-orange-300 text-orange-600">
                                                Próximamente
                                            </Badge>
                                        </div>
                                    )}

                                    {getTotalTickets() > 0 && (
                                        <>
                                            <Separator className="bg-gray-200" />
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-foreground">
                                                    <span>Total de entradas:</span>
                                                    <span className="font-semibold">{getTotalTickets()}</span>
                                                </div>
                                                <div className="flex justify-between text-foreground text-xl font-bold">
                                                    <span>Total:</span>
                                                    <span>${getTotalPrice().toLocaleString()} ARS</span>
                                                </div>
                                                <Button
                                                    onClick={handlePurchase}
                                                    disabled={isLoading}
                                                    className="w-full bg-primary hover:bg-primary-hover text-white py-3 text-lg font-semibold rounded-xl transform hover:scale-105 transition-all duration-200"
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