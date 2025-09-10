import { useState, FormEventHandler } from 'react';
import { Link } from '@inertiajs/react';
import { User, Mail, Phone, CreditCard, MapPin, Lock, Eye, EyeOff, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Textarea } from '@/components/ui/textarea';

interface UserData {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dni: string;
    address: string;
    password?: string;
    password_confirmation?: string;
}

interface UserFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dni: string;
    address: string;
    password: string;
    password_confirmation: string;
}

interface UserFormProps {
    data: UserFormData;
    setData: (key: keyof UserFormData | any, value: any) => void;
    errors: Partial<Record<keyof UserFormData, string>>;
    processing: boolean;
    onSubmit: FormEventHandler;
    submitText: string;
    user?: UserData;
    isEditing?: boolean;
}

export default function UserForm({ 
    data, 
    setData, 
    errors, 
    processing, 
    onSubmit, 
    submitText, 
    user, 
    isEditing = false 
}: UserFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Información Principal */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Información Personal */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-medium text-black flex items-center">
                                <User className="w-5 h-5 mr-2" />
                                Información Personal
                            </h3>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Nombre y Apellido */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">Nombre *</Label>
                                    <Input
                                        id="firstName"
                                        value={data.firstName}
                                        onChange={(e) => setData('firstName', e.target.value)}
                                        placeholder="Ingresa el nombre"
                                        required
                                    />
                                    <InputError message={errors.firstName} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Apellido *</Label>
                                    <Input
                                        id="lastName"
                                        value={data.lastName}
                                        onChange={(e) => setData('lastName', e.target.value)}
                                        placeholder="Ingresa el apellido"
                                        required
                                    />
                                    <InputError message={errors.lastName} />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="correo@ejemplo.com"
                                    required
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* DNI y Teléfono */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="dni">DNI *</Label>
                                    <Input
                                        id="dni"
                                        value={data.dni}
                                        onChange={(e) => setData('dni', e.target.value)}
                                        placeholder="12345678"
                                        required
                                    />
                                    <InputError message={errors.dni} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Teléfono</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="+54 11 1234-5678"
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                            </div>

                            {/* Dirección */}
                            <div className="space-y-2">
                                <Label htmlFor="address">Dirección</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Dirección completa"
                                    rows={3}
                                />
                                <InputError message={errors.address} />
                            </div>
                        </div>
                    </div>

                    {/* Credenciales */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-medium text-black flex items-center">
                                <Lock className="w-5 h-5 mr-2" />
                                {isEditing ? 'Cambiar Contraseña (Opcional)' : 'Credenciales de Acceso'}
                            </h3>
                        </div>
                        <div className="p-6 space-y-6">
                            {isEditing && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Nota:</strong> Deja estos campos en blanco si no deseas cambiar la contraseña actual del usuario.
                                    </p>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        {isEditing ? 'Nueva Contraseña' : 'Contraseña *'}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder={isEditing ? "Nueva contraseña (opcional)" : "Mínimo 8 caracteres"}
                                            className="pr-10"
                                            required={!isEditing}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-gray-400" />
                                            )}
                                        </Button>
                                    </div>
                                    <InputError message={errors.password} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">
                                        {isEditing ? 'Confirmar Nueva Contraseña' : 'Confirmar Contraseña *'}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password_confirmation"
                                            type={showPasswordConfirmation ? "text" : "password"}
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            placeholder={isEditing ? "Confirma la nueva contraseña" : "Confirma la contraseña"}
                                            className="pr-10"
                                            required={!isEditing}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                        >
                                            {showPasswordConfirmation ? (
                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-gray-400" />
                                            )}
                                        </Button>
                                    </div>
                                    <InputError message={errors.password_confirmation} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel Lateral */}
                <div className="space-y-6">
                    {/* Información del Usuario (solo al editar) */}
                    {isEditing && user && (
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                            <div className="border-b border-gray-200 px-6 py-4">
                                <h3 className="text-lg font-medium text-black">Información del Usuario</h3>
                            </div>
                            <div className="p-6 space-y-3">
                                <div className="text-sm">
                                    <span className="font-medium text-gray-900">ID:</span>
                                    <span className="ml-2 text-gray-600">#{user.id}</span>
                                </div>
                                <div className="text-sm">
                                    <span className="font-medium text-gray-900">Email actual:</span>
                                    <span className="ml-2 text-gray-600">{user.email}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Información para creación */}
                    {!isEditing && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-blue-900 mb-3">Información</h3>
                                <ul className="text-sm text-blue-800 space-y-2">
                                    <li>• El usuario será creado como cliente</li>
                                    <li>• El email no estará verificado inicialmente</li>
                                    <li>• La contraseña debe tener al menos 8 caracteres</li>
                                    <li>• El DNI debe ser único en el sistema</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Acciones */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="p-6">
                            <div className="space-y-4">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full hover:bg-primary-hover"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {processing ? 'Guardando...' : submitText}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    asChild
                                    className="w-full"
                                >
                                    <Link href={route('admin.users.index')}>
                                        Cancelar
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}