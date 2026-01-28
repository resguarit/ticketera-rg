import { useState, useEffect } from 'react';
import { Head, router, useForm, Link } from '@inertiajs/react';
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
import { Archive, Upload, Trash2, Image as ImageIcon, CheckCircle, XCircle, Home, Edit, GripVertical, Clock } from 'lucide-react';
import { toast } from 'sonner';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
    banners: Banner[];
}

function SortableBannerCard({ banner, onEdit, onArchive, onDelete }: {
    banner: Banner;
    onEdit: (banner: Banner) => void;
    onArchive: (banner: Banner) => void;
    onDelete: (banner: Banner) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: banner.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={`overflow-hidden group relative ${isDragging ? 'shadow-2xl' : ''}`}
        >
            <div className="flex flex-col">
                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-sm rounded p-1.5 cursor-grab active:cursor-grabbing hover:bg-white"
                >
                    <GripVertical className="w-5 h-5 text-gray-600" />
                </div>

                {/* Order Badge */}
                <div className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                    #{banner.display_order}
                </div>

                {/* Desktop Image */}
                <div className="aspect-video relative w-full">
                    <img
                        src={banner.image_url}
                        alt={banner.title || 'Banner Desktop'}
                        className={`w-full h-full object-cover transition-all ${banner.is_archived ? 'grayscale opacity-75' : ''}`}
                    />
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded">
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
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded">
                            Mobile
                        </div>
                    </div>
                )}
            </div>
            <CardContent className="p-4 space-y-2 bg-white">
                <div className="flex justify-between items-start">
                    <div className="truncate flex-1 font-medium text-sm">
                        {banner.title || <span className="text-gray-400 italic">Sin título</span>}
                    </div>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{banner.duration_seconds}s en carrusel</span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2 border-t">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(banner)}
                        className="flex-1"
                    >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onArchive(banner)}
                        title={banner.is_archived ? "Desarchivar" : "Archivar"}
                    >
                        {banner.is_archived ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Archive className="w-5 h-5 text-orange-500" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(banner)}
                        title="Eliminar"
                        className="text-red-500 hover:text-red-700"
                    >
                        <Trash2 className="w-5 h-5" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function Index({ banners: initialBanners }: Props) {
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
    const [banners, setBanners] = useState(initialBanners);

    useEffect(() => {
        setBanners(initialBanners);
    }, [initialBanners]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Form for upload
    const { data, setData, post, processing, errors, reset } = useForm({
        image: null as File | null,
        mobile_image: null as File | null,
        title: '',
        duration_seconds: 5,
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

    const handleEdit = (banner: Banner) => {
        router.get(route('admin.banners.edit', banner.id));
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

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = banners.findIndex((b) => b.id === active.id);
            const newIndex = banners.findIndex((b) => b.id === over.id);

            const newBanners = arrayMove(banners, oldIndex, newIndex);

            // Actualizar orden local inmediatamente
            const updatedBanners = newBanners.map((banner, index) => ({
                ...banner,
                display_order: index + 1,
            }));

            setBanners(updatedBanners);

            // Enviar al servidor
            router.post(route('admin.banners.update-order'), {
                banners: updatedBanners.map((b) => ({
                    id: b.id,
                    display_order: b.display_order,
                })),
            }, {
                preserveScroll: true,
                onSuccess: () => toast.success('Orden actualizado'),
                onError: () => {
                    toast.error('Error al actualizar el orden');
                    setBanners(initialBanners); // Revertir en caso de error
                },
            });
        }
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
                description="Sube y administra los banners que aparecen en el carrusel principal. Arrastra para reordenar."
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
                {banners.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No hay banners subidos.
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={banners.map(b => b.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {banners.map((banner) => (
                                    <SortableBannerCard
                                        key={banner.id}
                                        banner={banner}
                                        onEdit={handleEdit}
                                        onArchive={handleArchiveToggle}
                                        onDelete={setBannerToDelete}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </AdminDashboardLayout>

            {/* Dialog de Upload */}
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Subir Nuevo Banner</DialogTitle>
                        <DialogDescription>
                            Sube una imagen para mostrar en el carrusel del inicio.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="image">Imagen Desktop *</Label>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('image', e.target.files ? e.target.files[0] : null)}
                                    className="mt-1 cursor-pointer"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Resolución recomendada: 1920x500 px</p>
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
                                <p className="text-xs text-muted-foreground mt-1">Resolución recomendada: 1200x500 px</p>
                                {/* @ts-ignore */}
                                {errors.mobile_image && <p className="text-red-500 text-sm mt-1">{errors.mobile_image}</p>}
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

                            <div>
                                <Label htmlFor="duration_seconds">Duración en Carrusel (segundos)</Label>
                                <Input
                                    id="duration_seconds"
                                    type="number"
                                    min="1"
                                    max="60"
                                    value={data.duration_seconds}
                                    onChange={(e) => setData('duration_seconds', parseInt(e.target.value))}
                                    className="mt-1"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Entre 1 y 60 segundos</p>
                                {/* @ts-ignore */}
                                {errors.duration_seconds && <p className="text-red-500 text-sm mt-1">{errors.duration_seconds}</p>}
                            </div>
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

            {/* Dialog de Confirmación de Eliminación */}
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
