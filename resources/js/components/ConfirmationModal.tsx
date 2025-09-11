import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    accionTitulo: string;
    accion: string;
    pronombre: string;
    entidad: string;
    accionando: string;
    nombreElemento?: string;
    advertencia?: string;
    confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    isLoading?: boolean;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    accionTitulo,
    accion,
    pronombre,
    entidad,
    accionando,
    nombreElemento,
    advertencia,
    confirmVariant = "default",
    isLoading = false
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <>
            {/* Overlay */}
            <div 
                className="fixed inset-0 bg-black/50 z-50 transition-opacity"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div 
                    className="bg-white rounded-md shadow-xl max-w-md w-full p-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center w-full text-center ">
                        <h3 className="w-full text-2xl text-center font-semibold text-gray-900">
                            Confirmar {accionTitulo}
                        </h3>
                    </div>

                    {/* Content */}
                    <div className="px-6 space-y-4">
                        <p className="text-gray-700 text-lg text-center mt-4">
                            ¿Estás seguro de que deseas {accion} {pronombre} {entidad}
                            {nombreElemento !== undefined ? ':' : '?'}
                        </p>

                        {/* Nombre del elemento si existe */}
                        {nombreElemento !== undefined && (
                            <div className="font-semibold text-center text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border">
                                "{nombreElemento}"
                            </div>
                        )}

                        {/* Advertencia adicional si existe */}
                        {advertencia !== undefined && (
                            <div className="w-full ">
                                <p className="text-sm text-red-700">{advertencia}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-center w-full gap-3 mt-6 ">
                        <Button
                            onClick={onClose}
                            variant="ghost"
                            disabled={isLoading}
                            className='px-6 py-6 text-lg font-normal bg-gray-300'
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            variant={confirmVariant}
                            disabled={isLoading}
                            className='px-6 py-6 text-lg font-medium'
                        >
                            {isLoading ? `${accionando}...` : accion}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}