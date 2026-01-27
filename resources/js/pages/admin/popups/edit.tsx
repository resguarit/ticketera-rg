import { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/layouts/app-layout'; // AGREGAR ESTE IMPORT
import { toast } from 'sonner';

interface WelcomePopup {
    id: number;
    image_url: string;
    mobile_image_url?: string;
    full_image_url: string;
    full_mobile_image_url?: string;
    is_active: boolean;
}

interface EditProps {
    popup: WelcomePopup;
}

export default function EditWelcomePopup({ popup }: EditProps) {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>(popup.full_image_url);
    const [mobileImageFile, setMobileImageFile] = useState<File | null>(null);
    const [mobileImagePreview, setMobileImagePreview] = useState<string | null>(
        popup.full_mobile_image_url || null
    );
    const [isActive, setIsActive] = useState(popup.is_active);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isMobile: boolean = false) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5120 * 1024) {
                toast.error('La imagen no debe superar los 5MB');
                return;
            }

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
            // No permitir eliminar la imagen principal en edición
            toast.error('Debes mantener al menos una imagen principal');
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);

        const formData = new FormData();
        
        if (imageFile) {
            formData.append('image_url', imageFile);
        }
        
        if (mobileImageFile) {
            formData.append('mobile_image_url', mobileImageFile);
        }
        
        formData.append('is_active', isActive ? '1' : '0');
        formData.append('_method', 'PUT');

        router.post(route('admin.popups.update', popup.id), formData, {
            onSuccess: () => {
                toast.success('Popup actualizado exitosamente');
            },
            onError: (errors) => {
                console.error(errors);
                toast.error('Error al actualizar el popup');
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Editar Popup de Bienvenida" />

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
                            Editar Popup de Bienvenida
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Actualiza la imagen del popup
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Desktop Image */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Imagen Desktop</CardTitle>
                            <CardDescription>
                                Imagen actual o sube una nueva
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-auto rounded-lg border"
                                />
                                <label
                                    htmlFor="image-upload"
                                    className="absolute bottom-4 right-4"
                                >
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => document.getElementById('image-upload')?.click()}
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Cambiar Imagen
                                    </Button>
                                    <input
                                        id="image-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                        onChange={(e) => handleImageChange(e, false)}
                                    />
                                </label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Mobile Image */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Imagen Mobile (Opcional)</CardTitle>
                            <CardDescription>
                                Imagen optimizada para dispositivos móviles
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
                                                <span className="font-semibold">Click para subir</span>
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
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}