import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Phone } from 'lucide-react';
import { UserItem } from '@/types/organizer';
import { getRoleText, getUserFullName, formatDate } from '@/utils/userFormat';
import RemoveUserDialog from '@/components/organizers/users/RemoveUserDialog';

interface Props { user: UserItem; onRemove(): void }

export function UserCard({ user, onRemove }: Props) {
  return (
    <div className="p-4 bg-muted rounded-lg hover:bg-accent transition-colors border border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user.person.name.charAt(0)}{user.person.last_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-card-foreground">{getUserFullName(user)}</h3>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center"><Mail className="w-3 h-3 mr-1" />{user.email}</span>
              {user.person.phone && <span className="flex items-center"><Phone className="w-3 h-3 mr-1" />{user.person.phone}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">{getRoleText(user.role)}</Badge>
          <span className="text-xs text-muted-foreground">Desde {formatDate(user.created_at)}</span>
          <RemoveUserDialog onConfirm={onRemove} />
        </div>
      </div>
    </div>
  );
}

export default UserCard;
