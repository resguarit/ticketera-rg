import { useState } from "react";
import { Eye, EyeOff, MoreVertical, Trash2, Copy, Edit2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { TicketType } from "@/types/models/ticketType";
import { formatPrice, formatCurrency } from "@/lib/currencyHelpers";
import { DuplicateTicketTypeModal } from "./modals/DuplicateTicketTypeModal";
import { useUserRole } from "@/hooks/useUserRole";

interface TicketTypeCardProps {
  ticket: TicketType;
  onToggleVisibility?: (ticketId: number) => void;
  onEdit?: (ticketId: number) => void;
  onDuplicateAll?: (ticket: TicketType, functionIds: number[]) => void;
  onDelete?: (ticket: TicketType) => void; // Cambiar para pasar el ticket completo
  allFunctions?: { id: number; name: string }[];
  functionsWithTicket?: number[];
}

export const TicketTypeCard: React.FC<TicketTypeCardProps> = ({ ticket, onToggleVisibility, onEdit, onDuplicateAll, onDelete, allFunctions = [], functionsWithTicket = [] }) => {
  const handleButtonClick = () => {
    if (onToggleVisibility) {
      onToggleVisibility(ticket.id);
    }
  };

  const { canEdit } = useUserRole();

  // Estado para el modal de duplicar
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [selectedFunctions, setSelectedFunctions] = useState<number[]>([]);

  const handleOpenDuplicateModal = () => {
    setShowDuplicateModal(true);
    setSelectedFunctions([]); // Reset selection when opening
  };

  const handleConfirmDuplicate = (functionIds: number[]) => {
    if (onDuplicateAll && functionIds.length > 0) {
      onDuplicateAll(ticket, functionIds);
    }
    setShowDuplicateModal(false);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(ticket.id);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(ticket); // Pasar el ticket completo
    }
  };

  const isBundle = ticket.is_bundle || false;
  const bundleQuantity = ticket.bundle_quantity || 1;

  // Para mostrar información de lotes vs entradas emitidas
  const lotesDisponibles = ticket.quantity_available || 0;
  const lotesVendidos = ticket.quantity_sold || 0;
  const entradasEmitidas = isBundle ? lotesVendidos * bundleQuantity : lotesVendidos;
  const totalEntradas = isBundle ? ticket.quantity * bundleQuantity : ticket.quantity;

  const isStaged = ticket.stage_group && ticket.stage_number;

  return (
    <Card className="w-full md:w-80 hover:shadow-md transition-shadow relative">
      <CardHeader className='pt-2 flex-grow'>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex flex-col gap-2">
              <CardTitle className="text-lg">{ticket.name}</CardTitle>
              {isBundle && (
                <Badge variant="secondary" className="text-xs">
                  Lote x{bundleQuantity}
                </Badge>
              )}
              {isStaged && (
                <Badge variant="outline" className="text-xs">
                  Tanda {ticket.stage_number}
                </Badge>
              )}
              {ticket.is_hidden && isStaged && (
                <Badge variant="secondary" className="text-xs">
                  En espera
                </Badge>
              )}
            </div>
            {ticket.description && (
              <CardDescription className="mt-1 text-sm">
                {ticket.description}
              </CardDescription>
            )}
          </div>
          <span className="text-xl font-bold text-primary">
            {formatPrice(ticket.price || 0)}
            {isBundle && (
              <div className="text-xs text-muted-foreground text-right">
                {formatPrice((ticket.price || 0) / bundleQuantity)} c/u
              </div>
            )}
          </span>

          {/* Submenú de tres puntitos */}
          {canEdit && (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="absolute top-0.5 -right-0.5">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleOpenDuplicateModal}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicar en funciones
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit2 className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {/* Información de lotes (para bundles) o entradas (para individuales) */}
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {isBundle ? 'Lotes totales:' : 'Entradas:'}
            </span>
            <span className="font-medium">{ticket.quantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Disponibles:</span>
            <span className="font-medium text-green-600">{lotesDisponibles}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {isBundle ? 'Lotes vendidos:' : 'Vendidas:'}
            </span>
            <span className="font-medium text-blue-600">{lotesVendidos}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Progreso:</span>
            <span className="font-medium">{ticket.sold_percentage}%</span>
          </div>
          {(ticket.invited_count || 0) > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Invitados:</span>
              <span className="font-medium text-indigo-600">{ticket.invited_count}</span>
            </div>
          )}
          {isBundle && (
            <>
              <div className="flex justify-between col-span-2 pt-2 border-t border-gray-200">
                <span className="text-muted-foreground text-sm font-medium">Entradas Emitidas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">Total emisiones:</span>
                <span className="font-medium text-xs text-blue-600">
                  {entradasEmitidas}/{totalEntradas}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">Por lote:</span>
                <span className="font-medium text-xs text-blue-600">
                  x{bundleQuantity} entradas
                </span>
              </div>
            </>
          )}

          <div className="flex justify-between col-span-2 pt-2 border-t border-gray-200">
            <span className="text-muted-foreground text-xs">Máx. por compra:</span>
            <span className="font-medium text-xs text-gray-700">
              {ticket.max_purchase_quantity}
              {isBundle && (
                <span className="text-blue-600">
                  {' '}(={ticket.max_purchase_quantity * bundleQuantity} entradas)
                </span>
              )}
            </span>
          </div>
        </div>

        <Separator />

        <div className="text-center">
          <div className="text-sm text-muted-foreground">Ingresos generados</div>
          <div className="text-lg font-bold text-green-600">
            {formatCurrency(ticket.total_income || 0)}
          </div>
        </div>

        {/* Barra de progreso visual */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{isBundle ? 'Lotes' : 'Ventas'}</span>
            <span>{lotesVendidos}/{ticket.quantity}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(ticket.sold_percentage ?? 0, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
      {canEdit && (
      <CardFooter className="flex gap-2">
        <Button
          variant={ticket.is_hidden ? 'destructive' : 'outline'}
          className="flex-1"
          onClick={handleButtonClick}
        >
          {ticket.is_hidden ? (
            <>
              <EyeOff className="mr-2 h-4 w-4" />
              Oculta
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              A la venta
            </>
          )}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          className="px-3"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Eliminar
        </Button>
      </CardFooter>
      )}
      {/* Modal de duplicar */}
      <DuplicateTicketTypeModal
        open={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        onConfirm={handleConfirmDuplicate}
        allFunctions={allFunctions}
        functionsWithTicket={functionsWithTicket}
        selectedFunctions={selectedFunctions}
        setSelectedFunctions={setSelectedFunctions}
      />
    </Card>
  );
};
