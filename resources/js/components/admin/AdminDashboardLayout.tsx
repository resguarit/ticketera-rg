import { Button } from '@/components/ui/button';
import { StatCard } from './StatCard';
import { FilterBar } from './FilterBar';
import { AdminDashboardLayoutProps } from '@/types/admin';

export function AdminDashboardLayout({
  title,
  description,
  stats,
  filterConfig,
  primaryAction,
  secondaryActions = [],
  children,
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedCategory,
  onCategoryChange,
  selectedCity,
  onCityChange,
  customFilterValues,
  onCustomFilterChange,
  onApplyFilters,
  onClearFilters,
  onKeyPress,
  hasPendingFilters,
}: AdminDashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">
              {title}
            </h1>
            <p className="text-gray-600 text-lg">
              {description}
            </p>
          </div>
          
          {(primaryAction || secondaryActions.length > 0) && (
            <div className="flex items-center space-x-4">
              {/* Botones secundarios */}
              {secondaryActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button 
                    key={index}
                    variant={action.variant || "outline"}
                    onClick={action.onClick}
                    className="border-gray-300 text-black hover:bg-gray-50 bg-white"
                  >
                    {Icon && <Icon className="w-4 h-4 mr-2" />}
                    {action.label}
                  </Button>
                );
              })}
              
              {/* Botón primario */}
              {primaryAction && (
                <Button 
                  onClick={primaryAction.onClick}
                  variant={primaryAction.variant || "default"}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  {primaryAction.icon && <primaryAction.icon className="w-4 h-4 mr-2" />}
                  {primaryAction.label}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Filter Bar */}
        <FilterBar
          config={filterConfig}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          selectedStatus={selectedStatus}
          onStatusChange={onStatusChange}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
          selectedCity={selectedCity}
          onCityChange={onCityChange}
          customFilterValues={customFilterValues}
          onCustomFilterChange={onCustomFilterChange}
          onApplyFilters={onApplyFilters}
          onClearFilters={onClearFilters}
          onKeyPress={onKeyPress}
          hasPendingFilters={hasPendingFilters}
        />

        {/* Main Content */}
        {children}
      </div>
    </div>
  );
}
