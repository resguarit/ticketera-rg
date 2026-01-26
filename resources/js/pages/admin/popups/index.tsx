import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, Eye, EyeOff, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import AdminLayout from '@/layouts/app-layout'; // AGREGAR ESTE IMPORT
import { toast } from 'sonner';

interface WelcomePopup {
    id: number;
    image_url: string;
    mobile_image_url?: string;
    full_image_url: string;
    full_mobile_image_url?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface IndexProps {
    popups: WelcomePopup[];
}

export default function WelcomePopupsIndex({ popups }: IndexProps) {
    const [deletePopupId, setDeletePopupId] = useState<number | null>(null);
    const [previewPopup, setPreviewPopup] = useState<WelcomePopup | null>(null);

    const handleDelete = () => {
        if (deletePopupId) {
            router.delete(route('admin.popups.destroy', deletePopupId), {
                onSuccess: () => {
                    toast.success('Popup eliminado exitosamente');
                    setDeletePopupId(null);
                },
                onError: () => {
                    toast.error('Error al eliminar el popup');
                },
            });
        }
    };

    const handleToggleActive = (popupId: number) => {
        router.post(
            route('admin.popups.toggle-active', popupId),
            {},
            {
                onSuccess: () => {
                    toast.success('Estado actualizado exitosamente');
                },
                onError: () => {
                    toast.error('Error al actualizar el estado');
                },
            }
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AdminLayout>
            <Head title="Popups de Bienvenida" />

            <div className="space-y-6 p-4 sm:p-6 ">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Popups de Bienvenida
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Gestiona las imágenes que se muestran al ingresar al sitio
                        </p>
                    </div>
                    <Link href={route('admin.popups.create')}>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            Nuevo Popup
                        </Button>
                    </Link>
                </div>

                {/* Stats Card */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Popups
                            </CardTitle>
                            <Image className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{popups.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Activos
                            </CardTitle>
                            <Eye className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {popups.filter((p) => p.is_active).length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Inactivos
                            </CardTitle>
                            <EyeOff className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {popups.filter((p) => !p.is_active).length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        {popups.length === 0 ? (
                            <div className="text-center py-12">
                                <Image className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">
                                    No hay popups creados
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    Comienza creando tu primer popup de bienvenida
                                </p>
                                <Link href={route('admin.popups.create')}>
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Crear Popup
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Vista Previa</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Imagen Mobile</TableHead>
                                        <TableHead>Fecha Creación</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {popups.map((popup) => (
                                        <TableRow key={popup.id}>
                                            <TableCell>
                                                <button
                                                    onClick={() => setPreviewPopup(popup)}
                                                    className="relative w-24 h-16 rounded-md overflow-hidden border-2 border-gray-200 hover:border-primary transition-colors"
                                                >
                                                    <img
                                                        src={popup.full_image_url}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={popup.is_active ? 'default' : 'secondary'}
                                                    className={
                                                        popup.is_active
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                    }
                                                >
                                                    {popup.is_active ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {popup.mobile_image_url ? (
                                                    <Badge variant="outline" className="gap-1">
                                                        <Eye className="w-3 h-3" />
                                                        Sí
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">
                                                        No
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDate(popup.created_at)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleToggleActive(popup.id)}
                                                        title={popup.is_active ? 'Desactivar' : 'Activar'}
                                                    >
                                                        {popup.is_active ? (
                                                            <EyeOff className="w-4 h-4" />
                                                        ) : (
                                                            <Eye className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                    <Link
                                                        href={route('admin.popups.edit', popup.id)}
                                                    >
                                                        <Button variant="ghost" size="sm" title="Editar">
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setDeletePopupId(popup.id)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletePopupId} onOpenChange={() => setDeletePopupId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. El popup será eliminado permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Preview Dialog */}
            <AlertDialog open={!!previewPopup} onOpenChange={() => setPreviewPopup(null)}>
                <AlertDialogContent className="max-w-4xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Vista Previa del Popup</AlertDialogTitle>
                    </AlertDialogHeader>
                    {previewPopup && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium mb-2">Imagen Desktop:</h4>
                                <img
                                    src={previewPopup.full_image_url}
                                    alt="Desktop Preview"
                                    className="w-full h-auto rounded-lg border"
                                />
                            </div>
                            {previewPopup.full_mobile_image_url && (
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Imagen Mobile:</h4>
                                    <img
                                        src={previewPopup.full_mobile_image_url}
                                        alt="Mobile Preview"
                                        className="max-w-sm mx-auto h-auto rounded-lg border"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cerrar</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}