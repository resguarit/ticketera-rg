import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { ArrowLeft } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import UserForm from './UserForm';
import BackButton from '@/components/Backbutton';
import { toast } from 'sonner';

export default function CreateUser() {
    const { data, setData, post, processing, errors, reset } = useForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dni: '',
        address: '',
        password: '',
        password_confirmation: '',
    });

    // Función para validar campos requeridos antes del envío
    const validateRequiredFields = () => {
        const requiredFields = [
            { field: 'firstName', label: 'Nombre', value: data.firstName },
            { field: 'lastName', label: 'Apellido', value: data.lastName },
            { field: 'email', label: 'Email', value: data.email },
            { field: 'dni', label: 'DNI', value: data.dni },
            { field: 'password', label: 'Contraseña', value: data.password },
            { field: 'password_confirmation', label: 'Confirmación de contraseña', value: data.password_confirmation }
        ];

        for (const { field, label, value } of requiredFields) {
            if (!value || value.trim() === '') {
                toast.error(`El campo ${label} es obligatorio`, { id: 'validation-error' });
                return false;
            }
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            toast.error('El formato del email no es válido', { id: 'validation-error' });
            return false;
        }

        // Validar DNI (solo números y longitud mínima)
        const dniRegex = /^\d{7,8}$/;
        if (!dniRegex.test(data.dni)) {
            toast.error('El DNI debe tener entre 7 y 8 dígitos numéricos', { id: 'validation-error' });
            return false;
        }

        // Validar contraseña
        if (data.password.length < 8) {
            toast.error('La contraseña debe tener al menos 8 caracteres', { id: 'validation-error' });
            return false;
        }

        // Validar confirmación de contraseña
        if (data.password !== data.password_confirmation) {
            toast.error('Las contraseñas no coinciden', { id: 'validation-error' });
            return false;
        }

        // Validar teléfono si se proporciona
        if (data.phone && data.phone.trim() !== '') {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
            if (!phoneRegex.test(data.phone)) {
                toast.error('El formato del teléfono no es válido', { id: 'validation-error' });
                return false;
            }
        }

        return true;
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        // Validar antes de enviar
        if (!validateRequiredFields()) {
            return;
        }

        post(route('admin.users.store'), {
            onStart: () => {
                toast.loading('Creando usuario...', { id: 'create-user' });
            },
            onSuccess: () => {
                toast.success('Usuario creado exitosamente', { id: 'create-user' });
            },
            onError: (errors) => {
                console.log('Form errors:', errors);
                
                // Mostrar errores específicos del servidor
                if (errors.firstName) {
                    toast.error(`Nombre: ${errors.firstName}`, { id: 'create-user' });
                } else if (errors.lastName) {
                    toast.error(`Apellido: ${errors.lastName}`, { id: 'create-user' });
                } else if (errors.email) {
                    toast.error(`Email: ${errors.email}`, { id: 'create-user' });
                } else if (errors.phone) {
                    toast.error(`Teléfono: ${errors.phone}`, { id: 'create-user' });
                } else if (errors.dni) {
                    toast.error(`DNI: ${errors.dni}`, { id: 'create-user' });
                } else if (errors.address) {
                    toast.error(`Dirección: ${errors.address}`, { id: 'create-user' });
                } else if (errors.password) {
                    toast.error(`Contraseña: ${errors.password}`, { id: 'create-user' });
                } else {
                    toast.error('Error al crear el usuario. Verifique todos los campos', { id: 'create-user' });
                }
            },
            onFinish: () => {
                // No hacer nada aquí, los errores se manejan en onError
            },
        });
    };

    return (
        <>
            <Head title="Crear Usuario" />
            
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <BackButton 
                                href={route('admin.users.index')}
                            />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Usuario</h1>
                                <p className="text-gray-600 mt-1">
                                    Completa la información del nuevo cliente
                                </p>
                            </div>
                        </div>
                    </div>

                    <UserForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        onSubmit={submit}
                        submitText="Crear Usuario"
                        isEditing={false}
                    />
                </div>
            </div>
        </>
    );
}

// Asignamos el Layout de Administrador
CreateUser.layout = (page: any) => <AppLayout children={page} />;