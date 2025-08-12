import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SearchUserResult { id: number; name: string; email: string }

interface Props {
  selectedUserId: number | null;
  setSelectedUserId(id: number | null): void;
  term: string;
  setTerm(v: string): void;
  results: SearchUserResult[];
}

export function AddExistingUserForm({ selectedUserId, setSelectedUserId, term, setTerm, results }: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="searchUser">Buscar usuario</Label>
        <Input id="searchUser" placeholder="Nombre o email" value={term} onChange={(e) => setTerm(e.target.value)} />
        <div className="max-h-48 overflow-y-auto border border-border rounded-md divide-y divide-border">
          {results.length === 0 && term && (
            <div className="p-3 text-sm text-muted-foreground">Sin resultados</div>
          )}
          {results.map(u => (
            <button type="button" key={u.id} onClick={() => setSelectedUserId(u.id)} className={`w-full text-left p-3 text-sm hover:bg-accent flex items-center justify-between ${selectedUserId === u.id ? 'bg-accent' : ''}`}>
              <span className="truncate">{u.name}</span>
              <span className="text-muted-foreground ml-2 truncate">{u.email}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AddExistingUserForm;
