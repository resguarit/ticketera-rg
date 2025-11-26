import { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
    Settings as SettingsIcon,
    Mail,
    Bell,
    Shield,
    Database,
    Globe,
    CreditCard,
    Users,
    Save,
    RefreshCw,
    Key,
    Server,
    Palette,
    Check,
    AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function Settings({ auth, generalSettings: initialGeneral, emailSettings: initialEmail, paymentSettings: initialPayment, securitySettings: initialSecurity, notificationSettings: initialNotification }: any) {
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("general");

    // Estados para configuraciones usando datos del backend
    const [generalSettings, setGeneralSettings] = useState(initialGeneral);
    const [emailSettings, setEmailSettings] = useState(initialEmail);
    const [paymentSettings, setPaymentSettings] = useState(initialPayment);
    const [securitySettings, setSecuritySettings] = useState(initialSecurity);
    const [notificationSettings, setNotificationSettings] = useState(initialNotification);

    const handleSaveSettings = async (settingsType: string) => {
        setIsLoading(true);
        
        const settingsMap: any = {
            'general': generalSettings,
            'email': emailSettings,
            'payment': paymentSettings,
            'security': securitySettings,
            'notification': notificationSettings,
        };

        const settings = settingsType === 'all' 
            ? Object.entries(settingsMap).reduce((acc, [group, data]) => ({ ...acc, [group]: data }), {})
            : { [settingsType]: settingsMap[settingsType] };

        try {
            if (settingsType === 'all') {
                // Guardar todas las configuraciones
                for (const [group, data] of Object.entries(settings)) {
                    await fetch(route('admin.settings.update'), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        },
                        body: JSON.stringify({ group, settings: data }),
                    });
                }
            } else {
                await fetch(route('admin.settings.update'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({ group: settingsType, settings: settingsMap[settingsType] }),
                });
            }

            alert('Configuraciones guardadas correctamente');
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error al guardar las configuraciones');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestEmail = async () => {
        const email = prompt('Ingrese el email donde quiere recibir la prueba:');
        if (!email) return;

        try {
            await fetch(route('admin.settings.test-email'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ email }),
            });

            alert('Email de prueba enviado correctamente');
        } catch (error) {
            console.error('Error:', error);
            alert('Error al enviar el email de prueba');
        }
    };

    const handleBackupDatabase = async () => {
        if (!confirm('¿Está seguro de que desea realizar un backup de la base de datos?')) return;

        try {
            await fetch(route('admin.settings.backup'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            alert('Backup iniciado correctamente');
        } catch (error) {
            console.error('Error:', error);
            alert('Error al iniciar el backup');
        }
    };

    return (
        <>
            <Head title="Configuración" />
            
            <div className="min-h-screen bg-white">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-black mb-2">
                                Configuración del Sistema
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Administra todas las configuraciones de la plataforma
                            </p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <Button 
                                variant="outline" 
                                className="border-gray-300 text-black hover:bg-gray-50"
                                onClick={handleBackupDatabase}
                            >
                                <Database className="w-4 h-4 mr-2" />
                                Backup
                            </Button>
                            
                            <Button 
                                className="bg-primary text-white hover:bg-primary-hover"
                                onClick={() => handleSaveSettings('all')}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Guardando...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <Save className="w-4 h-4" />
                                        <span>Guardar Todo</span>
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="bg-gray-100 border border-gray-300 mb-8">
                            <TabsTrigger value="general" className="data-[state=active]:bg-white data-[state=active]:text-black">
                                General
                            </TabsTrigger>
                            <TabsTrigger value="email" className="data-[state=active]:bg-white data-[state=active]:text-black">
                                Email
                            </TabsTrigger>
                            <TabsTrigger value="payments" className="data-[state=active]:bg-white data-[state=active]:text-black">
                                Pagos
                            </TabsTrigger>
                            <TabsTrigger value="security" className="data-[state=active]:bg-white data-[state=active]:text-black">
                                Seguridad
                            </TabsTrigger>
                            <TabsTrigger value="notifications" className="data-[state=active]:bg-white data-[state=active]:text-black">
                                Notificaciones
                            </TabsTrigger>
                        </TabsList>

                        {/* Configuración General */}
                        <TabsContent value="general">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <Card className="bg-white border-gray-200 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="text-black flex items-center space-x-2">
                                            <Globe className="w-5 h-5" />
                                            <span>Información del Sitio</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="siteName" className="text-black">Nombre del Sitio</Label>
                                            <div className="p-2 text-sm bg-gray-50 border border-gray-300 rounded-md text-black">
                                                {generalSettings.siteName}
                                            </div>
                                            <p className="text-gray-500 text-xs mt-1">
                                                Este valor no puede ser modificado desde la interfaz
                                            </p>
                                        </div>

                                        <div>
                                            <Label htmlFor="siteDescription" className="text-black">Descripción</Label>
                                            <div className="p-2 text-sm bg-gray-50 border border-gray-300 rounded-md text-black min-h-[72px]">
                                                {generalSettings.siteDescription}
                                            </div>
                                            <p className="text-gray-500 text-xs mt-1">
                                                Este valor no puede ser modificado desde la interfaz
                                            </p>
                                        </div>

                                        <div>
                                            <Label htmlFor="contactEmail" className="text-black">Email de Contacto</Label>
                                            <Input
                                                id="contactEmail"
                                                type="email"
                                                value={generalSettings.contactEmail}
                                                onChange={(e) => setGeneralSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                                                className="bg-white border-gray-300 text-black"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="supportEmail" className="text-black">Email de Soporte</Label>
                                            <Input
                                                id="supportEmail"
                                                type="email"
                                                value={generalSettings.supportEmail}
                                                onChange={(e) => setGeneralSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                                                className="bg-white border-gray-300 text-black"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white border-gray-200 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="text-black flex items-center space-x-2">
                                            <SettingsIcon className="w-5 h-5" />
                                            <span>Configuración Regional</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="timezone" className="text-black">Zona Horaria</Label>
                                            <Select value={generalSettings.timezone} onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, timezone: value }))}>
                                                <SelectTrigger className="bg-white border-gray-300 text-black">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="America/Argentina/Buenos_Aires">Buenos Aires (GMT-3)</SelectItem>
                                                    <SelectItem value="America/Montevideo">Montevideo (GMT-3)</SelectItem>
                                                    <SelectItem value="America/Santiago">Santiago (GMT-3)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="currency" className="text-black">Moneda</Label>
                                            <Select value={generalSettings.currency} onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, currency: value }))}>
                                                <SelectTrigger className="bg-white border-gray-300 text-black">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ARS">Peso Argentino (ARS)</SelectItem>
                                                    <SelectItem value="USD">Dólar Estadounidense (USD)</SelectItem>
                                                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="language" className="text-black">Idioma</Label>
                                            <Select value={generalSettings.language} onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, language: value }))}>
                                                <SelectTrigger className="bg-white border-gray-300 text-black">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="es">Español</SelectItem>
                                                    <SelectItem value="en">English</SelectItem>
                                                    <SelectItem value="pt">Português</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <Button 
                                            onClick={() => handleSaveSettings('general')}
                                            className="w-full bg-primary text-white hover:bg-primary-hover"
                                        >
                                            Guardar Configuración General
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Configuración de Email */}
                        <TabsContent value="email">
                            <Card className="bg-white border-gray-200 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-black flex items-center space-x-2">
                                        <Mail className="w-5 h-5" />
                                        <span>Configuración SMTP</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="smtpHost" className="text-black">Servidor SMTP</Label>
                                                <Input
                                                    id="smtpHost"
                                                    value={emailSettings.smtpHost}
                                                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                                                    className="bg-white border-gray-300 text-black"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="smtpPort" className="text-black">Puerto</Label>
                                                <Input
                                                    id="smtpPort"
                                                    value={emailSettings.smtpPort}
                                                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: e.target.value }))}
                                                    className="bg-white border-gray-300 text-black"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="smtpUsername" className="text-black">Usuario</Label>
                                                <Input
                                                    id="smtpUsername"
                                                    value={emailSettings.smtpUsername}
                                                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUsername: e.target.value }))}
                                                    className="bg-white border-gray-300 text-black"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="smtpPassword" className="text-black">Contraseña</Label>
                                                <Input
                                                    id="smtpPassword"
                                                    type="password"
                                                    value={emailSettings.smtpPassword}
                                                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                                                    className="bg-white border-gray-300 text-black"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="smtpEncryption" className="text-black">Encriptación</Label>
                                                <Select value={emailSettings.smtpEncryption} onValueChange={(value) => setEmailSettings(prev => ({ ...prev, smtpEncryption: value }))}>
                                                    <SelectTrigger className="bg-white border-gray-300 text-black">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="tls">TLS</SelectItem>
                                                        <SelectItem value="ssl">SSL</SelectItem>
                                                        <SelectItem value="none">Ninguna</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label htmlFor="fromEmail" className="text-black">Email Remitente</Label>
                                                <Input
                                                    id="fromEmail"
                                                    type="email"
                                                    value={emailSettings.fromEmail}
                                                    onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                                                    className="bg-white border-gray-300 text-black"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="fromName" className="text-black">Nombre Remitente</Label>
                                                <Input
                                                    id="fromName"
                                                    value={emailSettings.fromName}
                                                    onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
                                                    className="bg-white border-gray-300 text-black"
                                                />
                                            </div>

                                            <div className="flex space-x-2">
                                                <Button 
                                                    onClick={handleTestEmail}
                                                    variant="outline"
                                                    className="flex-1 border-gray-300 text-black hover:bg-gray-50"
                                                >
                                                    Enviar Email de Prueba
                                                </Button>
                                                
                                                <Button 
                                                    onClick={() => handleSaveSettings('email')}
                                                    className="flex-1 bg-primary text-white hover:bg-primary-hover"
                                                >
                                                    Guardar
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Configuración de Pagos */}
                        <TabsContent value="payments">
                            <div className="space-y-8">
                                <Card className="bg-white border-gray-200 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="text-black flex items-center space-x-2">
                                            <CreditCard className="w-5 h-5" />
                                            <span>Stripe</span>
                                            <Badge className={`${paymentSettings.stripeEnabled ? 'bg-green-500' : 'bg-red-500'} text-white border-0`}>
                                                {paymentSettings.stripeEnabled ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-black">Habilitar Stripe</Label>
                                            <Switch
                                                checked={paymentSettings.stripeEnabled}
                                                onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, stripeEnabled: checked }))}
                                            />
                                        </div>

                                        {paymentSettings.stripeEnabled && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="stripePublicKey" className="text-black">Clave Pública</Label>
                                                    <Input
                                                        id="stripePublicKey"
                                                        value={paymentSettings.stripePublicKey}
                                                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripePublicKey: e.target.value }))}
                                                        className="bg-white border-gray-300 text-black"
                                                        placeholder="pk_..."
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="stripeSecretKey" className="text-black">Clave Secreta</Label>
                                                    <Input
                                                        id="stripeSecretKey"
                                                        type="password"
                                                        value={paymentSettings.stripeSecretKey}
                                                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripeSecretKey: e.target.value }))}
                                                        className="bg-white border-gray-300 text-black"
                                                        placeholder="sk_..."
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="bg-white border-gray-200 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="text-black flex items-center space-x-2">
                                            <CreditCard className="w-5 h-5" />
                                            <span>MercadoPago</span>
                                            <Badge className={`${paymentSettings.mercadopagoEnabled ? 'bg-green-500' : 'bg-red-500'} text-white border-0`}>
                                                {paymentSettings.mercadopagoEnabled ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-black">Habilitar MercadoPago</Label>
                                            <Switch
                                                checked={paymentSettings.mercadopagoEnabled}
                                                onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, mercadopagoEnabled: checked }))}
                                            />
                                        </div>

                                        {paymentSettings.mercadopagoEnabled && (
                                            <div>
                                                <Label htmlFor="mercadopagoAccessToken" className="text-black">Access Token</Label>
                                                <Input
                                                    id="mercadopagoAccessToken"
                                                    type="password"
                                                    value={paymentSettings.mercadopagoAccessToken}
                                                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, mercadopagoAccessToken: e.target.value }))}
                                                    className="bg-white border-gray-300 text-black"
                                                    placeholder="APP_USR-..."
                                                />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="bg-white border-gray-200 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="text-black">Configuración de Comisiones</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div>
                                            <Label htmlFor="commissionRate" className="text-black">Tasa de Comisión (%)</Label>
                                            <Input
                                                id="commissionRate"
                                                type="number"
                                                step="0.1"
                                                value={paymentSettings.commissionRate}
                                                onChange={(e) => setPaymentSettings(prev => ({ ...prev, commissionRate: e.target.value }))}
                                                className="bg-white border-gray-300 text-black"
                                            />
                                            <p className="text-gray-600 text-sm mt-1">
                                                Comisión que se cobra a los organizadores por cada venta
                                            </p>
                                        </div>

                                        <Button 
                                            onClick={() => handleSaveSettings('payments')}
                                            className="w-full mt-4 bg-primary text-white hover:bg-primary-hover"
                                        >
                                            Guardar Configuración de Pagos
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Configuración de Seguridad */}
                        <TabsContent value="security">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <Card className="bg-white border-gray-200 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="text-black flex items-center space-x-2">
                                            <Shield className="w-5 h-5" />
                                            <span>Autenticación</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-black">2FA Requerido</Label>
                                                <p className="text-gray-600 text-sm">Obligar autenticación de dos factores</p>
                                            </div>
                                            <Switch
                                                checked={securitySettings.twoFactorRequired}
                                                onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorRequired: checked }))}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="passwordMinLength" className="text-black">Longitud Mínima de Contraseña</Label>
                                            <Input
                                                id="passwordMinLength"
                                                type="number"
                                                value={securitySettings.passwordMinLength}
                                                onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
                                                className="bg-white border-gray-300 text-black"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="maxLoginAttempts" className="text-black">Máximos Intentos de Login</Label>
                                            <Input
                                                id="maxLoginAttempts"
                                                type="number"
                                                value={securitySettings.maxLoginAttempts}
                                                onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                                                className="bg-white border-gray-300 text-black"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white border-gray-200 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="text-black flex items-center space-x-2">
                                            <Server className="w-5 h-5" />
                                            <span>Sistema</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="sessionTimeout" className="text-black">Timeout de Sesión (minutos)</Label>
                                            <Input
                                                id="sessionTimeout"
                                                type="number"
                                                value={securitySettings.sessionTimeout}
                                                onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                                                className="bg-white border-gray-300 text-black"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-black">Lista Blanca de IPs</Label>
                                                <p className="text-gray-600 text-sm">Restringir acceso admin por IP</p>
                                            </div>
                                            <Switch
                                                checked={securitySettings.ipWhitelistEnabled}
                                                onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, ipWhitelistEnabled: checked }))}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-black flex items-center space-x-2">
                                                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                                                    <span>Modo Mantenimiento</span>
                                                </Label>
                                                <p className="text-gray-600 text-sm">Desactivar el sitio temporalmente</p>
                                            </div>
                                            <Switch
                                                checked={securitySettings.maintenanceMode}
                                                onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, maintenanceMode: checked }))}
                                            />
                                        </div>

                                        <Button 
                                            onClick={() => handleSaveSettings('security')}
                                            className="w-full bg-primary text-white hover:bg-primary-hover"
                                        >
                                            Guardar Configuración de Seguridad
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Configuración de Notificaciones */}
                        <TabsContent value="notifications">
                            <Card className="bg-white border-gray-200 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-black flex items-center space-x-2">
                                        <Bell className="w-5 h-5" />
                                        <span>Notificaciones del Sistema</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {[
                                            {
                                                key: "emailNotifications",
                                                title: "Notificaciones por Email",
                                                description: "Enviar notificaciones generales por email"
                                            },
                                            {
                                                key: "smsNotifications",
                                                title: "Notificaciones por SMS",
                                                description: "Enviar notificaciones importantes por SMS"
                                            },
                                            {
                                                key: "pushNotifications",
                                                title: "Notificaciones Push",
                                                description: "Notificaciones en tiempo real"
                                            },
                                            {
                                                key: "newUserNotification",
                                                title: "Nuevos Usuarios",
                                                description: "Notificar cuando se registra un nuevo usuario"
                                            },
                                            {
                                                key: "newEventNotification",
                                                title: "Nuevos Eventos",
                                                description: "Notificar cuando se crea un nuevo evento"
                                            },
                                            {
                                                key: "paymentNotification",
                                                title: "Pagos",
                                                description: "Notificar sobre pagos y transacciones"
                                            },
                                            {
                                                key: "securityAlerts",
                                                title: "Alertas de Seguridad",
                                                description: "Notificar sobre actividad sospechosa"
                                            }
                                        ].map((setting) => (
                                            <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div>
                                                    <Label className="text-black font-medium">{setting.title}</Label>
                                                    <p className="text-gray-600 text-sm">{setting.description}</p>
                                                </div>
                                                <Switch
                                                    checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                                                    onCheckedChange={(checked) =>
                                                        setNotificationSettings(prev => ({ ...prev, [setting.key]: checked }))
                                                    }
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <Button 
                                        onClick={() => handleSaveSettings('notifications')}
                                        className="w-full mt-6 bg-primary text-white hover:bg-primary-hover"
                                    >
                                        Guardar Configuración de Notificaciones
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
}

// Asignamos el Layout de Administrador
Settings.layout = (page: any) => <AppLayout children={page} />;