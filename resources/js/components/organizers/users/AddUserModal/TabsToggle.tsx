import { Button } from '@/components/ui/button';

interface Props { mode: 'existing' | 'new'; setMode(m: 'existing' | 'new'): void }

export function TabsToggle({ mode, setMode }: Props) {
  return (
    <div className="flex space-x-4">
      <Button type="button" variant={mode === 'existing' ? 'default' : 'outline'} onClick={() => setMode('existing')} className="flex-1">Existente</Button>
      <Button type="button" variant={mode === 'new' ? 'default' : 'outline'} onClick={() => setMode('new')} className="flex-1">Nuevo</Button>
    </div>
  );
}

export default TabsToggle;
