import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { formatDate } from '@/lib/dateHelpers';
import { 
    Plus, 
    MoreVertical, 
    Eye, 
    Edit, 
    Trash2, 
    Building, 
    Mail, 
    Calendar, 
    Users,
    CheckCircle,
    DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

// Components
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout';
import type { StatCardProps, FilterConfig } from '@/types/admin';
import { Organizer } from '@/types';
import { PaginatedResponse } from '@/types/ui/ui';

interface Stat {
    total_organizers: number;
    active_organizers: number;
    total_events: number;
    total_revenue: number;
}

interface OrganizerIndex extends Organizer {
    events_count: number; // de withCount('events')
}

interface PageProps {
    organizers: PaginatedResponse<OrganizerIndex>;
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
    console.log(organizers)

    // Estados para manejar los filtros
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [sortBy, setSortBy] = useState(filters.sort_by || "created_at");
    const [hasPendingFilters, setHasPendingFilters] = useState(false);
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

    // Configuración de estadísticas para el dashboard
    const organizerStats: StatCardProps[] = [
        {
            title: "Total Organizadores",
            value: stats.total_organizers,
            format: "number",
            icon: Building,
            variant: "primary"
        },
        {
            title: "Organizadores Activos",
            value: stats.active_organizers,
            format: "number",
            icon: CheckCircle,
            variant: "success"
        },
        {
            title: "Eventos Creados",
            value: stats.total_events,
            format: "number",
            icon: Calendar,
            variant: "info"
        },
        {
            title: "Ingresos Totales",
            value: stats.total_revenue,
            format: "currency",
            icon: DollarSign,
            variant: "warning"
        }
    ];

    // Detectar cambios pendientes en filtros
    useEffect(() => {
        const hasChanges = 
            searchTerm !== (filters.search || "") ||
            selectedStatus !== "all" ||
            sortBy !== (filters.sort_by || "created_at");
        
        setHasPendingFilters(hasChanges);
    }, [searchTerm, selectedStatus, sortBy, filters]);

    // Función para aplicar filtros
    const handleFilters = () => {
        router.get(route('admin.organizers.index'), {
            search: searchTerm,
            status: selectedStatus !== "all" ? selectedStatus : undefined,
            sort_by: sortBy,
        }, {
            preserveState: true,
            replace: true,
            onFinish: () => {
                setHasPendingFilters(false);
            }
        });
    };

    // Función para limpiar filtros
    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedStatus("all");
        setSortBy("created_at");
        setHasPendingFilters(false);
        
        router.get(route('admin.organizers.index'), {}, {
            preserveState: true,
            replace: true
        });
    };

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
            
            <AdminDashboardLayout
                title="Gestión de Organizadores"
                description="Administra todos los organizadores de eventos"
                stats={organizerStats}
                filterConfig={{
                    searchPlaceholder: "Buscar organizadores...",
                    customFilters: [
                        {
                            key: "status",
                            placeholder: "Estado",
                            options: [
                                { value: "all", label: "Todos los estados" },
                                { value: "active", label: "Activos" },
                                { value: "inactive", label: "Inactivos" }
                            ]
                        },
                        {
                            key: "sort_by",
                            placeholder: "Ordenar por",
                            options: [
                                { value: "created_at", label: "Fecha de registro" },
                                { value: "name", label: "Nombre" },
                                { value: "events_count", label: "Número de eventos" },
                                { value: "email", label: "Email" }
                            ]
                        }
                    ]
                }}
                primaryAction={{
                    label: "Crear Organizador",
                    onClick: () => router.get(route('admin.organizers.create')),
                    icon: Plus
                }}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                customFilterValues={{
                    status: selectedStatus,
                    sort_by: sortBy
                }}
                onCustomFilterChange={(key: string, value: string) => {
                    if (key === 'status') setSelectedStatus(value);
                    if (key === 'sort_by') setSortBy(value);
                }}
                onApplyFilters={handleFilters}
                onClearFilters={handleClearFilters}
                hasPendingFilters={hasPendingFilters}
            >
                {/* Organizers Content */}
                <div className="space-y-4">

                    {organizers.data.map((organizer) => (
                        
                        <div key={organizer.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                            <div className="flex items-center space-x-6">
                                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                    {organizer.image_url ? (
                                        <img 
                                            src={organizer.image_url}
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
                                        <Building className="w-8 h-8 text-white" />
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="text-lg font-semibold text-black mb-1 flex items-center space-x-2">
                                                <span>{organizer.name}</span>
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
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                        <div className="flex items-center text-gray-600 text-sm">
                                            <Calendar className="w-4 h-4 mr-2 text-primary" />
                                            <span>Registro: {formatDate(organizer.created_at)}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600 text-sm">
                                            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
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
                                                <DropdownMenuItem 
                                                    className="text-gray-700 hover:bg-gray-50"
                                                    onClick={() => router.get(route('admin.organizers.show', organizer.id))}
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    Ver perfil
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    className="text-gray-700 hover:bg-gray-50"
                                                    onClick={() => router.get(route('admin.organizers.edit', organizer.id))}
                                                >
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
                                {searchTerm || selectedStatus !== "all"
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

                {/* Pagination */}
                {organizers.data.length > 0 && (
                    <div className="mt-6 flex justify-center">
                        <div className="flex items-center space-x-2">
                            {organizers.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-3 py-2 text-sm rounded-md ${
                                        link.active
                                            ? 'bg-black text-white'
                                            : link.url
                                            ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </AdminDashboardLayout>
        </>
    );
}

// Asignamos el Layout de Administrador
Index.layout = (page: any) => <AppLayout children={page} />;