import { useState, FormEventHandler } from 'react';
import { Link } from '@inertiajs/react';
import { User, Mail, Phone, CreditCard, Lock, Eye, EyeOff, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface UserFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dni: string | null;
    password: string;
    password_confirmation: string;
    [key: string]: any;
}

interface UserFormProps {
    data: UserFormData;
    setData: (key: keyof UserFormData | any, value: any) => void;
    errors: Partial<Record<keyof UserFormData, string>>;
    processing: boolean;
    onSubmit: FormEventHandler;
    submitText: string;
    isEditing?: boolean;
}

export default function UserForm({ 
    data, 
    setData, 
    errors, 
    processing, 
    onSubmit, 
    submitText = 'Guardar',
    isEditing = false
}: UserFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="firstName">
                        <User className="w-4 h-4 inline mr-2" />
                        Nombre <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={data.firstName}
                        className="mt-1 block w-full"
                        autoComplete="given-name"
                        onChange={(e) => setData('firstName', e.target.value)}
                        placeholder="Ingresa el nombre"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="lastName">
                        <User className="w-4 h-4 inline mr-2" />
                        Apellido <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={data.lastName}
                        className="mt-1 block w-full"
                        autoComplete="family-name"
                        onChange={(e) => setData('lastName', e.target.value)}
                        placeholder="Ingresa el apellido"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Correo Electrónico <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    value={data.email}
                    className="mt-1 block w-full"
                    autoComplete="email"
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="correo@ejemplo.com"
                />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="phone">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Teléfono
                    </Label>
                    <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={data.phone}
                        className="mt-1 block w-full"
                        autoComplete="tel"
                        onChange={(e) => setData('phone', e.target.value)}
                        placeholder="+54 9 11 1234-5678"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dni">
                        <CreditCard className="w-4 h-4 inline mr-2" />
                        DNI
                    </Label>
                    <Input
                        id="dni"
                        name="dni"
                        type="text"
                        value={data.dni || ''}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('dni', e.target.value)}
                        placeholder="12345678"
                    />
                </div>
            </div>

            {isEditing && (
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        <strong>Cambio de contraseña:</strong> Deja estos campos vacíos si no deseas cambiar la contraseña actual.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="password">
                        <Lock className="w-4 h-4 inline mr-2" />
                        Contraseña {!isEditing && <span className="text-red-500">*</span>}
                        {isEditing && <span className="text-gray-500">(dejar vacío para mantener actual)</span>}
                    </Label>
                    <div className="relative">
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={data.password}
                            className="mt-1 block w-full pr-10"
                            autoComplete={isEditing ? "new-password" : "new-password"}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="********"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                            )}
                        </button>
                    </div>
                    {!isEditing && (
                        <p className="text-xs text-gray-500 mt-1">
                            Mínimo 8 caracteres. Se recomienda incluir mayúsculas, números y símbolos.
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password_confirmation">
                        <Lock className="w-4 h-4 inline mr-2" />
                        Confirmar Contraseña {!isEditing && <span className="text-red-500">*</span>}
                    </Label>
                    <div className="relative">
                        <Input
                            id="password_confirmation"
                            name="password_confirmation"
                            type={showPasswordConfirmation ? "text" : "password"}
                            value={data.password_confirmation}
                            className="mt-1 block w-full pr-10"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="********"
                            disabled={isEditing && !data.password}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                            disabled={isEditing && !data.password}
                        >
                            {showPasswordConfirmation ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                <Link 
                    href={route('organizer.users.index')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Cancelar
                </Link>
                
                <Button 
                    type="submit" 
                    disabled={processing}
                    className="min-w-[120px]"
                >
                    {processing ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            {isEditing ? 'Actualizando...' : 'Guardando...'}
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            {submitText}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}