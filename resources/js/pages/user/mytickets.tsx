import { Head, Link } from '@inertiajs/react';
import Header from '@/components/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ticket, Calendar, MapPin, ChevronRight, ShoppingBag } from 'lucide-react';
import { formatPriceWithCurrency } from '@/lib/currencyHelpers';

interface Order {
    id: number;
    transaction_id: string;
    order_date: string;
    total_amount: number;
    status: string;
    event: {
        title: string;
        image: string;
        date: string;
        location: string;
    };
    items_count: number;
}

interface MyTicketsProps {
    orders: Order[];
}

export default function MyTickets({ orders }: MyTicketsProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "paid":
                return "bg-green-500";
            case "pending":
                return "bg-yellow-500";
            case "cancelled":
                return "bg-red-500";
            case "refunded":
                return "bg-gray-400";
            default:
                return "bg-gray-500";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "paid":
                return "Pagado";
            case "pending":
                return "Pendiente";
            case "cancelled":
                return "Cancelado";
            case "refunded":
                return "Devuelto";
            default:
                return status;
        }
    };

    return (
        <>
            <Head title="Mis Entradas" />
            <div className="min-h-screen bg-gray-50/50">
                <Header />

                <main className="container mx-auto px-4 py-8 max-w-4xl">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Ticket className="w-8 h-8" />
                            Mis Entradas
                        </h1>
                        <Link href={route('my-tickets.all')}>
                            <Button variant="outline">Ver todos mis tickets</Button>
                        </Link>
                    </div>

                    {orders.length === 0 ? (
                        <Card className="text-center py-12">
                            <CardContent>
                                <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-medium text-gray-900 mb-2">No tienes compras registradas</h3>
                                <p className="text-gray-500 mb-6">Explora nuestros eventos y compra tus entradas.</p>
                                <Link href={route('events')}>
                                    <Button>Explorar Eventos</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <Link key={order.id} href={route('my-tickets.show', { order: order.id })} className="block group">
                                    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                                        <div className="flex flex-col sm:flex-row">
                                            {/* Imagen del evento */}
                                            <div className="sm:w-48 h-32 sm:h-auto relative shrink-0">
                                                <img
                                                    src={order.event.image}
                                                    alt={order.event.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Contenido */}
                                            <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">
                                                            {order.event.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 flex items-center mt-1">
                                                            <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                                            {order.event.date}
                                                        </p>
                                                        <p className="text-sm text-gray-500 flex items-center mt-0.5">
                                                            <MapPin className="w-3.5 h-3.5 mr-1.5" />
                                                            {order.event.location}
                                                        </p>
                                                    </div>
                                                    <Badge className={`${getStatusColor(order.status)} border-0 text-white`}>
                                                        {getStatusText(order.status)}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-end justify-between mt-4">
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Orden #{order.transaction_id}</p>
                                                        <p className="text-xs text-gray-400">Comprado el {order.order_date}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-500">{order.items_count} entradas</p>
                                                        <p className="font-bold text-lg">{formatPriceWithCurrency(order.total_amount)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Flecha solo en desktop */}
                                            <div className="hidden sm:flex items-center justify-center w-12 border-l bg-gray-50/50 text-gray-400 group-hover:text-primary group-hover:bg-primary/5 transition-colors">
                                                <ChevronRight className="w-6 h-6" />
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}