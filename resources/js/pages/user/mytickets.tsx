import { useState } from 'react';
import { Calendar, MapPin, Clock, Download, QrCode, Share2, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/header';
import { Head, Link } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

const mockTickets = [
    {
        id: 1,
        eventId: 1,
        eventTitle: "Festival de Música Electrónica 2024",
        eventImage: "/placeholder.svg?height=200&width=300",
        date: "15 Mar 2024",
        time: "20:00",
        location: "Estadio Nacional",
        city: "Buenos Aires",
        ticketType: "VIP",
        quantity: 2,
        price: 15000,
        total: 30000,
        status: "confirmed",
        qrCode: "QR123456789",
        purchaseDate: "2024-02-15",
    },
    {
        id: 2,
        eventId: 4,
        eventTitle: "Obra de Teatro: Romeo y Julieta",
        eventImage: "/placeholder.svg?height=200&width=300",
        date: "05 Abr 2024",
        time: "21:00",
        location: "Teatro San Martín",
        city: "Córdoba",
        ticketType: "General",
        quantity: 1,
        price: 6500,
        total: 6500,
        status: "confirmed",
        qrCode: "QR987654321",
        purchaseDate: "2024-02-20",
    },
    {
        id: 3,
        eventId: 5,
        eventTitle: "Festival de Jazz Internacional",
        eventImage: "/placeholder.svg?height=200&width=300",
        date: "12 Abr 2024",
        time: "18:00",
        location: "Parque Centenario",
        city: "Buenos Aires",
        ticketType: "Premium",
        quantity: 1,
        price: 25000,
        total: 25000,
        status: "pending",
        qrCode: "QR456789123",
        purchaseDate: "2024-02-25",
    },
];

export default function MyTickets() {
    const { auth } = usePage<SharedData>().props;
    const [tickets] = useState(mockTickets);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "confirmed":
                return "bg-green-500";
            case "pending":
                return "bg-yellow-500";
            case "cancelled":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "confirmed":
                return "Confirmado";
            case "pending":
                return "Pendiente";
            case "cancelled":
                return "Cancelado";
            default:
                return "Desconocido";
        }
    };

    const upcomingTickets = tickets.filter((ticket) => new Date(ticket.date) >= new Date());
    const pastTickets = tickets.filter((ticket) => new Date(ticket.date) < new Date());

    // Si el usuario no está autenticado, redirigir o mostrar mensaje
    if (!auth.user) {
        return (
            <>
                <Head title="Mis Tickets - TicketMax" />
                <div className="min-h-screen bg-gradient-to-br from-gray-200 to-secondary">
                    <Header />

                    <div className="container mx-auto px-4 py-16">
                        <div className="max-w-md mx-auto text-center">
                            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                                <Ticket className="w-12 h-12 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-foreground mb-4">Inicia Sesión</h1>
                            <p className="text-foreground/80 mb-8">Para ver tus tickets necesitas iniciar sesión en tu cuenta</p>
                            <Link href={route('login')}>
                                <Button className="bg-primary hover:bg-primary-hover text-white px-8 py-3 text-lg">
                                    Iniciar Sesión
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Mis Tickets - TicketMax" />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-200 to-secondary">
                <Header />

                <div className="container mx-auto px-4 py-8">
                    {/* Page Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-5xl font-bold text-foreground mb-4">
                            Mis Tickets
                        </h1>
                        <p className="text-foreground/80 text-lg">Bienvenido de vuelta, {auth.user.person.name}. Aquí están todos tus tickets</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card className="bg-white py-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className=" text-center">
                                <div className="text-2xl font-bold text-foreground mb-2">{upcomingTickets.length}</div>
                                <div className="text-foreground/80">Próximos Eventos</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white py-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className=" text-center">
                                <div className="text-2xl font-bold text-foreground mb-2">{pastTickets.length}</div>
                                <div className="text-foreground/80">Eventos Pasados</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white py-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className=" text-center">
                                <div className="text-2xl font-bold text-foreground mb-2">
                                    ${tickets.reduce((sum, ticket) => sum + ticket.total, 0).toLocaleString()}
                                </div>
                                <div className="text-foreground/80">Total Gastado</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tickets Tabs */}
                    <Tabs defaultValue="upcoming" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-white border border-gray-200 shadow-sm">
                            <TabsTrigger 
                                value="upcoming" 
                                className="data-[state=active]:bg-primary data-[state=active]:text-white text-foreground"
                            >
                                Próximos ({upcomingTickets.length})
                            </TabsTrigger>
                            <TabsTrigger 
                                value="past" 
                                className="data-[state=active]:bg-primary data-[state=active]:text-white text-foreground"
                            >
                                Pasados ({pastTickets.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="upcoming" className="mt-6">
                            {upcomingTickets.length === 0 ? (
                                <Card className="bg-white border-gray-200 shadow-lg">
                                    <CardContent className="p-12 text-center">
                                        <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-foreground mb-2">No tienes tickets próximos</h3>
                                        <p className="text-foreground/60 mb-6">¡Explora nuestros eventos y compra tu próximo ticket!</p>
                                        <Link href={route('events')}>
                                            <Button className="bg-primary hover:bg-primary-hover text-white">
                                                Explorar Eventos
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {upcomingTickets.map((ticket) => (
                                        <Card
                                            key={ticket.id}
                                            className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                                        >
                                            <div className="flex">
                                                <div className="relative w-32 h-32 flex-shrink-0">
                                                    <img
                                                        src={ticket.eventImage}
                                                        alt={ticket.eventTitle}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 p-6">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <h4 className="font-bold text-foreground text-lg line-clamp-2">{ticket.eventTitle}</h4>
                                                        <Badge className={`${getStatusColor(ticket.status)} text-white border-0`}>
                                                            {getStatusText(ticket.status)}
                                                        </Badge>
                                                    </div>

                                                    <div className="space-y-2 mb-4">
                                                        <div className="flex items-center text-foreground/80 text-sm">
                                                            <Calendar className="w-4 h-4 mr-2" />
                                                            <span>
                                                                {ticket.date} • {ticket.time}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center text-foreground/80 text-sm">
                                                            <MapPin className="w-4 h-4 mr-2" />
                                                            <span>
                                                                {ticket.location}, {ticket.city}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="text-foreground font-semibold">
                                                                {ticket.quantity}x {ticket.ticketType}
                                                            </div>
                                                            <div className="text-foreground/60 text-sm">${ticket.total.toLocaleString()} ARS</div>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-gray-300 text-foreground hover:bg-gray-50"
                                                            >
                                                                <QrCode className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-gray-300 text-foreground hover:bg-gray-50"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-gray-300 text-foreground hover:bg-gray-50"
                                                            >
                                                                <Share2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="past" className="mt-6">
                            {pastTickets.length === 0 ? (
                                <Card className="bg-white border-gray-200 shadow-lg">
                                    <CardContent className="p-12 text-center">
                                        <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-foreground mb-2">No tienes eventos pasados</h3>
                                        <p className="text-foreground/60">Tus eventos anteriores aparecerán aquí</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {pastTickets.map((ticket) => (
                                        <Card
                                            key={ticket.id}
                                            className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow opacity-75"
                                        >
                                            <CardContent className="p-6">
                                                <div className="flex items-center space-x-6">
                                                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={ticket.eventImage}
                                                            alt={ticket.eventTitle}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-foreground text-lg mb-2">{ticket.eventTitle}</h4>
                                                        <div className="flex items-center space-x-4 text-foreground/80 text-sm">
                                                            <span>{ticket.date}</span>
                                                            <span>
                                                                {ticket.location}, {ticket.city}
                                                            </span>
                                                            <span>
                                                                {ticket.quantity}x {ticket.ticketType}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-foreground font-semibold">${ticket.total.toLocaleString()}</div>
                                                        <div className="text-foreground/80 text-sm">ARS</div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
}