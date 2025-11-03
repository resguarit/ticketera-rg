import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import AppLayout from '@/layouts/app-layout';
import UserForm from './UserForm';
import BackButton from '@/components/Backbutton';
import { toast } from 'sonner';

interface UserData {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dni: string;
    address: string;
}

interface PageProps {
    user: UserData;
}

export default function EditUser() {
    const { user } = usePage<PageProps>().props;
    
    const { data, setData, put, processing, errors } = useForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        dni: user.dni,
        address: user.address || '',
        password: '',
        password_confirmation: '',
    });

    // Función para validar campos requeridos antes del envío
    const validateRequiredFields = () => {
        const requiredFields = [
            { field: 'firstName', label: 'Nombre', value: data.firstName },
            { field: 'lastName', label: 'Apellido', value: data.lastName },
            { field: 'email', label: 'Email', value: data.email },
            { field: 'dni', label: 'DNI', value: data.dni }
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

        // Validar contraseña solo si se proporciona
        if (data.password && data.password.trim() !== '') {
            if (data.password.length < 8) {
                toast.error('La nueva contraseña debe tener al menos 8 caracteres', { id: 'validation-error' });
                return false;
            }

            if (data.password !== data.password_confirmation) {
                toast.error('Las contraseñas no coinciden', { id: 'validation-error' });
                return false;
            }
        }

        // Validar que si se proporciona password_confirmation, también se proporcione password
        if (data.password_confirmation && data.password_confirmation.trim() !== '' && (!data.password || data.password.trim() === '')) {
            toast.error('Debes ingresar la nueva contraseña si proporcionas la confirmación', { id: 'validation-error' });
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

        put(route('admin.users.update', user.id), {
            onStart: () => {
                toast.loading('Actualizando usuario...', { id: 'update-user' });
            },
            onSuccess: () => {
                toast.success('Usuario actualizado exitosamente', { id: 'update-user' });
            },
            onError: (errors) => {
                console.log('Form errors:', errors);
                
                // Mostrar errores específicos del servidor
                if (errors.firstName) {
                    toast.error(`Nombre: ${errors.firstName}`, { id: 'update-user' });
                } else if (errors.lastName) {
                    toast.error(`Apellido: ${errors.lastName}`, { id: 'update-user' });
                } else if (errors.email) {
                    toast.error(`Email: ${errors.email}`, { id: 'update-user' });
                } else if (errors.phone) {
                    toast.error(`Teléfono: ${errors.phone}`, { id: 'update-user' });
                } else if (errors.dni) {
                    toast.error(`DNI: ${errors.dni}`, { id: 'update-user' });
                } else if (errors.address) {
                    toast.error(`Dirección: ${errors.address}`, { id: 'update-user' });
                } else if (errors.password) {
                    toast.error(`Contraseña: ${errors.password}`, { id: 'update-user' });
                } else {
                    toast.error('Error al actualizar el usuario. Verifique todos los campos', { id: 'update-user' });
                }
            },
        });
    };

    return (
        <>
            <Head title={`Editar Usuario - ${user.firstName} ${user.lastName}`} />
            
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <BackButton 
                                href={route('admin.users.index')}
                            />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Editar Usuario
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Modificando: {user.firstName} {user.lastName}
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
                        submitText="Actualizar Usuario"
                        user={user}
                        isEditing={true}
                    />
                </div>
            </div>
        </>
    );
}

// Asignamos el Layout de Administrador
EditUser.layout = (page: any) => <AppLayout children={page} />;