import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/dateHelpers';
import { getUserDisplayName } from '@/lib/userHelpers';
import { 
    Users, 
    Calendar, 
    DollarSign, 
    TrendingUp, 
    Eye,
    Settings,
    Shield,
    AlertTriangle,
    Activity,
    BarChart3,
    UserCheck,
    Building,
    Ticket,
    Clock,
    CheckCircle,
    XCircle,
    MoreVertical,
    Plus,
    Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Category, Event, Venue } from '@/types';
import { formatCurrency } from '@/lib/currencyHelpers';

// Interfaces para TypeScript
interface DashboardStat {
    title: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative';
    description: string;
}

interface RecentEvent extends Event {
    venue: Venue;
    category: Category;
    organizer: string;
    status: string;
    status_label: string;
    status_color: string;
    is_active: boolean;
    date: string;
    tickets_sold: number;
    total_tickets: number;
    revenue: number;
}

interface RecentUser {
    id: number;
    name: string;
    last_name: string;
    email: string;
    role: string;
    joined: string;
    status: string;
    purchases?: number;
    events_created?: number;
}

interface SystemAlert {
    id: number;
    type: string;
    title: string;
    message: string;
    time: string;
}

interface SystemStatus {
    name: string;
    status: string;
    label: string;
    details?: string;
}

interface DashboardProps {
    auth: any;
    dashboardStats: DashboardStat[];
    recentEvents: RecentEvent[];
    recentUsers: RecentUser[];
    systemAlerts: SystemAlert[];
    systemStatus: SystemStatus[];
    timeRange: string;
}

// Mapeo de iconos para las estadísticas
const getStatIcon = (title: string) => {
    switch (title) {
        case 'Total Clientes': return Users;
        case 'Eventos Activos': return Calendar;
        case 'Ingresos Totales': return DollarSign;
        case 'Tickets Vendidos': return Ticket;
        default: return Activity;
    }
};

// Mapeo de colores para las estadísticas
const getStatColor = (title: string) => {
    switch (title) {
        case 'Total Clientes': return 'bg-primary';
        case 'Eventos Activos': return 'bg-chart-2';
        case 'Ingresos Totales': return 'bg-chart-3';
        case 'Tickets Vendidos': return 'bg-chart-4';
        default: return 'bg-gray-500';
    }
};

const formatStat = (stat: DashboardStat) => {
    if (stat.title === 'Ingresos Totales') {
        return formatCurrency(stat.value as unknown as number);
    }
    return stat.value;
}

