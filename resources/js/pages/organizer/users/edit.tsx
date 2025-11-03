import { FormEventHandler, useEffect } from 'react';
import { Head, useForm, router, usePage, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import UserForm from './UserForm';
import { UserPen, ArrowLeft, User } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface UserData {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dni: string;
    status: 'active' | 'pending';
    email_verified_at: string | null;
    created_at: string;
}

interface UserFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dni: string;
    password: string;
    password_confirmation: string;
    [key: string]: any;
}

interface EditUserProps {
    user: UserData;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function EditUser() {
    const { user, flash } = usePage<EditUserProps>().props;
    
    const { data, setData, processing, errors } = useForm<UserFormData>({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        dni: user.dni,
        password: '',
        password_confirmation: '',
    });

    // Manejar mensajes flash de Laravel
    useEffect(() => {
        if (flash?.success) {
            toast.success('Usuario actualizado exitosamente', {
                description: flash.success
            });
        }
        
        if (flash?.error) {
            toast.error('Error al actualizar usuario', {
                description: flash.error
            });
        }
    }, [flash]);

    const validateForm = (): boolean => {
        // Validar nombre
        if (!data.firstName?.trim()) {
            toast.error('Nombre requerido', {
                description: 'El nombre es obligatorio'
            });
            return false;
        }

        // Validar apellido
        if (!data.lastName?.trim()) {
            toast.error('Apellido requerido', {
                description: 'El apellido es obligatorio'
            });
            return false;
        }

        // Validar email
        if (!data.email?.trim()) {
            toast.error('Email requerido', {
                description: 'El email es obligatorio'
            });
            return false;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            toast.error('Email inválido', {
                description: 'Por favor ingresa un email válido'
            });
            return false;
        }

        // Validar contraseña solo si se proporciona
        if (data.password?.trim()) {
            // Validar longitud mínima de contraseña
            if (data.password.length < 8) {
                toast.error('Contraseña muy corta', {
                    description: 'La contraseña debe tener al menos 8 caracteres'
                });
                return false;
            }

            // Validar confirmación de contraseña
            if (!data.password_confirmation?.trim()) {
                toast.error('Confirmación de contraseña requerida', {
                    description: 'Debe confirmar la nueva contraseña'
                });
                return false;
            }

            // Validar que las contraseñas coincidan
            if (data.password !== data.password_confirmation) {
                toast.error('Las contraseñas no coinciden', {
                    description: 'La contraseña y su confirmación deben ser iguales'
                });
                return false;
            }
        }

        // Validar DNI si se proporciona
        if (data.dni && data.dni.trim() && data.dni.length < 6) {
            toast.error('DNI inválido', {
                description: 'El DNI debe tener al menos 6 caracteres'
            });
            return false;
        }

        // Validar teléfono si se proporciona
        if (data.phone && data.phone.trim()) {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(data.phone)) {
                toast.error('Teléfono inválido', {
                    description: 'El teléfono solo puede contener números, espacios, guiones y paréntesis'
                });
                return false;
            }
        }

        return true;
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        // Ejecutar validaciones del frontend
        if (!validateForm()) {
            return;
        }

        router.put(route('organizer.users.update', user.id), data, {
            preserveScroll: true,
            onStart: () => {
                toast.loading('Actualizando usuario...', { id: 'update-user' });
            },
            onSuccess: () => {
                toast.success('Usuario actualizado exitosamente', {
                    id: 'update-user',
                    description: 'Los cambios han sido guardados correctamente'
                });
            },
            onError: (errors) => {
                // Manejar errores específicos del servidor
                if (errors.firstName) {
                    toast.error('Error en el nombre', {
                        id: 'update-user',
                        description: Array.isArray(errors.firstName) ? errors.firstName[0] : errors.firstName
                    });
                } else if (errors.lastName) {
                    toast.error('Error en el apellido', {
                        id: 'update-user',
                        description: Array.isArray(errors.lastName) ? errors.lastName[0] : errors.lastName
                    });
                } else if (errors.email) {
                    toast.error('Error en el email', {
                        id: 'update-user',
                        description: Array.isArray(errors.email) ? errors.email[0] : errors.email
                    });
                } else if (errors.password) {
                    toast.error('Error en la contraseña', {
                        id: 'update-user',
                        description: Array.isArray(errors.password) ? errors.password[0] : errors.password
                    });
                } else if (errors.dni) {
                    toast.error('Error en el DNI', {
                        id: 'update-user',
                        description: Array.isArray(errors.dni) ? errors.dni[0] : errors.dni
                    });
                } else {
                    const firstError = Object.values(errors)[0];
                    const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
                    
                    toast.error('Error al actualizar usuario', {
                        id: 'update-user',
                        description: errorMessage || 'Verifica todos los campos e intenta nuevamente'
                    });
                }
                
                console.error('Form errors:', errors);
            }
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="outline" className="bg-green-50 text-green-700">Activo</Badge>;
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pendiente</Badge>;
            default:
                return <Badge variant="destructive">Inactivo</Badge>;
        }
    };

    return (
        <AppLayout>
            <Head title={`Editar Usuario: ${user.firstName} ${user.lastName}`} />

            <div className="space-y-6 p-6">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center gap-2">
                        <Link 
                            href={route('organizer.users.index')}
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <Button variant="outline" size="icon" className="mr-2">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">Editar Usuario</h1>
                        <p className="text-muted-foreground mt-1">
                            Modifica la información de {user.firstName} {user.lastName}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {getStatusBadge(user.status)}
                        <div className="text-sm text-gray-500">
                            Creado: {new Date(user.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                <div className="w-full flex justify-center">
                    <Card className="w-full max-w-2xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Información del Usuario
                            </CardTitle>
                            <div className="text-sm text-muted-foreground">
                                <p>Deja los campos de contraseña vacíos si no deseas cambiarla.</p>
                                {user.status === 'pending' && (
                                    <p className="text-amber-600 font-medium mt-1">
                                        Este usuario aún no ha verificado su email.
                                    </p>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <UserForm
                                data={data}
                                setData={setData}
                                errors={errors}
                                processing={processing}
                                onSubmit={submit}
                                submitText="Guardar Cambios"
                                isEditing={true}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}