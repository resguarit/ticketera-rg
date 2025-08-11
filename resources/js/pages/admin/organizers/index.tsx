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
            
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="section text-foreground">
                                Gestión de Organizadores
                            </h2>
                            <p className="text-muted-foreground text-lg">
                                Administra todos los organizadores de eventos
                            </p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <Link href="/admin/organizers/create">
                                <Button className="bg-primary text-primary-foreground hover:bg-primary-hover">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Crear Organizador
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-card border-border shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-muted-foreground text-sm font-medium">Total Organizadores</p>
                                        <p className="text-2xl font-bold text-card-foreground">{stats.total_organizers}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                                        <Building className="w-6 h-6 text-primary-foreground" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card border-border shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-muted-foreground text-sm font-medium">Organizadores Activos</p>
                                        <p className="text-2xl font-bold text-card-foreground">{stats.active_organizers}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-chart-2 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-primary-foreground" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card border-border shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-muted-foreground text-sm font-medium">Eventos Creados</p>
                                        <p className="text-2xl font-bold text-card-foreground">{stats.total_events}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-chart-3 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-primary-foreground" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card border-border shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-muted-foreground text-sm font-medium">Ingresos Totales</p>
                                        <p className="text-2xl font-bold text-card-foreground">${stats.total_revenue.toLocaleString()}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-chart-4 rounded-lg flex items-center justify-center">
                                        <DollarSign className="w-6 h-6 text-primary-foreground" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters - Simplificado a solo búsqueda */}
                    <Card className="bg-card border-border shadow-lg mb-8">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                <div className="relative md:col-span-5">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                    <Input
                                        placeholder="Buscar por nombre o email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                                    />
                                </div>

                                <Button 
                                    onClick={() => setSearchTerm("")}
                                    variant="outline"
                                    className="border-border text-foreground hover:bg-accent bg-background"
                                >
                                    <Filter className="w-4 h-4 mr-2" />
                                    Limpiar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Organizers Table - Usando datos reales de `organizers` */}
                    <Card className="bg-card border-border shadow-lg">
                        <CardHeader className="border-b border-border pb-6">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-card-foreground">
                                    Organizadores ({organizers.total})
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {organizers.data.map((organizer) => (
                                    <div key={organizer.id} className="p-4 bg-muted rounded-lg hover:bg-accent transition-colors border border-border">
                                        <div className="flex items-center space-x-6">
                                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                                                {organizer.logo_url ? (
                                                    <img 
                                                        src={organizer.logo_url.startsWith('/') ? organizer.logo_url : `/images/organizers/${organizer.logo_url}`}
                                                        alt={`Logo de ${organizer.name}`}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            // Fallback si no se encuentra la imagen
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : null}
                                                <div className={`w-full h-full bg-gradient-to-r from-primary to-chart-2 flex items-center justify-center ${organizer.logo_url ? 'hidden' : ''}`}>
                                                    <Building className="w-8 h-8 text-primary-foreground" />
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-card-foreground mb-1 flex items-center space-x-2">
                                                            <span>{organizer.name}</span>
                                                            {/* Se elimina badge de verificado */}
                                                        </h3>
                                                        <p className="text-muted-foreground text-sm flex items-center space-x-4">
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
                                                    <div className="flex items-center text-muted-foreground text-sm">
                                                        <Calendar className="w-4 h-4 mr-2 text-primary" />
                                                        <span>Registro: {new Date(organizer.created_at).toLocaleDateString('es-ES')}</span>
                                                    </div>
                                                    <div className="flex items-center text-muted-foreground text-sm">
                                                        <Calendar className="w-4 h-4 mr-2 text-chart-3" />
                                                        <span>{organizer.events_count} eventos</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                                        <span>Teléfono: {organizer.phone}</span>
                                                        <span>ID: #{organizer.id}</span>
                                                    </div>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent">
                                                                <MoreVertical className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent className="w-56 bg-popover border-border">
                                                            <DropdownMenuItem 
                                                                className="hover:bg-accent"
                                                                onClick={() => router.get(route('admin.organizers.show', organizer.id))}
                                                            >
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                Ver perfil
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                className="hover:bg-accent"
                                                                onClick={() => router.get(route('admin.organizers.edit', organizer.id))}
                                                            >
                                                                <Edit className="w-4 h-4 mr-2" />
                                                                Editar organizador
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-border" />
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <DropdownMenuItem 
                                                                        className="text-destructive focus:text-destructive hover:bg-destructive/10"
                                                                        onSelect={(e) => e.preventDefault()}
                                                                    >
                                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                                        Eliminar organizador
                                                                    </DropdownMenuItem>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent className="bg-popover border-border">
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle className="text-popover-foreground">¿Estás seguro?</AlertDialogTitle>
                                                                        <AlertDialogDescription className="text-muted-foreground">
                                                                            Esta acción no se puede deshacer. Esto eliminará permanentemente el organizador
                                                                            "{organizer.name}" y todos los datos relacionados.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel className="border-border text-foreground hover:bg-accent">Cancelar</AlertDialogCancel>
                                                                        <AlertDialogAction 
                                                                            onClick={() => handleDeleteOrganizer(organizer.id)}
                                                                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
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
                                        <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-foreground mb-2">No se encontraron organizadores</h3>
                                        <p className="text-muted-foreground mb-6">
                                            {filters.search
                                                ? "Prueba ajustando los filtros de búsqueda"
                                                : "Aún no hay organizadores registrados"}
                                        </p>
                                        <Link href={route('admin.organizers.create')}>
                                            <Button className="bg-primary text-primary-foreground hover:bg-primary-hover">
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