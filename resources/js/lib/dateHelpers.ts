/**
 * Formatea una fecha en formato Y-m-d a dd/mm/yyyy
 */
export const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Sin fecha';
    
    // Si ya viene formateada desde el backend como Y-m-d, convertirla a formato dd/mm/yyyy
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }
    
    // Si viene en otro formato, intentar parsearla
    try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
    } catch (error) {
        console.warn('Error formateando fecha:', dateString);
    }
    
    return dateString; // Retornar tal como viene si no se puede formatear
};

/**
 * Formatea una fecha en un formato más legible (ej: "15 de marzo de 2024")
 */
export const formatDateReadable = (dateString: string | null): string => {
    if (!dateString) return 'Sin fecha';
    
    try {
        let date: Date;
        
        // Si viene como Y-m-d, parsear manualmente para evitar problemas de timezone
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = dateString.split('-');
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
            date = new Date(dateString);
        }
        
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
    } catch (error) {
        console.warn('Error formateando fecha:', dateString);
    }
    
    return dateString;
};

/**
 * Formatea una fecha y hora para mostrar en formato corto
 */
export const formatDateTime = (dateString: string | null, timeString: string | null): string => {
    const formattedDate = formatDate(dateString);
    
    if (formattedDate === 'Sin fecha') return formattedDate;
    if (!timeString) return formattedDate;
    
    return `${formattedDate} • ${timeString}`;
};

/**
 * Calcula el tiempo relativo desde una fecha (ej: "hace 3 días")
 */
export const formatRelativeTime = (dateString: string | null): string => {
    if (!dateString) return 'Fecha desconocida';
    
    try {
        let date: Date;
        
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = dateString.split('-');
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
            date = new Date(dateString);
        }
        
        if (isNaN(date.getTime())) return dateString;
        
        const now = new Date();
        const diffInMilliseconds = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
        
        if (diffInDays === 0) return 'Hoy';
        if (diffInDays === 1) return 'Ayer';
        if (diffInDays < 7) return `Hace ${diffInDays} días`;
        if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
        if (diffInDays < 365) return `Hace ${Math.floor(diffInDays / 30)} meses`;
        
        return `Hace ${Math.floor(diffInDays / 365)} años`;
    } catch (error) {
        console.warn('Error calculando tiempo relativo:', dateString);
        return dateString;
    }
};

/**
 * Formatea una fecha para uso en inputs de tipo date (formato: YYYY-MM-DD)
 */
export const formatDateForInput = (dateString: string | null): string => {
    if (!dateString) return '';
    
    // Si ya está en formato Y-m-d, retornarla tal como está
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
    }
    
    try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    } catch (error) {
        console.warn('Error formateando fecha para input:', dateString);
    }
    
    return '';
};

/**
 * Convierte una fecha en formato dd/mm/yyyy a Y-m-d
 */
export const parseDateFromInput = (dateString: string): string => {
    if (!dateString) return '';
    
    // Si ya está en formato Y-m-d
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
    }
    
    // Si está en formato dd/mm/yyyy
    if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return dateString;
};

/**
 * Verifica si una fecha es válida
 */
export const isValidDate = (dateString: string | null): boolean => {
    if (!dateString) return false;
    
    try {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    } catch {
        return false;
    }
};

/**
 * Compara dos fechas y retorna si la primera es mayor que la segunda
 */
export const isDateAfter = (date1: string | null, date2: string | null): boolean => {
    if (!date1 || !date2) return false;
    
    try {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return d1.getTime() > d2.getTime();
    } catch {
        return false;
    }
};

/**
 * Retorna el primer día del mes para una fecha dada
 */
export const getFirstDayOfMonth = (dateString: string | null): string => {
    if (!dateString) return '';
    
    try {
        let date: Date;
        
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month] = dateString.split('-');
            date = new Date(parseInt(year), parseInt(month) - 1, 1);
        } else {
            date = new Date(dateString);
            date.setDate(1);
        }
        
        return date.toISOString().split('T')[0];
    } catch {
        return '';
    }
};

/**
 * Retorna el último día del mes para una fecha dada
 */
export const getLastDayOfMonth = (dateString: string | null): string => {
    if (!dateString) return '';
    
    try {
        let date: Date;
        
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month] = dateString.split('-');
            date = new Date(parseInt(year), parseInt(month), 0); // Día 0 del siguiente mes = último día del mes actual
        } else {
            date = new Date(dateString);
            date.setMonth(date.getMonth() + 1, 0);
        }
        
        return date.toISOString().split('T')[0];
    } catch {
        return '';
    }
};

/**
 * Compara dos fechas para ordenamiento
 */
export const compareDates = (dateA: string, dateB: string): number => {
  return new Date(dateA).getTime() - new Date(dateB).getTime();
};