import { useState } from 'react';
import { 
    User, 
    UserPlus, 
    Search, 
    Filter, 
    MoreVertical, 
    Eye, 
    Edit, 
    Trash2, 
    Mail, 
    Phone, 
    Calendar, 
    DollarSign,
    CheckCircle,
    Clock,
    XCircle,
    Users as UsersIcon, // Cambiar el nombre del icono
    TrendingUp,
    ShoppingCart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger,
    DropdownMenuSeparator 
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
import { Head, Link, router, usePage } from '@inertiajs/react';

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
    total_spent: number;
    last_purchase: string | null;
}

interface UserStats {
    total: number;
    active: number;
    pending: number;
    new_this_month: number;
    total_orders: number;
    total_revenue: number;
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
}

export default function Users({ auth }: any) {
    const { users, stats, filters } = usePage<PageProps>().props;

    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [selectedStatus, setSelectedStatus] = useState(filters.status || "all");
    const [sortBy, setSortBy] = useState(filters.sort_by || "created_at");

    // Aplicar filtros
    const handleFilters = () => {
        router.get(route('admin.users.index'), {
            search: searchTerm,
            status: selectedStatus,
            sort_by: sortBy,
        }, {
            preserveState: true,
            replace: true
        });
    };

    // Limpiar filtros
    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedStatus("all");
        setSortBy("created_at");
        router.get(route('admin.users.index'), {}, {
            preserveState: true,
            replace: true
        });
    };

    // Manejar Enter en búsqueda
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleFilters();
        }
    };

    const handleDeleteUser = (userId: number) => {
        router.delete(route('admin.users.destroy', userId), {
            onBefore: () => confirm('¿Estás seguro de que quieres eliminar este usuario?'),
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
            <Head title="Gestión de Usuarios - Panel Admin" />
            
            <div className="min-h-screen bg-white">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-black mb-2">
                                Gestión de Usuarios
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Administra todos los clientes de la plataforma
                            </p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <Link href={route('admin.users.create')}>
                                <Button className="bg-black text-white hover:bg-gray-800">
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Crear Usuario
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-white border-gray-200 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Total Usuarios</p>
                                        <p className="text-2xl font-bold text-black">{stats.total}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                                        <UsersIcon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-gray-200 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Usuarios Activos</p>
                                        <p className="text-2xl font-bold text-black">{stats.active}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-chart-2 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-gray-200 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Nuevos Este Mes</p>
                                        <p className="text-2xl font-bold text-black">{stats.new_this_month}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-chart-3 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-white" />
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
                                    <div className="w-12 h-12 bg-chart-4 rounded-lg flex items-center justify-center">
                                        <DollarSign className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="bg-white border-gray-200 shadow-lg mb-6">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Buscar usuarios..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="pl-10 bg-white border-gray-300 text-black placeholder:text-gray-400"
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
                                    </SelectContent>
                                </Select>

                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="bg-white border-gray-300 text-black">
                                        <SelectValue placeholder="Ordenar por" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-gray-300">
                                        <SelectItem value="created_at">Fecha de registro</SelectItem>
                                        <SelectItem value="name">Nombre</SelectItem>
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="purchases">Compras</SelectItem>
                                        <SelectItem value="spent">Gasto total</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className="flex space-x-2">
                                    <Button 
                                        onClick={handleFilters}
                                        className="bg-black text-white hover:bg-gray-800 flex-1"
                                    >
                                        Aplicar Filtros
                                    </Button>
                                    <Button 
                                        onClick={handleClearFilters}
                                        variant="outline"
                                        className="border-gray-300 text-black hover:bg-gray-50 bg-white"
                                    >
                                        <Filter className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

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
                                    <div key={user.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4 flex-1">
                                                {/* Avatar */}
                                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <User className="w-6 h-6 text-white" />
                                                </div>

                                                {/* User Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-3 mb-1">
                                                        <h3 className="font-semibold text-black truncate">{user.name}</h3>
                                                        {getStatusBadge(user.status)}
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                                                        <div className="flex items-center">
                                                            <Mail className="w-4 h-4 mr-2 text-primary" />
                                                            <span className="truncate">{user.email}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Phone className="w-4 h-4 mr-2 text-primary" />
                                                            <span>{user.phone || 'Sin teléfono'}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <ShoppingCart className="w-4 h-4 mr-2 text-primary" />
                                                            <span>{user.total_purchases} compras</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <DollarSign className="w-4 h-4 mr-2 text-primary" />
                                                            <span>${user.total_spent.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                                                        <span>Registro: {new Date(user.created_at).toLocaleDateString('es-ES')}</span>
                                                        <span>DNI: {user.dni || 'Sin DNI'}</span>
                                                        {user.last_purchase && (
                                                            <span>Última compra: {new Date(user.last_purchase).toLocaleDateString('es-ES')}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-black hover:bg-gray-200">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-56 bg-white border-gray-300">
                                                    <DropdownMenuItem 
                                                        className="text-gray-700 hover:bg-gray-50"
                                                        onClick={() => router.get(route('admin.users.show', user.id))}
                                                    >
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Ver detalles
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        className="text-gray-700 hover:bg-gray-50"
                                                        onClick={() => router.get(route('admin.users.edit', user.id))}
                                                    >
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Editar usuario
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-gray-200" />
                                                    <DropdownMenuItem 
                                                        className="text-gray-700 hover:bg-gray-50"
                                                        onClick={() => handleToggleStatus(user.id)}
                                                    >
                                                        {getStatusIcon(user.status)}
                                                        <span className="ml-2">
                                                            {user.status === 'active' ? 'Desactivar' : 'Activar'} usuario
                                                        </span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-gray-200" />
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem 
                                                                className="text-red-600 focus:text-red-600 hover:bg-red-50"
                                                                onSelect={(e) => e.preventDefault()}
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Eliminar usuario
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="bg-white border-gray-300">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="text-black">¿Estás seguro?</AlertDialogTitle>
                                                                <AlertDialogDescription className="text-gray-600">
                                                                    Esta acción no se puede deshacer. Esto eliminará permanentemente la cuenta de
                                                                    "{user.name}" y todos los datos relacionados.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="border-gray-300 text-black hover:bg-gray-50">Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction 
                                                                    onClick={() => handleDeleteUser(user.id)}
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
                                ))}

                                {users.data.length === 0 && (
                                    <div className="text-center py-12">
                                        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-black mb-2">No se encontraron usuarios</h3>
                                        <p className="text-gray-600 mb-6">
                                            {searchTerm || selectedStatus !== "all"
                                                ? "Prueba ajustando los filtros de búsqueda"
                                                : "Aún no hay usuarios registrados"}
                                        </p>
                                        <Link href={route('admin.users.create')}>
                                            <Button className="bg-black text-white hover:bg-gray-800">
                                                <UserPlus className="w-4 h-4 mr-2" />
                                                Crear primer usuario
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {users.links && users.links.length > 3 && (
                                <div className="flex items-center justify-center space-x-2 mt-6 pt-6 border-t border-gray-200">
                                    {users.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                                link.active
                                                    ? 'bg-black text-white'
                                                    : link.url
                                                    ? 'text-gray-700 hover:bg-gray-100 border border-gray-300'
                                                    : 'text-gray-400 cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

// Asignamos el Layout de Administrador
Users.layout = (page: any) => <AppLayout children={page} />;