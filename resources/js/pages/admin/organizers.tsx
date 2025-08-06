import { useState } from 'react';
import { 
    Search, 
    Plus, 
    Filter, 
    MoreVertical, 
    Eye, 
    Edit, 
    Trash2, 
    Building, 
    Mail, 
    Calendar, 
    Users,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Download,
    Upload,
    Star,
    DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

// Mock data de organizadores
const mockOrganizers = [
    {
        id: 1,
        name: "MusicPro Events",
        contact_name: "Carlos Rodríguez",
        email: "contact@musicpro.com",
        phone: "+54 11 1234-5678",
        city: "Buenos Aires",
        status: "active",
        created_at: "2023-08-15",
        last_login: "2024-03-10",
        events_created: 12,
        total_revenue: 450000,
        rating: 4.8,
        verified: true
    },
    {
        id: 2,
        name: "Rock Producciones",
        contact_name: "Ana Martínez",
        email: "info@rockprod.com",
        phone: "+54 11 2345-6789",
        city: "Córdoba",
        status: "active",
        created_at: "2023-09-20",
        last_login: "2024-03-09",
        events_created: 8,
        total_revenue: 320000,
        rating: 4.6,
        verified: true
    },
    {
        id: 3,
        name: "Teatro Municipal",
        contact_name: "María González",
        email: "teatro@municipal.gov",
        phone: "+54 11 3456-7890",
        city: "Rosario",
        status: "pending",
        created_at: "2024-01-10",
        last_login: "2024-03-08",
        events_created: 3,
        total_revenue: 85000,
        rating: 4.2,
        verified: false
    },
    {
        id: 4,
        name: "TechEvents",
        contact_name: "Luis Fernández",
        email: "events@tech.com",
        phone: "+54 11 4567-8901",
        city: "Buenos Aires",
        status: "active",
        created_at: "2023-11-05",
        last_login: "2024-03-07",
        events_created: 15,
        total_revenue: 780000,
        rating: 4.9,
        verified: true
    },
    {
        id: 5,
        name: "Liga Amateur",
        contact_name: "Patricia López",
        email: "liga@amateur.com",
        phone: "+54 11 5678-9012",
        city: "Mendoza",
        status: "suspended",
        created_at: "2023-12-01",
        last_login: "2024-02-15",
        events_created: 2,
        total_revenue: 15000,
        rating: 3.8,
        verified: false
    }
];

const organizerStats = {
    total: mockOrganizers.length,
    active: mockOrganizers.filter(o => o.status === 'active').length,
    pending: mockOrganizers.filter(o => o.status === 'pending').length,
    suspended: mockOrganizers.filter(o => o.status === 'suspended').length,
    totalRevenue: mockOrganizers.reduce((sum, o) => sum + o.total_revenue, 0),
    totalEvents: mockOrganizers.reduce((sum, o) => sum + o.events_created, 0)
};

export default function Organizers({ auth }: any) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedVerification, setSelectedVerification] = useState("all");
    const [selectedCity, setSelectedCity] = useState("all");
    const [sortBy, setSortBy] = useState("created");
    const [viewMode, setViewMode] = useState("all");

    const filteredOrganizers = mockOrganizers.filter(organizer => {
        const matchesSearch = organizer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            organizer.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            organizer.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === "all" || organizer.status === selectedStatus;
        const matchesVerification = selectedVerification === "all" || 
            (selectedVerification === "verified" && organizer.verified) ||
            (selectedVerification === "unverified" && !organizer.verified);
        const matchesCity = selectedCity === "all" || organizer.city === selectedCity;

        return matchesSearch && matchesStatus && matchesVerification && matchesCity;
    });

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: { label: "Activo", color: "bg-green-500 hover:bg-green-600" },
            pending: { label: "Pendiente", color: "bg-yellow-500 hover:bg-yellow-600" },
            suspended: { label: "Suspendido", color: "bg-red-500 hover:bg-red-600" }
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        
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
            case "suspended": return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
        }
    };

    const handleDeleteOrganizer = (organizerId: number) => {
        console.log(`Eliminar organizador ${organizerId}`);
        // Aquí iría la lógica para eliminar el organizador
    };

    const handleStatusChange = (organizerId: number, newStatus: string) => {
        console.log(`Cambiar estado del organizador ${organizerId} a ${newStatus}`);
        // Aquí iría la lógica para cambiar el estado
    };

    const handleVerificationToggle = (organizerId: number) => {
        console.log(`Cambiar verificación del organizador ${organizerId}`);
        // Aquí iría la lógica para cambiar la verificación
    };

    return (
        <>
            <Head title="Gestión de Organizadores - Panel Admin" />
            
            <div className="min-h-screen bg-white">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-black mb-2">
                                Gestión de Organizadores
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Administra todos los organizadores de eventos
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
                            
                            <Button className="bg-black text-white hover:bg-gray-800">
                                <Plus className="w-4 h-4 mr-2" />
                                Crear Organizador
                            </Button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-white border-gray-200 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Total Organizadores</p>
                                        <p className="text-2xl font-bold text-black">{organizerStats.total}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <Building className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-gray-200 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Organizadores Activos</p>
                                        <p className="text-2xl font-bold text-black">{organizerStats.active}</p>
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
                                        <p className="text-gray-600 text-sm font-medium">Eventos Creados</p>
                                        <p className="text-2xl font-bold text-black">{organizerStats.totalEvents}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-gray-200 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Ingresos Totales</p>
                                        <p className="text-2xl font-bold text-black">${organizerStats.totalRevenue.toLocaleString()}</p>
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
                                        placeholder="Buscar organizadores..."
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
                                        <SelectItem value="suspended">Suspendidos</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={selectedVerification} onValueChange={setSelectedVerification}>
                                    <SelectTrigger className="bg-white border-gray-300 text-black">
                                        <SelectValue placeholder="Verificación" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-gray-300">
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="verified">Verificados</SelectItem>
                                        <SelectItem value="unverified">No verificados</SelectItem>
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
                                        <SelectItem value="Mendoza">Mendoza</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="bg-white border-gray-300 text-black">
                                        <SelectValue placeholder="Ordenar por" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-gray-300">
                                        <SelectItem value="created">Fecha de registro</SelectItem>
                                        <SelectItem value="events">Eventos creados</SelectItem>
                                        <SelectItem value="revenue">Ingresos</SelectItem>
                                        <SelectItem value="rating">Calificación</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button 
                                    onClick={() => {
                                        setSearchTerm("");
                                        setSelectedStatus("all");
                                        setSelectedVerification("all");
                                        setSelectedCity("all");
                                        setSortBy("created");
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

                    {/* Organizers Table */}
                    <Card className="bg-white border-gray-200 shadow-lg">
                        <CardHeader className="border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-black">
                                    Organizadores ({filteredOrganizers.length})
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
                                {filteredOrganizers.map((organizer) => (
                                    <div key={organizer.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                        <div className="flex items-center space-x-6">
                                            {/* Organizer Logo */}
                                            <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                                <Building className="w-8 h-8 text-white" />
                                            </div>

                                            {/* Organizer Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-black mb-1 flex items-center space-x-2">
                                                            <span>{organizer.name}</span>
                                                            {organizer.verified && (
                                                                <Badge className="bg-blue-500 text-white border-0 text-xs flex items-center space-x-1">
                                                                    <CheckCircle className="w-3 h-3" />
                                                                    <span>Verificado</span>
                                                                </Badge>
                                                            )}
                                                        </h3>
                                                        <p className="text-gray-600 text-sm flex items-center space-x-4">
                                                            <span className="flex items-center space-x-1">
                                                                <Users className="w-4 h-4" />
                                                                <span>{organizer.contact_name}</span>
                                                            </span>
                                                            <span className="flex items-center space-x-1">
                                                                <Mail className="w-4 h-4" />
                                                                <span>{organizer.email}</span>
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(organizer.status)}
                                                        {getStatusBadge(organizer.status)}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                                                    <div className="flex items-center text-gray-700 text-sm">
                                                        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                                        <span>Registro: {new Date(organizer.created_at).toLocaleDateString('es-ES')}</span>
                                                    </div>
                                                    <div className="flex items-center text-gray-700 text-sm">
                                                        <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                                                        <span>{organizer.events_created} eventos</span>
                                                    </div>
                                                    <div className="flex items-center text-gray-700 text-sm">
                                                        <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                                                        <span>${organizer.total_revenue.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex items-center text-gray-700 text-sm">
                                                        <Star className="w-4 h-4 mr-2 text-yellow-500" />
                                                        <span>{organizer.rating}/5.0</span>
                                                    </div>
                                                    <div className="flex items-center text-gray-700 text-sm">
                                                        <Building className="w-4 h-4 mr-2 text-orange-500" />
                                                        <span>{organizer.city}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                        <span>Teléfono: {organizer.phone}</span>
                                                        <span>Último acceso: {new Date(organizer.last_login).toLocaleDateString('es-ES')}</span>
                                                        <span>ID: #{organizer.id}</span>
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
                                                                Ver perfil
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="hover:bg-gray-100">
                                                                <Edit className="w-4 h-4 mr-2" />
                                                                Editar organizador
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => handleVerificationToggle(organizer.id)}
                                                                className="hover:bg-gray-100"
                                                            >
                                                                <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
                                                                {organizer.verified ? "Quitar verificación" : "Verificar"}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-gray-200" />
                                                            <DropdownMenuItem 
                                                                onClick={() => handleStatusChange(organizer.id, 'active')}
                                                                disabled={organizer.status === 'active'}
                                                                className="hover:bg-gray-100"
                                                            >
                                                                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                                                Activar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => handleStatusChange(organizer.id, 'suspended')}
                                                                disabled={organizer.status === 'suspended'}
                                                                className="hover:bg-gray-100"
                                                            >
                                                                <XCircle className="w-4 h-4 mr-2 text-red-500" />
                                                                Suspender
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-gray-200" />
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <DropdownMenuItem 
                                                                        className="text-red-600 focus:text-red-600 hover:bg-red-50"
                                                                        onSelect={(e) => e.preventDefault()}
                                                                    >
                                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                                        Eliminar organizador
                                                                    </DropdownMenuItem>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent className="bg-white border-gray-300">
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle className="text-black">¿Estás seguro?</AlertDialogTitle>
                                                                        <AlertDialogDescription className="text-gray-600">
                                                                            Esta acción no se puede deshacer. Esto eliminará permanentemente el organizador
                                                                            "{organizer.name}" y todos los datos relacionados.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel className="border-gray-300 text-black hover:bg-gray-50">Cancelar</AlertDialogCancel>
                                                                        <AlertDialogAction 
                                                                            onClick={() => handleDeleteOrganizer(organizer.id)}
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

                                {filteredOrganizers.length === 0 && (
                                    <div className="text-center py-12">
                                        <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-black mb-2">No se encontraron organizadores</h3>
                                        <p className="text-gray-600 mb-6">
                                            {searchTerm || selectedStatus !== "all" || selectedVerification !== "all" || selectedCity !== "all"
                                                ? "Prueba ajustando los filtros de búsqueda"
                                                : "Aún no hay organizadores registrados"}
                                        </p>
                                        <Button className="bg-black text-white hover:bg-gray-800">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Crear primer organizador
                                        </Button>
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
Organizers.layout = (page: any) => <AppLayout children={page} />;