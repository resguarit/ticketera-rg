import { useState } from 'react';
import { User, Lock, Shield, Monitor, HelpCircle, Bell, CreditCard, MapPin, Mail, Phone, Calendar, Save, Camera, Eye, EyeOff } from 'lucide-react';
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
        label: "Información Personal",
        icon: User,
        color: "from-cyan-500 to-blue-500",
    },
    {
        id: "security",
        label: "Contraseña y Seguridad",
        icon: Lock,
        color: "from-purple-500 to-pink-500",
    },
    {
        id: "privacy",
        label: "Privacidad",
        icon: Shield,
        color: "from-green-500 to-emerald-500",
    },
    {
        id: "notifications",
        label: "Notificaciones",
        icon: Bell,
        color: "from-orange-500 to-red-500",
    },
    {
        id: "payment",
        label: "Métodos de Pago",
        icon: CreditCard,
        color: "from-indigo-500 to-purple-500",
    },
    {
        id: "sessions",
        label: "Sesiones Activas",
        icon: Monitor,
        color: "from-teal-500 to-cyan-500",
    },
    {
        id: "help",
        label: "Ayuda y Soporte",
        icon: HelpCircle,
        color: "from-pink-500 to-rose-500",
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
        phone: "",
        birthDate: "",
        country: "Argentina",
        documentType: "DNI",
        documentNumber: "",
        address: "",
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
                <Head title="Mi Cuenta - TicketMax" />
                <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                    <Header />
                    <div className="container mx-auto px-4 py-16 text-center">
                        <h1 className="text-3xl font-bold text-white mb-4">Acceso Requerido</h1>
                        <p className="text-white/80 mb-8">Necesitas iniciar sesión para acceder a tu cuenta</p>
                        <Link href={route('login')}>
                            <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white">
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
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            // Aquí harías la llamada real a la API
        }, 1000);
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (securityInfo.newPassword !== securityInfo.confirmPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setSecurityInfo((prev) => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            }));
            alert("Contraseña actualizada exitosamente");
        }, 1000);
    };

    return (
        <>
            <Head title="Mi Cuenta - TicketMax" />
            
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <Header />

                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <Card className="bg-white/10 backdrop-blur-md border-white/20 sticky top-24">
                                <CardHeader className="text-center pb-4">
                                    <div className="relative w-20 h-20 mx-auto mb-4">
                                        <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                                            <User className="w-10 h-10 text-white" />
                                        </div>
                                        <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                                            <Camera className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                    <h3 className="text-xl font-bold text-white">{auth.user.person.name}</h3>
                                    <p className="text-white/60 text-sm">{auth.user.email}</p>
                                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 mt-2">
                                        Cuenta Verificada
                                    </Badge>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <nav className="space-y-1">
                                        {sidebarItems.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => setActiveTab(item.id)}
                                                className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-all duration-200 ${
                                                    activeTab === item.id
                                                        ? "bg-gradient-to-r from-white/20 to-white/10 border-r-2 border-cyan-400 text-white"
                                                        : "text-white/80 hover:bg-white/10 hover:text-white"
                                                }`}
                                            >
                                                <div
                                                    className={`w-8 h-8 rounded-lg bg-gradient-to-r ${item.color} flex items-center justify-center`}
                                                >
                                                    <item.icon className="w-4 h-4 text-white" />
                                                </div>
                                                <span className="font-medium">{item.label}</span>
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
                                <TabsContent value="personal">
                                    <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                        <CardHeader>
                                            <CardTitle className="text-2xl font-bold text-white flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                                                    <User className="w-5 h-5 text-white" />
                                                </div>
                                                <span>Información Personal</span>
                                            </CardTitle>
                                            <p className="text-white/80">Actualiza tu información personal y de contacto</p>
                                        </CardHeader>
                                        <CardContent>
                                            <form onSubmit={handleSavePersonalInfo} className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="firstName" className="text-white font-medium">
                                                            Nombre
                                                        </Label>
                                                        <Input
                                                            id="firstName"
                                                            value={personalInfo.firstName}
                                                            onChange={(e) =>
                                                                setPersonalInfo((prev) => ({ ...prev, firstName: e.target.value }))
                                                            }
                                                            className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                                                            placeholder="Tu nombre"
                                                        />
                                                        <p className="text-white/60 text-sm">Nombre como figura en tu documento</p>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="lastName" className="text-white font-medium">
                                                            Apellido
                                                        </Label>
                                                        <Input
                                                            id="lastName"
                                                            value={personalInfo.lastName}
                                                            onChange={(e) =>
                                                                setPersonalInfo((prev) => ({ ...prev, lastName: e.target.value }))
                                                            }
                                                            className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                                                            placeholder="Tu apellido"
                                                        />
                                                        <p className="text-white/60 text-sm">Apellido como figura en tu documento</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="email" className="text-white font-medium">
                                                        E-Mail
                                                    </Label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            value={personalInfo.email}
                                                            onChange={(e) => setPersonalInfo((prev) => ({ ...prev, email: e.target.value }))}
                                                            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                                                            placeholder="tu@email.com"
                                                        />
                                                    </div>
                                                    <p className="text-white/60 text-sm">E-mail para notificaciones y recuperación de contraseña</p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="phone" className="text-white font-medium">
                                                            Teléfono
                                                        </Label>
                                                        <div className="relative">
                                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                                                            <Input
                                                                id="phone"
                                                                value={personalInfo.phone}
                                                                onChange={(e) => setPersonalInfo((prev) => ({ ...prev, phone: e.target.value }))}
                                                                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                                                                placeholder="+54 11 1234-5678"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="birthDate" className="text-white font-medium">
                                                            Fecha de Nacimiento
                                                        </Label>
                                                        <div className="relative">
                                                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                                                            <Input
                                                                id="birthDate"
                                                                type="date"
                                                                value={personalInfo.birthDate}
                                                                onChange={(e) =>
                                                                    setPersonalInfo((prev) => ({ ...prev, birthDate: e.target.value }))
                                                                }
                                                                className="pl-10 bg-white/10 border-white/20 text-white"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end">
                                                    <Button
                                                        type="submit"
                                                        disabled={isLoading}
                                                        className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8 py-3 font-semibold rounded-xl"
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
                                        <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                            <CardHeader>
                                                <CardTitle className="text-2xl font-bold text-white flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                                        <Lock className="w-5 h-5 text-white" />
                                                    </div>
                                                    <span>Cambiar Contraseña</span>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <form onSubmit={handleChangePassword} className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="currentPassword" className="text-white font-medium">
                                                            Contraseña Actual
                                                        </Label>
                                                        <div className="relative">
                                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                                                            <Input
                                                                id="currentPassword"
                                                                type={showPassword ? "text" : "password"}
                                                                value={securityInfo.currentPassword}
                                                                onChange={(e) =>
                                                                    setSecurityInfo((prev) => ({ ...prev, currentPassword: e.target.value }))
                                                                }
                                                                className="pl-10 pr-10 bg-white/10 border-white/20 text-white"
                                                                required
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                                                            >
                                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="newPassword" className="text-white font-medium">
                                                            Nueva Contraseña
                                                        </Label>
                                                        <div className="relative">
                                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                                                            <Input
                                                                id="newPassword"
                                                                type={showNewPassword ? "text" : "password"}
                                                                value={securityInfo.newPassword}
                                                                onChange={(e) =>
                                                                    setSecurityInfo((prev) => ({ ...prev, newPassword: e.target.value }))
                                                                }
                                                                className="pl-10 pr-10 bg-white/10 border-white/20 text-white"
                                                                required
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                                                            >
                                                                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="confirmPassword" className="text-white font-medium">
                                                            Confirmar Nueva Contraseña
                                                        </Label>
                                                        <div className="relative">
                                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                                                            <Input
                                                                id="confirmPassword"
                                                                type={showNewPassword ? "text" : "password"}
                                                                value={securityInfo.confirmPassword}
                                                                onChange={(e) =>
                                                                    setSecurityInfo((prev) => ({ ...prev, confirmPassword: e.target.value }))
                                                                }
                                                                className="pl-10 bg-white/10 border-white/20 text-white"
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    <Button
                                                        type="submit"
                                                        disabled={isLoading}
                                                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                                                    >
                                                        Actualizar Contraseña
                                                    </Button>
                                                </form>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                            <CardHeader>
                                                <CardTitle className="text-xl font-bold text-white flex items-center space-x-3">
                                                    <Shield className="w-6 h-6 text-green-400" />
                                                    <span>Autenticación de Dos Factores</span>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-white font-medium">Activar 2FA</p>
                                                        <p className="text-white/60 text-sm">
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
                                    <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                        <CardHeader>
                                            <CardTitle className="text-2xl font-bold text-white flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                                    <Bell className="w-5 h-5 text-white" />
                                                </div>
                                                <span>Preferencias de Notificaciones</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
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
                                                <div key={setting.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                                    <div>
                                                        <p className="text-white font-medium">{setting.title}</p>
                                                        <p className="text-white/60 text-sm">{setting.description}</p>
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
                                    <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                        <CardContent className="p-12 text-center">
                                            <Shield className="w-16 h-16 text-white/40 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-white mb-2">Configuración de Privacidad</h3>
                                            <p className="text-white/60">Esta sección estará disponible próximamente</p>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="payment">
                                    <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                        <CardContent className="p-12 text-center">
                                            <CreditCard className="w-16 h-16 text-white/40 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-white mb-2">Métodos de Pago</h3>
                                            <p className="text-white/60">Esta sección estará disponible próximamente</p>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="sessions">
                                    <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                        <CardContent className="p-12 text-center">
                                            <Monitor className="w-16 h-16 text-white/40 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-white mb-2">Sesiones Activas</h3>
                                            <p className="text-white/60">Esta sección estará disponible próximamente</p>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="help">
                                    <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                        <CardContent className="p-12 text-center">
                                            <HelpCircle className="w-16 h-16 text-white/40 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-white mb-2">Ayuda y Soporte</h3>
                                            <p className="text-white/60 mb-6">¿Necesitas ayuda? Visita nuestro centro de ayuda</p>
                                            <Link href={route('help')}>
                                                <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white">
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