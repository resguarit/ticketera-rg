import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import TabsToggle from './TabsToggle';
import AddExistingUserForm from './AddExistingUserForm';
import AddNewUserForm from './AddNewUserForm';
import CredentialsConfirmation from './CredentialsConfirmation';
import { CredentialsFlash } from '@/types/organizer';
import { Button } from '@/components/ui/button';
import { useSearchUsers } from '@/hooks/useSearchUsers';

interface Props {
  open: boolean;
  onOpenChange(o: boolean): void;
  organizerId: number;
  actions: { addUserExisting(userId: number, cb?: () => void): void; addUserNew(payload: { email: string; person: any }, cb?: () => void): void };
  adding: boolean;
  errors: Record<string, string>;
  createdCredentials: CredentialsFlash | null;
  resetCreatedCredentials(): void;
}

export default function AddUserModal({ open, onOpenChange, organizerId, actions, adding, errors, createdCredentials, resetCreatedCredentials }: Props) {
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newUser, setNewUser] = useState({ name: '', last_name: '', dni: '', phone: '', address: '', email: '' });
  const search = useSearchUsers(organizerId);

  useEffect(() => {
    if (!open) {
      setMode('existing');
      setSelectedUserId(null);
      setNewUser({ name: '', last_name: '', dni: '', phone: '', address: '', email: '' });
    }
  }, [open]);

  const handleExistingSubmit = () => {
    if (!selectedUserId) return;
    actions.addUserExisting(selectedUserId, () => onOpenChange(false));
  };

  const handleNewSubmit = () => {
    const v = newUser;
    actions.addUserNew({ email: v.email, person: { name: v.name, last_name: v.last_name, dni: v.dni || null, phone: v.phone || null, address: v.address || null } });
  };

  const closeWithReset = () => { resetCreatedCredentials(); onOpenChange(false); setNewUser({ name: '', last_name: '', dni: '', phone: '', address: '', email: '' }); setMode('existing'); setSelectedUserId(null); };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetCreatedCredentials(); }}>
      <DialogContent className="max-w-xl bg-card border-border">
        {!createdCredentials && (
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Agregar usuario</DialogTitle>
            <DialogDescription className="text-muted-foreground">Asigna un usuario existente o crea uno nuevo.</DialogDescription>
          </DialogHeader>
        )}
        {createdCredentials ? (
          <CredentialsConfirmation
            credentials={createdCredentials}
            onCreateAnother={() => { resetCreatedCredentials(); setMode('new'); setNewUser({ name: '', last_name: '', dni: '', phone: '', address: '', email: '' }); }}
            onClose={closeWithReset}
          />
        ) : (
          <div className="space-y-6">
            <TabsToggle mode={mode} setMode={(m) => { setMode(m); }} />
            {mode === 'existing' && (
              <AddExistingUserForm
                selectedUserId={selectedUserId}
                setSelectedUserId={setSelectedUserId}
                term={search.term}
                setTerm={search.setTerm}
                results={search.results as any}
              />
            )}
            {mode === 'new' && (
              <AddNewUserForm
                values={newUser as any}
                setValues={setNewUser as any}
                errors={errors}
              />
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border">Cancelar</Button>
              {mode === 'existing' && <Button type="button" onClick={handleExistingSubmit} disabled={adding}>{adding ? 'Guardando...' : 'Guardar'}</Button>}
              {mode === 'new' && <Button type="button" onClick={handleNewSubmit} disabled={adding}>{adding ? 'Guardando...' : 'Guardar'}</Button>}
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
