// Custom marker icons for map
import L from 'leaflet';

export const getEmergencyIcon = (severity: string) => {
    const colors = {
        high: '#ef4444',
        medium: '#f97316',
        low: '#eab308'
    };

    const color = colors[severity as keyof typeof colors] || colors.medium;

    return L.divIcon({
        className: 'custom-marker-emergency',
        html: `
            <div style="
                background: ${color};
                width: 36px;
                height: 36px;
                border-radius: 50%;
                border: 3px solid white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">!</div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
    });
};

export const getUserIcon = (role: string) => {
    const config = {
        rescue: { emoji: 'R', color: '#3b82f6' },
        admin: { emoji: 'A', color: '#8b5cf6' },
        supervisor: { emoji: 'S', color: '#6b7280' },
        worker: { emoji: 'W', color: '#10b981' }
    };

    const { emoji, color } = config[role as keyof typeof config] || config.supervisor;

    return L.divIcon({
        className: 'custom-marker-user',
        html: `
            <div style="
                background: ${color};
                width: 30px;
                height: 30px;
                border-radius: 50%;
                border: 2px solid white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            ">${emoji}</div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
    });
};
