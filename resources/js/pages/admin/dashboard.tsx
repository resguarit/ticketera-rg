import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';

// Mock data para el dashboard
const dashboardStats = [
    {
        title: "Total Usuarios",
        value: "12,547",
        change: "+12%",
        changeType: "positive",
        icon: Users,
        color: "bg-blue-500",
        description: "Usuarios registrados este mes"
    },
    {
        title: "Eventos Activos",
        value: "1,234",
        change: "+8%",
        changeType: "positive",
        icon: Calendar,
        color: "bg-purple-500",
        description: "Eventos programados"
    },
    {
        title: "Ingresos Totales",
        value: "$2.4M",
        change: "+15%",
        changeType: "positive",
        icon: DollarSign,
        color: "bg-green-500",
        description: "Ingresos este mes"
    },
    {
        title: "Tickets Vendidos",
        value: "45,231",
        change: "+23%",
        changeType: "positive",
        icon: Ticket,
        color: "bg-orange-500",
        description: "Tickets vendidos hoy"
    }
];

const recentEvents = [
    {
        id: 1,
        name: "Festival de Música Electrónica",
        organizer: "MusicPro Events",
        date: "2024-03-15",
        status: "active",
        tickets_sold: 2450,
        total_tickets: 3000,
        revenue: 125000
    },
    {
        id: 2,
        name: "Concierto Rock Nacional",
        organizer: "Rock Producciones",
        date: "2024-03-20",
        status: "pending",
        tickets_sold: 890,
        total_tickets: 1500,
        revenue: 45000
    },
    {
        id: 3,
        name: "Teatro: Romeo y Julieta",
        organizer: "Teatro Municipal",
        date: "2024-03-25",
        status: "active",
        tickets_sold: 180,
        total_tickets: 200,
        revenue: 18000
    },
    {
        id: 4,
        name: "Conferencia Tech 2024",
        organizer: "TechEvents",
        date: "2024-04-01",
        status: "draft",
        tickets_sold: 0,
        total_tickets: 500,
        revenue: 0
    }
];

const recentUsers = [
    {
        id: 1,
        name: "María González",
        email: "maria@email.com",
        role: "client",
        joined: "2024-03-10",
        status: "active",
        purchases: 3
    },
    {
        id: 2,
        name: "Carlos Rodríguez",
        email: "carlos@events.com",
        role: "organizer",
        joined: "2024-03-09",
        status: "pending",
        events_created: 5
    },
    {
        id: 3,
        name: "Ana Martínez",
        email: "ana@email.com",
        role: "client",
        joined: "2024-03-08",
        status: "active",
        purchases: 1
    },
    {
        id: 4,
        name: "Luis Fernández",
        email: "luis@email.com",
        role: "client",
        joined: "2024-03-07",
        status: "suspended",
        purchases: 0
    }
];

const systemAlerts = [
    {
        id: 1,
        type: "warning",
        title: "Alto tráfico detectado",
        message: "El servidor está experimentando 300% más tráfico de lo normal",
        time: "hace 5 min"
    },
    {
        id: 2,
        type: "info",
        title: "Mantenimiento programado",
        message: "Mantenimiento del sistema programado para mañana a las 2:00 AM",
        time: "hace 2 horas"
    },
    {
        id: 3,
        type: "success",
        title: "Backup completado",
        message: "Backup diario completado exitosamente",
        time: "hace 6 horas"
    }
];

