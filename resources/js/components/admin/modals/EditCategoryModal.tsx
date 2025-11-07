import { FormEventHandler, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { DynamicIcon, iconMap } from '../CategoryIcons';

interface Category {
    id: number;
    name: string;
    icon: string;
    color: string;
    events_count: number;
}

interface EditCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: Category | null;
}

export default function EditCategoryModal({ isOpen, onClose, category }: EditCategoryModalProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: '',
        icon: '',
        color: '#3b82f6',
    });

    useEffect(() => {
        if (category) {
            setData({
                name: category.name,
                icon: category.icon || '',
                color: category.color || '#3b82f6',
            });
        }
    }, [category]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!category) return;

        put(route('admin.categories.update', category.id), {
            onSuccess: () => {
                onClose();
            },
        });
    };

    const handleClose = () => {
        onClose();
        reset();
    };

    if (!isOpen || !category) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                {/* Backdrop */}
                <div 
                    className="fixed inset-0 bg-black/50 transition-opacity"
                    onClick={handleClose}
                />
                
                {/* Modal */}
                <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Editar Categoría
                        </h2>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-500 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <form onSubmit={submit}>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-600">
                                Actualiza los detalles de la categoría.
                            </p>

                            <div className="space-y-2">
                                <Label htmlFor="edit-name" className="text-black">
                                    Nombre <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="edit-name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="bg-white border-gray-300 text-black"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-black">Icono (Opcional)</Label>
                                <div className="grid grid-cols-6 gap-2 p-3 border rounded-md bg-gray-50">
                                    {Object.keys(iconMap).map((iconName) => (
                                        <button
                                            type="button"
                                            key={iconName}
                                            onClick={() => setData('icon', data.icon === iconName ? '' : iconName)}
                                            className={`flex items-center justify-center w-10 h-10 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                                                data.icon === iconName
                                                    ? 'bg-primary text-white'
                                                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
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
                                <Label htmlFor="edit-color" className="text-black">Color</Label>
                                <div className="flex items-center gap-3">
                                    <Input
                                        id="edit-color"
                                        type="color"
                                        value={data.color}
                                        onChange={(e) => setData('color', e.target.value)}
                                        className="p-1 h-10 w-16 block bg-white border border-gray-300 cursor-pointer rounded-lg"
                                    />
                                    <Input
                                        type="text"
                                        value={data.color}
                                        onChange={(e) => setData('color', e.target.value)}
                                        className="bg-white border-gray-300 text-black flex-1"
                                    />
                                </div>
                                <InputError message={errors.color} />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={handleClose}
                                disabled={processing}
                            >
                                Cancelar
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={processing} 
                                className="bg-primary hover:bg-primary-hover text-white"
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Guardar Cambios
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}