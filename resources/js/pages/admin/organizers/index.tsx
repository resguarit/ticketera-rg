import { useState, useEffect, useCallback, useRef } from 'react';
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
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import ConfirmationModal from '../../../components/ConfirmationModal';

// Components
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout';
import type { StatCardProps, FilterConfig } from '@/types/admin';
import { Organizer } from '@/types';
import { PaginatedResponse } from '@/types/ui/ui';

interface Stat {
    total_organizers: number;
    active_organizers: number;
    total_events: number;
    organizers_with_active_events: number;
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
    const { organizers, stats, filters } = usePage<PageProps>().props;

    // Estados para manejar los filtros - CORREGIDO
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [selectedStatus, setSelectedStatus] = useState("all"); // Este está bien
    const [sortBy, setSortBy] = useState(filters.sort_by || "created_at"); // Este está bien
    
    // Ref para controlar si es la primera carga
    const isInitialLoad = useRef(true);
    
    // Ref para controlar timeouts de debounce
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Estado para el modal de confirmación
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [organizerToDelete, setOrganizerToDelete] = useState<OrganizerIndex | null>(null);

    // Función para aplicar filtros automáticamente - CORREGIDO
    const applyFilters = useCallback((resetPage = true) => {
        const params: Record<string, any> = {
            search: searchTerm || undefined,
            // REMOVIDO: No enviar status ya que no lo estás usando en el backend
            // status: selectedStatus !== "all" ? selectedStatus : undefined,
            sort_by: sortBy !== "created_at" ? sortBy : undefined,
        };

        // Solo resetear página si resetPage es true
        if (!resetPage) {
            params.page = filters.page || 1;
        }

        // Filtrar parámetros undefined
        const filteredParams = Object.fromEntries(
            Object.entries(params).filter(([_, value]) => value !== undefined)
        );

        router.get(route('admin.organizers.index'), filteredParams, {
            preserveState: true,
            replace: true,
            only: ['organizers', 'stats']
        });
    }, [searchTerm, sortBy, filters.page]); // REMOVIDO selectedStatus de las dependencias

    // Aplicar filtros automáticamente cuando cambien los selectores (excepto en la primera carga)
    useEffect(() => {
        if (isInitialLoad.current) {
            isInitialLoad.current = false;
            return;
        }
        
        applyFilters(true); // Resetear página cuando cambian los filtros
    }, [sortBy, applyFilters]); // Agregar applyFilters a las dependencias

    // Para la búsqueda, aplicar con debounce
    useEffect(() => {
        if (isInitialLoad.current) {
            return;
        }

        // Limpiar timeout anterior
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Si la búsqueda está vacía, aplicar inmediatamente
        if (searchTerm.trim() === '') {
            applyFilters(true);
            return;
        }

        // Aplicar búsqueda con debounce
        searchTimeoutRef.current = setTimeout(() => {
            applyFilters(true); // Resetear página cuando se busca
        }, 500);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm, applyFilters]); // Agregar applyFilters a las dependencias

