import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';
import { FaqCategory } from '@/types/models';
import { Ticket, CreditCard, Users, Shield, HelpCircle, Palette, Laugh, Music, Theater, Trophy, Presentation, Utensils } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    category: FaqCategory | null;
    icons: string[];
}

const iconMap: { [key: string]: React.ElementType } = {
    Ticket, CreditCard, Users, Shield, HelpCircle, Palette, Laugh, Music, Theater, Trophy, Presentation, Utensils
};

const DynamicIcon = ({ name, ...props }: { name: string } & React.ComponentProps<typeof Shield>) => {
    const Icon = iconMap[name] || HelpCircle;
    return <Icon {...props} />;
};

export function FaqCategoryModal({ isOpen, onClose, category, icons }: Props) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: '',
        icon: 'HelpCircle',
        color: '#3b82f6',
        order: 0,
    });

    useEffect(() => {
        if (isOpen) {
            if (category) {
                setData({
                    title: category.title,
                    icon: category.icon || 'HelpCircle',
                    color: category.color || '#3b82f6',
                    order: category.order || 0,
                });
            } else {
                reset();
            }
        }
    }, [category, isOpen]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const routeName = category ? route('admin.faqs.categories.update', category.id) : route('admin.faqs.categories.store');
        const method = category ? put : post;
        method(routeName, {
            onSuccess: () => onClose(),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] sm:max-w-[525px] bg-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{category ? 'Editar Categoría' : 'Crear Categoría'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit}>
                    <div className="grid gap-4 py-4">
                        <div>
                            <Label htmlFor="title">Título</Label>
                            <Input id="title" value={data.title} onChange={e => setData('title', e.target.value)} className="mt-1" />
                            {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
                        </div>
                        <div>
                            <Label>Icono</Label>
                            <div className="grid grid-cols-6 md:grid-cols-8 gap-2 p-2 border rounded-md bg-gray-50 mt-1">
                                {icons.map(iconName => (
                                    <button
                                        type="button"
                                        key={iconName}
                                        onClick={() => setData('icon', iconName)}
                                        className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-md transition-colors ${data.icon === iconName ? 'bg-secondary text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                    >
                                        <DynamicIcon name={iconName} className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                ))}
                            </div>
                            {errors.icon && <p className="text-sm text-red-600 mt-1">{errors.icon}</p>}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <Label htmlFor="color">Color</Label>
                                <Input id="color" type="color" value={data.color} onChange={e => setData('color', e.target.value)} className="mt-1 w-full h-10" />
                                {errors.color && <p className="text-sm text-red-600 mt-1">{errors.color}</p>}
                            </div>
                            <div className="flex-1">
                                <Label htmlFor="order">Orden</Label>
                                <Input id="order" type="number" value={data.order} onChange={e => setData('order', parseInt(e.target.value))} className="mt-1" />
                                {errors.order && <p className="text-sm text-red-600 mt-1">{errors.order}</p>}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">Cancelar</Button>
                        <Button type="submit" disabled={processing} className="w-full sm:w-auto">{processing ? 'Guardando...' : 'Guardar'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}