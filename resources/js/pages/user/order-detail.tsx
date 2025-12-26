import { Head, Link } from '@inertiajs/react';
import Header from '@/components/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { QrCode, ArrowLeft, Download } from 'lucide-react';
import { formatPriceWithCurrency } from '@/lib/currencyHelpers';
import { useState } from 'react';
import ModalQR from '@/components/qr-code-modal';

interface OrderDetailProps {
    order: {
        id: number;
        transaction_id: string; // Used for display
        status: string;
        created_at: string;
    };
    event: {
        title: string;
        date: string;
        venue: string;
    } | null;
    tickets: Array<{
        id: number;
        unique_code: string;
        status: string;
        ticket_type_name: string;
        price: number;
        qr_data: any;
    }>;
    order_items: Array<{
        ticket_type_name: string;
        sector_name: string;
        price: number;
        quantity: number;
        is_bundle: boolean;
    }>;
    payment: {
        method: number;
        card_brand: string | null;
        card_bin: string | null;
        payment_type: string | null;
        installments: number;
        subtotal: number;
        service_fee: number;
        discount_rate: number;
        discount_amount: number;
        total: number;
        date: string;
        status: string;
    };
}

export default function OrderDetail({ order, event, tickets, order_items, payment }: OrderDetailProps) {
    const [selectedQrCode, setSelectedQrCode] = useState<string | null>(null);

    const handleDownloadTicket = (ticketId: number) => {
        window.open(route('user.tickets.download', { ticket: ticketId }), '_blank');
    };

    // Simplificar visualización de estado
    const getStatusText = (status: string) => {
        const statuses: Record<string, string> = {
            paid: 'Pagado',
            pending: 'Pendiente',
            cancelled: 'Cancelado',
            rejected: 'Rechazado'
        };
        return statuses[status] || status;
    };

    return (
        <>
            <Head title={`Orden #${order.id}`} />
            <div className="min-h-screen bg-gray-50/50">
                <Header />

                <main className="container mx-auto px-4 py-8 max-w-5xl">
                    <div className="mb-8">
                        <Link href={route('my-tickets')} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors mb-2">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Volver a Mis Entradas
                        </Link>
                    </div>

                    <div className="space-y-8">
                        {/* 1. Lista de Tickets Individuales (Top) */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <QrCode className="w-5 h-5" />
                                Mis Entradas
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {tickets.map((ticket) => (
                                    <div key={ticket.id} className="p-4 border rounded-lg bg-gray-50/50 hover:bg-white hover:shadow-md transition-all">
                                        <div className="mb-3">
                                            <p className="font-bold text-gray-900">{ticket.ticket_type_name}</p>
                                            <p className="text-xs font-mono text-gray-500">{ticket.unique_code}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => setSelectedQrCode(ticket.unique_code)}
                                            >
                                                <QrCode className="w-3.5 h-3.5 mr-2" />
                                                QR
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 bg-blue-50"
                                                onClick={() => handleDownloadTicket(ticket.id)}
                                            >
                                                <Download className="w-3.5 h-3.5 mr-2" />
                                                PDF
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. Sección Inferior Wrapper en una Card */}
                        <Card className="p-6">
                            <div className="grid gap-8 md:grid-cols-2">

                                {/* Columna Izquierda: Detalles de la Compra */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                                        Detalles de la compra: <span className="text-gray-900">#{order.id}</span>
                                    </h3>

                                    {event && (
                                        <div className="mb-6">
                                            <h2 className="text-lg font-bold uppercase text-gray-400">{event.title}</h2>
                                            <p className="text-sm font-medium mt-1">{event.date}</p>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {/* Lista de Items Agrupados */}
                                        <div className="space-y-3">
                                            {order_items.map((item, index) => (
                                                <div key={index} className="flex justify-between text-sm py-1 border-b border-dashed border-gray-100 last:border-0">
                                                    <span className="text-gray-700">
                                                        {item.quantity}x {item.ticket_type_name}
                                                    </span>
                                                    <span className="font-medium whitespace-nowrap ml-4">
                                                        {/* If grouped, show total for that group? Or unit price? Usually total for the line item */}
                                                        {/* Assistant controller returns unit price, let's assume item calculation is unit * quantity for display? */}
                                                        {/* BUT frontend usually just shows Price. If I bought 2, do I show unit price or total? */}
                                                        {/* Usually users want to see the SUM for that line. */}
                                                        {/* Let's show (Unit Price * Qty) */}
                                                        {formatPriceWithCurrency(item.price * item.quantity)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-4 space-y-2">
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span className="font-bold text-gray-900">Servicios</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-600 pl-4 border-l-2 border-gray-100">
                                                <span>Cargo por servicio</span>
                                                <span>{formatPriceWithCurrency(payment.service_fee)}</span>
                                            </div>

                                            <Separator className="my-3" />

                                            <div className="flex justify-between text-base">
                                                <span className="font-bold text-gray-900">Total</span>
                                                <span className="font-bold text-gray-900">{formatPriceWithCurrency(payment.total)}</span>
                                            </div>

                                            <div className="mt-4">
                                                <Button variant="link" className="px-0 text-blue-600 h-auto font-normal text-xs" onClick={() => window.print()}>
                                                    <Download className="w-3 h-3 mr-1" />
                                                    Imprimir detalle de compra
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Columna Derecha: Detalles del Pago */}
                                <div className="md:pl-8 md:border-l border-gray-100">
                                    <h3 className="text-sm font-medium text-gray-500 mb-6">
                                        Detalle del pago #{order.transaction_id}
                                    </h3>

                                    <div className="space-y-0">
                                        <p className="text-sm text-gray-400 mb-6">Medio de pago: {payment.card_brand || 'Tarjeta'}</p>

                                        <div className="flex justify-between py-3">
                                            <span className="text-sm text-gray-600">Monto</span>
                                            <span className="text-sm font-medium">{formatPriceWithCurrency(payment.total)}</span>
                                        </div>

                                        <div className="flex justify-between py-3 bg-gray-50/50 -mx-2 px-2 rounded">
                                            <span className="text-sm text-gray-600">Tarjeta</span>
                                            <span className="text-sm text-gray-900 font-mono">
                                                {payment.card_bin ? `${payment.card_bin}XXXXXX` : '****'}
                                            </span>
                                        </div>

                                        <div className="flex justify-between py-3">
                                            <span className="text-sm text-gray-600">Estado</span>
                                            <span className={`text-sm font-medium px-2 py-0.5 rounded ${payment.status === 'paid' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {getStatusText(payment.status)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between py-3">
                                            <span className="text-sm text-gray-600">Fecha</span>
                                            <span className="text-sm text-gray-900">{payment.date}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </main>

                <ModalQR
                    open={!!selectedQrCode}
                    onClose={() => setSelectedQrCode(null)}
                    value={selectedQrCode || ''}
                />
            </div>
        </>
    );
}