export default function AdminDashboard({ auth }: any) {
    const [timeRange, setTimeRange] = useState("7d");
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: { label: "Activo", color: "bg-green-500 hover:bg-green-600" },
            pending: { label: "Pendiente", color: "bg-yellow-500 hover:bg-yellow-600" },
            draft: { label: "Borrador", color: "bg-gray-500 hover:bg-gray-600" },
            suspended: { label: "Suspendido", color: "bg-red-500 hover:bg-red-600" }
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
        
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
            case "success": return <CheckCircle className="w-4 h-4 text-green-500" />;
            default: return <Activity className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <>
            <Head title="Panel de Administración - TicketMax" />
            
            <div className="min-h-screen bg-white">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-black mb-2">
                                Panel de Administración
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Bienvenido, {auth.user.name} • {currentTime.toLocaleDateString('es-ES', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <Select value={timeRange} onValueChange={setTimeRange}>
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
                            
                            <Button className="bg-black text-white hover:bg-gray-800">
                                <Plus className="w-4 h-4 mr-2" />
                                Acciones Rápidas
                            </Button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {dashboardStats.map((stat, index) => (
                            <Card key={index} className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                                            <stat.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <Badge className={`${stat.changeType === 'positive' ? 'bg-green-500' : 'bg-red-500'} text-white border-0`}>
                                            {stat.change}
                                        </Badge>
                                    </div>
                                    <h3 className="text-2xl font-bold text-black mb-1">{stat.value}</h3>
                                    <p className="text-gray-700 text-sm font-medium mb-1">{stat.title}</p>
                                    <p className="text-gray-500 text-xs">{stat.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Events & Users */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Recent Events */}
                            <Card className="bg-white border-gray-200 shadow-lg">
                                <CardHeader className="border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-black flex items-center space-x-3">
                                            <Calendar className="w-6 h-6 text-blue-500" />
                                            <span>Eventos Recientes</span>
                                        </CardTitle>
                                        <div className="flex items-center space-x-2">
                                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-black hover:bg-gray-100">
                                                <Filter className="w-4 h-4" />
                                            </Button>
                                            <Link href="/admin/events">
                                                <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                                                    Ver todos
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {recentEvents.map((event) => (
                                            <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h4 className="text-black font-semibold">{event.name}</h4>
                                                        {getStatusBadge(event.status)}
                                                    </div>
                                                    <p className="text-gray-600 text-sm mb-2">
                                                        Por: {event.organizer} • {new Date(event.date).toLocaleDateString('es-ES')}
                                                    </p>
                                                    <div className="flex items-center space-x-4 text-sm">
                                                        <span className="text-gray-700">
                                                            Tickets: {event.tickets_sold}/{event.total_tickets}
                                                        </span>
                                                        <span className="text-green-600 font-medium">
                                                            ${event.revenue.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <Progress 
                                                        value={(event.tickets_sold / event.total_tickets) * 100} 
                                                        className="mt-2 h-2"
                                                    />
                                                </div>
                                                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-black hover:bg-gray-200">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Users */}
                            <Card className="bg-white border-gray-200 shadow-lg">
                                <CardHeader className="border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-black flex items-center space-x-3">
                                            <Users className="w-6 h-6 text-purple-500" />
                                            <span>Usuarios Recientes</span>
                                        </CardTitle>
                                        <Link href="/admin/users">
                                            <Button variant="ghost" size="sm" className="text-purple-500 hover:text-purple-600 hover:bg-purple-50">
                                                Ver todos
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        {recentUsers.map((user) => (
                                            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white font-semibold text-sm">
                                                            {user.name.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-black font-medium">{user.name}</h4>
                                                        <p className="text-gray-600 text-sm">{user.email}</p>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            {getRoleBadge(user.role)}
                                                            {getStatusBadge(user.status)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-gray-600 text-sm">
                                                        {new Date(user.joined).toLocaleDateString('es-ES')}
                                                    </p>
                                                    {user.purchases !== undefined && (
                                                        <p className="text-gray-700 text-xs">
                                                            {user.purchases} compras
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Alerts & Quick Actions */}
                        <div className="space-y-8">
                            {/* System Status */}
                            <Card className="bg-white border-gray-200 shadow-lg">
                                <CardHeader className="border-b border-gray-200">
                                    <CardTitle className="text-black flex items-center space-x-3">
                                        <Activity className="w-6 h-6 text-green-500" />
                                        <span>Estado del Sistema</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                            <span className="text-gray-700 font-medium">Servidores</span>
                                        </div>
                                        <Badge className="bg-green-500 text-white border-0">
                                            Operativo
                                        </Badge>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                            <span className="text-gray-700 font-medium">Base de Datos</span>
                                        </div>
                                        <Badge className="bg-green-500 text-white border-0">
                                            Operativo
                                        </Badge>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <div className="flex items-center space-x-2">
                                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                            <span className="text-gray-700 font-medium">CDN</span>
                                        </div>
                                        <Badge className="bg-yellow-500 text-white border-0">
                                            Lento
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* System Alerts */}
                            <Card className="bg-white border-gray-200 shadow-lg">
                                <CardHeader className="border-b border-gray-200">
                                    <CardTitle className="text-black flex items-center space-x-3">
                                        <AlertTriangle className="w-6 h-6 text-orange-500" />
                                        <span>Alertas del Sistema</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        {systemAlerts.map((alert) => (
                                            <div key={alert.id} className="p-3 bg-gray-50 rounded-lg border-l-4 border-orange-500">
                                                <div className="flex items-start space-x-3">
                                                    {getAlertIcon(alert.type)}
                                                    <div className="flex-1">
                                                        <h4 className="text-black font-medium text-sm">{alert.title}</h4>
                                                        <p className="text-gray-600 text-xs mt-1">{alert.message}</p>
                                                        <p className="text-gray-500 text-xs mt-2">{alert.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card className="bg-white border-gray-200 shadow-lg">
                                <CardHeader className="border-b border-gray-200">
                                    <CardTitle className="text-black flex items-center space-x-3">
                                        <Settings className="w-6 h-6 text-gray-600" />
                                        <span>Acciones Rápidas</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-3">
                                    <Link href="/admin/users">
                                        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white justify-start">
                                            <UserCheck className="w-4 h-4 mr-2" />
                                            Gestionar Usuarios
                                        </Button>
                                    </Link>
                                    
                                    <Link href="/admin/organizers">
                                        <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white justify-start">
                                            <Building className="w-4 h-4 mr-2" />
                                            Gestionar Organizadores
                                        </Button>
                                    </Link>
                                    
                                    <Link href="/admin/events">
                                        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white justify-start">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Revisar Eventos
                                        </Button>
                                    </Link>
                                    
                                    <Link href="/admin/reports">
                                        <Button className="w-full bg-green-500 hover:bg-green-600 text-white justify-start">
                                            <BarChart3 className="w-4 h-4 mr-2" />
                                            Ver Reportes
                                        </Button>
                                    </Link>
                                    
                                    <Link href="/admin/settings">
                                        <Button className="w-full bg-gray-500 hover:bg-gray-600 text-white justify-start">
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