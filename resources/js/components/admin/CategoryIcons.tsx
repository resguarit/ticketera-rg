import {
    Tag, Music, Theater, Trophy, Presentation, Utensils, Laugh, Users,
    Palette as PaletteIcon, LucideIcon
} from 'lucide-react';

// Helper para mapear nombres de iconos a componentes de Lucide
export const iconMap: { [key: string]: LucideIcon } = {
    music: Music,
    theater: Theater,
    trophy: Trophy,
    presentation: Presentation,
    utensils: Utensils,
    palette: PaletteIcon,
    laugh: Laugh,
    users: Users,
};

export const DynamicIcon = ({ name, ...props }: { name: string } & React.ComponentProps<LucideIcon>) => {
    // Usar el icono 'Tag' como fallback si el nombre no se encuentra
    const IconComponent = iconMap[name] || Tag;
    return <IconComponent {...props} />;
};