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

const API_TRACK_LOCAL = 'http://localhost:5000/api/track';
const API_ANALYTICS_LOCAL = 'http://localhost:5000/api/analytics';

export const trackVisit = async (siteLabel = 'Main Hub') => {
    let geoData = {};
    try {
        const responseGeo = await fetch(API_ENDPOINT);
        geoData = await responseGeo.json();

        if (geoData.status !== 'success') return;

        // Post to your own Postgres Backend
        const trackRes = await fetch(API_TRACK_LOCAL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ siteLabel, ...geoData })
        });

        return await trackRes.json();
    } catch (error) {
        console.warn('Backend tracking failed, using local fallback:', error);

        // Fallback to localStorage if backend is down
        const existingLogs = JSON.parse(localStorage.getItem('hub_visitor_logs') || '[]');
        const fallbackEntry = {
            id: Date.now(),
            site: siteLabel,
            site_label: siteLabel,
            timestamp: new Date().toISOString(),
            query: geoData.query || 'Unknown',
            ...geoData
        };
        existingLogs.unshift(fallbackEntry);
        localStorage.setItem('hub_visitor_logs', JSON.stringify(existingLogs.slice(0, 50)));
        return fallbackEntry;
    }
};

export const getHubAnalytics = async () => {
    try {
        const res = await fetch(API_ANALYTICS_LOCAL);
        const data = await res.json();
        // Modernize postgres structure for UI compatibility
        return data.map(log => ({
            ...log,
            site: log.site_label,
            countryCode: log.country_code
        }));
    } catch (error) {
        console.warn('Analytics fetch error, showing local cache:', error);
        return JSON.parse(localStorage.getItem('hub_visitor_logs') || '[]');
    }
};
