import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

// Tipos para las tarjetas de estadísticas
export interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant: 'primary' | 'success' | 'warning' | 'info' | 'danger';
  format?: 'number' | 'currency' | 'percentage';
}

// Variantes de color para las tarjetas de estadísticas
export type StatCardVariant = 'primary' | 'success' | 'warning' | 'info' | 'danger';

// Configuración para filtros
export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  searchPlaceholder?: string;
  showStatusFilter?: boolean;
  showCategoryFilter?: boolean;
  showCityFilter?: boolean;
  statusOptions?: FilterOption[];
  categoryOptions?: FilterOption[];
  cityOptions?: FilterOption[];
  customFilters?: {
    key: string;
    placeholder: string;
    options: FilterOption[];
  }[];
}

// Configuración para botones de acción
export interface ActionButton {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
}

// Props principales del layout de dashboard de admin
export interface AdminDashboardLayoutProps {
  title: string;
  description: string;
  stats: StatCardProps[];
  filterConfig?: FilterConfig;
  primaryAction?: ActionButton;
  secondaryActions?: ActionButton[];
  children: ReactNode;
  
  // Props para manejo de filtros
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  selectedStatus?: string;
  onStatusChange?: (value: string) => void;
  selectedCategory?: string;
  onCategoryChange?: (value: string) => void;
  selectedCity?: string;
  onCityChange?: (value: string) => void;
  customFilterValues?: Record<string, string>;
  onCustomFilterChange?: (key: string, value: string) => void;
  
  // Funciones de filtros
  onApplyFilters?: () => void;
  onClearFilters?: () => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  hasPendingFilters?: boolean;
}

// Mapa de variantes de colores para las tarjetas
export const STAT_CARD_VARIANTS: Record<StatCardVariant, string> = {
  primary: 'bg-primary',
  success: 'bg-chart-2', // Verde
  warning: 'bg-chart-3', // Naranja/Amarillo
  info: 'bg-chart-4',    // Azul
  danger: 'bg-red-500',  // Rojo
};
