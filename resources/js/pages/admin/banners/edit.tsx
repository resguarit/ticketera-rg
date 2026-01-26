import { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface Banner {
    id: number;
    image_url: string;
    mobile_image_url?: string;
    title: string | null;
    is_archived: boolean;
    display_order: number;
    duration_seconds: number;
}

interface Props {
    banner: Banner;
}

export default function Edit({ banner }: Props) {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>(banner.image_url);
    const [mobileImageFile, setMobileImageFile] = useState<File | null>(null);
    const [mobileImagePreview, setMobileImagePreview] = useState<string | null>(banner.mobile_image_url || null);
    const [title, setTitle] = useState(banner.title || '');
    const [displayOrder, setDisplayOrder] = useState(banner.display_order);
    const [durationSeconds, setDurationSeconds] = useState(banner.duration_seconds);
    const [isArchived, setIsArchived] = useState(banner.is_archived);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isMobile: boolean = false) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10240 * 1024) {
                toast.error('La imagen no debe superar los 10MB');
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
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();

        if (imageFile) {
            formData.append('image', imageFile);
        }

        if (mobileImageFile) {
            formData.append('mobile_image', mobileImageFile);
        }

        formData.append('title', title);
        formData.append('display_order', displayOrder.toString());
        formData.append('duration_seconds', durationSeconds.toString());
        formData.append('is_archived', isArchived ? '1' : '0');
        formData.append('_method', 'PUT');

        router.post(route('admin.banners.update', banner.id), formData, {
            onSuccess: () => {
                toast.success('Banner actualizado exitosamente');
            },
            onError: (errors) => {
                console.error(errors);
                toast.error('Error al actualizar el banner');
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <>
            <Head title="Editar Banner" />

            <div className="space-y-6 max-w-4xl p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.get(route('admin.banners.index'))}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Editar Banner
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Actualiza la información del banner
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
                                <label htmlFor="image-upload" className="absolute bottom-4 right-4">
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
                                        accept="image/*"
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
                                                PNG, JPG, GIF o WEBP (MAX. 10MB)
                                            </p>
                                        </div>
                                        <input
                                            id="mobile-image-upload"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
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
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="title">Título (Opcional)</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ej: Promo Verano"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="display_order">Orden de Visualización</Label>
                                <Input
                                    id="display_order"
                                    type="number"
                                    min="0"
                                    value={displayOrder}
                                    onChange={(e) => setDisplayOrder(parseInt(e.target.value))}
                                    className="mt-1"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Menor número = mayor prioridad
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="duration_seconds">Duración en Carrusel (segundos)</Label>
                                <Input
                                    id="duration_seconds"
                                    type="number"
                                    min="1"
                                    max="60"
                                    value={durationSeconds}
                                    onChange={(e) => setDurationSeconds(parseInt(e.target.value))}
                                    className="mt-1"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Entre 1 y 60 segundos
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is-archived">Estado</Label>
                                    <p className="text-sm text-muted-foreground">
                                        El banner se mostrará solo si está activo
                                    </p>
                                </div>
                                <Switch
                                    id="is-archived"
                                    checked={!isArchived}
                                    onCheckedChange={(checked) => setIsArchived(!checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.get(route('admin.banners.index'))}
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
        </>
    );
}

Edit.layout = (page: any) => <AppLayout children={page} />;