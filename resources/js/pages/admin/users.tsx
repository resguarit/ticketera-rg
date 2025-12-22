import { useState, useEffect, useCallback, useRef } from 'react';
import { formatCurrency, formatNumber } from '@/lib/currencyHelpers';
import { Eye, Edit, Trash2, User, CheckCircle, Clock, XCircle, UserPlus, UsersIcon, ShoppingCart, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminDashboardLayout, StatCardProps, FilterConfig } from '@/components/admin';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import UserDetailsModal from './users/UserDetailsModal';
import ConfirmationModal from '@/components/ConfirmationModal';

interface UserData {
    id: number;
    name: string;
    email: string;
    phone: string;
    dni: string;
    address: string;
    status: 'active' | 'pending';
    email_verified_at: string | null;
    created_at: string;
    last_login: string;
    total_purchases: number;
    total_spent: string;
    last_purchase: string | null;
}

interface UserStats {
    total: number;
    active: number;
    pending: number;
    new_this_month: number;
    total_orders: number;
}

interface PaginatedUsers {
    data: UserData[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
}

interface PageProps {
    users: PaginatedUsers;
    stats: UserStats;
    filters: {
        search: string;
        status: string;
        sort_by: string;
        sort_direction: string;
    };
    [key: string]: any;
}

export default function Users({ auth }: any) {
    const { users, stats, filters } = usePage<PageProps>().props;

    // Estados para filtros locales
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [selectedStatus, setSelectedStatus] = useState(filters.status || "all");
    const [sortBy, setSortBy] = useState(filters.sort_by || "created_at");
    
    // Ref para controlar si es la primera carga
    const isInitialLoad = useRef(true);
    
    // Ref para controlar timeouts de debounce
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Estados para el modal
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserData | null>(null);

    // Función para aplicar filtros automáticamente
    const applyFilters = useCallback((resetPage = true) => {
        const params: Record<string, any> = {
            search: searchTerm || undefined,
            status: selectedStatus !== "all" ? selectedStatus : undefined,
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

        router.get(route('admin.users.index'), filteredParams, {
            preserveState: true,
            replace: true,
            only: ['users', 'stats']
        });
    }, [searchTerm, selectedStatus, sortBy, filters.page]);

    // Aplicar filtros automáticamente cuando cambien los selectores (excepto en la primera carga)
    useEffect(() => {
        if (isInitialLoad.current) {
            isInitialLoad.current = false;
            return;
        }
        
        applyFilters(true); // Resetear página cuando cambian los filtros
    }, [selectedStatus, sortBy]);

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
    }, [searchTerm]);

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
            only: ['users']
        });
    };

    // Funciones para el modal
    const handleViewUser = (user: UserData) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    // Configuración de estadísticas para el dashboard
    const userStats: StatCardProps[] = [
        {
            title: "Total Usuarios",
            value: stats.total,
            icon: UsersIcon,
            variant: "primary",
        },
        {
            title: "Usuarios Activos", 
            value: stats.active,
            icon: CheckCircle,
            variant: "success",
        },
        {
            title: "Nuevos Este Mes",
            value: stats.new_this_month,
            icon: TrendingUp,
            variant: "warning",
        },
        {
            title: "Total de Pedidos",
            value: stats.total_orders,
            icon: ShoppingCart,
            variant: "info",
        },
    ];

    // Configuración de filtros
    const filterConfig: FilterConfig = {
        searchPlaceholder: "Buscar usuarios...",
        showStatusFilter: true,
        statusOptions: [
            { value: "all", label: "Todos los estados" },
            { value: "active", label: "Activos" },
            { value: "pending", label: "Pendientes" },
        ],
    };

    // Función para limpiar filtros
    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedStatus("all");
        setSortBy("created_at");
        
        // Redirigir sin parámetros
        router.get(route('admin.users.index'), {}, {
            preserveState: true,
            replace: true,
            only: ['users', 'stats']
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

    const handleDeleteUser = (userId: number) => {
        router.delete(route('admin.users.destroy', userId), {
        });
    };

    const handleToggleStatus = (userId: number) => {
        router.patch(route('admin.users.toggle-status', userId), {}, {
            preserveScroll: true,
        });
    };

    const getStatusBadge = (status: string) => {
        const config = {
            active: { label: "Activo", color: "bg-green-500" },
            pending: { label: "Pendiente", color: "bg-yellow-500" }
        };
        
        const statusConfig = config[status as keyof typeof config] || config.pending;
        
        return (
            <Badge className={`${statusConfig.color} text-white border-0 text-xs`}>
                {statusConfig.label}
            </Badge>
        );
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "active": return <CheckCircle className="w-4 h-4 text-green-500" />;
            case "pending": return <Clock className="w-4 h-4 text-yellow-500" />;
            default: return <XCircle className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <>
            <Head title="Gestión de Usuarios" />
            
            <AdminDashboardLayout
                title="Gestión de Usuarios"
                description="Administra todos los clientes de la plataforma"
                stats={userStats}
                filterConfig={filterConfig}
                primaryAction={{
                    label: "Crear Usuario",
                    icon: UserPlus,
                    onClick: () => router.visit(route('admin.users.create')),
                }}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                onClearFilters={handleClearFilters}
                onKeyPress={handleKeyPress}
                searchDebounceMs={500}
            >
                {/* Users Table */}
                <Card className="bg-white border-gray-200 shadow-lg">
                    <CardHeader className="border-b border-gray-200">
                        <CardTitle className="text-black">
                            Usuarios ({users.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {users.data.map((user) => (
                                <div key={user.id} className="p-2 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4 flex-1">
                                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                                <User className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="font-semibold text-black">{user.name}</h3>
                                                    {getStatusBadge(user.status)}
                                                </div>
                                                <p className="text-sm text-gray-600">{user.email}</p>
                                                <div className="flex flex-col lg:flex-row items-start lg:items-center space-x-4 mt-1 text-xs text-gray-500">
                                                    <span>DNI: {user.dni}</span>
                                                    <span>Tel: {user.phone}</span>
                                                    <span>Compras: {user.total_purchases}</span>
                                                    <span>Gastado: ${user.total_spent}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Actions */}
                                        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-2">
                                            <Button 
                                                onClick={() => handleToggleStatus(user.id)}
                                                variant="outline" 
                                                size="sm" 
                                                className="border-gray-300 text-black hover:bg-gray-50"
                                            >
                                                {getStatusIcon(user.status)}
                                                <span className="hidden lg:inline">
                                                    {user.status === 'active' ? 'Desactivar' : 'Activar'}
                                                </span>
                                            </Button>
                                            <Button 
                                                onClick={() => handleViewUser(user)}
                                                variant="outline" 
                                                size="sm" 
                                                className="border-gray-300 text-black hover:bg-gray-50"
                                            >
                                                <Eye className="w-4 h-4 lg:mr-1" />
                                                <span className="hidden lg:inline">
                                                    Ver
                                                </span>
                                            </Button>
                                            <Button 
                                                onClick={() => {
                                                    setUserToDelete(user);
                                                    setIsConfirmModalOpen(true);
                                                }}
                                                variant="outline" 
                                                size="sm" 
                                                className="border-red-300 text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4 lg:mr-2" />
                                                <span className="hidden lg:inline">
                                                    Eliminar
                                                </span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {users.data.length === 0 && (
                                <div className="text-center py-12">
                                    <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-black mb-2">No se encontraron usuarios</h3>
                                    <p className="text-gray-600">
                                        {searchTerm || selectedStatus !== "all"
                                            ? "Prueba ajustando los filtros de búsqueda"
                                            : "Aún no hay usuarios registrados"}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Pagination - Actualizada para usar la función handlePagination */}
                        {users.data.length > 0 && (
                            <div className="mt-6 flex justify-center">
                                <div className="flex items-center space-x-2">
                                    {users.links.map((link, index) => (
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
                    </CardContent>
                </Card>

                {/* User Details Modal */}
                {selectedUser && (
                    <UserDetailsModal 
                        isOpen={isModalOpen} 
                        onClose={handleCloseModal} 
                        user={selectedUser} 
                        onUserUpdated={(updatedUser) => {
                            // Actualizar el usuario en la lista sin recargar
                            const updatedUsers = users.data.map((user) =>
                                user.id === updatedUser.id ? updatedUser : user
                            );
                            // @ts-ignore
                            router.setData('admin.users.index', { ...users, data: updatedUsers });
                            handleCloseModal();
                        }}
                    />
                )}
            </AdminDashboardLayout>
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => {
                    setIsConfirmModalOpen(false);
                    setUserToDelete(null);
                }}
                onConfirm={() => {
                    if (userToDelete) {
                        handleDeleteUser(userToDelete.id);
                    }
                    setIsConfirmModalOpen(false);
                    setUserToDelete(null);
                }}
                accionTitulo="Eliminación"
                accion="Eliminar"
                pronombre="este"
                entidad="usuario"
                accionando="eliminando"
                nombreElemento={userToDelete?.name}
                advertencia="Todos los datos asociados al usuario también serán eliminados."
                confirmVariant='destructive'
                isLoading={false}
            />
        </>
    );
}

// Asignamos el Layout de Administrador
Users.layout = (page: any) => <AppLayout children={page} />;