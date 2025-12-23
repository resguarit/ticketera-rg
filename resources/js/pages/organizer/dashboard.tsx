import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, Ticket, Calendar, Activity, ArrowRight, Plus, Eye, EyeOff, TrendingUp, Percent } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/currencyHelpers';
import { Event } from '@/types';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import ChangePasswordDialog from '@/components/change-password-modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Stat {
    totalRevenue: number;
    netRevenue: number;
    serviceFee: number;
    totalEntradasVendidas: number;
    totalTicketsSold: number;
    activeEventsCount: number;
    totalEventsCount: number;
}

interface RecentEvent {
    id: number;
    name: string;
    image_url: string;
    date: string;
    entradas_vendidas: number;
    total_entradas: number;
    tickets_sold: number;
    total_tickets: number;
    status: string;
    status_label: string;
    status_color: string;
    is_active: boolean;
}

interface TopEvent {
    id: number;
    name: string;
    revenue: number;
    tickets_sold: number;
    status: string;
    status_label: string;
    status_color: string;
    is_active: boolean;
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
    currentPeriod: string;
}

export default function Dashboard({ auth, organizer, stats, recentEvents, topEvents, revenueChartData, currentPeriod }: DashboardProps) {
    const statCards = [
        { title: 'Ingresos Totales', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'text-chart-1', description: 'Total facturado' },
        { title: 'Ingresos Netos', value: formatCurrency(stats.netRevenue), icon: TrendingUp, color: 'text-chart-2', description: 'Lo que recibes' },
        { title: 'Entradas Vendidas', value: formatNumber(stats.totalEntradasVendidas), icon: Ticket, color: 'text-chart-3', description: 'lotes + individuales' },
        { title: 'Tickets Emitidos', value: formatNumber(stats.totalTicketsSold), icon: Activity, color: 'text-chart-4', description: 'entradas físicas' },
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

    const handlePeriodChange = (period: string) => {
        router.get(route('organizer.dashboard'), { period }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const periodOptions = [
        { value: 'today', label: 'Hoy' },
        { value: 'week', label: 'Última semana' },
        { value: 'month', label: 'Último mes' },
        { value: 'quarter', label: 'Últimos 3 meses' },
        { value: 'year', label: 'Último año' },
        { value: 'three_years', label: 'Últimos 3 años' },
        { value: 'all', label: 'Histórico' },
    ];

    // Función para obtener badge de estado
    const getStatusBadge = (event: RecentEvent | TopEvent) => {
        const colorMap: Record<string, string> = {
            'green': 'bg-green-500',
            'blue': 'bg-blue-500',
            'red': 'bg-red-500',
            'gray': 'bg-gray-500',
            'yellow': 'bg-yellow-500',
            'orange': 'bg-orange-500',
        };

        const badgeColor = colorMap[event.status_color] || 'bg-gray-500';

        return (
            <div className="flex items-center gap-1 flex-wrap">
                <Badge className={`${badgeColor} text-white border-0 text-xs`}>
                    {event.status_label}
                </Badge>
                {!event.is_active && (
                    <Badge className="bg-gray-400 text-white border-0 text-xs">
                        <EyeOff className="w-3 h-3" />
                    </Badge>
                )}
            </div>
        );
    };

    const getPeriodLabel = () => {
        return periodOptions.find(opt => opt.value === currentPeriod)?.label || 'Último año';
    };

    return (
        <>
            <Head title="Mi Dashboard" />

            <div className="container mx-auto p-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard de Organizador</h1>
                        <p className="text-gray-600 mt-1">Resumen de la actividad de <strong>{organizer.name}</strong></p>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                        <Select value={currentPeriod} onValueChange={handlePeriodChange}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Seleccionar período" />
                            </SelectTrigger>
                            <SelectContent>
                                {periodOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Link href={route('organizer.events.create')} className="w-full md:w-auto">
                            <Button className="bg-primary hover:bg-primary-hover text-white w-full md:w-auto">
                                <Plus className="w-4 h-4 mr-2" />
                                Crear Evento
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-2">
                    {statCards.map((card, index) => (
                        <Card key={index} className={`p-4 border-l-4 border-l-chart-3`}>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                                    <card.icon className={`w-4 h-4 ${card.color}`} />
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                                {card.description && (
                                    <p className="text-xs text-gray-500">{card.description}</p>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Revenue Chart */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Ingresos - {getPeriodLabel()}</CardTitle>
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
                                <div key={event.id} className="space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none truncate">{event.name}</p>
                                            <p className="text-xs text-muted-foreground">{formatNumber(event.tickets_sold)} tickets emitidos</p>
                                        </div>
                                        <div className="font-medium text-sm text-green-600 ml-2">{formatCurrency(event.revenue)}</div>
                                    </div>
                                    {getStatusBadge(event)}
                                </div>
                            )) : <p className="text-sm text-muted-foreground text-center py-4">No hay datos de rendimiento.</p>}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Events */}
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
                                            <div className="p-3 space-y-2">
                                                <p className="font-semibold text-sm truncate group-hover:text-primary">{event.name}</p>
                                                <p className="text-xs text-muted-foreground">{event.date}</p>

                                                {/* Estado del evento */}
                                                {getStatusBadge(event)}

                                                {/* Barra de progreso */}
                                                <Progress
                                                    value={event.total_entradas > 0 ? (event.entradas_vendidas / event.total_entradas) * 100 : 0}
                                                    className="h-2 mt-2 bg-white border border-gray-300"
                                                />

                                                {/* Estadísticas */}
                                                <div className="text-xs text-muted-foreground space-y-0.5">
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