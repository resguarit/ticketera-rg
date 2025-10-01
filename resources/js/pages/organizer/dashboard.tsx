import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, Ticket, Calendar, Activity, ArrowRight, Plus } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/currencyHelpers';
import { Event } from '@/types';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import ChangePasswordDialog from '@/components/change-password-modal';

interface Stat {
    totalRevenue: number;
    totalEntradasVendidas: number; // NUEVO: entradas vendidas
    totalTicketsSold: number; // CAMBIADO: tickets emitidos
    activeEventsCount: number;
    totalEventsCount: number;
}

interface RecentEvent {
    id: number;
    name: string;
    image_url: string;
    date: string;
    entradas_vendidas: number;  // NUEVO: entradas vendidas para progreso
    total_entradas: number;     // NUEVO: total entradas para progreso
    tickets_sold: number;       // tickets emitidos
    total_tickets: number;      // total tickets físicos
}

interface TopEvent {
    id: number;
    name: string;
    revenue: number;
    tickets_sold: number;
}

interface ChartData {
    date: string;
    revenue: number;
}

interface DashboardProps {
    auth: any;
    organizer: any;
    stats: Stat;
    recentEvents: RecentEvent[];
    topEvents: TopEvent[];
    revenueChartData: ChartData[];
}

export default function Dashboard({ auth, organizer, stats, recentEvents, topEvents, revenueChartData }: DashboardProps) {
    const statCards = [
        { title: 'Ingresos Totales', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'text-chart-2' },
        { title: 'Entradas Vendidas', value: formatNumber(stats.totalEntradasVendidas), icon: Ticket, color: 'text-chart-3' },
        { title: 'Tickets Emitidos', value: formatNumber(stats.totalTicketsSold), icon: Activity, color: 'text-chart-4' },
        { title: 'Eventos Activos', value: formatNumber(stats.activeEventsCount), icon: Calendar, color: 'text-chart-5' },
    ];

    const { must_change_password } = usePage().props as any;
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (must_change_password) {
            setIsModalOpen(true);
        }
    }, [must_change_password]);

    const handleModalOpenChange = (open: boolean) => {
        setIsModalOpen(open);
    };

    return (
        <>
            <Head title="Mi Dashboard" />

            <div className="container mx-auto p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard de Organizador</h1>
                        <p className="text-gray-600 mt-1">Resumen de la actividad de <strong>{organizer.name}</strong></p>
                    </div>
                    <Link href={route('organizer.events.create')}>
                        <Button className="bg-primary hover:bg-primary-hover text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Crear Evento
                        </Button>
                    </Link>
                </div>

                {/* Stat Cards - ACTUALIZADO con 4 estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((card, index) => (
                        <Card key={index} className="p-6 border-l-4 border-l-blue-500">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                                    <card.icon className={`w-4 h-4 ${card.color}`} />
                                </div>
                                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                                {/* NUEVO: Añadir descripción para las nuevas métricas */}
                                {card.title === 'Entradas Vendidas' && (
                                    <p className="text-xs text-gray-500">lotes + individuales</p>
                                )}
                                {card.title === 'Tickets Emitidos' && (
                                    <p className="text-xs text-gray-500">entradas físicas</p>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Revenue Chart */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Ingresos en los últimos 30 días</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={revenueChartData}>
                                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${formatNumber(value as number)}`} />
                                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Top Events */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Eventos con Mayor Rendimiento</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {topEvents.length > 0 ? topEvents.map(event => (
                                <div key={event.id} className="flex items-center">
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none truncate">{event.name}</p>
                                        <p className="text-xs text-muted-foreground">{formatNumber(event.tickets_sold)} tickets emitidos</p>
                                    </div>
                                    <div className="font-medium text-green-600">{formatCurrency(event.revenue)}</div>
                                </div>
                            )) : <p className="text-sm text-muted-foreground text-center py-4">No hay datos de rendimiento.</p>}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Events - CORREGIDO para usar entradas en progreso */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Eventos Recientes</CardTitle>
                        <Link href={route('organizer.events.index')}>
                            <Button variant="outline" size="sm">
                                Ver todos <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentEvents.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                                {recentEvents.map(event => (
                                    <Link key={event.id} href={route('organizer.events.manage', event.id)}>
                                        <div className="border rounded-lg overflow-hidden group hover:shadow-lg transition-shadow">
                                            <img src={event.image_url} alt={event.name} className="h-32 w-full object-cover" />
                                            <div className="p-3">
                                                <p className="font-semibold text-sm truncate group-hover:text-primary">{event.name}</p>
                                                <p className="text-xs text-muted-foreground">{event.date}</p>
                                                
                                                {/* CORREGIDO: Barra de progreso basada en entradas vendidas */}
                                                <Progress 
                                                    value={event.total_entradas > 0 ? (event.entradas_vendidas / event.total_entradas) * 100 : 0} 
                                                    className="h-2 mt-2 bg-white border border-gray-300" 
                                                />
                                                
                                                {/* CORREGIDO: Mostrar entradas vendidas para el progreso */}
                                                <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                                    <div>{formatNumber(event.entradas_vendidas)} / {formatNumber(event.total_entradas)} entradas</div>
                                                    <div className="text-purple-600">{formatNumber(event.tickets_sold)} tickets emitidos</div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">No has creado eventos</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Crea tu primer evento para empezar a ver tus estadísticas.
                                </p>
                                <Link href={route('organizer.events.create')} className="mt-4 inline-block">
                                    <Button>Crear Evento</Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <ChangePasswordDialog 
                open={isModalOpen}
                onOpenChange={handleModalOpenChange}
                showDisclaimer={must_change_password}
                required={must_change_password}
            />
        </>
    );
}

Dashboard.layout = (page: any) => <AppLayout children={page} />;