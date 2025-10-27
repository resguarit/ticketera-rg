import { Search, Filter, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilterConfig } from '@/types/admin';

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
  onApplyFilters?: () => void;
  onClearFilters?: () => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  hasPendingFilters?: boolean;
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
  onApplyFilters,
  onClearFilters,
  onKeyPress,
  hasPendingFilters = false,
}: FilterBarProps) {
  if (!config) return null;

  const defaultStatusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' },
  ];

  const statusOptions = config.statusOptions || defaultStatusOptions;

  return (

        <div className="w-full grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <Input
              placeholder={config.searchPlaceholder || "Buscar..."}
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
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

            {/* Botón Aplicar Filtros */}
            <Button 
              onClick={onApplyFilters}
              className={`text-white hover:opacity-90 flex-1 ${
                hasPendingFilters 
                  ? 'bg-orange-500 hover:bg-orange-600 animate-pulse' 
                  : 'bg-primary hover:bg-primary/90'
              }`}
            >
              <Play className="w-4 h-4 mr-2" />
              {hasPendingFilters ? 'Aplicar Cambios' : 'Aplicar'}
            </Button>

            {/* Botón Limpiar */}
            <Button 
              onClick={onClearFilters}
              variant="outline"
              className="border-gray-300 text-black hover:bg-gray-50 bg-white flex-1"
            >
              <Filter className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
        </div>

  );
}
