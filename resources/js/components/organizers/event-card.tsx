import { Card }  from '@/components/ui/card';

export default function OrganizerEventCard({ event }: { event: any }) {
    return (
        <Card>
            <li>
                <h3>{event.name}</h3>
                <p>{event.description}</p>
            </li>
        </Card>
    );
}
