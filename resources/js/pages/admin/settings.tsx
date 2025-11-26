import { useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
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
    AlertTriangle,
    Edit,
    X
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
    const [editingField, setEditingField] = useState<string | null>(null);

    // Estados para configuraciones usando datos del backend
    const [generalSettings, setGeneralSettings] = useState(initialGeneral);
    const [emailSettings, setEmailSettings] = useState(initialEmail);
    const [paymentSettings, setPaymentSettings] = useState(initialPayment);
    const [securitySettings, setSecuritySettings] = useState(initialSecurity);
    const [notificationSettings, setNotificationSettings] = useState(initialNotification);

    // Estados temporales para edición
    const [tempValue, setTempValue] = useState<any>(null);

    const handleStartEdit = (fieldKey: string, currentValue: any) => {
        setEditingField(fieldKey);
        setTempValue(currentValue);
    };

    const handleCancelEdit = () => {
        setEditingField(null);
        setTempValue(null);
    };

    const handleSaveField = async (group: string, fieldKey: string) => {
        setIsLoading(true);

        try {
            const { data } = await axios.post(route('admin.settings.update'), {
                group,
                settings: { [fieldKey]: tempValue }
            });

            if (data.success) {
                switch(group) {
                    case 'general':
                        setGeneralSettings(prev => ({ ...prev, [fieldKey]: tempValue }));
                        break;
                    case 'email':
                        setEmailSettings(prev => ({ ...prev, [fieldKey]: tempValue }));
                        break;
                    case 'payment':
                        setPaymentSettings(prev => ({ ...prev, [fieldKey]: tempValue }));
                        break;
                    case 'security':
                        setSecuritySettings(prev => ({ ...prev, [fieldKey]: tempValue }));
                        break;
                    case 'notification':
                        setNotificationSettings(prev => ({ ...prev, [fieldKey]: tempValue }));
                        break;
                }

                setEditingField(null);
                setTempValue(null);
                alert('Campo actualizado correctamente');
            } else {
                alert('Error al guardar: ' + data.message);
            }
        } catch (error: any) {
            console.error('Error al guardar:', error);
            alert('Error al guardar el campo: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestEmail = async () => {
        const email = prompt('Ingrese el email donde quiere recibir la prueba:');
        if (!email) return;

        try {
            const { data } = await axios.post(route('admin.settings.test-email'), { email });
            alert(data.message || 'Email de prueba enviado correctamente');
        } catch (error: any) {
            console.error('Error:', error);
            alert('Error al enviar el email de prueba: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleBackupDatabase = async () => {
        if (!confirm('¿Está seguro de que desea realizar un backup de la base de datos?')) return;

        try {
            const { data } = await axios.post(route('admin.settings.backup'));
            alert(data.message || 'Backup iniciado correctamente');
        } catch (error: any) {
            console.error('Error:', error);
            alert('Error al iniciar el backup: ' + (error.response?.data?.message || error.message));
        }
    };

    const renderEditableField = (
        group: string,
        fieldKey: string,
        label: string,
        value: any,
        type: 'text' | 'email' | 'number' | 'password' | 'select' = 'text',
        selectOptions?: { value: string, label: string }[]
    ) => {
        const isEditing = editingField === `${group}.${fieldKey}`;
        const fieldId = `${group}.${fieldKey}`;

        return (
            <div>
                <Label htmlFor={fieldId} className="text-black">{label}</Label>
                <div className="flex items-center space-x-2">
                    {isEditing ? (
                        <>
                            {type === 'select' && selectOptions ? (
                                <Select value={tempValue} onValueChange={setTempValue}>
                                    <SelectTrigger className="bg-white border-gray-300 text-black flex-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectOptions.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    id={fieldId}
                                    type={type}
                                    value={tempValue}
                                    onChange={(e) => setTempValue(type === 'number' ? parseInt(e.target.value) : e.target.value)}
                                    className="bg-white border-gray-300 text-black flex-1"
                                />
                            )}
                            <Button
                                size="sm"
                                onClick={() => handleSaveField(group, fieldKey)}
                                disabled={isLoading}
                                className="bg-green-500 hover:bg-green-600 text-white"
                            >
                                <Check className="w-4 h-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                disabled={isLoading}
                                className="border-gray-300"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Input
                                id={fieldId}
                                type={type === 'password' ? 'password' : 'text'}
                                value={value}
                                className="bg-gray-50 border-gray-300 text-black flex-1"
                                disabled
                                readOnly
                            />
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStartEdit(fieldId, value)}
                                className="border-gray-300"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                        </>
                    )}
                </div>
            </div>
        );
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

                                        {renderEditableField('general', 'supportEmail', 'Email de Soporte', generalSettings.supportEmail, 'email')}
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
                                        {renderEditableField('general', 'timezone', 'Zona Horaria', generalSettings.timezone, 'select', [
                                            { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (GMT-3)' },
                                            { value: 'America/Montevideo', label: 'Montevideo (GMT-3)' },
                                            { value: 'America/Santiago', label: 'Santiago (GMT-3)' },
                                        ])}

                                        {renderEditableField('general', 'currency', 'Moneda', generalSettings.currency, 'select', [
                                            { value: 'ARS', label: 'Peso Argentino (ARS)' },
                                            { value: 'USD', label: 'Dólar Estadounidense (USD)' },
                                            { value: 'EUR', label: 'Euro (EUR)' },
                                        ])}

                                        {renderEditableField('general', 'language', 'Idioma', generalSettings.language, 'select', [
                                            { value: 'es', label: 'Español' },
                                            { value: 'en', label: 'English' },
                                            { value: 'pt', label: 'Português' },
                                        ])}
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
                                            {renderEditableField('email', 'smtpHost', 'Servidor SMTP', emailSettings.smtpHost)}
                                            {renderEditableField('email', 'smtpPort', 'Puerto', emailSettings.smtpPort, 'number')}
                                            {renderEditableField('email', 'smtpUsername', 'Usuario', emailSettings.smtpUsername)}
                                            {renderEditableField('email', 'smtpPassword', 'Contraseña', emailSettings.smtpPassword, 'password')}
                                        </div>

                                        <div className="space-y-4">
                                            {renderEditableField('email', 'smtpEncryption', 'Encriptación', emailSettings.smtpEncryption, 'select', [
                                                { value: 'tls', label: 'TLS' },
                                                { value: 'ssl', label: 'SSL' },
                                                { value: 'none', label: 'Ninguna' },
                                            ])}

                                            {renderEditableField('email', 'fromEmail', 'Email Remitente', emailSettings.fromEmail, 'email')}
                                            {renderEditableField('email', 'fromName', 'Nombre Remitente', emailSettings.fromName)}

                                            <Button 
                                                onClick={handleTestEmail}
                                                variant="outline"
                                                className="w-full border-gray-300 text-black hover:bg-gray-50"
                                            >
                                                Enviar Email de Prueba
                                            </Button>
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
                                                onCheckedChange={async (checked) => {
                                                    setTempValue(checked);
                                                    await handleSaveField('payment', 'stripeEnabled');
                                                    setPaymentSettings(prev => ({ ...prev, stripeEnabled: checked }));
                                                }}
                                            />
                                        </div>

                                        {paymentSettings.stripeEnabled && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {renderEditableField('payment', 'stripePublicKey', 'Clave Pública', paymentSettings.stripePublicKey)}
                                                {renderEditableField('payment', 'stripeSecretKey', 'Clave Secreta', paymentSettings.stripeSecretKey, 'password')}
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
                                                onCheckedChange={async (checked) => {
                                                    setTempValue(checked);
                                                    await handleSaveField('payment', 'mercadopagoEnabled');
                                                    setPaymentSettings(prev => ({ ...prev, mercadopagoEnabled: checked }));
                                                }}
                                            />
                                        </div>

                                        {paymentSettings.mercadopagoEnabled && (
                                            renderEditableField('payment', 'mercadopagoAccessToken', 'Access Token', paymentSettings.mercadopagoAccessToken, 'password')
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="bg-white border-gray-200 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="text-black">Configuración de Comisiones</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {renderEditableField('payment', 'commissionRate', 'Tasa de Comisión (%)', paymentSettings.commissionRate, 'number')}
                                        <p className="text-gray-600 text-sm mt-1">
                                            Comisión que se cobra a los organizadores por cada venta
                                        </p>
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
                                                onCheckedChange={async (checked) => {
                                                    setTempValue(checked);
                                                    await handleSaveField('security', 'twoFactorRequired');
                                                    setSecuritySettings(prev => ({ ...prev, twoFactorRequired: checked }));
                                                }}
                                            />
                                        </div>

                                        {renderEditableField('security', 'passwordMinLength', 'Longitud Mínima de Contraseña', securitySettings.passwordMinLength, 'number')}
                                        {renderEditableField('security', 'maxLoginAttempts', 'Máximos Intentos de Login', securitySettings.maxLoginAttempts, 'number')}
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
                                        {renderEditableField('security', 'sessionTimeout', 'Timeout de Sesión (minutos)', securitySettings.sessionTimeout, 'number')}

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-black">Lista Blanca de IPs</Label>
                                                <p className="text-gray-600 text-sm">Restringir acceso admin por IP</p>
                                            </div>
                                            <Switch
                                                checked={securitySettings.ipWhitelistEnabled}
                                                onCheckedChange={async (checked) => {
                                                    setTempValue(checked);
                                                    await handleSaveField('security', 'ipWhitelistEnabled');
                                                    setSecuritySettings(prev => ({ ...prev, ipWhitelistEnabled: checked }));
                                                }}
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
                                                onCheckedChange={async (checked) => {
                                                    setTempValue(checked);
                                                    await handleSaveField('security', 'maintenanceMode');
                                                    setSecuritySettings(prev => ({ ...prev, maintenanceMode: checked }));
                                                }}
                                            />
                                        </div>
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
                                                    onCheckedChange={async (checked) => {
                                                        setTempValue(checked);
                                                        await handleSaveField('notification', setting.key);
                                                        setNotificationSettings(prev => ({ ...prev, [setting.key]: checked }));
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
}

Settings.layout = (page: any) => <AppLayout children={page} />;