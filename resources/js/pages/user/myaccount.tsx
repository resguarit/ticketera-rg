import { useState } from 'react';
import { User, Lock, Shield, Monitor, HelpCircle, Bell, CreditCard, MapPin, Mail, Phone, Calendar, Save, Camera, Eye, EyeOff, BadgeCheck  } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/header';
import { Head, Link, router } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

const sidebarItems = [
    {
        id: "personal",
        label: "Personal",
        icon: User,
        color: "bg-chart-2",
    },
    {
        id: "security",
        label: "Contraseña y Seguridad",
        icon: Lock,
        color: "bg-foreground",
    },
    {
        id: "privacy",
        label: "Privacidad",
        icon: Shield,
        color: "bg-foreground",
    },
    {
        id: "notifications",
        label: "Notificaciones",
        icon: Bell,
        color: "bg-foreground",
    },
    {
        id: "payment",
        label: "Métodos de Pago",
        icon: CreditCard,
        color: "bg-foreground",
    },
    {
        id: "help",
        label: "Ayuda y Soporte",
        icon: HelpCircle,
        color: "bg-foreground",
    },
];

export default function MyAccount() {
    const { auth } = usePage<SharedData>().props;
    const [activeTab, setActiveTab] = useState("personal");
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [personalInfo, setPersonalInfo] = useState({
        firstName: auth.user?.person?.name || "",
        lastName: auth.user?.person?.last_name || "",
        email: auth.user?.email || "",
        phone: auth.user?.person?.phone || "", // ✅ Cargar phone existente
        birthDate: "",
        country: "Argentina",
        documentType: "DNI",
        documentNumber: auth.user?.person?.dni || "", // ✅ Cargar DNI existente
        address: auth.user?.person?.address || "", // ✅ Cargar address existente
        city: "",
        postalCode: "",
    });

    const [securityInfo, setSecurityInfo] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        twoFactorEnabled: false,
    });

    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        eventReminders: true,
        promotionalEmails: false,
        securityAlerts: true,
    });

    // Si el usuario no está autenticado, redirigir
    if (!auth.user) {
        return (
            <>
                <Head title="Mi Cuenta" />
                <div className="min-h-screen bg-gradient-to-br from-gray-200 to-secondary">
                    <Header />
                    <div className="container mx-auto px-4 py-16 text-center">
                        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                            <User className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-foreground mb-4">Acceso Requerido</h1>
                        <p className="text-foreground/80 mb-8">Necesitas iniciar sesión para acceder a tu cuenta</p>
                        <Link href={route('login')}>
                            <Button className="bg-primary hover:bg-primary-hover text-white">
                                Iniciar Sesión
                            </Button>
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    const handleSavePersonalInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            await router.patch(route('profile.update'), personalInfo, {
                onSuccess: () => {
                    alert('Información personal actualizada correctamente');
                },
                onError: (errors) => {
                    console.error('Errores:', errors);
                },
                onFinish: () => setIsLoading(false)
            });
        } catch (error) {
            console.error('Error:', error);
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (securityInfo.newPassword !== securityInfo.confirmPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }
        
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
                        twoFactorEnabled: securityInfo.twoFactorEnabled,
                    });
                    alert("Contraseña actualizada exitosamente");
                },
                onError: (errors) => {
                    console.error('Errores:', errors);
                    alert('Error al actualizar la contraseña');
                }
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSaveNotifications = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            // Por ahora solo simular, ya que no hay ruta para notificaciones en settings
            setTimeout(() => {
                alert('Preferencias de notificaciones guardadas (simulado)');
                setIsLoading(false);
            }, 1000);
            
            // Cuando quieras agregar la funcionalidad real, descomenta esto:
            // await router.put(route('profile.notifications'), notificationSettings, {
            //     onSuccess: () => {
            //         alert('Preferencias de notificaciones actualizadas');
            //     },
            //     onError: (errors) => {
            //         console.error('Errores:', errors);
            //         alert('Error al actualizar las preferencias');
            //     },
            //     onFinish: () => setIsLoading(false)
            // });
        } catch (error) {
            console.error('Error:', error);
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head title="Mi Cuenta" />
            
            <div className="min-h-screen bg-primary">
                <Header />

                <div className="container mx-0 lg:mx-auto px-0 lg:px-4 py-0 lg:py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 lg:gap-8">
                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <Card className="bg-white border-gray-200 rounded-none lg:rounded-md shadow-lg sticky top-24 py-4 lg:py-8">
                                <CardHeader className="text-start items-center flex flex-row lg:flex-col lg:text-center pb-0 lg:pb-4">
                                    <div className="relative h-10 w-fit lg:w-20 lg:h-20 justify-start lg:justify-center lg:mx-auto ">
                                        <div className="lg:w-20 lg:h-20 w-10 h-10 bg-foreground  rounded-full flex items-center justify-center">
                                            <User className="w-6 h-6 lg:w-10 lg:h-10 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                    <h3 className="text-lg lg:text-xl font-bold text-foreground">{auth.user.person.name}</h3>
                                    <p className="text-foreground/60 text-xs lg:text-sm">{auth.user.email}</p>
                                    </div>
                                </CardHeader>
<CardContent className="p-0">
    {/* Desktop Navigation - Vertical */}
    <nav className="hidden lg:block space-y-1">
        {sidebarItems.map((item) => (
            <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-all duration-200 ${
                    activeTab === item.id
                        ? "bg-primary text-white hover:bg-secondary"
                        : "text-foreground/80 hover:bg-secondary"
                }`}
            >
                <div
                    className={`w-8 h-8 rounded-lg bg-primary hover:bg-secondary flex items-center justify-center`}
                >
                    <item.icon className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium">{item.label}</span>
            </button>
        ))}
    </nav>

    {/* Mobile Navigation - Horizontal Tabs */}
    <div className="lg:hidden">
        <div className="overflow-x-auto scrollbar-hide">
            <div className="flex space-x-1 p-2 min-w-max">
                {sidebarItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap min-w-0 ${
                            activeTab === item.id
                                ? "bg-primary text-white shadow-sm"
                                : "text-foreground/70 hover:bg-gray-50 hover:text-foreground"
                        }`}
                    >
                        <div
                            className={`w-6 h-6 rounded-md flex items-center justify-center ${
                                activeTab === item.id ? "bg-white/20" : "bg-foreground/10"
                            }`}
                        >
                            <item.icon className={`w-3 h-3 ${
                                activeTab === item.id ? "text-white" : "text-foreground/70"
                            }`} />
                        </div>
                        <span className="text-xs font-medium truncate max-w-16">
                            {item.label.split(' ')[0]}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    </div>
</CardContent>
                            </Card>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                {/* Personal Information */}
                                <TabsContent value="personal">
                                    <Card className="bg-white border-gray-200 lg:rounded-md rounded-none shadow-lg lg:gap-6 gap-4">
                                        <CardHeader>
                                            <CardTitle className="text-lg lg:text-2xl font-bold text-foreground flex items-center space-x-3">
                                                <div className="lg:w-10 lg:h-10 w-8 h-8 bg-gradient-to-r from-primary to-blue-500 rounded-lg flex items-center justify-center">
                                                    <User className="lg:w-5 lg:h-5 w-4 h-4 text-white" />
                                                </div>
                                                <span>Información Personal</span>
                                            </CardTitle>
                                            <p className="text-foreground/80 lg:text-base text-sm">Actualiza tu información personal y de contacto</p>
                                        </CardHeader>
                                        <CardContent>
                                            <form onSubmit={handleSavePersonalInfo} className="space-y-6">
                                                <div className="grid grid-cols-2 gap-2 lg:gap-6 mb-2">
                                                    <div className="space-y-1 ">
                                                        <Label htmlFor="firstName" className="lg:text-sm text-xs text-foreground font-medium">
                                                            Nombre
                                                        </Label>
                                                        <Input
                                                            id="firstName"
                                                            value={personalInfo.firstName}
                                                            onChange={(e) =>
                                                                setPersonalInfo((prev) => ({ ...prev, firstName: e.target.value }))
                                                            }
                                                            className="bg-white border-gray-300  text-foreground placeholder:text-gray-400 text-sm lg:text-base lg:px-3 px-2 h-fit py-1"
                                                            placeholder="Tu nombre"
                                                        />
                                                        <p className="text-foreground/60 text-xs lg:text-sm">Nombre como figura en tu documento</p>
                                                    </div>

                                                    <div className="space-y-1 ">
                                                        <Label htmlFor="lastName" className="lg:text-sm text-xs text-foreground font-medium">
                                                            Apellido
                                                        </Label>
                                                        <Input
                                                            id="lastName"
                                                            value={personalInfo.lastName}
                                                            onChange={(e) =>
                                                                setPersonalInfo((prev) => ({ ...prev, lastName: e.target.value }))
                                                            }
                                                            className="bg-white border-gray-300 text-foreground placeholder:text-gray-400 text-sm lg:text-base lg:px-3 px-2 h-fit py-1"
                                                            placeholder="Tu apellido"
                                                        />
                                                        <p className="text-foreground/60 text-xs lg:text-sm">Apellido como figura en tu documento</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-1 mb-2">
                                                    <Label htmlFor="email" className="text-foreground font-medium text-xs lg:text-sm">
                                                        E-Mail
                                                    </Label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 lg:w-5 lg:h-5 w-4 h-4" />
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            value={personalInfo.email}
                                                            onChange={(e) => setPersonalInfo((prev) => ({ ...prev, email: e.target.value }))}
                                                            className="lg:pl-10 pl-6 bg-white border-gray-300 text-foreground placeholder:text-gray-400 text-sm lg:text-base  h-fit py-1"
                                                            placeholder="tu@email.com"
                                                        />
                                                    </div>
                                                    <p className="text-foreground/60 text-xs lg:text-sm">E-mail para notificaciones y recuperación de contraseña</p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 lg:gap-6 mb-2">
                                                    <div className="space-y-1">
                                                        <Label htmlFor="phone" className="text-xs lg:text-sm text-foreground font-medium">
                                                            Teléfono
                                                        </Label>
                                                        <div className="relative">
                                                            <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 lg:w-5 lg:h-5 w-4 h-4" />
                                                            <Input
                                                                id="phone"
                                                                value={personalInfo.phone}
                                                                onChange={(e) => setPersonalInfo((prev) => ({ ...prev, phone: e.target.value }))
                                                                }
                                                                className="lg:pl-10 pl-6 bg-white border-gray-300 text-foreground placeholder:text-gray-400 text-sm lg:text-base h-fit py-1"
                                                                placeholder="+54 11 1234-5678"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <Label htmlFor="birthDate" className="text-xs lg:text-sm text-foreground font-medium">
                                                            Fecha de Nacimiento
                                                        </Label>
                                                        <div className="relative">
                                                            <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 lg:w-5 lg:h-5 w-4 h-4" />
                                                            <Input
                                                                id="birthDate"
                                                                type="date"
                                                                value={personalInfo.birthDate}
                                                                onChange={(e) =>
                                                                    setPersonalInfo((prev) => ({ ...prev, birthDate: e.target.value }))
                                                                }
                                                                className="lg:pl-10 pl-6 bg-white border-gray-300 text-foreground text-sm lg:text-base  h-fit py-1"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 lg:gap-6 mb-2">
                                                    <div className="space-y-1">
                                                        <Label htmlFor="documentType" className="text-xs lg:text-sm text-foreground font-medium">
                                                            Tipo de Documento
                                                        </Label>
                                                        <Select
                                                            value={personalInfo.documentType}
                                                            onValueChange={(value) =>
                                                                setPersonalInfo((prev) => ({ ...prev, documentType: value }))
                                                            }
                                                        >
                                                            <SelectTrigger className="bg-white border-gray-300 text-foreground text-sm lg:text-base lg:px-3 px-2 h-fit py-1">
                                                                <SelectValue placeholder="Selecciona tipo" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="DNI">DNI</SelectItem>
                                                                <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                                                                <SelectItem value="Cedula">Cédula</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <Label htmlFor="documentNumber" className="text-xs lg:text-sm text-foreground font-medium">
                                                            Número de Documento 
                                                        </Label>
                                                        <Input
                                                            id="documentNumber"
                                                            value={personalInfo.documentNumber}
                                                            onChange={(e) => setPersonalInfo((prev) => ({ ...prev, documentNumber: e.target.value }))}
                                                            className="bg-white border-gray-300 text-foreground placeholder:text-gray-400 text-sm lg:text-base lg:px-3 px-2 h-fit py-1"
                                                            placeholder="12345678"
                                                            required
                                                        />
                                                        <p className="text-foreground/60 text-xs lg:text-sm">Número sin puntos ni espacios</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-1 mb-2">
                                                    <Label htmlFor="address" className="text-xs lg:text-sm text-foreground font-medium">
                                                        Dirección
                                                    </Label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-2 top-2 text-gray-400 lg:w-5 lg:h-5 w-4 h-4" />
                                                        <Input
                                                            id="address"
                                                            value={personalInfo.address}
                                                            onChange={(e) => setPersonalInfo((prev) => ({ ...prev, address: e.target.value }))}
                                                            className="pl-6 lg:pl-10 bg-white border-gray-300 text-foreground placeholder:text-gray-400 text-sm lg:text-base  h-fit py-1"
                                                            placeholder="Calle 123, Ciudad"
                                                        />
                                                    </div>
                                                    <p className="text-foreground/60 text-xs lg:text-sm">Dirección completa (opcional)</p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 lg:gap-6">
                                                    <div className="space-y-1">
                                                        <Label htmlFor="city" className="text-xs lg:text-sm text-foreground font-medium">
                                                            Ciudad
                                                        </Label>
                                                        <Input
                                                            id="city"
                                                            value={personalInfo.city}
                                                            onChange={(e) => setPersonalInfo((prev) => ({ ...prev, city: e.target.value }))
                                                            }
                                                            className="bg-white border-gray-300 text-foreground placeholder:text-gray-400 text-sm lg:text-base lg:px-3 px-2 h-fit py-1"
                                                            placeholder="Buenos Aires"
                                                        />
                                                    </div>

                                                    <div className="space-y-1">
                                                        <Label htmlFor="postalCode" className="text-xs lg:text-sm text-foreground font-medium">
                                                            Código Postal
                                                        </Label>
                                                        <Input
                                                            id="postalCode"
                                                            value={personalInfo.postalCode}
                                                            onChange={(e) => setPersonalInfo((prev) => ({ ...prev, postalCode: e.target.value }))
                                                            }
                                                            className="bg-white border-gray-300 text-foreground placeholder:text-gray-400 text-sm lg:text-base lg:px-3 px-2 h-fit py-1"
                                                            placeholder="1000"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex justify-end">
                                                    <Button
                                                        type="submit"
                                                        disabled={isLoading}
                                                        className="bg-primary hover:bg-primary-hover text-white px-8 py-3 font-semibold"
                                                    >
                                                        {isLoading ? (
                                                            <div className="flex items-center space-x-2">
                                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                <span>Guardando...</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center space-x-2">
                                                                <Save className="w-5 h-5" />
                                                                <span>Guardar Cambios</span>
                                                            </div>
                                                        )}
                                                    </Button>
                                                </div>
                                            </form>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Security */}
                                <TabsContent value="security">
                                    <div className="space-y-6">
                                        <Card className="bg-white border-gray-200 lg:rounded-md rounded-none shadow-lg">
                                            <CardHeader>
                                                <CardTitle className="text-lg lg:text-2xl font-bold text-foreground flex items-center space-x-3">
                                                    <div className="lg:w-10 lg:h-10 w-8 h-8 bg-gradient-to-r from-primary to-blue-500 rounded-lg flex items-center justify-center">
                                                        <Lock className="lg:w-5 lg:h-5 h-4 w-4 text-white" />
                                                    </div>
                                                    <span>Cambiar Contraseña</span>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <form onSubmit={handleChangePassword} className="space-y-2 lg:space-y-4">
                                                    <div className="space-y-1">
                                                        <Label htmlFor="currentPassword" className="text-xs lg:text-sm  text-foreground font-medium">
                                                            Contraseña Actual
                                                        </Label>
                                                        <div className="relative">
                                                            <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 lg:w-5 lg:h-5 w-4 h-4" />
                                                            <Input
                                                                id="currentPassword"
                                                                type={showPassword ? "text" : "password"}
                                                                value={securityInfo.currentPassword}
                                                                onChange={(e) =>
                                                                    setSecurityInfo((prev) => ({ ...prev, currentPassword: e.target.value }))
                                                                }
                                                                className="lg:pl-10 lg:pr-10 pl-8 pr-8 bg-white border-gray-300 text-foreground lg:h-9 h-fit text-sm lg:text-base"
                                                                required
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-foreground"
                                                            >
                                                                {showPassword ? <EyeOff className="lg:w-5 lg:h-5 w-4 h-4" /> : <Eye className="lg:w-5 lg:h-5 w-4 h-4" />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="newPassword" className="text-xs lg:text-sm text-foreground font-medium">
                                                            Nueva Contraseña
                                                        </Label>
                                                        <div className="relative">
                                                            <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 lg:w-5 lg:h-5 w-4 h-4" />
                                                            <Input
                                                                id="newPassword"
                                                                type={showNewPassword ? "text" : "password"}
                                                                value={securityInfo.newPassword}
                                                                onChange={(e) =>
                                                                    setSecurityInfo((prev) => ({ ...prev, newPassword: e.target.value }))
                                                                }
                                                                className="lg:pl-10 lg:pr-10 pl-8 pr-8 bg-white border-gray-300 text-foreground lg:h-9 h-fit text-sm lg:text-base"
                                                                required
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-foreground"
                                                            >
                                                                {showNewPassword ? <EyeOff className="lg:w-5 lg:h-5 w-4 h-4" /> : <Eye className="lg:w-5 lg:h-5 w-4 h-4" />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="confirmPassword" className="text-xs lg:text-sm text-foreground font-medium">
                                                            Confirmar Nueva Contraseña
                                                        </Label>
                                                        <div className="relative">
                                                            <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 lg:w-5 lg:h-5 w-4 h-4" />
                                                            <Input
                                                                id="confirmPassword"
                                                                type={showNewPassword ? "text" : "password"}
                                                                value={securityInfo.confirmPassword}
                                                                onChange={(e) =>
                                                                    setSecurityInfo((prev) => ({ ...prev, confirmPassword: e.target.value }))
                                                                }
                                                                className="pl-10 bg-white border-gray-300 text-foreground lg:h-9 h-fit text-sm lg:text-base"
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    <Button
                                                        type="submit"
                                                        disabled={isLoading}
                                                        className="bg-primary hover:bg-primary-hover text-white mt-2"
                                                    >
                                                        Actualizar Contraseña
                                                    </Button>
                                                </form>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-white border-gray-200 rounded-none lg:rounded-md shadow-lg">
                                            <CardHeader>
                                                <CardTitle className="text-lg lg:text-xl font-bold text-foreground flex items-center space-x-3">
                                                    <Shield className="lg:w-6 lg:h-6 w-5 h-5 text-primary" />
                                                    <span>Autenticación de Dos Factores</span>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-foreground font-medium text-sm lg:text-base">Activar 2FA</p>
                                                        <p className="text-foreground/60 text-xs lg:text-sm">
                                                            Agrega una capa extra de seguridad a tu cuenta
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={securityInfo.twoFactorEnabled}
                                                        onCheckedChange={(checked: boolean) =>
                                                            setSecurityInfo((prev) => ({ ...prev, twoFactorEnabled: checked }))
                                                        }
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                {/* Notifications */}
                                <TabsContent value="notifications">
                                    <Card className="bg-white border-gray-200 rounded-none lg:rounded-md shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="text-lg lg:text-2xl font-bold text-foreground flex items-center space-x-3">
                                                <div className="lg:w-10 lg:h-10 h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                                                    <Bell className="lg:w-5 lg:h-5 h-4 w-4 text-white" />
                                                </div>
                                                <span>Preferencias de Notificaciones</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4 lg:space-y-6">
                                            {[
                                                {
                                                    key: "emailNotifications",
                                                    title: "Notificaciones por Email",
                                                    description: "Recibe actualizaciones importantes por correo electrónico",
                                                },
                                                {
                                                    key: "smsNotifications",
                                                    title: "Notificaciones por SMS",
                                                    description: "Recibe alertas importantes por mensaje de texto",
                                                },
                                                {
                                                    key: "pushNotifications",
                                                    title: "Notificaciones Push",
                                                    description: "Recibe notificaciones en tiempo real en tu dispositivo",
                                                },
                                                {
                                                    key: "eventReminders",
                                                    title: "Recordatorios de Eventos",
                                                    description: "Te recordaremos sobre tus próximos eventos",
                                                },
                                                {
                                                    key: "promotionalEmails",
                                                    title: "Emails Promocionales",
                                                    description: "Recibe ofertas especiales y descuentos",
                                                },
                                                {
                                                    key: "securityAlerts",
                                                    title: "Alertas de Seguridad",
                                                    description: "Notificaciones sobre actividad sospechosa en tu cuenta",
                                                },
                                            ].map((setting) => (
                                                <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div>
                                                        <p className="text-foreground font-medium">{setting.title}</p>
                                                        <p className="text-foreground/60 text-sm">{setting.description}</p>
                                                    </div>
                                                    <Switch
                                                        checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                                                        onCheckedChange={(checked: boolean) =>
                                                            setNotificationSettings((prev) => ({ ...prev, [setting.key]: checked }))
                                                        }
                                                    />
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Other tabs placeholder */}
                                <TabsContent value="privacy">
                                    <Card className="bg-white border-gray-200 rounded-none lg:rounded-md shadow-lg">
                                        <CardContent className="p-12 text-center">
                                            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-foreground mb-2">Configuración de Privacidad</h3>
                                            <p className="text-foreground/60">Esta sección estará disponible próximamente</p>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="payment">
                                    <Card className="bg-white border-gray-200 rounded-none lg:rounded-md shadow-lg">
                                        <CardContent className="p-12 text-center">
                                            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-foreground mb-2">Métodos de Pago</h3>
                                            <p className="text-foreground/60">Esta sección estará disponible próximamente</p>
                                        </CardContent>
                                    </Card>
                                </TabsContent>


                                <TabsContent value="help">
                                    <Card className="bg-white border-gray-200 rounded-none lg:rounded-md shadow-lg">
                                        <CardContent className="p-12 text-center">
                                            <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-foreground mb-2">Ayuda y Soporte</h3>
                                            <p className="text-foreground/60 mb-6">¿Necesitas ayuda? Visita nuestro centro de ayuda</p>
                                            <Link href={route('help')}>
                                                <Button className="bg-primary hover:bg-primary-hover text-white">
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
        </>
    );
}