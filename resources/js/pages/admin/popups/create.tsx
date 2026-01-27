import { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Upload, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/layouts/app-layout'; // AGREGAR ESTE IMPORT
import { toast } from 'sonner';

export default function CreateWelcomePopup() {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [mobileImageFile, setMobileImageFile] = useState<File | null>(null);
    const [mobileImagePreview, setMobileImagePreview] = useState<string | null>(null);
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isMobile: boolean = false) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validar tamaño (max 5MB)
            if (file.size > 5120 * 1024) {
                toast.error('La imagen no debe superar los 5MB');
                return;
            }

            // Validar tipo
            if (!file.type.match(/image\/(jpeg|png|jpg|gif|webp)/)) {
                toast.error('Solo se permiten archivos JPG, PNG, GIF o WEBP');
                return;
            }

            if (isMobile) {
                setMobileImageFile(file);
                setMobileImagePreview(URL.createObjectURL(file));
            } else {
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
            }
        }
    };

    const handleRemoveImage = (isMobile: boolean = false) => {
        if (isMobile) {
            setMobileImageFile(null);
            setMobileImagePreview(null);
        } else {
            setImageFile(null);
            setImagePreview(null);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!imageFile) {
            toast.error('Debes seleccionar una imagen para el popup');
            return;
        }

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('image_url', imageFile);
        if (mobileImageFile) {
            formData.append('mobile_image_url', mobileImageFile);
        }
        formData.append('is_active', isActive ? '1' : '0');

        router.post(route('admin.popups.store'), formData, {
            onSuccess: () => {
                toast.success('Popup creado exitosamente');
            },
            onError: (errors) => {
                console.error(errors);
                toast.error('Error al crear el popup');
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Crear Popup de Bienvenida" />

            <div className="space-y-6 max-w-4xl p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.get(route('admin.popups.index'))}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Crear Popup de Bienvenida
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Sube una imagen que se mostrará al ingresar al sitio
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Desktop Image */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Imagen Desktop</CardTitle>
                            <CardDescription>
                                Imagen que se mostrará en dispositivos de escritorio (Requerida)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!imagePreview ? (
                                <div className="flex items-center justify-center w-full">
                                    <label
                                        htmlFor="image-upload"
                                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors bg-gray-50 hover:bg-gray-100"
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-12 h-12 text-gray-400 mb-4" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">Click para subir</span> o
                                                arrastra y suelta
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                PNG, JPG, GIF o WEBP (MAX. 5MB)
                                            </p>
                                        </div>
                                        <input
                                            id="image-upload"
                                            type="file"
                                            className="hidden"
                                            accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                            onChange={(e) => handleImageChange(e, false)}
                                        />
                                    </label>
                                </div>
                            ) : (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-auto rounded-lg border"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="absolute top-2 right-2"
                                        onClick={() => handleRemoveImage(false)}
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Eliminar
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Mobile Image */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Imagen Mobile (Opcional)</CardTitle>
                            <CardDescription>
                                Imagen optimizada para dispositivos móviles. Si no se proporciona, se usará
                                la imagen desktop.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!mobileImagePreview ? (
                                <div className="flex items-center justify-center w-full">
                                    <label
                                        htmlFor="mobile-image-upload"
                                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors bg-gray-50 hover:bg-gray-100"
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-12 h-12 text-gray-400 mb-4" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">Click para subir</span> o
                                                arrastra y suelta
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                PNG, JPG, GIF o WEBP (MAX. 5MB)
                                            </p>
                                        </div>
                                        <input
                                            id="mobile-image-upload"
                                            type="file"
                                            className="hidden"
                                            accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                            onChange={(e) => handleImageChange(e, true)}
                                        />
                                    </label>
                                </div>
                            ) : (
                                <div className="relative max-w-sm mx-auto">
                                    <img
                                        src={mobileImagePreview}
                                        alt="Mobile Preview"
                                        className="w-full h-auto rounded-lg border"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="absolute top-2 right-2"
                                        onClick={() => handleRemoveImage(true)}
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Eliminar
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuración</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is-active">Estado</Label>
                                    <p className="text-sm text-muted-foreground">
                                        El popup se mostrará solo si está activo
                                    </p>
                                </div>
                                <Switch
                                    id="is-active"
                                    checked={isActive}
                                    onCheckedChange={setIsActive}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.get(route('admin.popups.index'))}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting || !imageFile}>
                            {isSubmitting ? 'Creando...' : 'Crear Popup'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}