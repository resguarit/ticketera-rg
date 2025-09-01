import React from "react";

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
    setSelectedFunctions(
      allFunctions
        .filter(f => !functionsWithTicket.includes(f.id))
        .map(f => f.id)
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.3)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: 24,
          minWidth: 340,
          maxWidth: 400,
          boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
          Duplicar entrada en funciones
        </h2>
        <div style={{ marginBottom: 16, maxHeight: '200px', overflowY: 'auto' }}>
          {allFunctions.map(func => {
            const exists = functionsWithTicket.includes(func.id);
            return (
              <div
                key={func.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  opacity: exists ? 0.5 : 1,
                  marginBottom: 8,
                }}
              >
                <input
                  type="checkbox"
                  id={`func-${func.id}`}
                  checked={selectedFunctions.includes(func.id)}
                  onChange={() => handleToggleFunction(func.id)}
                  disabled={exists}
                />
                <label htmlFor={`func-${func.id}`} style={{ cursor: exists ? 'not-allowed' : 'pointer' }}>{func.name}</label>
                {exists && (
                  <span style={{ fontSize: 12, color: "#888", marginLeft: 8 }}>
                    (Ya existe)
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "6px 16px",
              borderRadius: 4,
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(selectedFunctions)}
            disabled={selectedFunctions.length === 0}
            style={{
              padding: "6px 16px",
              borderRadius: 4,
              border: "none",
              background: selectedFunctions.length === 0 ? "#eee" : "#2563eb",
              color: selectedFunctions.length === 0 ? "#888" : "#fff",
              cursor: selectedFunctions.length === 0 ? "not-allowed" : "pointer",
              fontWeight: 500,
            }}
          >
            Duplicar ({selectedFunctions.length})
          </button>
        </div>
        <button
          type="button"
          onClick={handleSelectAll}
          style={{
            marginTop: 12,
            fontSize: 13,
            color: "#2563eb",
            background: "none",
            border: "none",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Seleccionar todas las disponibles
        </button>
      </div>
    </div>
  );
};