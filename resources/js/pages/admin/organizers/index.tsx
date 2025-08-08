import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
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
import { Head, Link, usePage } from '@inertiajs/react';
import { useDebounce } from 'use-debounce';

// 1. Interfaces ajustadas a los datos reales del backend
interface Stat {
    total_organizers: number;
    active_organizers: number;
    total_events: number;
    total_revenue: number;
}

interface Organizer {
    id: number;
    name: string;
    email: string;
    referring: string;
    phone: string;
    events_count: number; // de withCount('events')
    logo_url: string;
    created_at: string;
}

interface PaginatedOrganizers {
    data: Organizer[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
}

interface PageProps {
    organizers: PaginatedOrganizers;
    stats: Stat;
    filters: {
        search: string;
        sort_by: string;
        sort_direction: string;
    };
    [key: string]: any;
}

export default function Index({ auth }: any) {
    // 2. Usar los props reales que vienen de Inertia
    const { organizers, stats, filters } = usePage<PageProps>().props;

    // Estados para manejar los filtros
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

    // 3. Eliminar la lógica de filtrado del lado del cliente (filteredOrganizers y mockOrganizers)

    // Efecto para recargar los datos cuando cambia el término de búsqueda
    useEffect(() => {
        router.get(
            route('admin.organizers.index'), 
            { search: debouncedSearchTerm }, 
            { 
                preserveState: true, 
                replace: true 
            }
        );
    }, [debouncedSearchTerm]);


    const handleDeleteOrganizer = (organizerId: number) => {
        // Lógica para eliminar (ej: usando Inertia)
        router.delete(route('admin.organizers.destroy', organizerId), {
            onBefore: () => confirm('¿Estás seguro de que quieres eliminar este organizador?'),
        });
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
                            <Link href="/admin/organizers/create">
                                <Button className="bg-black text-white hover:bg-gray-800">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Crear Organizador
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
                                        <p className="text-gray-600 text-sm font-medium">Total Organizadores</p>
                                        <p className="text-2xl font-bold text-black">{stats.total_organizers}</p>
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
                                        <p className="text-2xl font-bold text-black">{stats.active_organizers}</p>
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
                                        <p className="text-2xl font-bold text-black">{stats.total_events}</p>
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
                                        <p className="text-2xl font-bold text-black">${stats.total_revenue.toLocaleString()}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                                        <DollarSign className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters - Simplificado a solo búsqueda */}
                    <Card className="bg-white border-gray-200 shadow-lg mb-8">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                <div className="relative md:col-span-5">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                    <Input
                                        placeholder="Buscar por nombre o email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 bg-white border-gray-300 text-black placeholder:text-gray-500"
                                    />
                                </div>

                                <Button 
                                    onClick={() => setSearchTerm("")}
                                    variant="outline"
                                    className="border-gray-300 text-black hover:bg-gray-50 bg-white"
                                >
                                    <Filter className="w-4 h-4 mr-2" />
                                    Limpiar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Organizers Table - Usando datos reales de `organizers` */}
                    <Card className="bg-white border-gray-200 shadow-lg">
                        <CardHeader className="border-b border-gray-200 pb-6">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-black">
                                    Organizadores ({organizers.total})
                                </CardTitle>
                                {/* Se eliminan los Tabs de status ya que no existe en el modelo */}
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {organizers.data.map((organizer) => (
                                    <div key={organizer.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                        <div className="flex items-center space-x-6">
                                            <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                                {/* Puedes usar el logo_url si existe */}
                                                {organizer.logo_url ? <img src={`/storage/${organizer.logo_url}`} alt={organizer.name} className="w-full h-full object-cover rounded-lg" /> : <Building className="w-8 h-8 text-white" />}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-black mb-1 flex items-center space-x-2">
                                                            <span>{organizer.name}</span>
                                                            {/* Se elimina badge de verificado */}
                                                        </h3>
                                                        <p className="text-gray-600 text-sm flex items-center space-x-4">
                                                            <span className="flex items-center space-x-1">
                                                                <Users className="w-4 h-4" />
                                                                <span>{organizer.referring}</span>
                                                            </span>
                                                            <span className="flex items-center space-x-1">
                                                                <Mail className="w-4 h-4" />
                                                                <span>{organizer.email}</span>
                                                            </span>
                                                        </p>
                                                    </div>
                                                    {/* Se elimina el status badge */}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                                    <div className="flex items-center text-gray-700 text-sm">
                                                        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                                        <span>Registro: {new Date(organizer.created_at).toLocaleDateString('es-ES')}</span>
                                                    </div>
                                                    <div className="flex items-center text-gray-700 text-sm">
                                                        <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                                                        <span>{organizer.events_count} eventos</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                        <span>Teléfono: {organizer.phone}</span>
                                                        <span>ID: #{organizer.id}</span>
                                                    </div>

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

                                {organizers.data.length === 0 && (
                                    <div className="text-center py-12">
                                        <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-black mb-2">No se encontraron organizadores</h3>
                                        <p className="text-gray-600 mb-6">
                                            {filters.search
                                                ? "Prueba ajustando los filtros de búsqueda"
                                                : "Aún no hay organizadores registrados"}
                                        </p>
                                        <Link href={route('admin.organizers.create')}>
                                            <Button className="bg-black text-white hover:bg-gray-800">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Crear primer organizador
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
Index.layout = (page: any) => <AppLayout children={page} />;