import { useState } from 'react';
import { 
    Search, 
    Plus, 
    Filter, 
    MoreVertical, 
    Eye, 
    Edit, 
    Trash2, 
    Calendar, 
    MapPin, 
    Users, 
    DollarSign,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Download,
    Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';

// Mock data de eventos
const mockEvents = [
    {
        id: 1,
        title: "Festival de Música Electrónica 2024",
        organizer: {
            id: 1,
            name: "MusicPro Events",
            email: "contact@musicpro.com"
        },
        category: "música",
        date: "2024-03-15",
        time: "20:00",
        location: "Estadio Nacional",
        city: "Buenos Aires",
        status: "active",
        tickets_sold: 2450,
        total_tickets: 3000,
        revenue: 125000,
        price_range: "8500 - 25000",
        created_at: "2024-02-01",
        image: "/placeholder.svg?height=200&width=300",
        featured: true
    },
    {
        id: 2,
        title: "Concierto Rock Nacional",
        organizer: {
            id: 2,
            name: "Rock Producciones",
            email: "info@rockprod.com"
        },
        category: "música",
        date: "2024-03-20",
        time: "21:30",
        location: "Luna Park",
        city: "Buenos Aires",
        status: "pending",
        tickets_sold: 890,
        total_tickets: 1500,
        revenue: 45000,
        price_range: "5000 - 12000",
        created_at: "2024-02-10",
        image: "/placeholder.svg?height=200&width=300",
        featured: false
    },
    {
        id: 3,
        title: "Teatro: Romeo y Julieta",
        organizer: {
            id: 3,
            name: "Teatro Municipal",
            email: "teatro@municipal.gov"
        },
        category: "teatro",
        date: "2024-03-25",
        time: "20:00",
        location: "Teatro San Martín",
        city: "Córdoba",
        status: "active",
        tickets_sold: 180,
        total_tickets: 200,
        revenue: 18000,
        price_range: "3000 - 8000",
        created_at: "2024-01-15",
        image: "/placeholder.svg?height=200&width=300",
        featured: false
    },
    {
        id: 4,
        title: "Conferencia Tech 2024",
        organizer: {
            id: 4,
            name: "TechEvents",
            email: "events@tech.com"
        },
        category: "conferencia",
        date: "2024-04-01",
        time: "09:00",
        location: "Centro de Convenciones",
        city: "Rosario",
        status: "draft",
        tickets_sold: 0,
        total_tickets: 500,
        revenue: 0,
        price_range: "2000 - 5000",
        created_at: "2024-02-20",
        image: "/placeholder.svg?height=200&width=300",
        featured: false
    },
    {
        id: 5,
        title: "Copa de Fútbol Amateur",
        organizer: {
            id: 5,
            name: "Liga Amateur",
            email: "liga@amateur.com"
        },
        category: "deportes",
        date: "2024-03-30",
        time: "16:00",
        location: "Estadio Centenario",
        city: "Montevideo",
        status: "cancelled",
        tickets_sold: 150,
        total_tickets: 800,
        revenue: 7500,
        price_range: "500 - 1500",
        created_at: "2024-01-20",
        image: "/placeholder.svg?height=200&width=300",
        featured: false
    }
];

const eventStats = {
    total: mockEvents.length,
    active: mockEvents.filter(e => e.status === 'active').length,
    pending: mockEvents.filter(e => e.status === 'pending').length,
    draft: mockEvents.filter(e => e.status === 'draft').length,
    cancelled: mockEvents.filter(e => e.status === 'cancelled').length,
    totalRevenue: mockEvents.reduce((sum, e) => sum + e.revenue, 0),
    totalTicketsSold: mockEvents.reduce((sum, e) => sum + e.tickets_sold, 0)
};

export default function Events({ auth }: any) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedCity, setSelectedCity] = useState("all");
    const [sortBy, setSortBy] = useState("date");
    const [viewMode, setViewMode] = useState("all");

    const filteredEvents = mockEvents.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            event.organizer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            event.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === "all" || event.status === selectedStatus;
        const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
        const matchesCity = selectedCity === "all" || event.city === selectedCity;

        return matchesSearch && matchesStatus && matchesCategory && matchesCity;
    });

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: { label: "Activo", color: "bg-green-500 hover:bg-green-600" },
            pending: { label: "Pendiente", color: "bg-yellow-500 hover:bg-yellow-600" },
            draft: { label: "Borrador", color: "bg-gray-500 hover:bg-gray-600" },
            cancelled: { label: "Cancelado", color: "bg-red-500 hover:bg-red-600" }
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
        
        return (
            <Badge className={`${config.color} text-white border-0`}>
                {config.label}
            </Badge>
        );
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "active": return <CheckCircle className="w-4 h-4 text-green-500" />;
            case "pending": return <Clock className="w-4 h-4 text-yellow-500" />;
            case "cancelled": return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
        }
    };

    const handleDeleteEvent = (eventId: number) => {
        console.log(`Eliminar evento ${eventId}`);
        // Aquí iría la lógica para eliminar el evento
    };

    const handleStatusChange = (eventId: number, newStatus: string) => {
        console.log(`Cambiar estado del evento ${eventId} a ${newStatus}`);
        // Aquí iría la lógica para cambiar el estado
    };

    return (
        <>
            <Head title="Gestión de Eventos - Panel Admin" />
            
            <div className="min-h-screen bg-white">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-black mb-2">
                                Gestión de Eventos
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Administra todos los eventos de la plataforma
                            </p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <Button 
                                variant="outline" 
                                className="border-gray-300 text-black hover:bg-gray-50 bg-white"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Exportar
                            </Button>
                            
                            <Button 
                                variant="outline" 
                                className="border-gray-300 text-black hover:bg-gray-50 bg-white"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Importar
                            </Button>
                            
                            <Link href="/admin/events/create">
                                <Button className="bg-black text-white hover:bg-gray-800">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Crear Evento
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-white border-gray-200 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Total Eventos</p>
                                        <p className="text-2xl font-bold text-black">{eventStats.total}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-gray-200 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Eventos Activos</p>
                                        <p className="text-2xl font-bold text-black">{eventStats.active}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-gray-200 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Tickets Vendidos</p>
                                        <p className="text-2xl font-bold text-black">{eventStats.totalTicketsSold.toLocaleString()}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-gray-200 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Ingresos Totales</p>
                                        <p className="text-2xl font-bold text-black">${eventStats.totalRevenue.toLocaleString()}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                                        <DollarSign className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="bg-white border-gray-200 shadow-lg mb-8">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                    <Input
                                        placeholder="Buscar eventos..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 bg-white border-gray-300 text-black placeholder:text-gray-500"
                                    />
                                </div>

                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger className="bg-white border-gray-300 text-black">
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-gray-300">
                                        <SelectItem value="all">Todos los estados</SelectItem>
                                        <SelectItem value="active">Activos</SelectItem>
                                        <SelectItem value="pending">Pendientes</SelectItem>
                                        <SelectItem value="draft">Borradores</SelectItem>
                                        <SelectItem value="cancelled">Cancelados</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="bg-white border-gray-300 text-black">
                                        <SelectValue placeholder="Categoría" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-gray-300">
                                        <SelectItem value="all">Todas las categorías</SelectItem>
                                        <SelectItem value="música">Música</SelectItem>
                                        <SelectItem value="teatro">Teatro</SelectItem>
                                        <SelectItem value="deportes">Deportes</SelectItem>
                                        <SelectItem value="conferencia">Conferencias</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={selectedCity} onValueChange={setSelectedCity}>
                                    <SelectTrigger className="bg-white border-gray-300 text-black">
                                        <SelectValue placeholder="Ciudad" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-gray-300">
                                        <SelectItem value="all">Todas las ciudades</SelectItem>
                                        <SelectItem value="Buenos Aires">Buenos Aires</SelectItem>
                                        <SelectItem value="Córdoba">Córdoba</SelectItem>
                                        <SelectItem value="Rosario">Rosario</SelectItem>
                                        <SelectItem value="Montevideo">Montevideo</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="bg-white border-gray-300 text-black">
                                        <SelectValue placeholder="Ordenar por" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-gray-300">
                                        <SelectItem value="date">Fecha</SelectItem>
                                        <SelectItem value="revenue">Ingresos</SelectItem>
                                        <SelectItem value="tickets">Tickets vendidos</SelectItem>
                                        <SelectItem value="created">Fecha de creación</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button 
                                    onClick={() => {
                                        setSearchTerm("");
                                        setSelectedStatus("all");
                                        setSelectedCategory("all");
                                        setSelectedCity("all");
                                        setSortBy("date");
                                    }}
                                    variant="outline"
                                    className="border-gray-300 text-black hover:bg-gray-50 bg-white"
                                >
                                    <Filter className="w-4 h-4 mr-2" />
                                    Limpiar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Events Table */}
                    <Card className="bg-white border-gray-200 shadow-lg">
                        <CardHeader className="border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-black">
                                    Eventos ({filteredEvents.length})
                                </CardTitle>
                                <Tabs value={viewMode} onValueChange={setViewMode} className="w-auto">
                                    <TabsList className="bg-gray-100 border border-gray-300">
                                        <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-black">Todos</TabsTrigger>
                                        <TabsTrigger value="active" className="data-[state=active]:bg-white data-[state=active]:text-black">Activos</TabsTrigger>
                                        <TabsTrigger value="pending" className="data-[state=active]:bg-white data-[state=active]:text-black">Pendientes</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {filteredEvents.map((event) => (
                                    <div key={event.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                        <div className="flex items-center space-x-6">
                                            {/* Event Image */}
                                            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                                    <Calendar className="w-8 h-8 text-gray-600" />
                                                </div>
                                            </div>

                                            {/* Event Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-black mb-1 flex items-center space-x-2">
                                                            <span>{event.title}</span>
                                                            {event.featured && (
                                                                <Badge className="bg-orange-500 text-white border-0 text-xs">
                                                                    Destacado
                                                                </Badge>
                                                            )}
                                                        </h3>
                                                        <p className="text-gray-600 text-sm">
                                                            Por: {event.organizer.name} • {event.organizer.email}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(event.status)}
                                                        {getStatusBadge(event.status)}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                                                    <div className="flex items-center text-gray-700 text-sm">
                                                        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                                        <span>{new Date(event.date).toLocaleDateString('es-ES')} • {event.time}</span>
                                                    </div>
                                                    <div className="flex items-center text-gray-700 text-sm">
                                                        <MapPin className="w-4 h-4 mr-2 text-purple-500" />
                                                        <span>{event.location}, {event.city}</span>
                                                    </div>
                                                    <div className="flex items-center text-gray-700 text-sm">
                                                        <Users className="w-4 h-4 mr-2 text-green-500" />
                                                        <span>{event.tickets_sold}/{event.total_tickets} tickets</span>
                                                    </div>
                                                    <div className="flex items-center text-gray-700 text-sm">
                                                        <DollarSign className="w-4 h-4 mr-2 text-orange-500" />
                                                        <span>${event.revenue.toLocaleString()}</span>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                        <span>Progreso de ventas</span>
                                                        <span>{Math.round((event.tickets_sold / event.total_tickets) * 100)}%</span>
                                                    </div>
                                                    <Progress value={(event.tickets_sold / event.total_tickets) * 100} className="h-2" />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                        <span>Rango: ${event.price_range} ARS</span>
                                                        <span>Categoría: {event.category}</span>
                                                        <span>Creado: {new Date(event.created_at).toLocaleDateString('es-ES')}</span>
                                                    </div>

                                                    {/* Actions */}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-black hover:bg-gray-200">
                                                                <MoreVertical className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent className="w-56 bg-white border-gray-300">
                                                            <DropdownMenuItem className="hover:bg-gray-100">
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                Ver detalles
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="hover:bg-gray-100">
                                                                <Edit className="w-4 h-4 mr-2" />
                                                                Editar evento
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-gray-200" />
                                                            <DropdownMenuItem 
                                                                onClick={() => handleStatusChange(event.id, 'active')}
                                                                disabled={event.status === 'active'}
                                                                className="hover:bg-gray-100"
                                                            >
                                                                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                                                Activar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => handleStatusChange(event.id, 'pending')}
                                                                disabled={event.status === 'pending'}
                                                                className="hover:bg-gray-100"
                                                            >
                                                                <Clock className="w-4 h-4 mr-2 text-yellow-500" />
                                                                Poner en revisión
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => handleStatusChange(event.id, 'cancelled')}
                                                                disabled={event.status === 'cancelled'}
                                                                className="hover:bg-gray-100"
                                                            >
                                                                <XCircle className="w-4 h-4 mr-2 text-red-500" />
                                                                Cancelar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-gray-200" />
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <DropdownMenuItem 
                                                                        className="text-red-600 focus:text-red-600 hover:bg-red-50"
                                                                        onSelect={(e) => e.preventDefault()}
                                                                    >
                                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                                        Eliminar evento
                                                                    </DropdownMenuItem>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent className="bg-white border-gray-300">
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle className="text-black">¿Estás seguro?</AlertDialogTitle>
                                                                        <AlertDialogDescription className="text-gray-600">
                                                                            Esta acción no se puede deshacer. Esto eliminará permanentemente el evento
                                                                            "{event.title}" y todos los datos relacionados.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel className="border-gray-300 text-black hover:bg-gray-50">Cancelar</AlertDialogCancel>
                                                                        <AlertDialogAction 
                                                                            onClick={() => handleDeleteEvent(event.id)}
                                                                            className="bg-red-600 hover:bg-red-700 text-white"
                                                                        >
                                                                            Eliminar
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {filteredEvents.length === 0 && (
                                    <div className="text-center py-12">
                                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-black mb-2">No se encontraron eventos</h3>
                                        <p className="text-gray-600 mb-6">
                                            {searchTerm || selectedStatus !== "all" || selectedCategory !== "all" || selectedCity !== "all"
                                                ? "Prueba ajustando los filtros de búsqueda"
                                                : "Aún no hay eventos creados"}
                                        </p>
                                        <Link href="/admin/events/create">
                                            <Button className="bg-black text-white hover:bg-gray-800">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Crear primer evento
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

// Asignamos el Layout de Administrador
Events.layout = (page: any) => <AppLayout children={page} />;