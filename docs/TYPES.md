# Análisis de Definiciones de Tipado para Eventos

## Resumen General

Este documento analiza todas las definiciones de tipos relacionadas con **Eventos** encontradas en el proyecto. Se han identificado múltiples definiciones dispersas que necesitan unificación.

---

## 📊 Estadísticas de Ocurrencias

**Total de interfaces/tipos relacionados con Event:** 20+
**Archivos con definiciones:** 12 archivos
**Inconsistencias encontradas:** 7 principales

---

## 🗂️ Archivo Central de Tipos
// resources/js/@types/utils.ts

/**
 * Un tipo genérico que toma un modelo base (TModel) y le añade
 * un conjunto de relaciones (K) de su mapa de relaciones (TRelations).
 */
export type With<
    TModel, 
    TRelations, 
    K extends keyof TRelations
> = TModel & Pick<TRelations, K>;
Desglose de este tipo:

TModel: Será nuestro modelo base (ej: Event).

TRelations: Será nuestro mapa de relaciones (ej: EventRelations).

K: Será un string o una unión de strings con los nombres de las relaciones que queremos cargar (ej: 'organizer' o 'organizer' | 'venue').

& Pick<TRelations, K>: Esto significa: "toma el modelo base Y (&) elige (Pick) del mapa de relaciones solo las propiedades especificadas en K y añádelas al tipo final".

### ✅ `resources/js/types/events.ts` - **ARCHIVO PRINCIPAL**

Este archivo ya contiene una estructura base bien definida:

```typescript
export interface BaseEvent {
    id: number;
    name: string; // Unificar en 'name'
    description: string;
    banner_url: string | null;
    image_url: string | null; // Unificar en 'image_url'
    featured: boolean;
    created_at: string;
    updated_at: string;
}

export interface EventCategory {
    id: number;
    name: string;
    color: string;
}

export interface EventVenue {
    id: number;
    name: string;
    address: string;
    city: string;
    province?: string;
    full_address?: string;
}

export interface EventOrganizer {
    id: number;
    name: string;
    email: string;
}

export interface PublicEvent extends BaseEvent {
    category: EventCategory;
    venue: EventVenue;
    price_range?: string;
    rating?: number;
    reviews?: number;
    functions: PublicEventFunction[];
}

export interface AdminEvent extends BaseEvent {
    category: EventCategory;
    venue: EventVenue;
    organizer: EventOrganizer;
    status: string;
    tickets_sold: number;
    total_tickets: number;
    revenue: number;
    functions: AdminEventFunction[];
}

export interface OrganizerEvent extends BaseEvent {
    category: EventCategory;
    venue: EventVenue;
    functions: OrganizerEventFunction[];
}
```

---

## 🔍 Definiciones Dispersas Encontradas

HECHO ------------------------------------------------
### 1. **`resources/js/pages/public/eventdetail.tsx`**
**Líneas:** 42-60

```typescript
interface EventData {
    id: number;
    title: string; // ⚠️ Inconsistencia: debería ser 'name'
    description: string;
    image: string; // ⚠️ Inconsistencia: debería ser 'image_url'
    date: string; // ⚠️ Redundante con functions
    time: string; // ⚠️ Redundante con functions
    location: string; // ⚠️ Debería usar EventVenue
    city: string; // ⚠️ Debería usar EventVenue
    province?: string;
    full_address?: string;
    category: string; // ⚠️ Debería usar EventCategory
    rating: number;
    reviews: number;
    duration: string;
    ageRestriction: string;
    functions: EventFunction[];
}
```

HECHO ------------------------------------------------
### 2. **`resources/js/pages/admin/events.tsx`**
**Líneas:** 35-57

```typescript
interface EventData {
    id: number;
    title: string; // ⚠️ Inconsistencia: debería ser 'name'
    organizer: EventOrganizer;
    category: string; // ⚠️ Debería usar EventCategory
    date: string | null;
    time: string | null;
    datetime?: string | null;
    location: string; // ⚠️ Debería usar EventVenue
    city: string; // ⚠️ Debería usar EventVenue
    province?: string;
    status: string;
    tickets_sold: number;
    total_tickets: number;
    revenue: number;
    price_range: string;
    created_at: string;
    created_datetime?: string | null;
    image: string | null; // ⚠️ Inconsistencia: debería ser 'image_url'
    featured: boolean;
    functions_count: number;
}
```

