import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink } from "lucide-react";

interface GoogleMapsInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  placeholder?: string;
  helpText?: string;
}

export function GoogleMapsInput({
  value,
  onChange,
  error,
  label = "Link de Google Maps",
  placeholder = "https://maps.google.com/...",
  helpText = "Pega el enlace completo de Google Maps del recinto"
}: GoogleMapsInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="google_maps_url" className="flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        {label}
      </Label>
      
      <div className="flex gap-2">
        <Input
          id="google_maps_url"
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={error ? "border-red-500" : ""}
        />
        
        {value && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => window.open(value, '_blank')}
            title="Abrir en Google Maps"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {helpText && !error && (
        <p className="text-sm text-muted-foreground">{helpText}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}