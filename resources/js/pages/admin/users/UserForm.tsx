import { useState, FormEventHandler, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { User, Mail, Phone, CreditCard, MapPin, Lock, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

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
    email_verified: boolean;
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
    email_verified: boolean;
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
                                    <Label htmlFor="firstName" className="text-black">Nombre *</Label>
                                    <Input
                                        id="firstName"
                                        value={data.firstName}
                                        onChange={(e) => setData('firstName', e.target.value)}
                                        placeholder="Ingresa el nombre"
                                        className="bg-white border-gray-300"
                                        required
                                    />
                                    <InputError message={errors.firstName} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName" className="text-black">Apellido *</Label>
                                    <Input
                                        id="lastName"
                                        value={data.lastName}
                                        onChange={(e) => setData('lastName', e.target.value)}
                                        placeholder="Ingresa el apellido"
                                        className="bg-white border-gray-300"
                                        required
                                    />
                                    <InputError message={errors.lastName} />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-black">Email *</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="correo@ejemplo.com"
                                        className="bg-white border-gray-300 pl-10"
                                        required
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            {/* DNI y Teléfono */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="dni" className="text-black">DNI *</Label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="dni"
                                            value={data.dni}
                                            onChange={(e) => setData('dni', e.target.value)}
                                            placeholder="12345678"
                                            className="bg-white border-gray-300 pl-10"
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.dni} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-black">Teléfono</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="+54 11 1234-5678"
                                            className="bg-white border-gray-300 pl-10"
                                        />
                                    </div>
                                    <InputError message={errors.phone} />
                                </div>
                            </div>

                            {/* Dirección */}
                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-black">Dirección</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Textarea
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="Dirección completa"
                                        className="bg-white border-gray-300 pl-10"
                                        rows={3}
                                    />
                                </div>
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
                                <p className="text-sm text-gray-600 mb-4">
                                    Deja estos campos en blanco si no deseas cambiar la contraseña
                                </p>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-black">
                                        {isEditing ? 'Nueva Contraseña' : 'Contraseña *'}
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Mínimo 8 caracteres"
                                            className="bg-white border-gray-300 pl-10 pr-10"
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
                                    <Label htmlFor="password_confirmation" className="text-black">
                                        {isEditing ? 'Confirmar Nueva Contraseña' : 'Confirmar Contraseña *'}
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="password_confirmation"
                                            type={showPasswordConfirmation ? "text" : "password"}
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            placeholder={isEditing ? "Confirma la nueva contraseña" : "Confirma la contraseña"}
                                            className="bg-white border-gray-300 pl-10 pr-10"
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
                    {/* Configuración */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-medium text-black">Configuración</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-black">Email Verificado</Label>
                                    <p className="text-sm text-gray-500">
                                        {isEditing ? 'Estado de verificación del email' : 'Marcar si el email está verificado'}
                                    </p>
                                </div>
                                <Switch
                                    checked={data.email_verified}
                                    onCheckedChange={(checked) => setData('email_verified', checked)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Información del Usuario (solo al editar) */}
                    {isEditing && user && (
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                            <div className="border-b border-gray-200 px-6 py-4">
                                <h3 className="text-lg font-medium text-black">Información</h3>
                            </div>
                            <div className="p-6 space-y-3">
                                <div className="text-sm">
                                    <span className="font-medium text-gray-900">ID:</span>
                                    <span className="ml-2 text-gray-600">#{user.id}</span>
                                </div>
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
                                    className="w-full bg-black hover:bg-gray-800 text-white"
                                >
                                    {processing ? 'Guardando...' : submitText}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    asChild
                                    className="w-full border-gray-300 text-black hover:bg-gray-50"
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