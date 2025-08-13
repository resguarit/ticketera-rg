import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, ClipboardCopy, RefreshCw } from 'lucide-react';
import { CredentialsFlash } from '@/types/organizer';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange(o: boolean): void;
  credentials: CredentialsFlash | null;
  setCredentials(c: CredentialsFlash | null): void;
  organizerId: number;
  userId: number | null;
}

export default function ViewCredentialsModal({ open, onOpenChange, credentials, setCredentials, organizerId, userId }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegenerate = () => {
    if (!userId) return;
    setLoading(true);
    router.post(route('admin.organizers.regenerate-credentials', { organizerId, userId }), {}, {
      preserveScroll: true,
      onSuccess: (page: any) => {
        setLoading(false);
        // @ts-ignore
        const creds = page.props.credentials;
        if (creds) {
          setCredentials({ email: creds.email, password: creds.password });
          toast.success('Credenciales regeneradas'); // sin mostrar detalles aquí (ya se ven)
        }
      },
      onError: () => { setLoading(false); toast.error('No se pudieron regenerar'); }
    });
  };

  const copy = () => {
    if (!credentials) return;
    navigator.clipboard.writeText(`Email: ${credentials.email}\nPassword: ${credentials.password || ''}`);
    toast.success('Credenciales copiadas');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground flex items-center justify-between">Credenciales</DialogTitle>
        </DialogHeader>
        {credentials ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Email</div>
                <div className="p-2 rounded border border-border bg-muted/50 text-sm font-mono break-all">{credentials.email}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1 flex items-center justify-between">
                  <span>Contraseña</span>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setShowPassword(s => !s)}>
                    {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                  </Button>
                </div>
                <div className="p-2 rounded border border-border bg-muted/50 text-sm font-mono break-all select-all">
                  {credentials.password ? (showPassword ? credentials.password : '********') : <span className="italic text-muted-foreground">(sin contraseña almacenada - regenerar)</span>}
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" className="border-border" onClick={copy} disabled={!credentials}><ClipboardCopy className="w-4 h-4 mr-1"/>Copiar</Button>
              <Button variant="outline" className="border-border" onClick={handleRegenerate} disabled={loading || !userId}><RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`}/>Regenerar</Button>
              <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Selecciona un usuario.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
