import { useState } from 'react';
import { X, User, Mail, Phone, CreditCard, MapPin, Calendar, CheckCircle, Clock, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, router } from '@inertiajs/react';
import { formatCurrency } from '@/lib/currencyHelpers';

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

interface UserDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserData;
    onUserUpdated?: (user: UserData) => void;
}

export default function UserDetailsModal({ isOpen, onClose, user, onUserUpdated }: UserDetailsModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleDeleteUser = async () => {
        if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            return;
        }

        setIsLoading(true);
        router.delete(route('admin.users.destroy', user.id), {
            onSuccess: () => {
                onClose();
                // Recargar la página para actualizar la lista
                router.reload();
            },
            onFinish: () => setIsLoading(false)
        });
    };

    const handleToggleStatus = () => {
        setIsLoading(true);
        router.patch(route('admin.users.toggle-status', user.id), {}, {
            onSuccess: () => {
                // Actualizar el usuario localmente
                const updatedUser = {
                    ...user,
                    status: user.status === 'active' ? 'pending' : 'active' as 'active' | 'pending',
                    email_verified_at: user.status === 'active' ? null : new Date().toISOString()
                };
                onUserUpdated?.(updatedUser);
            },
            onFinish: () => setIsLoading(false),
            preserveScroll: true
        });
    };

    const getStatusBadge = (status: string) => {
        const config = {
            active: { label: "Activo", color: "bg-green-500" },
            pending: { label: "Pendiente", color: "bg-yellow-500" }
        };
        
        const statusConfig = config[status as keyof typeof config] || config.pending;
        
        return (
            <Badge className={`${statusConfig.color} text-white border-0`}>
                {statusConfig.label}
            </Badge>
        );
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "active": return <CheckCircle className="w-5 h-5 text-green-500" />;
            case "pending": return <Clock className="w-5 h-5 text-yellow-500" />;
            default: return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                            <div className="flex items-center space-x-2 mt-1">
                                {getStatusBadge(user.status)}
                                <span className="text-sm text-gray-500">ID: #{user.id}</span>
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Información Personal */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2" />
                            Información Personal
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-3">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Email</p>
                                    <p className="text-sm text-gray-600">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Teléfono</p>
                                    <p className="text-sm text-gray-600">{user.phone || 'No especificado'}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <CreditCard className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">DNI</p>
                                    <p className="text-sm text-gray-600">{user.dni}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Registrado</p>
                                    <p className="text-sm text-gray-600">{formatDate(user.created_at)}</p>
                                </div>
                            </div>
                        </div>
                        {user.address && (
                            <div className="mt-4 flex items-start space-x-3">
                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Dirección</p>
                                    <p className="text-sm text-gray-600">{user.address}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Estadísticas de Compras */}
                    <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Estadísticas de Compras</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">{user.total_purchases}</p>
                                <p className="text-sm text-gray-600">Total Compras</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">${user.total_spent}</p>
                                <p className="text-sm text-gray-600">Total Gastado</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-semibold text-purple-600">
                                    ${user.total_purchases > 0 ? (parseFloat(user.total_spent) / user.total_purchases).toFixed(0) : '0'}
                                </p>
                                <p className="text-sm text-gray-600">Promedio por Compra</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-700">
                                    {user.last_purchase ? formatDate(user.last_purchase) : 'Nunca'}
                                </p>
                                <p className="text-sm text-gray-600">Última Compra</p>
                            </div>
                        </div>
                    </div>

                    {/* Estado de la Cuenta */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Estado de la Cuenta</h3>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                {getStatusIcon(user.status)}
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {user.status === 'active' ? 'Cuenta Activa' : 'Cuenta Pendiente'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {user.status === 'active' 
                                            ? 'El usuario puede acceder y realizar compras'
                                            : 'El usuario necesita verificar su email'
                                        }
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={handleToggleStatus}
                                disabled={isLoading}
                                variant={user.status === 'active' ? 'outline' : 'default'}
                                size="sm"
                            >
                                {user.status === 'active' ? 'Desactivar' : 'Activar'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Footer con Acciones */}
                <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex space-x-3">
                        <Button
                            onClick={handleDeleteUser}
                            disabled={isLoading}
                            variant="outline"
                            size="sm"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                        </Button>
                        <Button onClick={onClose} variant="outline" size="sm">
                            Cerrar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}