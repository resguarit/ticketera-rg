import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, Ticket, Calendar, Activity, ArrowRight, Plus, Users, Eye } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/currencyHelpers';
import { Event } from '@/types';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface Stat {
    totalRevenue: number;
    totalTicketsSold: number;
    activeEventsCount: number;
    totalEventsCount: number;
}

interface RecentEvent {
    id: number;
    name: string;
    image_url: string;
    date: string;
    tickets_sold: number;
    total_tickets: number;
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
        { title: 'Tickets Vendidos', value: formatNumber(stats.totalTicketsSold), icon: Ticket, color: 'text-chart-3' },
        { title: 'Eventos Activos', value: formatNumber(stats.activeEventsCount), icon: Activity, color: 'text-chart-4' },
        { title: 'Total de Eventos', value: formatNumber(stats.totalEventsCount), icon: Calendar, color: 'text-chart-5' },
    ];

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

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((card, index) => (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                                <card.icon className={`h-5 w-5 ${card.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{card.value}</div>
                            </CardContent>
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
                                        <p className="text-xs text-muted-foreground">{formatNumber(event.tickets_sold)} tickets</p>
                                    </div>
                                    <div className="font-medium text-green-600">{formatCurrency(event.revenue)}</div>
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
                                            <div className="p-3">
                                                <p className="font-semibold text-sm truncate group-hover:text-primary">{event.name}</p>
                                                <p className="text-xs text-muted-foreground">{event.date}</p>
                                                <Progress value={(event.tickets_sold / event.total_tickets) * 100} className="h-2 mt-2 bg-white border border-gray-300" />
                                                <p className="text-xs text-muted-foreground mt-1">{formatNumber(event.tickets_sold)} / {formatNumber(event.total_tickets)}</p>
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

                {/* Funciones y estadísticas */}
                {organizer.functions.map((func) => {
    const stats = func.stats;
    
    return (
        <TabsContent key={func.id} value={func.id.toString()} className="space-y-6">
            {/* Estadísticas de la función */}
            <div className="bg-card rounded-lg border p-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Resumen de {func.name}</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                            <div className="bg-muted p-1.5 rounded-full">
                                <Ticket className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-xs font-medium">Lotes/Tipos</span>
                        </div>
                        <div className="text-lg font-bold text-foreground">{formatNumber(stats?.totalTickets || 0)}</div>
                        <div className="text-xs text-muted-foreground">{stats?.totalTypes || 0} tipos</div>
                    </div>
                    
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                            <div className="bg-muted p-1.5 rounded-full">
                                <Users className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-xs font-medium">Vendidos</span>
                        </div>
                        <div className="text-lg font-bold text-primary">{formatNumber(stats?.soldTickets || 0)}</div>
                        <div className="text-xs text-muted-foreground">{formatNumber(stats?.availableTickets || 0)} disponibles</div>
                    </div>
                    
                    {/* NUEVA COLUMNA: Entradas emitidas */}
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                            <div className="bg-muted p-1.5 rounded-full">
                                <div className="h-3 w-3 text-purple-600">🎫</div>
                            </div>
                            <span className="text-xs font-medium">Emitidas</span>
                        </div>
                        <div className="text-lg font-bold text-purple-600">{formatNumber(stats?.entradasEmitidas || 0)}</div>
                        <div className="text-xs text-muted-foreground">entradas físicas</div>
                    </div>
                    
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                            <div className="bg-muted p-1.5 rounded-full">
                                <DollarSign className="h-3 w-3 text-secondary" />
                            </div>
                            <span className="text-xs font-medium">Ingresos</span>
                        </div>
                        <div className="text-lg font-bold text-secondary">
                            {formatCurrency(stats?.totalRevenue || 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">ARS</div>
                    </div>
                    
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                            <div className="bg-muted p-1.5 rounded-full">
                                <Eye className="h-3 w-3 text-accent-foreground" />
                            </div>
                            <span className="text-xs font-medium">Visibles</span>
                        </div>
                        <div className="text-lg font-bold text-accent-foreground">{stats?.visibleTickets || 0}</div>
                        <div className="text-xs text-muted-foreground">de {stats?.totalTypes || 0}</div>
                    </div>
                </div>
            </div>
            
            {/* ...existing code... */}
        </TabsContent>
    );
})}
            </div>
        </>
    );
}

Dashboard.layout = (page: any) => <AppLayout children={page} />;