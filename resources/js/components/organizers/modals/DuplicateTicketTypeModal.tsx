import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface DuplicateTicketTypeModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedFunctionIds: number[]) => void;
  allFunctions: { id: number; name: string }[];
  functionsWithTicket: number[];
  selectedFunctions: number[];
  setSelectedFunctions: (ids: number[]) => void;
}

export const DuplicateTicketTypeModal: React.FC<DuplicateTicketTypeModalProps> = ({
  open,
  onClose,
  onConfirm,
  allFunctions,
  functionsWithTicket,
  selectedFunctions,
  setSelectedFunctions,
}) => {
  if (!open) return null;

  const handleToggleFunction = (funcId: number) => {
    setSelectedFunctions(
      selectedFunctions.includes(funcId)
        ? selectedFunctions.filter(id => id !== funcId)
        : [...selectedFunctions, funcId]
    );
  };

  const handleSelectAll = () => {
    const availableFunctions = allFunctions
      .filter(f => !functionsWithTicket.includes(f.id))
      .map(f => f.id);
    setSelectedFunctions(availableFunctions);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="relative z-50 w-full max-w-md p-6 bg-background rounded-lg shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Duplicar entrada en funciones</h3>
          <p className="text-sm text-muted-foreground">
            Selecciona las funciones donde quieres crear una copia de esta entrada.
          </p>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 my-4">
          {allFunctions.map(func => {
            const exists = functionsWithTicket.includes(func.id);
            const id = `func-${func.id}`;
            return (
              <div
                key={func.id}
                className={`flex items-center space-x-2 p-2 rounded-md ${exists ? 'opacity-50' : ''}`}
              >
                <Checkbox
                  id={id}
                  checked={selectedFunctions.includes(func.id)}
                  onCheckedChange={() => handleToggleFunction(func.id)}
                  disabled={exists}
                />
                <Label
                  htmlFor={id}
                  className={`flex-grow ${exists ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {func.name}
                </Label>
                {exists && (
                  <span className="text-xs text-muted-foreground">
                    (Ya existe)
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <Button
          variant="link"
          className="p-0 h-auto justify-start text-sm"
          onClick={handleSelectAll}
        >
          Seleccionar todas las disponibles
        </Button>

        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => onConfirm(selectedFunctions)}
            disabled={selectedFunctions.length === 0}
          >
            Duplicar ({selectedFunctions.length})
          </Button>
        </div>
      </div>
    </div>
  );
};