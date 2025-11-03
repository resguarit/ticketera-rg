import { Head, usePage } from '@inertiajs/react';
import { Plus, Edit, Trash2, Ticket, CreditCard, Users, Shield, HelpCircle, Palette, Laugh, Music, Theater, Trophy, Presentation, Utensils } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageProps } from '@/types';
import { Faq, FaqCategory } from '@/types/models';
import { useState } from 'react';
import { FaqCategoryModal } from '@/components/admin/modals/FaqCategoryModal';
import { FaqModal } from '@/components/admin/modals/FaqModal';
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
import { router } from '@inertiajs/react';
import ConfirmationModal from '@/components/ConfirmationModal';

interface FaqsPageProps extends PageProps {
    categories: (FaqCategory & { faqs: Faq[] })[];
}

const iconMap: { [key: string]: React.ElementType } = {
    Ticket, CreditCard, Users, Shield, HelpCircle, Palette, Laugh, Music, Theater, Trophy, Presentation, Utensils
};

const DynamicIcon = ({ name, ...props }: { name: string } & React.ComponentProps<typeof Shield>) => {
    const Icon = iconMap[name] || HelpCircle;
    return <Icon {...props} />;
};

export default function FaqsIndex() {
    const { categories } = usePage<FaqsPageProps>().props;
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
    const [isFaqModalOpen, setFaqModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<FaqCategory | null>(null);
    const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
    const [currentCategoryId, setCurrentCategoryId] = useState<number | null>(null);

    const [isConfirmModalCategoryOpen, setIsConfirmModalCategoryOpen] = useState(false);
    const [faqCategoryToDelete, setFaqCategoryToDelete] = useState<FaqCategory | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [faqToDelete, setFaqToDelete] = useState<Faq | null>(null);

    const openNewCategoryModal = () => {
        setEditingCategory(null);
        setCategoryModalOpen(true);
    };

    const openEditCategoryModal = (category: FaqCategory) => {
        setEditingCategory(category);
        setCategoryModalOpen(true);
    };

    const openNewFaqModal = (categoryId: number) => {
        setCurrentCategoryId(categoryId);
        setEditingFaq(null);
        setFaqModalOpen(true);
    };

    const openEditFaqModal = (faq: Faq) => {
        setCurrentCategoryId(faq.faq_category_id);
        setEditingFaq(faq);
        setFaqModalOpen(true);
    };

    const handleDeleteFaqCategory = (categoryId: number) => {
        router.delete(route('admin.faqs.categories.destroy', categoryId), {
            onSuccess: () => {
                setFaqCategoryToDelete(null);
            }
        });
    }

    const handleDeleteFaq = (faqId: number) => {
        router.delete(route('admin.faqs.destroy', faqId), {
            onSuccess: () => {
                setFaqToDelete(null);
            }
        });
    }

    return (
        <>
            <Head title="Gestión de FAQs" />
            <div className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestionar Preguntas Frecuentes</h1>
                        <p className="text-gray-600 mt-1">Crea y administra las categorías y preguntas del Centro de Ayuda.</p>
                    </div>
                    <Button onClick={openNewCategoryModal} className="bg-primary hover:bg-primary-hover text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Crear Categoría
                    </Button>
                </div>

                <div className="space-y-6">
                    {categories.map((category) => (
                        <Card key={category.id} className="bg-white shadow-lg border-gray-200">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-3">
                                    <div style={{ backgroundColor: category.color || '#ccc' }} className="w-8 h-8 rounded-lg flex items-center justify-center">
                                        <DynamicIcon name={category.icon || 'HelpCircle'} className="w-5 h-5 text-white" />
                                    </div>
                                    {category.title}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => openEditCategoryModal(category)}>
                                        <Edit className="h-4 w-4 mr-2" /> Editar Categoría
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => {setIsConfirmModalCategoryOpen(true); setFaqCategoryToDelete(category)}}>
                                        <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="divide-y divide-gray-200">
                                    {category.faqs.map((faq) => (
                                        <div key={faq.id} className="py-4 flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-gray-800">{faq.question}</p>
                                                <p className="text-gray-600 mt-1 text-sm">{faq.answer}</p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                                <Button variant="outline" size="icon" onClick={() => openEditFaqModal(faq)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="destructive" size="icon" onClick={() => { setFaqToDelete(faq);
                                                     setIsConfirmModalOpen(true) }}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="secondary" className="mt-4" onClick={() => openNewFaqModal(category.id)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Añadir Pregunta
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <FaqCategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => setCategoryModalOpen(false)}
                category={editingCategory}
                icons={Object.keys(iconMap)}
            />

            <FaqModal
                isOpen={isFaqModalOpen}
                onClose={() => setFaqModalOpen(false)}
                faq={editingFaq}
                categoryId={currentCategoryId}
            />

            <ConfirmationModal
                isOpen={isConfirmModalCategoryOpen}
                onClose={() => setIsConfirmModalCategoryOpen(false)}
                onConfirm={() => {
                    if (faqCategoryToDelete) {
                        handleDeleteFaqCategory(faqCategoryToDelete.id);
                    }
                }}
                accionTitulo="Eliminación"
                accion="Eliminar"
                pronombre="esta"
                entidad="categoría de pregunta"
                accionando="eliminando"
                nombreElemento={faqCategoryToDelete?.title}
                advertencia="Todos los datos asociados a la categoría de pregunta también serán eliminados."
                confirmVariant='destructive'
                isLoading={false}
                />

                <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={() => {
                    if (faqToDelete) {
                        handleDeleteFaq(faqToDelete.id);
                    }
                }}
                accionTitulo="Eliminación"
                accion="Eliminar"
                pronombre="esta"
                entidad="pregunta"
                accionando="eliminando"
                nombreElemento={faqToDelete?.question}
                advertencia="Todos los datos asociados a la pregunta también serán eliminados."
                confirmVariant='destructive'
                isLoading={false}
                />
        </>
    );
}

FaqsIndex.layout = (page: any) => <AppLayout children={page} />;