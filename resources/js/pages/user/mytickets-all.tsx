import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Header from '@/components/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';

import { Calendar, MapPin, Download, QrCode as QrIcon, ArrowLeft } from 'lucide-react';
import { formatPriceWithCurrency } from '@/lib/currencyHelpers';
import ModalQR from '@/components/qr-code-modal';

interface Ticket {
    id: number;
    eventId: number;
    eventTitle: string;
    eventImage: string;
    date: string;
    time: string;
    location: string;
    city: string;
    ticketType: string;
    quantity: number;
    price: number;
    status: string;
    qrCode: string; // The unique code string
}

interface MyTicketsAllProps {
    tickets: {
        upcoming: Ticket[];
        past: Ticket[];
    };
    stats: {
        upcoming_count: number;
        past_count: number;
    };
}

export default function MyTicketsAll({ tickets, stats }: MyTicketsAllProps) {
    const [selectedQrCode, setSelectedQrCode] = useState<string | null>(null);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'available': return 'default';
            case 'used': return 'secondary';
            case 'cancelled': return 'destructive';
            default: return 'outline';
        }
    };

    const getStatusText = (status: string) => {
        const map: Record<string, string> = {
            'available': 'Disponible',
            'used': 'Usado',
            'cancelled': 'Cancelado',
            'reprinted': 'Reimpreso'
        };
        return map[status] || status;
    };

    const TicketList = ({ list, isPast = false }: { list: Ticket[], isPast?: boolean }) => {
        if (!list || list.length === 0) {
            return (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                    <p className="text-gray-500">No hay tickets en esta sección.</p>
                </div>
            )
        }
        return (
            <div className="space-y-4">
                {list.map((ticket) => (
                    <Card key={ticket.id} className={`overflow-hidden hover:shadow-md transition-shadow ${isPast ? 'opacity-60 grayscale' : ''}`}>
                        <div className="flex flex-col md:flex-row">
                            <div className="w-full md:w-48 h-32 md:h-auto relative shrink-0">
                                <img
                                    src={ticket.eventImage}
                                    alt={ticket.eventTitle}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 p-4 md:p-5 flex flex-col justify-between">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                                    <div>
                                        <h3 className="font-bold text-lg">{ticket.eventTitle}</h3>
                                        <p className="text-sm text-gray-500 flex items-center mt-1">
                                            <Calendar className="w-4 h-4 mr-1.5" />
                                            {ticket.date} • {ticket.time}
                                        </p>
                                        <p className="text-sm text-gray-500 flex items-center mt-1">
                                            <MapPin className="w-4 h-4 mr-1.5" />
                                            {ticket.location}, {ticket.city}
                                        </p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded text-gray-700">
                                                {ticket.ticketType}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {formatPriceWithCurrency(ticket.price)}
                                            </span>
                                        </div>
                                    </div>
                                    <Badge variant={getStatusVariant(ticket.status) as any}>
                                        {getStatusText(ticket.status)}
                                    </Badge>
                                </div>
                                <div className="mt-4 flex gap-3 justify-end pt-4 border-t border-gray-100">
                                    {!isPast ? (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedQrCode(ticket.qrCode)}
                                            >
                                                <QrIcon className="w-4 h-4 mr-2" />
                                                Ver QR
                                            </Button>

                                            <a href={route('user.tickets.download', ticket.id)} target="_blank" rel="noopener noreferrer">
                                                <Button size="sm">
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Descargar
                                                </Button>
                                            </a>
                                        </>
                                    ) : (
                                        <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200">
                                            Evento Finalizado
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        )
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Head title="Mis Tickets" />
            <Header />
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8">
                    <Link href={route('my-tickets')} className="text-sm flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver a Mis Entradas
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold">Mis Tickets</h1>
                            <p className="text-gray-500 mt-1">Vista detallada de todos tus tickets adquiridos.</p>
                        </div>
                        <div className="text-right hidden sm:block">
                            {/* Stats removed */}
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="upcoming" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                        <TabsTrigger value="upcoming">Próximos ({stats.upcoming_count})</TabsTrigger>
                        <TabsTrigger value="past">Pasados ({stats.past_count})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upcoming" className="mt-0">
                        <TicketList list={tickets.upcoming} />
                    </TabsContent>
                    <TabsContent value="past" className="mt-0">
                        <TicketList list={tickets.past} isPast={true} />
                    </TabsContent>
                </Tabs>

                <ModalQR
                    open={!!selectedQrCode}
                    onClose={() => setSelectedQrCode(null)}
                    value={selectedQrCode || ''}
                />
            </main>
        </div>
    );
}
