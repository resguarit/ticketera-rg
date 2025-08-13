import { UserItem } from '@/types/organizer';
import { UserCard } from '@/components/organizers/users/UserCard';
import { UserCheck } from 'lucide-react';

interface Props { users: UserItem[]; onRemove(userId: number): void; removingIds: Record<number, boolean>; onViewCredentials?(user: UserItem): void }

export function UserList({ users, onRemove, onViewCredentials }: Props) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <UserCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No hay usuarios</h3>
        <p className="text-muted-foreground">Este organizador aún no tiene usuarios asignados.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {users.map(user => (
        <UserCard key={user.id} user={user} onRemove={() => onRemove(user.id)} onViewCredentials={() => onViewCredentials && onViewCredentials(user)} />
      ))}
    </div>
  );
}
