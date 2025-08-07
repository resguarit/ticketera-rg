import { useState } from 'react';
import { 
    Search, 
    Plus, 
    Filter, 
    MoreVertical, 
    Eye, 
    Edit, 
    Trash2, 
    User, 
    Mail, 
    Calendar, 
    Shield,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Download,
    Upload,
    UserCheck
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

// Mock data de usuarios
const mockUsers = [
    {
        id: 1,
        name: "María González",
        email: "maria@email.com",
        role: "client",
        status: "active",
        created_at: "2024-01-15",
        last_login: "2024-03-10",
        purchases: 5,
        total_spent: 25000,
        phone: "+54 11 1234-5678",
        city: "Buenos Aires"
    },
    {
        id: 2,
        name: "Carlos Rodríguez",
        email: "carlos@email.com",
        role: "client",
        status: "active",
        created_at: "2024-02-03",
        last_login: "2024-03-09",
        purchases: 2,
        total_spent: 12000,
        phone: "+54 11 2345-6789",
        city: "Córdoba"
    },
    {
        id: 3,
        name: "Ana Martínez",
        email: "ana@email.com",
        role: "client",
        status: "pending",
        created_at: "2024-02-20",
        last_login: "2024-03-08",
        purchases: 1,
        total_spent: 3500,
        phone: "+54 11 3456-7890",
        city: "Rosario"
    },
    {
        id: 4,
        name: "Luis Fernández",
        email: "luis@admin.com",
        role: "admin",
        status: "active",
        created_at: "2023-12-01",
        last_login: "2024-03-11",
        purchases: 0,
        total_spent: 0,
        phone: "+54 11 4567-8901",
        city: "Buenos Aires"
    },
    {
        id: 5,
        name: "Patricia López",
        email: "patricia@email.com",
        role: "client",
        status: "suspended",
        created_at: "2024-01-30",
        last_login: "2024-02-15",
        purchases: 0,
        total_spent: 0,
        phone: "+54 11 5678-9012",
        city: "Mendoza"
    }
];

const userStats = {
    total: mockUsers.length,
    active: mockUsers.filter(u => u.status === 'active').length,
    pending: mockUsers.filter(u => u.status === 'pending').length,
    suspended: mockUsers.filter(u => u.status === 'suspended').length,
    totalRevenue: mockUsers.reduce((sum, u) => sum + u.total_spent, 0),
    totalPurchases: mockUsers.reduce((sum, u) => sum + u.purchases, 0)
};

export default function Users({ auth }: any) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedRole, setSelectedRole] = useState("all");
    const [selectedCity, setSelectedCity] = useState("all");
    const [sortBy, setSortBy] = useState("created");
    const [viewMode, setViewMode] = useState("all");

    const filteredUsers = mockUsers.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === "all" || user.status === selectedStatus;
        const matchesRole = selectedRole === "all" || user.role === selectedRole;
        const matchesCity = selectedCity === "all" || user.city === selectedCity;

        return matchesSearch && matchesStatus && matchesRole && matchesCity;
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "active": return <CheckCircle className="w-4 h-4 text-green-500" />;
            case "pending": return <Clock className="w-4 h-4 text-yellow-500" />;
            case "suspended": return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
        }
    };

    const handleDeleteUser = (userId: number) => {
        console.log(`Eliminar usuario ${userId}`);
        // Aquí iría la lógica para eliminar el usuario
    };

    const handleStatusChange = (userId: number, newStatus: string) => {
        console.log(`Cambiar estado del usuario ${userId} a ${newStatus}`);
        // Aquí iría la lógica para cambiar el estado
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
                                Administra todos los usuarios de la plataforma
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
                                Crear Usuario
                            </Button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-white border-gray-200 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Total Usuarios</p>
                                        <p className="text-2xl font-bold text-black">{userStats.total}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-gray-200 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Usuarios Activos</p>
                                        <p className="text-2xl font-bold text-black">{userStats.active}</p>
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
                                        <p className="text-gray-600 text-sm font-medium">Total Compras</p>
                                        <p className="text-2xl font-bold text-black">{userStats.totalPurchases}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                        <UserCheck className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-gray-200 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Ingresos Totales</p>
                                        <p className="text-2xl font-bold text-black">${userStats.totalRevenue.toLocaleString()}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-white" />
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
                                        placeholder="Buscar usuarios..."
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

                                <Select value={selectedRole} onValueChange={setSelectedRole}>
                                    <SelectTrigger className="bg-white border-gray-300 text-black">
                                        <SelectValue placeholder="Rol" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-gray-300">
                                        <SelectItem value="all">Todos los roles</SelectItem>
                                        <SelectItem value="admin">Administradores</SelectItem>
                                        <SelectItem value="organizer">Organizadores</SelectItem>
                                        <SelectItem value="client">Clientes</SelectItem>
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
                                        <SelectItem value="login">Último acceso</SelectItem>
                                        <SelectItem value="purchases">Compras</SelectItem>
                                        <SelectItem value="spent">Gasto total</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button 
                                    onClick={() => {
                                        setSearchTerm("");
                                        setSelectedStatus("all");
                                        setSelectedRole("all");
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

                    {/* Users Table */}
                    <Card className="bg-white border-gray-200 shadow-lg">
                        <CardHeader className="border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-black">
                                    Usuarios ({filteredUsers.length})
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
                                {filteredUsers.map((user) => (
                                    <div key={user.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                        <div className="flex items-center space-x-6">
                                            {/* User Avatar */}
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                                <span className="text-white font-bold text-lg">
                                                    {user.name.charAt(0)}
                                                </span>
                                            </div>

                                            {/* User Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-black mb-1 flex items-center space-x-2">
                                                            <span>{user.name}</span>
                                                            {getRoleBadge(user.role)}
                                                        </h3>
                                                        <p className="text-gray-600 text-sm flex items-center space-x-2">
                                                            <Mail className="w-4 h-4" />
                                                            <span>{user.email}</span>
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(user.status)}
                                                        {getStatusBadge(user.status)}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                                                    <div className="flex items-center text-gray-700 text-sm">
                                                        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                                        <span>Registro: {new Date(user.created_at).toLocaleDateString('es-ES')}</span>
                                                    </div>
                                                    <div className="flex items-center text-gray-700 text-sm">
                                                        <Clock className="w-4 h-4 mr-2 text-green-500" />
                                                        <span>Último acceso: {new Date(user.last_login).toLocaleDateString('es-ES')}</span>
                                                    </div>
                                                    <div className="flex items-center text-gray-700 text-sm">
                                                        <UserCheck className="w-4 h-4 mr-2 text-purple-500" />
                                                        <span>{user.purchases} compras</span>
                                                    </div>
                                                    <div className="flex items-center text-gray-700 text-sm">
                                                        <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                                                        <span>${user.total_spent.toLocaleString()} gastado</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                        <span>Teléfono: {user.phone}</span>
                                                        <span>Ciudad: {user.city}</span>
                                                        <span>ID: #{user.id}</span>
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
                                                                Editar usuario
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-gray-200" />
                                                            <DropdownMenuItem 
                                                                onClick={() => handleStatusChange(user.id, 'active')}
                                                                disabled={user.status === 'active'}
                                                                className="hover:bg-gray-100"
                                                            >
                                                                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                                                Activar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => handleStatusChange(user.id, 'suspended')}
                                                                disabled={user.status === 'suspended'}
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
                                        </div>
                                    </div>
                                ))}

                                {filteredUsers.length === 0 && (
                                    <div className="text-center py-12">
                                        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-black mb-2">No se encontraron usuarios</h3>
                                        <p className="text-gray-600 mb-6">
                                            {searchTerm || selectedStatus !== "all" || selectedRole !== "all" || selectedCity !== "all"
                                                ? "Prueba ajustando los filtros de búsqueda"
                                                : "Aún no hay usuarios registrados"}
                                        </p>
                                        <Button className="bg-black text-white hover:bg-gray-800">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Crear primer usuario
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
Users.layout = (page: any) => <AppLayout children={page} />;