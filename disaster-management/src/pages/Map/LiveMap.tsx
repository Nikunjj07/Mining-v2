// Live map page showing emergencies and active user locations
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { supabase } from '../../lib/supabase';
import { getAllActiveLocations, getEmergencyLocations, type UserLocation } from '../../services/location.service';
import { getEmergencyIcon, getUserIcon } from '../../components/map/MapMarkers';
import MapLegend from '../../components/map/MapLegend';
import DashboardLayout from '../../components/ui/DashboardLayout';
import 'leaflet/dist/leaflet.css';

interface Emergency {
    id: string;
    type: string;
    severity: string;
    status: string;
    location: string;
    description: string;
    latitude: number;
    longitude: number;
    created_at: string;
    reporter?: {
        full_name: string;
        email: string;
    };
    assignee?: {
        full_name: string;
        email: string;
    };
}

export default function LiveMap() {
    const [emergencies, setEmergencies] = useState<Emergency[]>([]);
    const [userLocations, setUserLocations] = useState<UserLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Default center (India)
    const defaultCenter: [number, number] = [20.5937, 78.9629];
    const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [emergencyData, locationData] = await Promise.all([
                getEmergencyLocations(),
                getAllActiveLocations()
            ]);

            setEmergencies(emergencyData as Emergency[]);
            setUserLocations(locationData);

            // Center map on first emergency or user location
            if (emergencyData.length > 0 && emergencyData[0].latitude && emergencyData[0].longitude) {
                setMapCenter([emergencyData[0].latitude, emergencyData[0].longitude]);
            } else if (locationData.length > 0) {
                setMapCenter([locationData[0].latitude, locationData[0].longitude]);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load map data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Subscribe to real-time updates for emergencies
        const emergencyChannel = supabase
            .channel('map-emergencies')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'emergencies'
                },
                () => {
                    fetchData();
                }
            )
            .subscribe();

        // Subscribe to real-time updates for user locations
        const locationChannel = supabase
            .channel('map-locations')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'user_locations'
                },
                () => {
                    fetchData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(emergencyChannel);
            supabase.removeChannel(locationChannel);
        };
    }, []);

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    if (loading) {
        return (
            <DashboardLayout title="Live Map">
                <div className="flex items-center justify-center h-[80vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading map...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Live Map">
            <div className="space-y-4">
                {/* Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card border border-border rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">🚨</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{emergencies.length}</p>
                                <p className="text-sm text-muted-foreground">Active Emergencies</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">👥</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{userLocations.length}</p>
                                <p className="text-sm text-muted-foreground">Active Users</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">🔄</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">Real-time Updates</p>
                                <p className="text-xs text-muted-foreground">Auto-refresh enabled</p>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
                        {error}
                    </div>
                )}

                {/* Map Container */}
                <div className="relative bg-card border border-border rounded-lg overflow-hidden shadow-lg">
                    <MapContainer
                        center={mapCenter}
                        zoom={6}
                        style={{ height: '70vh', width: '100%' }}
                        className="z-0"
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Emergency Markers */}
                        {emergencies.map((emergency) => (
                            <Marker
                                key={emergency.id}
                                position={[emergency.latitude, emergency.longitude]}
                                icon={getEmergencyIcon(emergency.severity)}
                            >
                                <Popup>
                                    <div className="p-2 min-w-[200px]">
                                        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                            🚨 {emergency.type.replace(/_/g, ' ').toUpperCase()}
                                        </h3>
                                        <div className="space-y-1 text-sm">
                                            <p><strong>Severity:</strong> <span className={`capitalize ${emergency.severity === 'high' ? 'text-red-600' : emergency.severity === 'medium' ? 'text-orange-600' : 'text-yellow-600'}`}>{emergency.severity}</span></p>
                                            <p><strong>Location:</strong> {emergency.location}</p>
                                            <p><strong>Description:</strong> {emergency.description}</p>
                                            <p><strong>Status:</strong> <span className="capitalize">{emergency.status}</span></p>
                                            {emergency.reporter && (
                                                <p><strong>Reported by:</strong> {emergency.reporter.full_name}</p>
                                            )}
                                            {emergency.assignee && (
                                                <p><strong>Assigned to:</strong> {emergency.assignee.full_name}</p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-2">{formatTimeAgo(emergency.created_at)}</p>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                        {/* User Location Markers */}
                        {userLocations.map((location) => (
                            <Marker
                                key={location.user_id}
                                position={[location.latitude, location.longitude]}
                                icon={getUserIcon(location.user?.role || 'worker')}
                            >
                                <Popup>
                                    <div className="p-2 min-w-[180px]">
                                        <h3 className="font-semibold text-lg mb-2">
                                            {location.user?.full_name || 'Unknown User'}
                                        </h3>
                                        <div className="space-y-1 text-sm">
                                            <p><strong>Role:</strong> <span className="capitalize">{location.user?.role}</span></p>
                                            <p><strong>Email:</strong> {location.user?.email}</p>
                                            {location.accuracy && (
                                                <p><strong>Accuracy:</strong> ±{Math.round(location.accuracy)}m</p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-2">
                                                Updated {formatTimeAgo(location.last_updated)}
                                            </p>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>

                    {/* Map Legend */}
                    <MapLegend />
                </div>

                {/* Info Message */}
                {userLocations.length === 0 && (
                    <div className="bg-blue-500/10 border border-blue-500 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-md">
                        <p className="font-medium">📍 Enable location tracking</p>
                        <p className="text-sm mt-1">Grant location permission in your browser to appear on the map and help coordinate emergency response.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