export default function AdminDashboard({ 
    auth, 
    dashboardStats, 
    recentEvents, 
    recentUsers, 
    systemAlerts, 
    systemStatus,
    timeRange: initialTimeRange 
}: DashboardProps) {
    const [timeRange, setTimeRange] = useState(initialTimeRange);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Actualizar datos cuando cambia el rango de tiempo
    const handleTimeRangeChange = (newTimeRange: string) => {
        setTimeRange(newTimeRange);
        router.get(route('admin.dashboard'), { timeRange: newTimeRange }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    // Función actualizada para obtener el badge de estado usando el enum
    const getEventStatusBadge = (status: string, statusLabel: string, statusColor: string, isActive: boolean) => {
        // Mapeo de colores del enum a clases de Tailwind
        const colorMap: Record<string, string> = {
            'green': 'bg-green-500 hover:bg-green-600',
            'blue': 'bg-blue-500 hover:bg-blue-600',
            'red': 'bg-red-500 hover:bg-red-600',
            'gray': 'bg-gray-500 hover:bg-gray-600',
            'yellow': 'bg-yellow-500 hover:bg-yellow-600',
            'orange': 'bg-orange-500 hover:bg-orange-600',
        };

        const badgeColor = colorMap[statusColor] || 'bg-gray-500 hover:bg-gray-600';
        
        return (
            <div className="flex items-center gap-2">
                <Badge className={`${badgeColor} text-white border-0`}>
                    {statusLabel}
                </Badge>
                {!isActive && (
                    <Badge className="bg-gray-400 hover:bg-gray-500 text-white border-0 text-xs">
                        Oculto
                    </Badge>
                )}
            </div>
        );
    };

    // Función para obtener el badge de estado de usuario
    const getUserStatusBadge = (status: string) => {
        const statusConfig = {
            active: { label: "Activo", color: "bg-green-500 hover:bg-green-600" },
            pending: { label: "Pendiente", color: "bg-yellow-500 hover:bg-yellow-600" },
            suspended: { label: "Suspendido", color: "bg-red-500 hover:bg-red-600" },
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        
        return (
            <Badge className={`${config.color} text-white border-0`}>
                {config.label}
            </Badge>
        );
    };

    const getRoleBadge = (role: string) => {
        const roleConfig = {
            admin: { label: "Administrador", color: "bg-purple-500" },
            organizer: { label: "Organizador", color: "bg-blue-500" },
            client: { label: "Cliente", color: "bg-gray-500" }
        };
        
        const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.client;
        
        return (
            <Badge className={`${config.color} text-white border-0 text-xs`}>
                {config.label}
            </Badge>
        );
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            case "error": return <XCircle className="w-4 h-4 text-red-500" />;
            case "success": return <CheckCircle className="w-4 h-4 text-green-500" />;
            case "info": return <Activity className="w-4 h-4 text-blue-500" />;
            default: return <Activity className="w-4 h-4 text-blue-500" />;
        }
    };

    const getSystemStatusIcon = (status: string) => {
        switch (status) {
            case 'operational': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'slow': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'down': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return <CheckCircle className="w-5 h-5 text-green-500" />;
        }
    };

    const getSystemStatusColor = (status: string) => {
        switch (status) {
            case 'operational': return 'bg-green-50 border-green-200';
            case 'slow': return 'bg-yellow-50 border-yellow-200';
            case 'down': return 'bg-red-50 border-red-200';
            default: return 'bg-green-50 border-green-200';
        }
    };

    const getSystemStatusBadge = (status: string) => {
        switch (status) {
            case 'operational': return 'bg-green-500';
            case 'slow': return 'bg-yellow-500';
            case 'down': return 'bg-red-500';
            default: return 'bg-green-500';
        }
    };

    return (
        <>
            <Head title="Dashboard - Panel de Administración" />
            
            <div className="min-h-screen bg-white">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-black mb-2">
                                Panel de Administración
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Bienvenido, {getUserDisplayName(auth.user)} • {currentTime.toLocaleDateString('es-ES', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                                <SelectTrigger className="w-40 bg-white border-gray-300 text-black">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-gray-300">
                                    <SelectItem value="1d">Último día</SelectItem>
                                    <SelectItem value="7d">Últimos 7 días</SelectItem>
                                    <SelectItem value="30d">Últimos 30 días</SelectItem>
                                    <SelectItem value="90d">Últimos 90 días</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {dashboardStats.map((stat, index) => {
                            const IconComponent = getStatIcon(stat.title);
                            const colorClass = getStatColor(stat.title);
                            
                            return (
                                <Card key={index} className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`w-12 h-12 ${colorClass} rounded-lg flex items-center justify-center`}>
                                                <IconComponent className="w-6 h-6 text-white" />
                                            </div>
                                            <Badge className={`${stat.changeType === 'positive' ? 'bg-green-500' : 'bg-red-500'} text-white border-0`}>
                                                {stat.change}
                                            </Badge>
                                        </div>
                                        <h3 className="text-2xl font-bold text-black mb-1">{formatStat(stat)}</h3>
                                        <p className="text-gray-700 text-sm font-medium mb-1">{stat.title}</p>
                                        <p className="text-gray-500 text-xs">{stat.description}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Events & Users */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Recent Events */}
                            <Card className="bg-white border-gray-200 shadow-lg gap-0">
                                <CardHeader className="border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-foreground flex items-center space-x-3">
                                            <Calendar className="w-6 h-6" />
                                            <span>Eventos Recientes</span>
                                        </CardTitle>
                                        <div className="flex items-center space-x-2">
                                            <Link href="/admin/events">
                                                <Button variant="ghost" size="sm" className="text-black hover:text-secondary hover:bg-secondary/10">
                                                    Ver todos
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {recentEvents.length > 0 ? recentEvents.map((event) => (
                                            <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h4 className="text-black font-semibold">{event.name}</h4>
                                                        {getEventStatusBadge(
                                                            event.status, 
                                                            event.status_label, 
                                                            event.status_color,
                                                            event.is_active
                                                        )}
                                                    </div>
                                                    <p className="text-gray-600 text-sm mb-2">
                                                        Por: {event.organizer} • {formatDate(event.date)}
                                                    </p>
                                                    <div className="flex items-center space-x-4 text-sm">
                                                        <span className="text-gray-700">
                                                            Tickets: {event.tickets_sold}/{event.total_tickets}
                                                        </span>
                                                        <span className="text-green-600 font-medium">
                                                            {formatCurrency(event.revenue)}
                                                        </span>
                                                    </div>
                                                    <Progress 
                                                        value={event.total_tickets > 0 ? (event.tickets_sold / event.total_tickets) * 100 : 0} 
                                                        className="mt-2 h-2"
                                                    />
                                                </div>
                                                <Link href={`/admin/events/${event.id}`} className="cursor-pointer">
                                                    <Button variant="outline" className="flex items-center">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        )) : (
                                            <div className="text-center py-8">
                                                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-500">No hay eventos recientes</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Users */}
                            <Card className="bg-white border-gray-200 shadow-lg gap-0">
                                <CardHeader className="border-b border-gray-200 ">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-foreground flex items-center space-x-3">
                                            <Users className="w-6 h-6" />
                                            <span>Usuarios Recientes</span>
                                        </CardTitle>
                                        <Link href="/admin/users">
                                            <Button variant="ghost" size="sm" className="text-black hover:text-secondary hover:bg-secondary/10">
                                                Ver todos
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        {recentUsers.length > 0 ? recentUsers.map((user) => (
                                            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-chart-4 rounded-full flex items-center justify-center">
                                                        <span className="text-white font-semibold text-sm tracking-tight">
                                                            {user.name.charAt(0).toUpperCase()}{user.last_name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-black font-medium">{user.name} {user.last_name}</h4>
                                                        <p className="text-gray-600 text-sm">{user.email}</p>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            {getRoleBadge(user.role)}
                                                            {getUserStatusBadge(user.status)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-gray-600 text-sm">
                                                        {formatDate(user.joined)}
                                                    </p>
                                                    {user.purchases !== undefined && (
                                                        <p className="text-gray-700 text-xs">
                                                            {user.purchases} compras
                                                        </p>
                                                    )}
                                                    {user.events_created !== undefined && (
                                                        <p className="text-gray-700 text-xs">
                                                            {user.events_created} eventos
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-8">
                                                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-500">No hay usuarios recientes</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Alerts & Quick Actions */}
                        <div className="space-y-8">
                            {/* System Alerts */}
                            {systemAlerts && systemAlerts.length > 0 && (
                                <Card className="bg-white border-gray-200 shadow-lg gap-0">
                                    <CardHeader className="border-b border-gray-200">
                                        <CardTitle className="text-foreground flex items-center space-x-3">
                                            <AlertTriangle className="w-6 h-6" />
                                            <span>Alertas del Sistema</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="space-y-3">
                                            {systemAlerts.map((alert) => (
                                                <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    {getAlertIcon(alert.type)}
                                                    <div className="flex-1">
                                                        <h4 className="text-black font-medium text-sm">{alert.title}</h4>
                                                        <p className="text-gray-600 text-xs mt-1">{alert.message}</p>
                                                        <p className="text-gray-500 text-xs mt-1">{alert.time}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Quick Actions */}
                            <Card className="bg-white border-gray-200 shadow-lg gap-0 pb-0">
                                <CardHeader className="border-b border-gray-200">
                                    <CardTitle className="text-foreground flex items-center space-x-3">
                                        <Settings className="w-6 h-6" />
                                        <span>Acciones Rápidas</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-3 gap-4">
                                    <Link href="/admin/events">
                                        <Button className="w-full bg-primary mb-2 hover:bg-primary-hover text-white justify-start">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Gestionar Eventos
                                        </Button>
                                    </Link>
                                    <Link href="/admin/users">
                                        <Button className="w-full bg-primary mb-2 hover:bg-primary-hover text-white justify-start">
                                            <UserCheck className="w-4 h-4 mr-2" />
                                            Gestionar Usuarios
                                        </Button>
                                    </Link>
                                    <Link href="/admin/organizers">
                                        <Button className="w-full bg-primary mb-2 hover:bg-primary-hover text-white justify-start">
                                            <Building className="w-4 h-4 mr-2" />
                                            Gestionar Organizadores
                                        </Button>
                                    </Link>
                                    <Link href="/admin/reports">
                                        <Button className="w-full bg-primary mb-2 hover:bg-primary-hover text-white justify-start">
                                            <BarChart3 className="w-4 h-4 mr-2" />
                                            Ver Reportes
                                        </Button>
                                    </Link>
                                    <Link href="/admin/settings">
                                        <Button className="w-full bg-primary mb-2 hover:bg-primary-hover text-white justify-start">
                                            <Settings className="w-4 h-4 mr-2" />
                                            Configuración
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// Asignamos el Layout de Administrador
AdminDashboard.layout = (page: any) => <AppLayout children={page} />;