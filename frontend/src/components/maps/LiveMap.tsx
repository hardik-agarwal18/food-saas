'use client';

import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { useMemo, useState, useEffect } from 'react';

const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '300px'
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

export interface LiveMapProps {
  markers?: Array<{ lat: number; lng: number; type: 'DRIVER' | 'RESTAURANT' | 'CUSTOMER'; id: string }>;
  directionsOrigin?: { lat: number; lng: number };
  directionsDestination?: { lat: number; lng: number };
  directionsWaypoints?: Array<{ location: { lat: number; lng: number }, stopover: boolean }>;
  center?: { lat: number; lng: number };
  zoom?: number;
}

export function LiveMap({ markers = [], directionsOrigin, directionsDestination, directionsWaypoints, center, zoom = 14 }: LiveMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);

  useEffect(() => {
    if (!isLoaded || !directionsOrigin || !directionsDestination || !window.google) {
      setDirectionsResponse(null);
      return;
    }
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: directionsOrigin,
        destination: directionsDestination,
        waypoints: directionsWaypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionsResponse(result);
        }
      }
    );
  }, [isLoaded, directionsOrigin, directionsDestination, directionsWaypoints]);

  const mapCenter = useMemo(() => {
    if (center) return center;
    if (markers.length > 0) return { lat: markers[0].lat, lng: markers[0].lng };
    return defaultCenter;
  }, [center, markers]);

  // Quick helper to choose marker icons based on type
  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'DRIVER': return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
      case 'RESTAURANT': return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
      case 'CUSTOMER': return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
      default: return undefined;
    }
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-full min-h-[300px] bg-slate-100 animate-pulse flex items-center justify-center rounded-xl border">
        <span className="text-muted-foreground text-sm">Loading map...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px] rounded-xl overflow-hidden border shadow-sm">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={zoom}
        options={{ disableDefaultUI: true, zoomControl: true }}
      >
        {markers.map((marker) => (
          <Marker 
            key={marker.id} 
            position={{ lat: marker.lat, lng: marker.lng }} 
            icon={getMarkerIcon(marker.type)}
          />
        ))}
        
        {directionsResponse && (
          <DirectionsRenderer
            directions={directionsResponse}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#3b82f6',
                strokeOpacity: 0.8,
                strokeWeight: 4,
              }
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}
