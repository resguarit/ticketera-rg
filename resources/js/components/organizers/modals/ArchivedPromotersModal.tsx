import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RotateCcw, ArchiveX } from "lucide-react";
import { router } from "@inertiajs/react";
import { formatCurrency } from "@/lib/currencyHelpers";
import { useUserRole } from '@/hooks/useUserRole';

interface ArchivedPromotersModalProps {
    isOpen: boolean;
    onClose: (open: boolean) => void;
    event: any;
    archivedPromoters: any[];
}

export default function ArchivedPromotersModal({
    isOpen,
    onClose,
    event,
    archivedPromoters
}: ArchivedPromotersModalProps) {

    const handleRestore = (promoterId: number) => {
        router.patch(route('organizer.events.promoters.restore', {
            event: event.id,
            promoter: promoterId
        }), {}, {
            preserveScroll: true,
            onSuccess: () => {
                // Si no quedan más archivados, podríamos cerrar el modal, 
                // pero mejor dejar al usuario decidir.
            }
        });
    };

        const { canEdit } = useUserRole();


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ArchiveX className="w-5 h-5 text-orange-500" />
                        Vendedores Archivados
                    </DialogTitle>
                    <DialogDescription>
                        Historial de vendedores eliminados. Puedes reactivarlos para que sus códigos vuelvan a funcionar.
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[60vh] overflow-y-auto border rounded-md mt-2">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 sticky top-0">
                                <TableHead>Vendedor</TableHead>
                                <TableHead>Ventas Históricas</TableHead>
                                <TableHead>Recaudado</TableHead>
                                { canEdit &&(
                                <TableHead className="text-right">Acción</TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {archivedPromoters.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                        No hay vendedores en la papelera.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                archivedPromoters.map((promoter) => (
                                    <TableRow key={promoter.id}>
                                        <TableCell>
                                            <div className="font-medium">{promoter.name}</div>
                                            <div className="text-xs text-muted-foreground">{promoter.email || '-'}</div>
                                            <div className="text-[10px] text-orange-600 mt-1">
                                                Eliminado el: {new Date(promoter.deleted_at).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>{promoter.total_sales}</TableCell>
                                        <TableCell>{formatCurrency(promoter.total_revenue)}</TableCell>
                                        { canEdit &&(
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-2 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                                                onClick={() => handleRestore(promoter.id)}
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                                Reactivar
                                            </Button>
                                        </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
}