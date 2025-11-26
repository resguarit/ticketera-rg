import { useState } from 'react';
import axios from 'axios';
import { 
    Settings as SettingsIcon,
    Globe,
    Database,
    Check,
    Edit,
    X,
    Phone,
    Clock,
    Mail,
    Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function Settings({ auth, generalSettings: initialGeneral }: any) {
    const [isLoading, setIsLoading] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [generalSettings, setGeneralSettings] = useState(initialGeneral);
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
                setGeneralSettings(prev => ({ ...prev, [fieldKey]: tempValue }));
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

    const renderReadOnlyField = (
        label: string,
        value: any,
        type: 'text' | 'textarea' = 'text',
        icon?: React.ReactNode
    ) => {
        return (
            <div>
                <Label className="text-black flex items-center gap-2">
                    {icon}
                    {label}
                </Label>
                <div className="mt-2">
                    {type === 'textarea' ? (
                        <Textarea
                            value={value}
                            className="bg-gray-100 border-gray-300 text-gray-700 cursor-not-allowed"
                            disabled
                            readOnly
                            rows={3}
                        />
                    ) : (
                        <Input
                            type="text"
                            value={value}
                            className="bg-gray-100 border-gray-300 text-gray-700 cursor-not-allowed"
                            disabled
                            readOnly
                        />
                    )}
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Este campo no puede ser modificado desde la interfaz
                </p>
            </div>
        );
    };

    const renderEditableField = (
        group: string,
        fieldKey: string,
        label: string,
        value: any,
        type: 'text' | 'email' | 'textarea' = 'text',
        icon?: React.ReactNode
    ) => {
        const isEditing = editingField === `${group}.${fieldKey}`;
        const fieldId = `${group}.${fieldKey}`;

        return (
            <div>
                <Label htmlFor={fieldId} className="text-black flex items-center gap-2">
                    {icon}
                    {label}
                </Label>
                <div className="flex items-center space-x-2 mt-2">
                    {isEditing ? (
                        <>
                            {type === 'textarea' ? (
                                <Textarea
                                    id={fieldId}
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    className="bg-white border-gray-300 text-black flex-1"
                                    rows={3}
                                />
                            ) : (
                                <Input
                                    id={fieldId}
                                    type={type}
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
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
                            {type === 'textarea' ? (
                                <Textarea
                                    id={fieldId}
                                    value={value}
                                    className="bg-gray-50 border-gray-300 text-black flex-1"
                                    disabled
                                    readOnly
                                    rows={3}
                                />
                            ) : (
                                <Input
                                    id={fieldId}
                                    type={type}
                                    value={value}
                                    className="bg-gray-50 border-gray-300 text-black flex-1"
                                    disabled
                                    readOnly
                                />
                            )}
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
                                Administra la información general de la plataforma
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

                    {/* Configuración General */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="bg-white border-gray-200 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-black flex items-center space-x-2">
                                    <Globe className="w-5 h-5" />
                                    <span>Información del Sitio</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {renderReadOnlyField(
                                    'Nombre del Sitio', 
                                    generalSettings.siteName, 
                                    'text',
                                    <SettingsIcon className="w-4 h-4 text-gray-600" />
                                )}

                                {renderReadOnlyField(
                                    'Descripción del Sitio', 
                                    generalSettings.siteDescription, 
                                    'textarea',
                                    <Globe className="w-4 h-4 text-gray-600" />
                                )}
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-gray-200 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-black flex items-center space-x-2">
                                    <Mail className="w-5 h-5" />
                                    <span>Información de Contacto</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {renderEditableField(
                                    'general', 
                                    'supportEmail', 
                                    'Email de Soporte', 
                                    generalSettings.supportEmail, 
                                    'email',
                                    <Mail className="w-4 h-4 text-gray-600" />
                                )}

                                {renderEditableField(
                                    'general', 
                                    'supportPhone', 
                                    'Teléfono de Soporte', 
                                    generalSettings.supportPhone, 
                                    'text',
                                    <Phone className="w-4 h-4 text-gray-600" />
                                )}
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-gray-200 shadow-lg lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-black flex items-center space-x-2">
                                    <Clock className="w-5 h-5" />
                                    <span>Horarios de Atención</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {renderEditableField(
                                    'general', 
                                    'businessDays', 
                                    'Días de Atención', 
                                    generalSettings.businessDays, 
                                    'text',
                                    <Clock className="w-4 h-4 text-gray-600" />
                                )}

                                {renderEditableField(
                                    'general', 
                                    'businessHours', 
                                    'Horarios de Atención', 
                                    generalSettings.businessHours, 
                                    'text',
                                    <Clock className="w-4 h-4 text-gray-600" />
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

Settings.layout = (page: any) => <AppLayout children={page} />;