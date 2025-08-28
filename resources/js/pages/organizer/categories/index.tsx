import { useState, FormEventHandler } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Plus, Edit, Trash2, MoreVertical, Tag, Palette, Smile, AlertCircle,
    LucideIcon, Music, Theater, Trophy, Presentation, Utensils, Laugh, Users,
    Palette as PaletteIcon, // Alias para el icono de la categoría
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Category } from '@/types';
import { PageProps } from '@/types/ui/ui';

// Helper para mapear nombres de iconos a componentes de Lucide
const iconMap: { [key: string]: LucideIcon } = {
    music: Music,
    theater: Theater,
    trophy: Trophy,
    presentation: Presentation,
    utensils: Utensils,
    palette: PaletteIcon,
    laugh: Laugh,
    users: Users,
};

const DynamicIcon = ({ name, ...props }: { name: string } & React.ComponentProps<LucideIcon>) => {
    // Usar el icono 'Tag' como fallback si el nombre no se encuentra
    const IconComponent = iconMap[name] || Tag;
    return <IconComponent {...props} />;
};

interface CategoryWithCount extends Category {
    events_count: number;
}

interface CategoriesPageProps extends PageProps {
    categories: CategoryWithCount[];
}

export default function CategoriesIndex() {
    const { categories, errors } = usePage<CategoriesPageProps>().props;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null);

    const { data, setData, post, put, delete: deleteCategory, reset, processing } = useForm({
        name: '',
        icon: '',
        color: '#3b82f6',
    });

    const openCreateModal = () => {
        setEditingCategory(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (category: CategoryWithCount) => {
        setEditingCategory(category);
        setData({
            name: category.name,
            icon: category.icon || '',
            color: category.color || '#3b82f6',
        });
        setIsModalOpen(true);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const routeName = editingCategory
            ? route('organizer.categories.update', editingCategory.id)
            : route('organizer.categories.store');
        const method = editingCategory ? 'put' : 'post';

        (method === 'post' ? post : put)(routeName, {
            onSuccess: () => setIsModalOpen(false),
        });
    };

    return (
        <>
            <Head title="Gestionar Categorías" />

            <div className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestionar Categorías</h1>
                        <p className="text-gray-600 mt-1">
                            Crea y administra las categorías para tus eventos.
                        </p>
                    </div>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openCreateModal} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Crear Categoría
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-white">
                            <DialogHeader>
                                <DialogTitle className="text-black">
                                    {editingCategory ? 'Editar Categoría' : 'Crear Nueva Categoría'}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingCategory
                                        ? 'Actualiza los detalles de la categoría.'
                                        : 'Completa el formulario para añadir una nueva categoría.'}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={submit}>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-black">Nombre</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="bg-white border-gray-300 text-black"
                                            required
                                        />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-black">Icono (Opcional)</Label>
                                        <div className="grid grid-cols-6 gap-2 p-2 border rounded-md bg-gray-50">
                                            {Object.keys(iconMap).map((iconName) => (
                                                <button
                                                    type="button"
                                                    key={iconName}
                                                    onClick={() => setData('icon', data.icon === iconName ? '' : iconName)}
                                                    className={`flex items-center justify-center w-10 h-10 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                                        data.icon === iconName
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                                    }`}
                                                    title={iconName.charAt(0).toUpperCase() + iconName.slice(1)}
                                                >
                                                    <DynamicIcon name={iconName} className="w-5 h-5" />
                                                </button>
                                            ))}
                                        </div>
                                        <InputError message={errors.icon} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="color" className="text-black">Color</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id="color"
                                                type="color"
                                                value={data.color}
                                                onChange={(e) => setData('color', e.target.value)}
                                                className="p-1 h-10 w-14 block bg-white border border-gray-300 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none"
                                            />
                                            <Input
                                                type="text"
                                                value={data.color}
                                                onChange={(e) => setData('color', e.target.value)}
                                                className="bg-white border-gray-300 text-black"
                                            />
                                        </div>
                                        <InputError message={errors.color} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                        {processing ? 'Guardando...' : 'Guardar Cambios'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card className="bg-white shadow-lg border-gray-200">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-black text-xl">Lista de Categorías</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {categories.length > 0 ? (
                            <div className="divide-y divide-gray-200">
                                {categories.map((category) => (
                                    <div key={category.id} className="flex items-center justify-between py-4">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
                                                style={{ backgroundColor: category.color }}
                                            >
                                                <DynamicIcon name={category.icon} className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-black">{category.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {category.events_count} evento(s)
                                                </p>
                                            </div>
                                        </div>
                                        <AlertDialog>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="w-4 h-4 text-gray-600" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="bg-white border-gray-300">
                                                    <DropdownMenuItem onClick={() => openEditModal(category)} className="text-gray-700 hover:bg-gray-50">
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-gray-200" />
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-600 hover:bg-red-50"
                                                            onSelect={(e) => e.preventDefault()}
                                                            disabled={category.events_count > 0}
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Eliminar
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <AlertDialogContent className="bg-white border-gray-300">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="text-black">¿Estás seguro?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Esta acción no se puede deshacer. Se eliminará permanentemente la categoría.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => deleteCategory(route('organizer.categories.destroy', category.id))}
                                                        className="bg-red-600 hover:bg-red-700 text-white"
                                                    >
                                                        Sí, eliminar
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="bg-gray-50 rounded-lg p-8">
                                    <Tag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        No tienes categorías creadas
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Comienza creando tu primera categoría para organizar tus eventos.
                                    </p>
                                    <Button onClick={openCreateModal} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Crear tu primera categoría
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

CategoriesIndex.layout = (page: any) => <AppLayout children={page} />;