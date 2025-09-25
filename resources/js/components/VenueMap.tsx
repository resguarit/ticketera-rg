import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Configurar iconos para Leaflet
const markerIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface VenueMapProps {
    coordinates: string;
    venueName: string;
    venueAddress: string;
}

export default function VenueMap({ coordinates, venueName, venueAddress }: VenueMapProps) {
    const [lat, lng] = coordinates.split(',').map(Number);

    if (isNaN(lat) || isNaN(lng)) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                <p>No se pudo cargar el mapa</p>
            </div>
        );
    }

    return (
        <MapContainer
            center={[lat, lng]}
            zoom={15}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]} icon={markerIcon}>
                <Popup>
                    <div className="p-2">
                        <h3 className="font-semibold text-sm">{venueName}</h3>
                        <p className="text-xs text-gray-600 mt-1">{venueAddress}</p>
                    </div>
                </Popup>
            </Marker>
        </MapContainer>
    );
}