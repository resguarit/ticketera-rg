import { FormEventHandler, useEffect } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import UserForm from './UserForm';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';


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

export default function CreateUser() {
    const { flash } = usePage().props as any;
    const { data, setData, processing, errors } = useForm<UserFormData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dni: '',
        password: '',
        password_confirmation: '',
    });

    // Manejar mensajes flash de Laravel
    useEffect(() => {
        if (flash?.success) {
            toast.success('Usuario creado exitosamente', {
                description: flash.success
            });
        }
        
        if (flash?.error) {
            toast.error('Error al crear usuario', {
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

        // Validar contraseña
        if (!data.password?.trim()) {
            toast.error('Contraseña requerida', {
                description: 'La contraseña es obligatoria'
            });
            return false;
        }

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
                description: 'Debe confirmar la contraseña'
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

        router.post(route('organizer.users.store'), data, {
            preserveScroll: true,
            onStart: () => {
                toast.loading('Creando usuario...', { id: 'create-user' });
            },
            onSuccess: () => {
                toast.success('Usuario creado exitosamente', {
                    id: 'create-user',
                    description: 'El usuario ha sido añadido a tu organización'
                });
            },
            onError: (errors) => {
                // Manejar errores específicos del servidor
                if (errors.firstName) {
                    toast.error('Error en el nombre', {
                        id: 'create-user',
                        description: Array.isArray(errors.firstName) ? errors.firstName[0] : errors.firstName
                    });
                } else if (errors.lastName) {
                    toast.error('Error en el apellido', {
                        id: 'create-user',
                        description: Array.isArray(errors.lastName) ? errors.lastName[0] : errors.lastName
                    });
                } else if (errors.email) {
                    toast.error('Error en el email', {
                        id: 'create-user',
                        description: Array.isArray(errors.email) ? errors.email[0] : errors.email
                    });
                } else if (errors.password) {
                    toast.error('Error en la contraseña', {
                        id: 'create-user',
                        description: Array.isArray(errors.password) ? errors.password[0] : errors.password
                    });
                } else if (errors.dni) {
                    toast.error('Error en el DNI', {
                        id: 'create-user',
                        description: Array.isArray(errors.dni) ? errors.dni[0] : errors.dni
                    });
                } else {
                    const firstError = Object.values(errors)[0];
                    const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
                    
                    toast.error('Error al crear usuario', {
                        id: 'create-user',
                        description: errorMessage || 'Verifica todos los campos e intenta nuevamente'
                    });
                }
                
                console.error('Form errors:', errors);
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Crear Usuario" />

            <div className="space-y-6 p-6">
                
                <div className="flex items-center space-x-3">
                                <div className="flex items-center gap-2">
                <Link 
                    href={route('organizer.users.index')}
                    className="inline-flex items-center  text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <Button variant="outline" size="icon" className="mr-4">
                            <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
            </div>
                    <UserPlus className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold">Crear Usuario</h1>
                        <p className="text-muted-foreground mt-1">
                            Añade un nuevo usuario a tu organización
                        </p>
                    </div>
                </div>

                <div className="w-full flex justify-center">
                    <Card className="w-full max-w-2xl">
                        <CardHeader>
                            <CardTitle>Información del Usuario</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <UserForm
                                data={data}
                                setData={setData}
                                errors={errors}
                                processing={processing}
                                onSubmit={submit}
                                submitText="Crear Usuario"
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}