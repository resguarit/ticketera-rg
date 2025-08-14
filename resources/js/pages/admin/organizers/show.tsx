import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Mail, Users, Calendar, Eye, Edit, Star, MapPin, Ticket, Calendar as CalendarIcon } from 'lucide-react';
import { OrganizerItem, EventItem, CredentialsFlash } from '@/types/organizer';
import OrganizerUsersTab from '@/components/organizers/OrganizerUsersTab';
import { formatDate } from '@/utils/userFormat';
import { getVenueLocation } from '@/lib/venueHelpers';

interface PageProps extends Record<string, any> { organizer: OrganizerItem; flash?: { success?: string; error?: string }; credentials?: CredentialsFlash | null }

export default function Show() {
  const { organizer, flash, credentials } = usePage<PageProps>().props;
  const [activeTab, setActiveTab] = useState('users');

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
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
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
              <OrganizerUsersTab organizer={organizer} flash={flash} credentials={credentials} />
            </TabsContent>

            <TabsContent value="events">
              <Card className="bg-card border-border shadow-lg">
                <CardContent className="p-6">
                  {organizer.events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {organizer.events.map((event: EventItem) => (
                        <Card key={event.id} className="bg-muted border-border hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-4">
                              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                                {event.banner_url ? (
                                  <img
                                    src={event.banner_url.startsWith('/') ? event.banner_url : `/images/events/${event.banner_url}`}
                                    alt={event.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
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
                                  <div className="flex items-center"><MapPin className="w-3 h-3 mr-1 text-primary" /><span className="truncate">{getVenueLocation(event.venue)}</span></div>
                                  <div className="flex items-center"><CalendarIcon className="w-3 h-3 mr-1 text-primary" /><span>Creado {formatDate(event.created_at)}</span></div>
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
    </>
  );
}

Show.layout = (page: any) => <AppLayout children={page} />;