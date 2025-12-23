import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Archive, Upload, Trash2, Image as ImageIcon, CheckCircle, XCircle, Home } from 'lucide-react';
import { toast } from 'sonner';

interface Banner {
    id: number;
    image_url: string;
    mobile_image_url?: string;
    title: string | null;
    is_archived: boolean;
}

interface Props {
    banners: Banner[];
}

export default function Index({ banners }: Props) {
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);

    // Form for upload
    const { data, setData, post, processing, errors, reset } = useForm({
        image: null as File | null,
        mobile_image: null as File | null,
        title: '',
    });

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.banners.store'), {
            onSuccess: () => {
                setIsUploadOpen(false);
                reset();
                toast.success('Banner subido correctamente');
            },
            onError: () => {
                toast.error('Error al subir el banner');
            }
        });
    };

    const handleArchiveToggle = (banner: Banner) => {
        router.put(route('admin.banners.update', banner.id), {
            is_archived: !banner.is_archived
        }, {
            onSuccess: () => toast.success('Estado del banner actualizado')
        });
    };

    const confirmDelete = () => {
        if (!bannerToDelete) return;

        router.delete(route('admin.banners.destroy', bannerToDelete.id), {
            onSuccess: () => {
                toast.success('Banner eliminado');
                setBannerToDelete(null);
            },
            onFinish: () => setBannerToDelete(null)
        });
    };

    const activeCount = banners.filter(b => !b.is_archived).length;

    const stats = [
        {
            title: "Total Banners",
            value: banners.length,
            icon: ImageIcon,
            variant: "primary" as const
        },
        {
            title: "Activos en Carrusel",
            value: activeCount,
            icon: CheckCircle,
            variant: "success" as const
        },
        {
            title: "Archivados",
            value: banners.length - activeCount,
            icon: Archive,
            variant: "warning" as const
        }
    ];

    return (
        <>
            <Head title="Gestión de Banners" />

            <AdminDashboardLayout
                title="Gestión de Banners"
                description="Sube y administra los banners que aparecen en el carrusel principal"
                stats={stats}
                filterConfig={{
                    searchPlaceholder: "Buscar por título...",
                    customFilters: []
                }}
                primaryAction={{
                    label: "Subir Banner",
                    onClick: () => setIsUploadOpen(true),
                    icon: Upload
                }}
                secondaryActions={[
                    {
                        label: "Ver en Inicio",
                        onClick: () => window.open('/', '_blank'),
                        icon: Home,
                        variant: "outline"
                    }
                ]}
                searchTerm=""
                onSearchChange={() => { }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {banners.map((banner) => (
                        <Card key={banner.id} className="overflow-hidden group relative">
                            <div className="flex flex-col">
                                {/* Desktop Image */}
                                <div className="aspect-video relative w-full">
                                    <img
                                        src={banner.image_url}
                                        alt={banner.title || 'Banner Desktop'}
                                        className={`w-full h-full object-cover transition-all ${banner.is_archived ? 'grayscale opacity-75' : ''}`}
                                    />
                                    <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded">
                                        Desktop
                                    </div>
                                    {banner.is_archived && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <Badge variant="secondary" className="text-lg">Archivado</Badge>
                                        </div>
                                    )}
                                </div>

                                {/* Mobile Image (if exists) */}
                                {banner.mobile_image_url && (
                                    <div className="relative w-full h-32 border-t">
                                        <img
                                            src={banner.mobile_image_url}
                                            alt={banner.title || 'Banner Mobile'}
                                            className={`w-full h-full object-cover transition-all ${banner.is_archived ? 'grayscale opacity-75' : ''}`}
                                        />
                                        <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded">
                                            Mobile
                                        </div>
                                    </div>
                                )}
                            </div>
                            <CardContent className="p-4 flex justify-between items-center bg-white">
                                <div className="truncate flex-1 font-medium text-sm">
                                    {banner.title || <span className="text-gray-400 italic">Sin título</span>}
                                </div>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleArchiveToggle(banner)}
                                        title={banner.is_archived ? "Desarchivar" : "Archivar"}
                                    >
                                        {banner.is_archived ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Archive className="w-5 h-5 text-orange-500" />}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setBannerToDelete(banner)}
                                        title="Eliminar"
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {banners.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No hay banners subidos.
                    </div>
                )}
            </AdminDashboardLayout>

            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Subir Nuevo Banner</DialogTitle>
                        <DialogDescription>
                            Sube una imagen para mostrar en el carrusel del inicio. Se recomienda formato apaisado.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="image">Imagen Desktop</Label>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('image', e.target.files ? e.target.files[0] : null)}
                                    className="mt-1 cursor-pointer"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Resolución recomendada: 1920x500 px (Horizontal)</p>
                                {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                            </div>

                            <div>
                                <Label htmlFor="mobile_image">Imagen Móvil</Label>
                                <Input
                                    id="mobile_image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('mobile_image', e.target.files ? e.target.files[0] : null)}
                                    className="mt-1 cursor-pointer"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Resolución recomendada: 1200x500 px (Horizontal/Adaptable)</p>
                                {/* @ts-ignore */}
                                {errors.mobile_image && <p className="text-red-500 text-sm mt-1">{errors.mobile_image}</p>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="title">Título (Opcional)</Label>
                            <Input
                                id="title"
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Ej: Promo Verano"
                                className="mt-1"
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Subiendo...' : 'Subir Banner'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!bannerToDelete} onOpenChange={(open) => !open && setBannerToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el banner.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

Index.layout = (page: any) => <AppLayout children={page} />;
