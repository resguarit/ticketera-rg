import { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrganizerItem, CredentialsFlash } from '@/types/organizer';
import { UserList } from './users/UserList';
import AddUserModal from './users/AddUserModal';
import { useOrganizerUserActions } from '@/hooks/useOrganizerUserActions';
import { useFlashToasts } from '@/hooks/useFlashToasts';

interface Props { organizer: OrganizerItem; flash?: { success?: string; error?: string }; credentials?: CredentialsFlash | null }

export function OrganizerUsersTab({ organizer, flash, credentials }: Props) {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const { addUserExisting, addUserNew, removeUser, adding, removingIds, errors, createdCredentials, resetCreatedCredentials, setErrors } = useOrganizerUserActions(organizer.id);
  useFlashToasts(flash, credentials, createdCredentials);

  const handleRemove = useCallback((userId: number) => {
    removeUser(userId); // toast central en flash
  }, [removeUser]);

  return (
    <Card className="bg-card border-border shadow-lg">
      <CardHeader className="border-b border-border pb-6">
        <CardTitle className="text-card-foreground flex items-center justify-between">
          <span className="flex items-center"><Users className="w-5 h-5 mr-2" />Usuarios del Organizador</span>
          <Button size="sm" onClick={() => setShowAddUserModal(true)}>Agregar usuario</Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <UserList users={organizer.users} onRemove={handleRemove} removingIds={removingIds} />
      </CardContent>
      <AddUserModal
        open={showAddUserModal}
        onOpenChange={(o: boolean) => { setShowAddUserModal(o); if (!o) { resetCreatedCredentials(); setErrors({}); } }}
        organizerId={organizer.id}
        actions={{ addUserExisting, addUserNew }}
        adding={adding}
        errors={errors}
        createdCredentials={createdCredentials}
        resetCreatedCredentials={resetCreatedCredentials}
      />
    </Card>
  );
}

export default OrganizerUsersTab;