    // Limpiar timeout al desmontar
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    // Función para manejar la paginación
    const handlePagination = (url: string) => {
        if (!url) return;
        
        router.get(url, {}, {
            preserveState: true,
            replace: true,
            only: ['organizers']
        });
    };

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
            title: "Con Eventos Activos",
            value: stats.organizers_with_active_events,
            format: "number",
            icon: CheckCircle,
            variant: "warning"
        }
    ];

    // Función para limpiar filtros
    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedStatus("all");
        setSortBy("created_at");
        
        router.get(route('admin.organizers.index'), {}, {
            preserveState: true,
            replace: true,
            only: ['organizers', 'stats']
        });
    };

    // Manejar Enter en búsqueda para aplicar inmediatamente
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            // Limpiar timeout y aplicar inmediatamente
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            applyFilters(true);
        }
    };

    const handleDeleteOrganizer = (organizerId: number) => {
        router.delete(route('admin.organizers.destroy', organizerId), {
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
            <Head title="Gestión de Organizadores" />
            
            <AdminDashboardLayout
                title="Gestión de Organizadores"
                description="Administra todos los organizadores de eventos"
                stats={organizerStats}
                filterConfig={{
                    searchPlaceholder: "Buscar organizadores...",
                    customFilters: [
                        // CORREGIDO: Comentar o remover el filtro de status si no lo usas en el backend
                        /*
                        {
                            key: "status",
                            placeholder: "Estado",
                            options: [
                                { value: "active", label: "Activos" },
                                { value: "inactive", label: "Inactivos" }
                            ]
                        },
                        */
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
                    // REMOVIDO: status: selectedStatus, (ya que no lo usas)
                    sort_by: sortBy
                }}
                onCustomFilterChange={(key: string, value: string) => {
                    // REMOVIDO: if (key === 'status') setSelectedStatus(value);
                    if (key === 'sort_by') setSortBy(value);
                }}
                onClearFilters={handleClearFilters}
                onKeyPress={handleKeyPress}
                searchDebounceMs={500}
            >
                {/* Organizers Content */}
                <div className="space-y-4">
                    {organizers.data.map((organizer) => (
                        <div key={organizer.id} className="p-2 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                            <div className="flex items-center space-x-4 sm:space-x-6">
                                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                    {organizer.image_url ? (
                                        <img 
                                            src={organizer.image_url}
                                            alt={`Logo de ${organizer.name}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
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
                                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-3 mb-3'>
                                                <span className="flex items-center space-x-1">
                                                    <Users className="w-4 h-4" />
                                                    <span>{organizer.referring}</span>
                                                </span>
                                                <span className="flex items-center space-x-1">
                                                    <Mail className="w-4 h-4" />
                                                    <span>{organizer.email}</span>
                                                </span>
                                                </div>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-3 mb-3">
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
                                        <div className='flex items-center space-x-2'>
                                            <Link href={route('admin.organizers.show', organizer.id)} >
                                            <Button variant="outline" size="sm" className="border-gray-300 text-black hover:bg-gray-50" >Ver perfil</Button>
                                            </Link>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-black hover:bg-gray-200">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-56 bg-white border-gray-300">
                                                <DropdownMenuItem 
                                                    className="text-gray-700 hover:bg-gray-50"
                                                    onClick={() => router.get(route('admin.organizers.edit', organizer.id))}
                                                >
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Editar organizador
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-gray-200" />
                                                <DropdownMenuItem 
                                                    className="text-red-600 focus:text-red-600 hover:bg-red-50"
                                                    onClick={() => {
                                                        setOrganizerToDelete(organizer);
                                                        setIsConfirmModalOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Eliminar organizador
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        </div>
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
                                {searchTerm 
                                    ? "Prueba ajustando los filtros de búsqueda"
                                    : "Aún no hay organizadores registrados"}
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination - Actualizada para usar la función handlePagination */}
                {organizers.data.length > 0 && (
                    <div className="mt-6 flex justify-center">
                        <div className="flex items-center space-x-2">
                            {organizers.links.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={() => handlePagination(link.url)}
                                    disabled={!link.url}
                                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
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
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => {
                    setIsConfirmModalOpen(false);
                    setOrganizerToDelete(null);
                }}
                onConfirm={() => {
                    if (organizerToDelete) {
                        handleDeleteOrganizer(organizerToDelete.id);
                    }
                    setIsConfirmModalOpen(false);
                    setOrganizerToDelete(null);
                }}
                accionTitulo="Eliminación"
                accion="Eliminar"
                pronombre="este"
                entidad="organizador"
                accionando="eliminando"
                nombreElemento={organizerToDelete?.name}
                advertencia="Todos los datos asociados al organizador también serán eliminados."
                confirmVariant='destructive'
                isLoading={false}
            />
        </>
    );
}

// Asignamos el Layout de Administrador
Index.layout = (page: any) => <AppLayout children={page} />;