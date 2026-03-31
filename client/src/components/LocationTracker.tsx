// Background component for tracking and updating user location
import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { updateUserLocation, deactivateUserLocation } from '../services/location.service';

export default function LocationTracker() {
    const { user } = useAuth();
    const { location, error } = useGeolocation({
        enableHighAccuracy: true,
    });
    const lastUpdateRef = useRef<{ lat: number; lng: number } | null>(null);

    // Update location when it changes significantly (>50 meters)
    useEffect(() => {
        if (!location || !user?.id) return;

        const { latitude, longitude, accuracy } = location.coords;

        // Check if location changed significantly
        const hasMovedSignificantly = !lastUpdateRef.current ||
            Math.abs(lastUpdateRef.current.lat - latitude) > 0.0005 || // ~50 meters
            Math.abs(lastUpdateRef.current.lng - longitude) > 0.0005;

        if (hasMovedSignificantly) {
            updateUserLocation(user.id, latitude, longitude, accuracy)
                .then(() => {
                    lastUpdateRef.current = { lat: latitude, lng: longitude };
                })
                .catch(err => {
                    console.error('Error updating location:', err);
                });
        }
    }, [location, user?.id]);

    // Periodic update every 30 seconds
    useEffect(() => {
        if (!location || !user?.id) return;

        const interval = setInterval(() => {
            const { latitude, longitude, accuracy } = location.coords;
            updateUserLocation(user.id, latitude, longitude, accuracy)
                .catch(err => {
                    console.error('Error updating location:', err);
                });
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [location, user?.id]);

    // Deactivate location on unmount or logout
    useEffect(() => {
        return () => {
            if (user?.id) {
                deactivateUserLocation(user.id).catch(err => {
                    console.error('Error deactivating location:', err);
                });
            }
        };
    }, [user?.id]);

    // Show error message if location fails
    useEffect(() => {
        if (error) {
            console.warn('Geolocation error:', error);
        }
    }, [error]);

    return null; // Background component, no UI
}
