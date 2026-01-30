import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Edit, Trash2, User, CheckCircle, Clock, XCircle, UserPlus, Search, Filter, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import ConfirmationModal from '@/components/ConfirmationModal';

interface UserData {
    id: number;
    name: string;
    email: string;
    phone: string;
    dni: string;
    status: 'active' | 'pending';
    role: 'organizer' | 'viewer'; // <--- AGREGAR ESTO
    email_verified_at: string | null;
    created_at: string;
}

interface UserStats {
    total: number;
    active: number;
    pending: number;
}

interface PaginatedUsers {
    data: UserData[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
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

export default function UsersIndex() {
    const { users, stats, filters } = usePage<PageProps>().props;

    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [selectedStatus, setSelectedStatus] = useState(filters.status || "all");
    const [hasPendingFilters, setHasPendingFilters] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    useEffect(() => {
        const hasChanges = 
            searchTerm !== (filters.search || "") ||
            selectedStatus !== (filters.status || "all");
        setHasPendingFilters(hasChanges);
    }, [searchTerm, selectedStatus]);

    const applyFilters = () => {
        const params: any = {};
        
        if (searchTerm) params.search = searchTerm;
        if (selectedStatus !== "all") params.status = selectedStatus;

        router.get(route('organizer.users.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedStatus("all");
        router.get(route('organizer.users.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSort = (column: string) => {
        const newDirection = filters.sort_by === column && filters.sort_direction === 'asc' ? 'desc' : 'asc';
        
        router.get(route('organizer.users.index'), {
            ...filters,
            sort_by: column,
            sort_direction: newDirection,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleToggleStatus = (userId: number) => {
        router.patch(route('organizer.users.toggleStatus', userId), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDeleteUser = (user: UserData) => {
        setUserToDelete(user);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            router.delete(route('organizer.users.destroy', userToDelete.id), {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setIsConfirmModalOpen(false);
                    setUserToDelete(null);
                }
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="outline" className="bg-green-50 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Activo</Badge>;
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
            default:
                return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Inactivo</Badge>;
        }
    };

    return (
        <AppLayout>
            <Head title="Usuarios" />
            
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Usuarios</h1>
                        <p className="text-muted-foreground mt-2">
                            Gestiona los usuarios de tu organización
                        </p>
                    </div>
                    <Link href={route('organizer.users.create')}>
                        <Button>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Crear Usuario
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <CardTitle>Lista de Usuarios</CardTitle>
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Buscar usuarios..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 w-full sm:w-64"
                                    />
                                </div>
                                
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger className="w-full sm:w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="active">Activos</SelectItem>
                                        <SelectItem value="pending">Pendientes</SelectItem>
                                    </SelectContent>
                                </Select>

                                {hasPendingFilters && (
                                    <div className="flex gap-2">
                                        <Button onClick={applyFilters} variant="default">
                                            <Filter className="w-4 h-4 mr-2" />
                                            Aplicar
                                        </Button>
                                        <Button onClick={clearFilters} variant="outline">
                                            <X className="w-4 h-4 mr-2" />
                                            Limpiar
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2 px-4 font-medium cursor-pointer hover:bg-gray-50"
                                            onClick={() => handleSort('name')}>
                                            Nombre
                                        </th>
                                        <th className="text-left py-2 px-4 font-medium">
                                            Rol
                                        </th> 
                                        <th className="text-left py-2 px-4 font-medium cursor-pointer hover:bg-gray-50"
                                            onClick={() => handleSort('email')}>
                                            Email
                                        </th>
                                        <th className="text-left py-2 px-4 font-medium">DNI</th>
                                        <th className="text-left py-2 px-4 font-medium cursor-pointer hover:bg-gray-50"
                                            onClick={() => handleSort('created_at')}>
                                            Creado
                                        </th>
                                        <th className="text-left py-2 px-4 font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.data.map((user) => (
                                        <tr key={user.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                            <User className="w-4 h-4 text-gray-600" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{user.name}</div>
                                                        <div className="text-sm text-gray-500">{user.phone}</div>
                                                    </div>
                                                </div>
                                            </td>
                                                                                        <td className="py-3 px-4">
                                                {user.role === 'viewer' ? (
                                                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                                        <Eye className="w-3 h-3 mr-1" /> Visualizador
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                                                        <Shield className="w-3 h-3 mr-1" /> Organizador
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-sm">{user.email}</td>
                                            <td className="py-3 px-4 text-sm">{user.dni}</td>
                                            <td className="py-3 px-4 text-sm">{user.created_at}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center space-x-2">
                                                    <Link 
                                                        href={route('organizer.users.edit', user.id)}
                                                        className="inline-flex"
                                                    >
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDeleteUser(user)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {users.data.length === 0 && (
                            <div className="text-center py-8">
                                <User className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay usuarios</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Comienza creando un nuevo usuario.
                                </p>
                                <div className="mt-6">
                                    <Link href={route('organizer.users.create')}>
                                        <Button>
                                            <UserPlus className="w-4 h-4 mr-2" />
                                            Crear Usuario
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {users.links && users.links.length > 3 && (
                            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    {users.current_page > 1 && (
                                        <Link 
                                            href={users.links[0].url || '#'} 
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Anterior
                                        </Link>
                                    )}
                                    {users.current_page < users.last_page && (
                                        <Link 
                                            href={users.links[users.links.length - 1].url || '#'} 
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Siguiente
                                        </Link>
                                    )}
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Mostrando <span className="font-medium">{(users.current_page - 1) * users.per_page + 1}</span> a{' '}
                                            <span className="font-medium">{Math.min(users.current_page * users.per_page, users.total)}</span> de{' '}
                                            <span className="font-medium">{users.total}</span> usuarios
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            {users.links.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`relative inline-flex items-center px-2 py-2 border text-sm font-medium ${
                                                        link.active
                                                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    } ${index === 0 ? 'rounded-l-md' : ''} ${
                                                        index === users.links.length - 1 ? 'rounded-r-md' : ''
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDelete}
                accionTitulo="Eliminar Usuario"
                accion="Eliminar"
                pronombre="al"
                entidad="usuario"
                accionando="Eliminando"
                nombreElemento={userToDelete?.name}
                confirmVariant="destructive"
            />
        </AppLayout>
    );
}