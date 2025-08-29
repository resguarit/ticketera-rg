import { Eye, EyeOff } from 'lucide-react';
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
import { TicketType } from "@/types/models/ticketType";
import { formatPrice, formatCurrency } from "@/lib/currencyHelpers";

interface TicketTypeCardProps {
  ticket: TicketType;
  onToggleVisibility?: (ticketId: number) => void;
  onEdit?: (ticketId: number) => void;
  onDuplicateAll?: (ticket: TicketType) => void; // NUEVO
}

export const TicketTypeCard = ({ 
  ticket, 
  onToggleVisibility, 
  onEdit,
  onDuplicateAll // NUEVO
}: TicketTypeCardProps) => {
  const handleButtonClick = () => {
    if (onToggleVisibility) {
      onToggleVisibility(ticket.id);
    }
  };

  const handleDuplicateAll = () => {
    if (onDuplicateAll) {
      onDuplicateAll(ticket);
    }
  };

  return (
    <Card className="w-80 hover:shadow-md transition-shadow">
      <CardHeader>
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
            {formatPrice(ticket.price)}
          </span>
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
            {formatCurrency(ticket.total_income)}
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
          variant="secondary"
          size="sm"
          onClick={handleDuplicateAll}
          className="px-3"
        >
          Duplicar
        </Button>
        {onEdit && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onEdit(ticket.id)}
            className="px-3"
          >
            Editar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
