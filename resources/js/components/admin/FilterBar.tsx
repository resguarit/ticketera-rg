import { Search, Filter, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilterConfig } from '@/types/admin';
import { useEffect, useRef } from 'react';

interface FilterBarProps {
  config?: FilterConfig;
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
  onClearFilters?: () => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  searchDebounceMs?: number; // Nuevo prop para controlar el debounce
}

export function FilterBar({
  config,
  searchTerm = '',
  onSearchChange,
  selectedStatus = 'all',
  onStatusChange,
  selectedCategory = 'all',
  onCategoryChange,
  selectedCity = 'all',
  onCityChange,
  customFilterValues = {},
  onCustomFilterChange,
  onClearFilters,
  onKeyPress,
  searchDebounceMs = 500, // Debounce de 500ms por defecto
}: FilterBarProps) {
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (!config) return null;

  const defaultStatusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' },
  ];

  const statusOptions = config.statusOptions || defaultStatusOptions;

  // Función para manejar el cambio de búsqueda con debounce
  const handleSearchChange = (value: string) => {
    // Limpiar el timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Actualizar el estado inmediatamente para mostrar el texto
    onSearchChange?.(value);

    // Solo aplicar la búsqueda después del debounce si hay texto o si se limpia
    if (value.trim() === '') {
      // Si se limpia la búsqueda, aplicar inmediatamente
      return;
    }

    // Configurar un nuevo timeout para aplicar la búsqueda
    searchTimeoutRef.current = setTimeout(() => {
      // La búsqueda se aplicará automáticamente al cambiar el estado
      // No necesitamos hacer nada aquí porque el useEffect en el componente padre se encargará
    }, searchDebounceMs);
  };

  // Limpiar timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Determinar si hay filtros activos (para mostrar el botón de limpiar)
  const hasActiveFilters = 
    searchTerm !== '' ||
    selectedStatus !== 'all' ||
    selectedCategory !== 'all' ||
    selectedCity !== 'all' ||
    Object.values(customFilterValues).some(value => value !== 'all');

  return (
<div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
        <Input
          placeholder={config.searchPlaceholder || "Buscar..."}
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyPress={onKeyPress}
          className="pl-10 bg-white border-gray-300 text-black placeholder:text-gray-500"
        />
      </div>

      {/* Filtro de Estado */}
      {config.showStatusFilter && (
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="bg-white border-gray-300 text-black">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-300">
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Filtro de Categoría */}
      {config.showCategoryFilter && config.categoryOptions && (
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="bg-white border-gray-300 text-black">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-300">
            <SelectItem value="all">Todas las categorías</SelectItem>
            {config.categoryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Filtro de Ciudad */}
      {config.showCityFilter && config.cityOptions && (
        <Select value={selectedCity} onValueChange={onCityChange}>
          <SelectTrigger className="bg-white border-gray-300 text-black">
            <SelectValue placeholder="Ciudad" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-300">
            <SelectItem value="all">Todas las ciudades</SelectItem>
            {config.cityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Filtros Personalizados */}
      {config.customFilters?.map((filter) => (
        <Select 
          key={filter.key}
          value={customFilterValues[filter.key] || 'all'} 
          onValueChange={(value) => onCustomFilterChange?.(filter.key, value)}
        >
          <SelectTrigger className="bg-white border-gray-300 text-black">
            <SelectValue placeholder={filter.placeholder} />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-300">
            <SelectItem value="all">Todos</SelectItem>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {/* Solo mostrar el botón de limpiar si hay filtros activos */}
      {hasActiveFilters && (
        <Button 
          onClick={onClearFilters}
          variant="outline"
          className="border-gray-300 text-black hover:bg-gray-50 bg-white"
          title="Limpiar todos los filtros"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Limpiar Filtros
        </Button>
      )}

      {/* Si no hay filtros activos, mostrar un div vacío para mantener el grid */}
      {!hasActiveFilters && <div></div>}
    </div>
  );
}
