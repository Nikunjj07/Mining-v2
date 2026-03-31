// Custom hook for tracking user's geolocation
import { useState, useEffect } from 'react';

interface GeolocationCoordinates {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
}

interface GeolocationPosition {
    coords: GeolocationCoordinates;
    timestamp: number;
}

interface UseGeolocationOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
}

interface UseGeolocationReturn {
    location: GeolocationPosition | null;
    error: string | null;
    loading: boolean;
}

export const useGeolocation = (options: UseGeolocationOptions = {}): UseGeolocationReturn => {
    const [location, setLocation] = useState<GeolocationPosition | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        const defaultOptions: PositionOptions = {
            enableHighAccuracy: options.enableHighAccuracy ?? true,
            maximumAge: options.maximumAge ?? 0
        };

        // Do not force a timeout unless explicitly provided by caller.
        // Browser default is Infinity, which avoids repeated timeout errors
        // on slower GPS/location providers.
        if (typeof options.timeout === 'number' && options.timeout > 0) {
            defaultOptions.timeout = options.timeout;
        }

        const handleSuccess = (position: GeolocationPosition) => {
            setLocation({
                coords: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    altitude: position.coords.altitude,
                    altitudeAccuracy: position.coords.altitudeAccuracy,
                    heading: position.coords.heading,
                    speed: position.coords.speed
                },
                timestamp: position.timestamp
            });
            setError(null);
            setLoading(false);
        };

        const handleError = (error: GeolocationPositionError) => {
            let errorMessage = 'An unknown error occurred';

            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location information is unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Location request timed out.';
                    break;
            }

            setError(errorMessage);
            setLoading(false);
        };

        // Watch position for continuous updates
        const watchId = navigator.geolocation.watchPosition(
            handleSuccess,
            handleError,
            defaultOptions
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, [options.enableHighAccuracy, options.timeout, options.maximumAge]);

    return { location, error, loading };
};
