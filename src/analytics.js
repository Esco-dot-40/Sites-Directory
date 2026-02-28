// Analytics Utility for Domain Hub
const API_ENDPOINT = 'http://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query';

export const getFlagEmoji = (countryCode) => {
    if (!countryCode) return '🌐';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
};

export const trackVisit = async (siteLabel = 'Main Hub') => {
    try {
        // Fetch location data from ip-api
        const response = await fetch(API_ENDPOINT);
        const data = await response.json();

        if (data.status !== 'success') {
            console.warn('Geolocation failed:', data.message);
            return;
        }

        const visitEntry = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            site: siteLabel,
            ...data
        };

        // Store in localStorage for now (as requested by template)
        // Note: Real production should POST this to the user's Postgres DB
        const existingLogs = JSON.parse(localStorage.getItem('hub_visitor_logs') || '[]');
        existingLogs.unshift(visitEntry);

        // Limit to 200 entries to save space
        const limitedLogs = existingLogs.slice(0, 200);
        localStorage.setItem('hub_visitor_logs', JSON.stringify(limitedLogs));

        console.log(`[Analytics] Tracked view for ${siteLabel}`);

        // Placeholder for future Postgres integration
        /*
        await fetch('YOUR_POSTGRES_API_ENDPOINT', {
            method: 'POST',
            body: JSON.stringify(visitEntry)
        });
        */

        return visitEntry;
    } catch (error) {
        console.error('Analytics tracking error:', error);
    }
};

export const getHubAnalytics = () => {
    return JSON.parse(localStorage.getItem('hub_visitor_logs') || '[]');
};
