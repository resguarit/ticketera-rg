# Sistema de Layout Reutilizable para Dashboard de Admin

Este documento describe el sistema de componentes reutilizables creado para eliminar código duplicado en las páginas del dashboard de administración.

## Estructura de Archivos

```
resources/js/
├── components/admin/
│   ├── AdminDashboardLayout.tsx  # Layout principal reutilizable
│   ├── StatCard.tsx             # Componente para tarjetas de estadísticas
│   ├── FilterBar.tsx            # Componente para barra de filtros
│   └── index.ts                 # Exportaciones centralizadas
├── types/
│   └── admin.ts                 # Tipos TypeScript para el sistema
└── pages/admin/
    └── events.tsx               # Página refactorizada (ejemplo)
```

## Componentes Principales

### 1. AdminDashboardLayout

Componente principal que envuelve toda la estructura del dashboard de admin.

**Características:**
- Header con título, descripción y botones de acción
- Grid responsive de tarjetas de estadísticas
- Barra de filtros configurable
- Contenido principal como children

**Props principales:**
- `title`: Título de la página
- `description`: Descripción de la página
- `stats`: Array de configuraciones para las tarjetas de estadísticas
- `filterConfig`: Configuración de los filtros disponibles
- `primaryAction`: Botón de acción principal
- `secondaryActions`: Array de botones secundarios

### 2. StatCard

Componente reutilizable para mostrar estadísticas con iconos y colores temáticos.

**Variantes disponibles:**
- `primary`: Azul primario
- `success`: Verde (para estados activos/exitosos)
- `warning`: Naranja/Amarillo (para advertencias)
- `info`: Azul información
- `danger`: Rojo (para errores/peligros)

**Formatos de valor:**
- `number`: Formato numérico con separadores de miles
- `currency`: Formato monetario con símbolo $
- `percentage`: Formato porcentual con símbolo %

### 3. FilterBar

Componente para la barra de filtros con configuración flexible.

**Filtros soportados:**
- Búsqueda con icono
- Filtro de estado (configurable)
- Filtro de categoría (opcional)
- Filtro de ciudad (opcional)
- Filtros personalizados adicionales
- Botón limpiar filtros

## Uso del Sistema

### Ejemplo Básico

```typescript
import { AdminDashboardLayout, StatCardProps, FilterConfig } from '@/components/admin';
import { Calendar, CheckCircle, Users, DollarSign, Download } from 'lucide-react';

// Configurar estadísticas
const stats: StatCardProps[] = [
    {
        title: "Total Eventos",
        value: eventStats.total,
        icon: Calendar,
        variant: "primary",
    },
    {
        title: "Eventos Activos", 
        value: eventStats.active,
        icon: CheckCircle,
        variant: "success",
    },
    {
        title: "Tickets Vendidos",
        value: eventStats.totalTicketsSold,
        icon: Users,
        variant: "warning",
    },
    {
        title: "Ingresos Totales",
        value: eventStats.totalRevenue,
        icon: DollarSign,
        variant: "info",
        format: "currency",
    },
];

// Configurar filtros
const filterConfig: FilterConfig = {
    searchPlaceholder: "Buscar eventos...",
    showStatusFilter: true,
    showCategoryFilter: true,
    showCityFilter: true,
    statusOptions: [
        { value: "all", label: "Todos los estados" },
        { value: "active", label: "Activos" },
        { value: "inactive", label: "Inactivos" },
    ],
    categoryOptions: categories.map(cat => ({ value: cat, label: cat })),
    cityOptions: cities.map(city => ({ value: city, label: city })),
};

// Usar el layout
<AdminDashboardLayout
    title="Gestión de Eventos"
    description="Administra todos los eventos de la plataforma"
    stats={stats}
    filterConfig={filterConfig}
    secondaryActions={[
        {
            label: "Exportar",
            icon: Download,
            onClick: () => handleExport(),
            variant: "outline"
        }
    ]}
    searchTerm={searchTerm}
    onSearchChange={setSearchTerm}
    selectedStatus={selectedStatus}
    onStatusChange={setSelectedStatus}
    // ... otros props de filtros
    onApplyFilters={handleFilters}
    onClearFilters={handleClearFilters}
    onKeyPress={handleKeyPress}
>
    {/* Contenido específico de la página */}
    <YourCustomTable />
</AdminDashboardLayout>
```

## Configuración de Filtros Avanzada

### Filtros Personalizados

```typescript
const filterConfig: FilterConfig = {
    searchPlaceholder: "Buscar...",
    showStatusFilter: true,
    customFilters: [
        {
            key: "priority",
            placeholder: "Prioridad",
            options: [
                { value: "high", label: "Alta" },
                { value: "medium", label: "Media" },
                { value: "low", label: "Baja" },
            ]
        }
    ]
};
```

### Opciones de Estado Personalizadas

```typescript
const filterConfig: FilterConfig = {
    statusOptions: [
        { value: "all", label: "Todos" },
        { value: "pending", label: "Pendientes" },
        { value: "approved", label: "Aprobados" },
        { value: "rejected", label: "Rechazados" },
    ]
};
```

## Beneficios del Sistema

1. **Eliminación de código duplicado**: Una sola implementación reutilizable
2. **Consistencia visual**: Todas las páginas siguen el mismo patrón
3. **Mantenibilidad**: Cambios centralizados afectan todas las páginas
4. **Flexibilidad**: Configuración adaptable a diferentes necesidades
5. **Tipado fuerte**: TypeScript previene errores de configuración
6. **Responsive**: Grid adaptativo para diferentes tamaños de pantalla

## Extensibilidad

### Para añadir una nueva página de admin:

1. Configurar las estadísticas específicas de la página
2. Configurar los filtros necesarios
3. Implementar las funciones de manejo de filtros
4. Envolver el contenido específico en `AdminDashboardLayout`

### Para añadir nuevas variantes de StatCard:

1. Añadir la nueva variante al tipo `StatCardVariant` en `admin.ts`
2. Añadir la clase CSS correspondiente a `STAT_CARD_VARIANTS`

### Para añadir nuevos tipos de filtros:

1. Extender la interfaz `FilterConfig` en `admin.ts`
2. Implementar la lógica en el componente `FilterBar`
3. Añadir las props correspondientes a `AdminDashboardLayoutProps`

## Migración de Páginas Existentes

Para migrar una página existente al nuevo sistema:

1. Identificar las 4 secciones: header, stats, filtros, contenido
2. Extraer la configuración de estadísticas
3. Extraer la configuración de filtros
4. Mover la lógica de filtros a los handlers correspondientes
5. Envolver el contenido específico en el nuevo layout
6. Eliminar el código duplicado del header, stats y filtros

## Próximos Pasos

- Migrar página de usuarios (`users.tsx`)
- Migrar página de organizadores (cuando exista)
- Añadir soporte para ordenamiento en filtros
- Implementar funcionalidad de exportación genérica
- Añadir animaciones de transición entre estados