### 3. **`resources/js/pages/public/events.tsx`**
**Líneas:** 15-28

```typescript
interface Event {
    id: number;
    title: string; // ⚠️ Inconsistencia: debería ser 'name'
    image: string; // ⚠️ Inconsistencia: debería ser 'image_url'
    date: string;
    time: string;
    location: string; // ⚠️ Debería usar EventVenue
    city: string; // ⚠️ Debería usar EventVenue
    province?: string;
    category: string; // ⚠️ Debería usar EventCategory
    price: number;
    rating: number;
    featured: boolean;
}
```

### 4. **`resources/js/pages/public/checkoutconfirm.tsx`**
**Líneas:** 34-49

```typescript
interface EventData {
    id: number;
    title: string; // ⚠️ Inconsistencia: debería ser 'name'
    image: string; // ⚠️ Inconsistencia: debería ser 'image_url'
    date: string;
    time: string;
    location: string; // ⚠️ Debería usar EventVenue
    city: string; // ⚠️ Debería usar EventVenue
    province?: string;
    full_address?: string;
    selectedTickets: SelectedTicket[];
    function?: EventFunction;
}
```

### 5. **`resources/js/pages/organizer/events/index.tsx`**
**Líneas:** 7-31

```typescript
interface Event {
    id: number;
    name: string; // ✅ Correcto
    description: string;
    image_url: string | null; // ✅ Correcto
    featured: boolean;
    category: {
        id: number;
        name: string;
    }; // ✅ Estructura correcta
    venue: {
        id: number;
        name: string;
        address: string;
    }; // ✅ Estructura correcta
    organizer: {
        id: number;
        name: string;
    };
    functions: Array<{...}>; // ✅ Estructura correcta
}
```

### 6. **`resources/js/components/organizers/event-card.tsx`**
**Líneas:** 17-45

```typescript
interface Event {
    id: number;
    name: string; // ✅ Correcto
    description: string;
    image_url: string | null; // ✅ Correcto
    featured: boolean;
    category: EventCategory; // ✅ Estructura correcta
    venue: EventVenue; // ✅ Estructura correcta
    organizer: EventOrganizer;
    functions: Array<EventFunction>; // ✅ Estructura correcta
}
```

### 7. **`resources/js/types/organizer.ts`**
**Líneas:** 10-18

```typescript
export interface EventItem {
    id: number;
    name: string; // ✅ Correcto
    description: string;
    banner_url: string | null; // ✅ Correcto
    created_at: string;
    category: { id: number; name: string };
    venue: { id: number; name: string; address: string; city: string };
}
```

---

## 🚨 Inconsistencias Principales Identificadas

### 1. **Nombres de Propiedades**
- **`title` vs `name`**: 8 archivos usan `title`, 4 usan `name`
- **`image` vs `image_url` vs `banner_url`**: Múltiples variaciones

### 2. **Estructura de Categorías**
- **Como string**: `category: string` (5 archivos)
- **Como objeto**: `category: { id: number; name: string }` (3 archivos)
- **Como interface**: `category: EventCategory` (2 archivos)

### 3. **Estructura de Venues/Ubicación**
- **Propiedades planas**: `location`, `city`, `province` (6 archivos)
- **Como objeto**: `venue: { ... }` (4 archivos)
- **Como interface**: `venue: EventVenue` (2 archivos)

### 4. **Manejo de Fechas y Horarios**
- **Propiedades directas**: `date`, `time` (6 archivos)
- **A través de functions**: Más consistente con el modelo

### 5. **Tipos de EventFunction**
- **Definiciones locales**: 5 archivos diferentes
- **Falta tipado centralizado**: Para PublicEventFunction, AdminEventFunction, etc.

---

## 📋 Plan de Unificación Recomendado

