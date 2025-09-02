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
import { TicketType } from "@/types/models/ticketType";
import { formatPrice, formatCurrency } from "@/lib/currencyHelpers";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { DuplicateTicketTypeModal } from "./modals/DuplicateTicketTypeModal";

interface TicketTypeCardProps {
  ticket: TicketType;
  onToggleVisibility?: (ticketId: number) => void;
  onEdit?: (ticketId: number) => void;
  onDuplicateAll?: (ticket: TicketType, functionIds: number[]) => void;
  onDelete?: (ticketId: number) => void;
  allFunctions?: { id: number; name: string }[];
  functionsWithTicket?: number[];
}

export const TicketTypeCard = ({
  ticket,
  onToggleVisibility,
  onEdit,
  onDuplicateAll,
  onDelete,
  allFunctions = [],
  functionsWithTicket = [],
}: TicketTypeCardProps) => {
  const handleButtonClick = () => {
    if (onToggleVisibility) {
      onToggleVisibility(ticket.id);
    }
  };

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
      onDelete(ticket.id);
    }
  };

  return (
    <Card className="w-80 hover:shadow-md transition-shadow relative">
      <CardHeader className='pt-2 flex-grow'>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{ticket.name}</CardTitle>
            {ticket.description && (
              <CardDescription className="mt-1 text-sm">
                {ticket.description}
              </CardDescription>
            )}
          </div>
          <span className="text-xl font-bold text-primary">
            {formatPrice(ticket.price || 0)}
          </span>
          {/* Submenú de tres puntitos */}
          <DropdownMenu>
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
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-medium">{ticket.quantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Disponibles:</span>
            <span className="font-medium text-green-600">{ticket.quantity_available}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vendidas:</span>
            <span className="font-medium text-blue-600">{ticket.quantity_sold}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vendido:</span>
            <span className="font-medium">{ticket.sold_percentage}%</span>
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
            <span>Ventas</span>
            <span>{ticket.quantity_sold}/{ticket.quantity}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(ticket.sold_percentage, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
      
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

      {/* Reemplaza el Dialog por el nuevo modal */}
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
