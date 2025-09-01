import { useState, useEffect, FormEventHandler } from 'react';
import { Sector } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import InputError from '@/components/input-error';

interface SectorFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (sector: Sector) => void;
    sector: Sector | null;
}

export default function SectorFormModal({ isOpen, onClose, onSubmit, sector }: SectorFormModalProps) {
    const [data, setData] = useState({
        id: sector?.id || Date.now(), // ID temporal para nuevos
        name: sector?.name || '',
        capacity: sector?.capacity || '',
        description: sector?.description || '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        setData({
            id: sector?.id || Date.now(),
            name: sector?.name || '',
            capacity: sector?.capacity || '',
            description: sector?.description || '',
        });
        setErrors({});
    }, [sector, isOpen]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        const newErrors: { [key: string]: string } = {};
        if (!data.name) newErrors.name = 'El nombre es obligatorio.';
        if (!data.capacity || Number(data.capacity) <= 0) newErrors.capacity = 'La capacidad debe ser un número positivo.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit({
            ...data,
            capacity: Number(data.capacity),
        } as Sector);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                    <DialogTitle>{sector ? 'Editar Sector' : 'Agregar Sector'}</DialogTitle>
                    <DialogDescription>
                        Completa los detalles del sector.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre del Sector</Label>
                            <Input id="name" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} />
                            <InputError message={errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="capacity">Capacidad</Label>
                            <Input id="capacity" type="number" value={data.capacity} onChange={e => setData({ ...data, capacity: e.target.value })} />
                            <InputError message={errors.capacity} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción (Opcional)</Label>
                            <Textarea id="description" value={data.description} onChange={e => setData({ ...data, description: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="button" onClick={handleSubmit}>Guardar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}