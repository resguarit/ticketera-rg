import { useState } from 'react';
import { User, Lock, HelpCircle, Mail, Phone, MapPin, Save, Eye, EyeOff, Edit2, X, Check, Shield, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/header';
import { Head, Link, router } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { toast, Toaster } from 'sonner';

const sidebarItems = [
    {
        id: "personal",
        label: "Información Personal",
        icon: UserCircle2,
        description: "Gestiona tus datos personales",
    },
    {
        id: "security",
        label: "Seguridad",
        icon: Shield,
        description: "Contraseña y seguridad",
    },
    {
        id: "help",
        label: "Ayuda",
        icon: HelpCircle,
        description: "Centro de soporte",
    },
];

type EditingField = 'name' | 'email' | 'phone' | 'document' | 'address' | null;

export default function MyAccount() {
    const { auth } = usePage<SharedData>().props;
    const [activeTab, setActiveTab] = useState("personal");
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [editingField, setEditingField] = useState<EditingField>(null);

    const [personalInfo, setPersonalInfo] = useState({
        firstName: auth.user?.person?.name || "",
        lastName: auth.user?.person?.last_name || "",
        email: auth.user?.email || "",
        phone: auth.user?.person?.phone || "",
        documentNumber: auth.user?.person?.dni || "",
        address: auth.user?.person?.address || "",
    });

    const [tempInfo, setTempInfo] = useState({ ...personalInfo });

    const [securityInfo, setSecurityInfo] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    if (!auth.user) {
        return (
            <>
                <Head title="Mi Cuenta" />
                <div className="min-h-screen bg-primary">
                    <Header />
                    <div className="container mx-auto px-4 py-16 text-center">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <User className="w-12 h-12 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-4">Acceso Requerido</h1>
                        <p className="text-white/80 mb-8">Necesitas iniciar sesión para acceder a tu cuenta</p>
                        <Link href={route('login')}>
                            <Button className="bg-white text-primary hover:bg-white/90">
                                Iniciar Sesión
                            </Button>
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    const handleStartEdit = (field: EditingField) => {
        setEditingField(field);
        setTempInfo({ ...personalInfo });
    };

    const handleCancelEdit = () => {
        setEditingField(null);
        setTempInfo({ ...personalInfo });
    };

    const handleSaveField = async (field: EditingField) => {
        setIsLoading(true);
        
        try {
            await router.patch(route('profile.update'), tempInfo, {
                onSuccess: () => {
                    setPersonalInfo({ ...tempInfo });
                    setEditingField(null);
                    toast.success('Información actualizada correctamente');
                },
                onError: (errors) => {
                    console.error('Errores:', errors);
                    toast.error('Error al actualizar la información');
                },
                onFinish: () => setIsLoading(false)
            });
        } catch (error) {
            console.error('Error:', error);
            setIsLoading(false);
            toast.error('Ocurrió un error inesperado');
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (securityInfo.newPassword !== securityInfo.confirmPassword) {
            toast.error("Las contraseñas no coinciden");
            return;
        }

        setIsLoading(true);

        try {
            await router.put(route('password.update'), {
                current_password: securityInfo.currentPassword,
                password: securityInfo.newPassword,
                password_confirmation: securityInfo.confirmPassword,
            }, {
                onSuccess: () => {
                    setSecurityInfo({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                    });
                    toast.success("Contraseña actualizada exitosamente");
                },
                onError: (errors) => {
                    console.error('Errores:', errors);
                    toast.error('Error al actualizar la contraseña');
                },
                onFinish: () => setIsLoading(false)
            });
        } catch (error) {
            console.error('Error:', error);
            setIsLoading(false);
            toast.error('Ocurrió un error inesperado');
        }
    };

    const InfoField = ({ 
        label, 
        value, 
        icon: Icon, 
        field, 
        placeholder,
        type = "text"
    }: { 
        label: string; 
        value: string; 
        icon: any; 
        field: EditingField;
        placeholder: string;
        type?: string;
    }) => {
        const isEditing = editingField === field;
        const fieldKey = field === 'name' ? 'firstName' : 
                        field === 'email' ? 'email' :
                        field === 'phone' ? 'phone' :
                        field === 'document' ? 'documentNumber' :
                        'address';
        
        return (
            <div className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:border-primary/30 hover:shadow-sm transition-all duration-200">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                            <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <Label className="text-xs font-medium text-gray-500 mb-1 block">{label}</Label>
                            {isEditing ? (
                                field === 'name' ? (
                                    <div className="space-y-2">
                                        <Input
                                            type="text"
                                            value={tempInfo.firstName}
                                            onChange={(e) => {
                                                setTempInfo(prev => ({
                                                    ...prev,
                                                    firstName: e.target.value
                                                }));
                                            }}
                                            placeholder="Nombre"
                                            className="h-9 text-sm"
                                            autoFocus
                                        />
                                        <Input
                                            type="text"
                                            value={tempInfo.lastName}
                                            onChange={(e) => {
                                                setTempInfo(prev => ({
                                                    ...prev,
                                                    lastName: e.target.value
                                                }));
                                            }}
                                            placeholder="Apellido"
                                            className="h-9 text-sm"
                                        />
                                    </div>
                                ) : (
                                    <Input
                                        type={type}
                                        value={tempInfo[fieldKey as keyof typeof tempInfo]}
                                        onChange={(e) => {
                                            setTempInfo(prev => ({
                                                ...prev,
                                                [fieldKey]: e.target.value
                                            }));
                                        }}
                                        placeholder={placeholder}
                                        className="h-9 text-sm"
                                        autoFocus
                                    />
                                )
                            ) : (
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {value || <span className="text-gray-400">No especificado</span>}
                                </p>
                            )}
                        </div>
                    </div>
                    
                    {isEditing ? (
                        <div className="flex items-center space-x-1 ml-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelEdit}
                                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                disabled={isLoading}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSaveField(field)}
                                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-green-600/30 border-t-green-600 rounded-full animate-spin" />
                                ) : (
                                    <Check className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                    ) : (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStartEdit(field)}
                            className="h-8 w-8 p-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-primary/10 hover:text-primary"
                        >
                            <Edit2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            <Head title="Mi Cuenta" />

            <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-blue-600">
                <Header />

                <div className="container mx-auto px-4 py-8 max-w-7xl">
                    {/* Header Profile Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                            <div className="relative">
                                <div className="w-24 h-24 bg-gradient-to-br from-primary to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                                    <User className="w-12 h-12 text-white" />
                                </div>
                                {auth.user.email_verified_at && (
                                    <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1.5 shadow-lg">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                                    {auth.user.person.name} {auth.user.person.last_name}
                                </h1>
                                <p className="text-gray-600 mb-3">{auth.user.email}</p>
                                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                    {auth.user.email_verified_at ? (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                            <Check className="w-3 h-3 mr-1" />
                                            Email Verificado
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="border-orange-300 text-orange-700">
                                            Email Sin Verificar
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Sidebar Navigation */}
                        <div className="lg:col-span-1">
                            <Card className="bg-white shadow-xl border-0">
                                <CardContent className="p-0">
                                    {/* Vista Desktop - Vertical */}
                                    <nav className="hidden lg:block space-y-1 p-2">
                                        {sidebarItems.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => setActiveTab(item.id)}
                                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                                                    activeTab === item.id
                                                        ? "bg-primary text-white shadow-md"
                                                        : "text-gray-700 hover:bg-gray-50"
                                                }`}
                                            >
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                    activeTab === item.id ? "bg-white/20" : "bg-primary/10"
                                                }`}>
                                                    <item.icon className={`w-5 h-5 ${
                                                        activeTab === item.id ? "text-white" : "text-primary"
                                                    }`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-sm truncate">{item.label}</p>
                                                    <p className={`text-xs truncate ${
                                                        activeTab === item.id ? "text-white/80" : "text-gray-500"
                                                    }`}>
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </nav>

                                    {/* Vista Mobile - Horizontal 3 columnas */}
                                    <nav className="lg:hidden grid grid-cols-3 gap-2 p-2">
                                        {sidebarItems.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => setActiveTab(item.id)}
                                                className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                                                    activeTab === item.id
                                                        ? "bg-white "
                                                        : "bg-white/50 hover:bg-white/80"
                                                }`}
                                            >
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${
                                                    activeTab === item.id ? "bg-primary" : "bg-primary/10"
                                                }`}>
                                                    <item.icon className={`w-6 h-6 ${
                                                        activeTab === item.id ? "text-white" : "text-primary"
                                                    }`} />
                                                </div>
                                                <p className={`text-xs font-medium text-center leading-tight ${
                                                    activeTab === item.id ? "text-primary" : "text-gray-700"
                                                }`}>
                                                    {item.label}
                                                </p>
                                            </button>
                                        ))}
                                    </nav>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                {/* Personal Information */}
                                <TabsContent value="personal" className="mt-0">
                                    <Card className="bg-white shadow-xl border-0">
                                        <CardHeader className="border-b border-gray-100 pb-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                                                    <UserCircle2 className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-2xl font-bold text-gray-900">
                                                        Información Personal
                                                    </CardTitle>
                                                    <CardDescription className="text-sm text-gray-600">
                                                        Gestiona tu información personal y de contacto
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <div className="space-y-4">
                                                <InfoField
                                                    label="Nombre Completo"
                                                    value={`${personalInfo.firstName} ${personalInfo.lastName}`}
                                                    icon={User}
                                                    field="name"
                                                    placeholder="Juan Pérez"
                                                />
                                                
                                                <InfoField
                                                    label="Correo Electrónico"
                                                    value={personalInfo.email}
                                                    icon={Mail}
                                                    field="email"
                                                    placeholder="tu@email.com"
                                                    type="email"
                                                />
                                                
                                                <InfoField
                                                    label="Teléfono"
                                                    value={personalInfo.phone}
                                                    icon={Phone}
                                                    field="phone"
                                                    placeholder="+54 11 1234-5678"
                                                />
                                                
                                                <InfoField
                                                    label="Documento de Identidad"
                                                    value={personalInfo.documentNumber}
                                                    icon={UserCircle2}
                                                    field="document"
                                                    placeholder="12345678"
                                                />
                                                
                                                <InfoField
                                                    label="Dirección"
                                                    value={personalInfo.address}
                                                    icon={MapPin}
                                                    field="address"
                                                    placeholder="Calle 123, Ciudad"
                                                />
                                            </div>

                                            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                                <div className="flex items-start space-x-3">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <Shield className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-blue-900 mb-1">
                                                            Información Segura
                                                        </p>
                                                        <p className="text-xs text-blue-700">
                                                            Tus datos están protegidos y solo tú puedes modificarlos. 
                                                            Haz clic en el ícono de editar para actualizar cualquier campo.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Security */}
                                <TabsContent value="security" className="mt-0">
                                    <Card className="bg-white shadow-xl border-0">
                                        <CardHeader className="border-b border-gray-100 pb-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                                                    <Shield className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-2xl font-bold text-gray-900">
                                                        Seguridad de la Cuenta
                                                    </CardTitle>
                                                    <CardDescription className="text-sm text-gray-600">
                                                        Actualiza tu contraseña para mantener tu cuenta segura
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <form onSubmit={handleChangePassword} className="space-y-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
                                                        Contraseña Actual
                                                    </Label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                        <Input
                                                            id="currentPassword"
                                                            type={showPassword ? "text" : "password"}
                                                            value={securityInfo.currentPassword}
                                                            onChange={(e) =>
                                                                setSecurityInfo((prev) => ({ ...prev, currentPassword: e.target.value }))
                                                            }
                                                            className="pl-10 pr-10 h-12 border-gray-300 focus:border-primary focus:ring-primary"
                                                            placeholder="Ingresa tu contraseña actual"
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                        >
                                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                                                        Nueva Contraseña
                                                    </Label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                        <Input
                                                            id="newPassword"
                                                            type={showNewPassword ? "text" : "password"}
                                                            value={securityInfo.newPassword}
                                                            onChange={(e) =>
                                                                setSecurityInfo((prev) => ({ ...prev, newPassword: e.target.value }))
                                                            }
                                                            className="pl-10 pr-10 h-12 border-gray-300 focus:border-primary focus:ring-primary"
                                                            placeholder="Ingresa tu nueva contraseña"
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                        >
                                                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                                                        Confirmar Nueva Contraseña
                                                    </Label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                        <Input
                                                            id="confirmPassword"
                                                            type={showNewPassword ? "text" : "password"}
                                                            value={securityInfo.confirmPassword}
                                                            onChange={(e) =>
                                                                setSecurityInfo((prev) => ({ ...prev, confirmPassword: e.target.value }))
                                                            }
                                                            className="pl-10 h-12 border-gray-300 focus:border-primary focus:ring-primary"
                                                            placeholder="Confirma tu nueva contraseña"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                                                    <div className="flex items-start space-x-3">
                                                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <Lock className="w-4 h-4 text-amber-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-amber-900 mb-1">
                                                                Requisitos de Contraseña
                                                            </p>
                                                            <ul className="text-xs text-amber-700 space-y-1">
                                                                <li>• Mínimo 8 caracteres</li>
                                                                <li>• Incluye letras mayúsculas y minúsculas</li>
                                                                <li>• Al menos un número</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Button
                                                    type="submit"
                                                    disabled={isLoading}
                                                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg"
                                                >
                                                    {isLoading ? (
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            <span>Actualizando...</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center space-x-2">
                                                            <Shield className="w-5 h-5" />
                                                            <span>Actualizar Contraseña</span>
                                                        </div>
                                                    )}
                                                </Button>
                                            </form>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Help */}
                                <TabsContent value="help" className="mt-0">
                                    <Card className="bg-white shadow-xl border-0">
                                        <CardContent className="p-12 text-center">
                                            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                                <HelpCircle className="w-10 h-10 text-white" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                                ¿Necesitas Ayuda?
                                            </h3>
                                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                                Visita nuestro centro de ayuda para encontrar respuestas a tus preguntas 
                                                o contacta con nuestro equipo de soporte
                                            </p>
                                            <Link href={route('help')}>
                                                <Button className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg">
                                                    <HelpCircle className="w-5 h-5 mr-2" />
                                                    Ir al Centro de Ayuda
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
            <Toaster position="top-right" richColors />
        </>
    );
}