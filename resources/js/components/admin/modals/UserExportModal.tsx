import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileSpreadsheet } from 'lucide-react';

interface UserExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (type: 'all' | 'buyers' | 'non_buyers') => void;
}

export default function UserExportModal({ isOpen, onClose, onExport }: UserExportModalProps) {
    const [exportType, setExportType] = useState<'all' | 'buyers' | 'non_buyers'>('all');

    const handleConfirm = () => {
        onExport(exportType);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Exportar Usuarios</DialogTitle>
                    <DialogDescription>
                        Selecciona qué grupo de usuarios deseas exportar a Excel.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <RadioGroup
                        defaultValue="all"
                        value={exportType}
                        onValueChange={(v) => setExportType(v as 'all' | 'buyers' | 'non_buyers')}
                        className="grid gap-4"
                    >
                        <div className="flex items-center space-x-2 border p-4 rounded-md cursor-pointer hover:bg-gray-50">
                            <RadioGroupItem value="all" id="opt-all" />
                            <div className="grid gap-1.5 cursor-pointer flex-1" onClick={() => setExportType('all')}>
                                <Label htmlFor="opt-all" className="font-semibold cursor-pointer">Todos los clientes</Label>
                                <span className="text-sm text-muted-foreground">Exporta la lista completa de clientes registrados.</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 border p-4 rounded-md cursor-pointer hover:bg-gray-50">
                            <RadioGroupItem value="buyers" id="opt-buyers" />
                            <div className="grid gap-1.5 cursor-pointer flex-1" onClick={() => setExportType('buyers')}>
                                <Label htmlFor="opt-buyers" className="font-semibold cursor-pointer">Solo clientes con compras</Label>
                                <span className="text-sm text-muted-foreground">Clientes que han realizado al menos una compra pagada.</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 border p-4 rounded-md cursor-pointer hover:bg-gray-50">
                            <RadioGroupItem value="non_buyers" id="opt-non-buyers" />
                            <div className="grid gap-1.5 cursor-pointer flex-1" onClick={() => setExportType('non_buyers')}>
                                <Label htmlFor="opt-non-buyers" className="font-semibold cursor-pointer">Solo clientes sin compras</Label>
                                <span className="text-sm text-muted-foreground">Clientes registrados que aún no han comprado entradas.</span>
                            </div>
                        </div>
                    </RadioGroup>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Descargar Excel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