### Fase 1: Completar el archivo central
1. **Agregar interfaces faltantes**:
   ```typescript
   export interface PublicEventFunction { ... }
   export interface AdminEventFunction { ... }
   export interface OrganizerEventFunction { ... }
   export interface TicketType { ... }
   ```

### Fase 2: Migrar archivos por secciones
1. **Páginas públicas** → Usar `PublicEvent`
2. **Páginas admin** → Usar `AdminEvent`  
3. **Páginas organizer** → Usar `OrganizerEvent`

### Fase 3: Eliminar interfaces locales
1. Reemplazar todas las interfaces `Event`, `EventData` locales
2. Importar desde `@/types/events`

---

## 🎯 Estructura Final IMPLEMENTADA - LIMPIA Y BASADA EN BACKEND

### ✅ **ARCHIVO PRINCIPAL**: `resources/js/types/events.ts`

**Estructura 100% basada en lo que envía el backend PHP:**

```typescript
// ===================================
// CORE TYPES - Basado en estructura PHP
// ===================================

// Modelos base que coinciden exactamente con PHP
export interface BaseEvent { /* ... */ }
export interface EventCategory { /* ... */ }
export interface Provincia { /* ... */ }
export interface Ciudad { /* ... */ }
export interface EventVenue { /* ... */ }
export interface EventOrganizer { /* ... */ }
export interface TicketType { /* ... */ }
export interface EventFunction { /* ... */ }

// ===================================
// STRUCTURE SENT BY CONTROLLERS
// ===================================

// Exactamente como envía PublicEventController@index
export interface PublicEventListItem {
    id: number;
    title: string; // event.name
    image: string; // event.image_url
    date: string;  // primera función
    time: string;  // primera función
    location: string; // venue.name
    city: string;     // venue.ciudad.name
    province?: string; // venue.ciudad.provincia.name
    category: string;  // strtolower(category.name)
    price: number;     // precio mínimo
    rating: number;    // hardcoded 4.5
    featured: boolean;
}

// Exactamente como envía PublicEventController@show
export interface PublicEventDetail {
    id: number;
    title: string;        // event.name
    description: string;
    image: string;        // event.image_url
    location: string;     // venue.name
    city: string;         // venue.ciudad.name
    province?: string;    // venue.ciudad.provincia.name
    full_address: string; // venue.getFullAddressAttribute()
    category: string;     // strtolower(category.name)
    rating: number;       // hardcoded 4.8
    reviews: number;      // hardcoded 1247
    duration: string;     // hardcoded "8 horas"
    ageRestriction: string; // hardcoded "18+"
    functions: EventFunction[];
    // Para compatibilidad
    date: string;
    time: string;
}

// Exactamente como envía AdminEventController@index
export interface AdminEventListItem { /* ... */ }

// Exactamente como envía OrganizerEventController@index
export interface OrganizerEventListItem { /* ... */ }

// ===================================
// PAGE PROPS (exactly as sent by controllers)
// ===================================

export interface PublicEventsPageProps {
    events: PublicEventListItem[];
    categories: CategoryFilter[]; // Como envía el getCategoryIcon()
    cities: string[];             // Como envía Ciudad::pluck('name')
    filters: { /* ... */ };
}

export interface PublicEventDetailPageProps {
    eventData: PublicEventDetail; // Exactamente como se envía
}

export interface AdminEventsPageProps { /* ... */ }
export interface OrganizerEventsPageProps { /* ... */ }
```

### ✅ **ARCHIVO SECUNDARIO**: `resources/js/types/ui.ts`

**Para interfaces de formularios, UI extras y compatibilidad:**

```typescript
// Interfaces para formularios
export interface EventFormData { /* ... */ }
export interface TicketTypeFormData { /* ... */ }

// Interfaces para componentes UI
export interface EventDetailProps { /* ... */ }
export interface EventCardProps { /* ... */ }

// Interfaces de compatibilidad legacy
export interface LegacyEventData { /* ... */ }

// Type guards y helpers
export function hasRequiredEventFields(event: any): boolean { /* ... */ }
```

---

## 🔧 **SOLUCIÓN A LOS ERRORES DE TYPESCRIPT**

### **Problema**: `'eventData.functions' is possibly 'undefined'`

