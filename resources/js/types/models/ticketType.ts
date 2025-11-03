import type { EventFunction } from './eventFunction';
import type { Sector } from './sector';

export interface TicketType {
    id: number;
    event_function_id: number;
    sector_id: number;
    name: string;
    description?: string;
    price: number;
    quantity: number;
    quantity_sold: number;
    max_purchase_quantity: number;
    is_hidden: boolean;
    is_bundle: boolean;        
    bundle_quantity: number;   
    sales_start_date: string;
    sales_end_date?: string;
    created_at: string;
    updated_at: string;

    // Campos calculados existentes
    quantity_available?: number;
    sold_percentage?: number;
    total_income?: number;
    real_quantity?: number;           
    real_quantity_sold?: number;      
    tickets_issued?: number;          // ← NUEVO: Entradas realmente emitidas

    // NUEVOS: Campos para tandas (computed attributes del modelo)
    stage_group?: string | null;      // ← NUEVO: Grupo base de la tanda
    stage_number?: number | null;     // ← NUEVO: Número de tanda
}

export interface TicketTypeRelations {
    eventFunction: EventFunction;
    sector: Sector;
}

// NUEVA: Interfaz específica para el formulario de creación
export interface TicketTypeFormData extends Partial<TicketType> {
    // Campos específicos para tandas en el formulario
    create_stages?: boolean;
    stages_count?: number;
    price_increment?: number;
}

// NUEVA: Interfaz para el estado de un grupo de tandas
export interface StageGroupStatus {
    total_stages: number;
    active_stage: TicketType | null;
    completed_stages: number;
    current_stage_number?: number;
    stages_info: Array<{
        name: string;
        number: number;
        price: number;
        available: number;
        is_active: boolean;
        is_completed: boolean;
    }>;
}