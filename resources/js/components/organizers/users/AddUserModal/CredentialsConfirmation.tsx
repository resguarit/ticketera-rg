import { ClipboardCopy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CredentialsFlash } from '@/types/organizer';
import { toast } from 'sonner';

interface Props { credentials: CredentialsFlash; onClose(): void; onCreateAnother(): void }

export function CredentialsConfirmation({ credentials, onClose, onCreateAnother }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-3">
        <CheckCircle2 className="w-14 h-14 text-green-500" />
        <h3 className="text-xl font-semibold text-card-foreground">Usuario creado correctamente</h3>
        <p className="text-sm text-muted-foreground max-w-sm">Comparte estas credenciales con el nuevo usuario. Debe cambiarlas tras iniciar sesión.</p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div className="p-4 rounded-lg border border-border bg-muted/50">
          <div className="text-xs font-medium text-muted-foreground mb-1">Email</div>
          <div className="font-mono text-sm break-all">{credentials.email}</div>
        </div>
        <div className="p-4 rounded-lg border border-border bg-muted/50">
          <div className="text-xs font-medium text-muted-foreground mb-1">Contraseña</div>
          <div className="font-mono text-sm break-all">{credentials.password}</div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Button type="button" variant="outline" className="border-border" onClick={() => { navigator.clipboard.writeText(`Email: ${credentials.email}\nPassword: ${credentials.password}`); toast.success('Credenciales copiadas'); }}>
          <ClipboardCopy className="w-4 h-4 mr-2" /> Copiar
        </Button>
        <div className="flex gap-2 ml-auto">
          <Button type="button" variant="outline" className="border-border" onClick={onCreateAnother}>Crear otro</Button>
          <Button type="button" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>
  );
}

export default CredentialsConfirmation;
