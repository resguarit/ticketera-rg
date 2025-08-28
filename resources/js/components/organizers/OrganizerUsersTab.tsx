import { useState, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Organizer, CredentialsFlash, User } from '@/types';
import { UserList } from './users/UserList';
import AddUserModal from './users/AddUserModal';
import ViewCredentialsModal from '@/components/organizers/users/ViewCredentialsModal';
import { useOrganizerUserActions } from '@/hooks/useOrganizerUserActions';
import { useFlashToasts } from '@/hooks/useFlashToasts';

interface OrganizerItem extends Organizer {
  users: User[];
}

interface Props { organizer: OrganizerItem; flash?: { success?: string; error?: string }; credentials?: CredentialsFlash | null }

export function OrganizerUsersTab({ organizer, flash, credentials }: Props) {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [currentCreds, setCurrentCreds] = useState<CredentialsFlash | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const { addUserExisting, addUserNew, removeUser, adding, removingIds, errors, createdCredentials, resetCreatedCredentials, setErrors } = useOrganizerUserActions(organizer.id);
  useFlashToasts(flash, credentials, createdCredentials);

  const handleRemove = useCallback((userId: number) => {
    removeUser(userId); // toast central en flash
  }, [removeUser]);

  useEffect(() => {
    // When coming back from server with regenerated credentials
    if (credentials && (credentials as any) && (credentials as any).password && showCredentialsModal) {
      setCurrentCreds(credentials);
    }
  }, [credentials, showCredentialsModal]);

  return (
    <Card className="bg-card border-border shadow-lg">
      <CardHeader className="border-b border-border pb-6">
        <CardTitle className="text-card-foreground flex items-center justify-between">
          <span className="flex items-center"><Users className="w-5 h-5 mr-2" />Usuarios del Organizador</span>
          <Button size="sm" onClick={() => setShowAddUserModal(true)}>Agregar usuario</Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <UserList users={organizer.users} onRemove={handleRemove} removingIds={removingIds} onViewCredentials={(u) => { setCurrentCreds({ email: u.email, password: (credentials && (credentials as any).email === u.email) ? (credentials as any).password : '' }); setCurrentUserId(u.id); setShowCredentialsModal(true); }} />
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
      <ViewCredentialsModal
        open={showCredentialsModal}
        onOpenChange={(o: boolean) => { setShowCredentialsModal(o); if(!o){ setCurrentCreds(null); setCurrentUserId(null);} }}
        credentials={currentCreds}
        userId={currentUserId}
        organizerId={organizer.id}
        setCredentials={setCurrentCreds}
      />
    </Card>
  );
}

export default OrganizerUsersTab;