**Análisis del Backend**:
```php
// PublicEventController@show SIEMPRE envía functions
'functions' => $functions, // Array, nunca undefined
```

**Solución**: El tipo `PublicEventDetail` tiene `functions: EventFunction[]` (requerido), no opcional.

### **Problema**: `'eventData.category' is possibly 'undefined'`

**Análisis del Backend**:
```php
// PublicEventController@show SIEMPRE envía category
'category' => strtolower($event->category->name), // String, nunca undefined
```

**Solución**: El tipo `PublicEventDetail` tiene `category: string` (requerido), no opcional.

### **Para usar en `eventdetail.tsx`**:

```typescript
import { PublicEventDetailPageProps } from '@/types/events';

// En lugar de EventDetailProps genérica, usar la específica
export default function EventDetail({ eventData }: PublicEventDetailPageProps) {
    // TypeScript ahora sabe que functions y category siempre existen
    const firstFunction = eventData.functions[0]; // ✅ Sin errores
    
    return (
        <div>
            <span>{eventData.category.toUpperCase()}</span> {/* ✅ Sin errores */}
            {eventData.functions.map((func) => ( /* ✅ Sin errores */
                <div key={func.id}>{func.name}</div>
            ))}
        </div>
    );
}
```

---

## 📋 **PRÓXIMOS PASOS PARA MIGRACIÓN**

### **1. Actualizar componentes específicos**:

```typescript
// ANTES (con tipos genéricos/incorrectos)
import { EventData } from '@/types/events';

// DESPUÉS (con tipos específicos del backend)
import { PublicEventDetail } from '@/types/events';
```

### **2. Migrar por páginas**:

1. **`public/eventdetail.tsx`** → usar `PublicEventDetailPageProps`
2. **`public/events.tsx`** → usar `PublicEventsPageProps`  
3. **`admin/events.tsx`** → usar `AdminEventsPageProps`
4. **`organizer/events/index.tsx`** → usar `OrganizerEventsPageProps`

### **3. Para casos especiales usar `ui.ts`**:

```typescript
// Si necesitas compatibilidad o interfaces híbridas
import { LegacyEventData, EventFormData } from '@/types/ui';
```

---

## ✅ **VENTAJAS DE ESTA IMPLEMENTACIÓN**

1. **🎯 100% Alineado con Backend**: Cada interface coincide exactamente con lo que envía PHP
2. **🔒 Type Safety Garantizado**: No más `possibly undefined` porque coincide con la realidad
3. **🧹 Código Limpio**: Sin campos opcionales innecesarios
4. **🔄 Fácil Mantenimiento**: Si cambias el backend, solo cambias el tipo correspondiente
5. **📦 Separación Clara**: Tipos core vs tipos UI/formularios

**El frontend ahora se adapta al backend, no al revés. ✅**

---

## 📁 Archivos que Requieren Migración

### Prioridad Alta (Usar tipos unificados)
1. `resources/js/pages/public/eventdetail.tsx`
2. `resources/js/pages/admin/events.tsx`
3. `resources/js/pages/public/events.tsx`
4. `resources/js/pages/public/checkoutconfirm.tsx`

### Prioridad Media (Ajustar imports)
5. `resources/js/pages/organizer/events/index.tsx`
6. `resources/js/components/organizers/event-card.tsx`
7. `resources/js/pages/admin/events/show.tsx`

### Prioridad Baja (Ya están bien estructurados)
8. `resources/js/types/organizer.ts` - ✅ Parcialmente compatible

---

## 🔄 Alineación con Modelos PHP

### Modelo Event.php
```php
protected $fillable = [
    'organizer_id',
    'category_id', 
    'venue_id',
    'name', // ✅ Coincide con tipado unificado
    'description',
    'banner_url', // ⚠️ Se mapea a image_url en frontend
    'featured',
];
```

### Relaciones identificadas
- `category()` → `EventCategory`
- `venue()` → `EventVenue` 
- `organizer()` → `EventOrganizer`
- `functions()` → `EventFunction[]`

---

**Última actualización:** 21 de agosto de 2025
**Estado:** Análisis completado - Pendiente implementación de unificación