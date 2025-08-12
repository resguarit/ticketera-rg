import { useState, useEffect, useRef } from 'react';
import {
  Building,
  Mail,
  Phone,
  Calendar,
  Users,
  MapPin,
  Eye,
  Edit,
  Star,
  UserCheck,
  Ticket,
  CheckCircle2,
  ClipboardCopy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface EventItem {
  id: number;
  name: string;
  description: string;
  banner_url: string | null;
  created_at: string;
  category: { id: number; name: string };
  venue: { id: number; name: string; address: string; city: string };
}

interface UserItem {
  id: number;
  email: string;
  role: string;
  created_at: string;
  person: { id: number; name: string; last_name: string; phone: string | null };
}

interface OrganizerItem {
  id: number;
  name: string;
  referring: string;
  email: string;
  phone: string;
  logo_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  tax: string | null;
  created_at: string;
  events: EventItem[];
  users: UserItem[];
}

interface PageProps extends Record<string, any> {
  organizer: OrganizerItem;
  flash?: { success?: string; error?: string };
  credentials?: { email: string; password: string } | null | undefined | {};
}

export default function Show() {
  const { organizer, flash, credentials } = usePage<PageProps>().props;

  const [activeTab, setActiveTab] = useState('users');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    last_name: '',
    dni: '',
    phone: '',
    address: '',
    email: ''
  });
  const [errors, setErrors] = useState<any>({});
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);
  const flashShownRef = useRef<{ success?: string; error?: string }>({});

  const organizerId = organizer.id;

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  const getUserFullName = (user: UserItem) => `${user.person.name} ${user.person.last_name}`;

  const getRoleText = (role: string) => ({ admin: 'Administrador', organizer: 'Organizador', user: 'Usuario' } as Record<string, string>)[role] || role;

  const searchUsers = async (term: string) => {
    if (!term) { setSearchResults([]); return; }
    try {
      const res = await fetch(route('admin.organizers.search-users', organizerId) + '?q=' + encodeURIComponent(term));
      if (res.ok) setSearchResults(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleSubmitAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setErrors({});
    setCreatedCredentials(null);

    const payload: any = { mode };
    if (mode === 'existing') {
      payload.user_id = selectedUserId;
      if (!selectedUserId) { setCreating(false); toast.error('Selecciona un usuario'); return; }
    } else {
      payload.email = newUser.email;
      payload.person = {
        name: newUser.name,
        last_name: newUser.last_name,
        dni: newUser.dni || null,
        phone: newUser.phone || null,
        address: newUser.address || null,
      };
    }

    router.post(route('admin.organizers.add-user', organizerId), payload, {
      preserveScroll: true,
      onSuccess: (page) => {
        setCreating(false);
        // Obtener credenciales y flash del response
        // @ts-ignore
        const flashSuccess = page.props.flash?.success;
        // @ts-ignore
        const creds = page.props.credentials as any;
        if (creds && typeof creds.email === 'string' && typeof creds.password === 'string') {
          setCreatedCredentials({ email: creds.email, password: creds.password });
        } else if (flashSuccess) {
          // Cerrar modal; el toast lo maneja el efecto centralizado
          setShowAddUserModal(false);
        }
        setMode('existing');
        setSelectedUserId(null);
        setNewUser({ name: '', last_name: '', dni: '', phone: '', address: '', email: '' });
      },
      onError: (errs: any) => {
        setCreating(false);
        setErrors(errs);
        toast.error('Corrige los errores del formulario');
      }
    });
  };

  const handleRemoveUser = (userId: number) => {
    router.delete(route('admin.organizers.remove-user', { organizerId: organizer.id, userId }), {
      preserveScroll: true,
      onSuccess: (page: any) => {
        // Centralizamos toasts en el effect: sólo marcamos como ya mostrado para evitar duplicado
        // @ts-ignore
        const flashMsg = page.props.flash?.success;
        if (flashMsg) {
          if (flashShownRef.current.success !== flashMsg) {
            toast.success(flashMsg);
            flashShownRef.current.success = flashMsg; // evita que el effect lo repita
          }
        }
      },
      onError: () => toast.error('Error al remover el usuario')
    });
  };

  useEffect(() => {
    // Evitar duplicados usando ref
    if (flash?.success && !createdCredentials) {
      const credsObj: any = credentials;
      const hasCreds = credsObj && typeof credsObj.email === 'string' && typeof credsObj.password === 'string';
      if (flash.success !== flashShownRef.current.success) {
        if (hasCreds) {
          toast.success(flash.success, { description: `Email: ${credsObj.email} | Contraseña: ${credsObj.password}` });
        } else {
          toast.success(flash.success);
        }
        flashShownRef.current.success = flash.success;
      }
    }
    if (flash?.error && flash.error !== flashShownRef.current.error) {
      toast.error(flash.error);
      flashShownRef.current.error = flash.error;
    }
  }, [flash?.success, flash?.error, credentials, createdCredentials]);

  return (
    <>
      <Head title={`${organizer.name} - Organizador`} />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-card border-border shadow-lg mb-8">
            <CardContent className="p-8">
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border border-border">
                  {organizer.logo_url ? (
                    <img
                      src={organizer.logo_url.startsWith('/') ? organizer.logo_url : `/images/organizers/${organizer.logo_url}`}
                      alt={`Logo de ${organizer.name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full bg-gradient-to-r from-primary to-chart-2 flex items-center justify-center ${organizer.logo_url ? 'hidden' : ''}`}>
                    <Building className="w-12 h-12 text-primary-foreground" />
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-card-foreground mb-2">{organizer.name}</h1>
                  <p className="text-lg text-muted-foreground mb-4">Referente: {organizer.referring}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-muted-foreground"><Mail className="w-4 h-4 mr-2" /><span>{organizer.email}</span></div>
                    <div className="flex items-center text-muted-foreground"><Users className="w-4 h-4 mr-2" /><span>{organizer.phone}</span></div>
                    <div className="flex items-center text-muted-foreground"><Calendar className="w-4 h-4 mr-2" /><span>Registrado: {formatDate(organizer.created_at)}</span></div>
                    <div className="flex items-center text-muted-foreground"><Building className="w-4 h-4 mr-2" /><span>{organizer.events.length} eventos creados</span></div>
                  </div>
                  {(organizer.facebook_url || organizer.instagram_url || organizer.twitter_url) && (
                    <div className="flex items-center space-x-4 mt-4">
                      {organizer.facebook_url && <a href={organizer.facebook_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Facebook</a>}
                      {organizer.instagram_url && <a href={organizer.instagram_url} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800">Instagram</a>}
                      {organizer.twitter_url && <a href={organizer.twitter_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">Twitter</a>}
                    </div>
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  <Link href={route('admin.organizers.edit', organizer.id)}>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary-hover"><Edit className="w-4 h-4 mr-2" />Editar</Button>
                  </Link>
                  <Link href={route('admin.organizers.index')}>
                    <Button variant="outline" className="border-border text-foreground hover:bg-accent">Volver</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-muted border-border">
              <TabsTrigger value="users" className="data-[state=active]:bg-background"><Users className="w-4 h-4 mr-2" />Usuarios ({organizer.users.length})</TabsTrigger>
              <TabsTrigger value="events" className="data-[state=active]:bg-background"><Calendar className="w-4 h-4 mr-2" />Eventos ({organizer.events.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card className="bg-card border-border shadow-lg">
                <CardHeader className="border-b border-border pb-6">
                  <CardTitle className="text-card-foreground flex items-center justify-between">
                    <span className="flex items-center"><Users className="w-5 h-5 mr-2" />Usuarios del Organizador</span>
                    <Button size="sm" onClick={() => setShowAddUserModal(true)}>Agregar usuario</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {organizer.users.length > 0 ? (
                    <div className="space-y-4">
                      {organizer.users.map(user => (
                        <div key={user.id} className="p-4 bg-muted rounded-lg hover:bg-accent transition-colors border border-border">
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
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="border-border">Quitar</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-popover border-border">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-popover-foreground">¿Quitar usuario?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-muted-foreground">Esto lo desvinculará del organizador y volverá a tener rol de cliente.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="border-border text-foreground hover:bg-accent">Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleRemoveUser(user.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Quitar</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <UserCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">No hay usuarios</h3>
                      <p className="text-muted-foreground">Este organizador aún no tiene usuarios asignados.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events">
              <Card className="bg-card border-border shadow-lg">
                <CardHeader className="border-b border-border pb-6">
                  <CardTitle className="text-card-foreground flex items-center"><Calendar className="w-5 h-5 mr-2" />Eventos del Organizador</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {organizer.events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {organizer.events.map(event => (
                        <Card key={event.id} className="bg-muted border-border hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-4">
                              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                                {event.banner_url ? (
                                  <img
                                    src={event.banner_url.startsWith('/') ? event.banner_url : `/images/events/${event.banner_url}`}
                                    alt={event.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <div className={`w-full h-full bg-gradient-to-r from-chart-1 to-chart-3 flex items-center justify-center ${event.banner_url ? 'hidden' : ''}`}>
                                  <Ticket className="w-8 h-8 text-primary-foreground" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-card-foreground mb-1 truncate">{event.name}</h3>
                                <p className="text-sm text-muted-foreground mb-2 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{event.description}</p>
                                <div className="space-y-1 text-xs text-muted-foreground">
                                  <div className="flex items-center"><Star className="w-3 h-3 mr-1 text-primary" /><span>{event.category.name}</span></div>
                                  <div className="flex items-center"><MapPin className="w-3 h-3 mr-1 text-primary" /><span className="truncate">{event.venue.name}, {event.venue.city}</span></div>
                                  <div className="flex items-center"><Calendar className="w-3 h-3 mr-1 text-primary" /><span>Creado {formatDate(event.created_at)}</span></div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                  <Link href={route('admin.events.show', event.id)}>
                                    <Button size="sm" variant="outline" className="border-border hover:bg-background"><Eye className="w-4 h-4 mr-1" /> Ver detalle</Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">No hay eventos</h3>
                      <p className="text-muted-foreground">Este organizador aún no ha creado eventos.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={showAddUserModal} onOpenChange={(o) => { setShowAddUserModal(o); if (!o) setCreatedCredentials(null); }}>
        <DialogContent className="max-w-xl bg-card border-border">
          {!createdCredentials && (
            <DialogHeader>
              <DialogTitle className="text-card-foreground">Agregar usuario</DialogTitle>
              <DialogDescription className="text-muted-foreground">Asigna un usuario existente o crea uno nuevo.</DialogDescription>
            </DialogHeader>
          )}
          {createdCredentials ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <CheckCircle2 className="w-14 h-14 text-green-500" />
                <h3 className="text-xl font-semibold text-card-foreground">Usuario creado correctamente</h3>
                <p className="text-sm text-muted-foreground max-w-sm">Comparte estas credenciales con el nuevo usuario. Debe cambiarlas tras iniciar sesión.</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 rounded-lg border border-border bg-muted/50">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Email</div>
                  <div className="font-mono text-sm break-all">{createdCredentials.email}</div>
                </div>
                <div className="p-4 rounded-lg border border-border bg-muted/50">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Contraseña</div>
                  <div className="font-mono text-sm break-all">{createdCredentials.password}</div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <Button type="button" variant="outline" className="border-border" onClick={() => { navigator.clipboard.writeText(`Email: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`); toast.success('Credenciales copiadas'); }}>
                  <ClipboardCopy className="w-4 h-4 mr-2" /> Copiar
                </Button>
                <div className="flex gap-2 ml-auto">
                  <Button type="button" variant="outline" className="border-border" onClick={() => { setCreatedCredentials(null); setMode('new'); }}>Crear otro</Button>
                  <Button type="button" onClick={() => { setCreatedCredentials(null); setShowAddUserModal(false); }}>Cerrar</Button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitAddUser} className="space-y-6">
              <div className="flex space-x-4">
                <Button type="button" variant={mode === 'existing' ? 'default' : 'outline'} onClick={() => setMode('existing')} className="flex-1">Existente</Button>
                <Button type="button" variant={mode === 'new' ? 'default' : 'outline'} onClick={() => setMode('new')} className="flex-1">Nuevo</Button>
              </div>

              {mode === 'existing' && (
                <div className="space-y-3">
                  <Label htmlFor="searchUser">Buscar usuario</Label>
                  <Input id="searchUser" placeholder="Nombre o email" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); searchUsers(e.target.value); }} />
                  <div className="max-h-48 overflow-y-auto border border-border rounded-md divide-y divide-border">
                    {searchResults.length === 0 && searchTerm && (
                      <div className="p-3 text-sm text-muted-foreground">Sin resultados</div>
                    )}
                    {searchResults.map(u => (
                      <button type="button" key={u.id} onClick={() => setSelectedUserId(u.id)} className={`w-full text-left p-3 text-sm hover:bg-accent flex items-center justify-between ${selectedUserId === u.id ? 'bg-accent' : ''}`}>
                        <span className="truncate">{u.name}</span>
                        <span className="text-muted-foreground ml-2 truncate">{u.email}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mode === 'new' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} required />
                    {errors['person.name'] && <p className="text-xs text-destructive">{errors['person.name']}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Apellido</Label>
                    <Input value={newUser.last_name} onChange={e => setNewUser({ ...newUser, last_name: e.target.value })} required />
                    {errors['person.last_name'] && <p className="text-xs text-destructive">{errors['person.last_name']}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>DNI</Label>
                    <Input value={newUser.dni} onChange={e => setNewUser({ ...newUser, dni: e.target.value })} />
                    {errors['person.dni'] && <p className="text-xs text-destructive">{errors['person.dni']}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} />
                    {errors['person.phone'] && <p className="text-xs text-destructive">{errors['person.phone']}</p>}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Dirección</Label>
                    <Input value={newUser.address} onChange={e => setNewUser({ ...newUser, address: e.target.value })} />
                    {errors['person.address'] && <p className="text-xs text-destructive">{errors['person.address']}</p>}
                  </div>
                  <div className="md:col-span-2 text-xs text-muted-foreground">La contraseña se generará automáticamente.</div>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddUserModal(false)} className="border-border">Cancelar</Button>
                <Button type="submit" disabled={creating}>{creating ? 'Guardando...' : 'Guardar'}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

Show.layout = (page: any) => <AppLayout children={page} />;