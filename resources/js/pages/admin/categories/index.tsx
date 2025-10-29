import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Plus, Edit, Trash2, MoreVertical, Tag } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Category } from '@/types';
import { PageProps } from '@/types/ui/ui';
import ConfirmationModal from '@/components/ConfirmationModal';
import CreateCategoryModal from '@/components/admin/modals/CreateCategoryModal';
import EditCategoryModal from '@/components/admin/modals/EditCategoryModal';
import { DynamicIcon } from '@/components/admin/CategoryIcons';

interface CategoryWithCount extends Category {
    events_count: number;
}

interface CategoriesPageProps extends PageProps {
    categories: CategoryWithCount[];
}

export default function CategoriesIndex() {
    const { categories } = usePage<CategoriesPageProps>().props;

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<CategoryWithCount | null>(null);
    const [categoryToEdit, setCategoryToEdit] = useState<CategoryWithCount | null>(null);

    const { delete: deleteCategory } = useForm();

    const openEditModal = (category: CategoryWithCount) => {
        setCategoryToEdit(category);
        setIsEditModalOpen(true);
    };

    const handleDeleteCategory = (categoryId: number) => {
        deleteCategory(route('admin.categories.destroy', categoryId), {
            onSuccess: () => {
                setCategoryToDelete(null);
                setIsConfirmModalOpen(false);
            }
        });
    };

    return (
        <>
            <Head title="Gestión de Categorías" />

            <div className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestionar Categorías</h1>
                        <p className="text-gray-600 mt-1">
                            Crea y administra las categorías para tus eventos.
                        </p>
                    </div>
                    <Button 
                        onClick={() => setIsCreateModalOpen(true)} 
                        className="bg-primary hover:bg-primary-hover text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Crear Categoría
                    </Button>
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
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="w-4 h-4 text-gray-600" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="bg-white border-gray-300">
                                                <DropdownMenuItem 
                                                    onClick={() => openEditModal(category)} 
                                                    className="text-gray-700 hover:bg-gray-50"
                                                >
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-gray-200" />
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600 hover:bg-red-50"
                                                    onSelect={() => {
                                                        setCategoryToDelete(category);
                                                        setIsConfirmModalOpen(true);
                                                    }}
                                                    disabled={category.events_count > 0}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
                                    <Button 
                                        onClick={() => setIsCreateModalOpen(true)} 
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Crear tu primera categoría
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modales */}
            <CreateCategoryModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            <EditCategoryModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setCategoryToEdit(null);
                }}
                category={categoryToEdit}
            />

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => {
                    setIsConfirmModalOpen(false);
                    setCategoryToDelete(null);
                }}
                onConfirm={() => {
                    if (categoryToDelete) {
                        handleDeleteCategory(categoryToDelete.id);
                    }
                }}
                accionTitulo="Eliminación"
                accion="Eliminar"
                pronombre="esta"
                entidad="categoría"
                accionando="eliminando"
                nombreElemento={categoryToDelete?.name}
                advertencia="Todos los datos asociados a la categoría también serán eliminados."
                confirmVariant='destructive'
                isLoading={false}
            />
        </>
    );
}

CategoriesIndex.layout = (page: any) => <AppLayout children={page} />;