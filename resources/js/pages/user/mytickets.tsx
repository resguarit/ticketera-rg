import { Calendar, MapPin, Clock, Download, QrCode, Share2, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/header';
import { Head, Link } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

// Definir la interfaz TicketType
interface TicketType {
    id: number;
    eventTitle: string;
    eventImage: string;
    date: string;
    time: string;
    location: string;
    city: string;
    ticketType: string;
    quantity: number;
    total: number;
    status: 'confirmed' | 'pending' | 'cancelled';
    qrCode?: string;
    orderId?: number;
}

interface TicketProps {
    tickets: {
        upcoming: TicketType[];
        past: TicketType[];
    };
    stats: {
        upcoming_count: number;
        past_count: number;
        total_spent: number;
    };
}

export default function MyTickets({ tickets, stats }: TicketProps) {
    const { auth } = usePage<SharedData>().props;

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

    const upcomingTickets = tickets.upcoming;
    const pastTickets = tickets.past;

    // Si el usuario no está autenticado, redirigir o mostrar mensaje
    if (!auth.user) {
        return (
            <>
                <Head title="Mis Tickets - TicketMax" />
                <div className="min-h-screen bg-gradient-to-br from-gray-200 to-secondary">
                    <Header />

                    <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-16">
                        <div className="max-w-md mx-auto text-center">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                <Ticket className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">Inicia Sesión</h1>
                            <p className="text-foreground/80 mb-6 sm:mb-8 text-sm sm:text-base">Para ver tus tickets necesitas iniciar sesión en tu cuenta</p>
                            <Link href={route('login')}>
                                <Button className="bg-primary hover:bg-primary-hover text-white px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg">
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

                <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
                    {/* Page Header */}
                    <div className="text-center mb-4 sm:mb-6">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-2 sm:mb-4">
                            Mis Tickets
                        </h1>
                        <p className="text-foreground/80 text-sm sm:text-base lg:text-lg px-4">
                            Bienvenido de vuelta, {auth.user.person.name}. Aquí están todos tus tickets
                        </p>
                    </div>

{/*                     
                    <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
                        <Card className="bg-white py-0 border-gray-200 shadow-md sm:shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-2 sm:p-4 lg:p-6 text-center">
                                <div className="tex-lg sm:text-2xl lg:text-3xl font-bold text-foreground mb-1 sm:mb-2">{stats.upcoming_count}</div>
                                <div className="text-foreground/80 text-xs sm:text-sm lg:text-base">Próximos Eventos</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white py-0 border-gray-200 shadow-md sm:shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-2 sm:p-4 lg:p-6 text-center">
                                <div className="tex-lg sm:text-2xl lg:text-3xl font-bold text-foreground mb-1 sm:mb-2">{stats.past_count}</div>
                                <div className="text-foreground/80 text-xs sm:text-sm lg:text-base">Eventos Pasados</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white py-0 border-gray-200 shadow-md sm:shadow-lg hover:shadow-xl transition-shadow sm:col-span-2 lg:col-span-1">
                            <CardContent className="p-2 sm:p-4 lg:p-6 text-center">
                                <div className="tex-lg sm:text-2xl lg:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                                    ${stats.total_spent.toLocaleString()}
                                </div>
                                <div className="text-foreground/80 text-xs sm:text-sm lg:text-base">Total Gastado</div>
                            </CardContent>
                        </Card>
                    </div>
 */}
                    {/* Tickets Tabs */}
                    <Tabs defaultValue="upcoming" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-white border border-gray-200 shadow-sm h-9 sm:h-10 lg:h-11">
                            <TabsTrigger 
                                value="upcoming" 
                                className="data-[state=active]:bg-primary data-[state=active]:text-white text-foreground text-xs sm:text-sm lg:text-base"
                            >
                                <span className="hidden sm:inline">Próximos ({upcomingTickets.length})</span>
                                <span className="sm:hidden">Próximos</span>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="past" 
                                className="data-[state=active]:bg-primary data-[state=active]:text-white text-foreground text-xs sm:text-sm lg:text-base"
                            >
                                <span className="hidden sm:inline">Pasados ({pastTickets.length})</span>
                                <span className="sm:hidden">Pasados</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="upcoming" className="mt-3 sm:mt-4 lg:mt-6">
                            {upcomingTickets.length === 0 ? (
                                <Card className="bg-white border-gray-200 shadow-md sm:shadow-lg rounded-lg sm:rounded-xl">
                                    <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
                                        <Ticket className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                                        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No tienes tickets próximos</h3>
                                        <p className="text-foreground/60 mb-4 sm:mb-6 text-sm sm:text-base">¡Explora nuestros eventos y compra tu próximo ticket!</p>
                                        <Link href={route('events')}>
                                            <Button className="bg-primary hover:bg-primary-hover text-white text-sm sm:text-base">
                                                Explorar Eventos
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                                    {upcomingTickets.map((ticket) => (
                                        <Card
                                            key={ticket.id}
                                            className="bg-white py-0 border-gray-200 shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden rounded-lg sm:rounded-xl"
                                        >
                                            <div className="flex flex-col sm:flex-row items-center">
                                                <div className="relative w-full h-32 sm:w-32 sm:h-60 flex-shrink-0">
                                                    <img
                                                        src={ticket.eventImage}
                                                        alt={ticket.eventTitle}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 p-3 sm:p-4 lg:p-6">
                                                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                                                        <h4 className="font-bold text-foreground text-sm sm:text-base lg:text-lg line-clamp-2 pr-2">{ticket.eventTitle}</h4>
                                                        <Badge className={`${getStatusColor(ticket.status)} text-white border-0 text-xs flex-shrink-0`}>
                                                            {getStatusText(ticket.status)}
                                                        </Badge>
                                                    </div>

                                                    <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                                                        <div className="flex items-center text-foreground/80 text-xs sm:text-sm">
                                                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                                                            <span>
                                                                {ticket.date} • {ticket.time}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center text-foreground/80 text-xs sm:text-sm">
                                                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                                                            <span className="truncate">
                                                                {ticket.location}, {ticket.city}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="min-w-0">
                                                            <div className="text-foreground font-semibold text-xs sm:text-sm lg:text-base">
                                                                {ticket.quantity}x {ticket.ticketType}
                                                            </div>
                                                            <div className="text-foreground/60 text-xs sm:text-sm">${ticket.total.toLocaleString()} ARS</div>
                                                        </div>
                                                        <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-gray-300 text-foreground hover:bg-gray-50 p-1 sm:p-2 h-7 w-7 sm:h-8 sm:w-8"
                                                            >
                                                                <QrCode className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-gray-300 text-foreground hover:bg-gray-50 p-1 sm:p-2 h-7 w-7 sm:h-8 sm:w-8"
                                                            >
                                                                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-gray-300 text-foreground hover:bg-gray-50 p-1 sm:p-2 h-7 w-7 sm:h-8 sm:w-8"
                                                            >
                                                                <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
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

                        <TabsContent value="past" className="mt-3 sm:mt-4 lg:mt-6">
                            {pastTickets.length === 0 ? (
                                <Card className="bg-white border-gray-200 shadow-md sm:shadow-lg rounded-lg sm:rounded-xl">
                                    <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
                                        <Clock className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                                        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No tienes eventos pasados</h3>
                                        <p className="text-foreground/60 text-sm sm:text-base">Tus eventos anteriores aparecerán aquí</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-3 sm:space-y-4">
                                    {pastTickets.map((ticket) => (
                                        <Card
                                            key={ticket.id}
                                            className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow opacity-75 rounded-lg sm:rounded-xl"
                                        >
                                            <CardContent className="p-3 sm:p-4 lg:p-6">
                                                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-6">
                                                    <div className="relative w-full h-20 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={ticket.eventImage}
                                                            alt={ticket.eventTitle}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-foreground text-sm sm:text-base lg:text-lg mb-1 sm:mb-2 truncate">{ticket.eventTitle}</h4>
                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-foreground/80 text-xs sm:text-sm space-y-1 sm:space-y-0">
                                                            <span>{ticket.date}</span>
                                                            <span className="truncate">
                                                                {ticket.location}, {ticket.city}
                                                            </span>
                                                            <span>
                                                                {ticket.quantity}x {ticket.ticketType}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-left sm:text-right flex-shrink-0">
                                                        <div className="text-foreground font-semibold text-sm sm:text-base lg:text-lg">${ticket.total.toLocaleString()}</div>
                                                        <div className="text-foreground/80 text-xs sm:text-sm">ARS</div>
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