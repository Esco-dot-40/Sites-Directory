// Analytics Utility for Domain Hub
const API_ENDPOINT = 'https://freeipapi.com/api/json';

export const getFlagEmoji = (countryCode) => {
    if (!countryCode) return '🌐';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
};

const API_BASE_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : ''; // Use relative paths in production to match Railway domain

const API_TRACK_LOCAL = `${API_BASE_LOCAL}/api/track`;
const API_ANALYTICS_LOCAL = `${API_BASE_LOCAL}/api/hits`;

export const trackVisit = async (siteLabel = 'Main Hub', force = false) => {
    let geoData = {};
    const metadata = {
        userAgent: navigator.userAgent,
        screenRes: `${window.screen.width}x${window.screen.height}`,
        referrer: document.referrer || 'Direct Entry',
        language: navigator.language,
        platform: navigator.platform,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory || 'Unknown'
    };

    try {
        const responseGeo = await fetch(API_ENDPOINT);
        const rawGeo = await responseGeo.json();

        // Map freeipapi structure to our schema
        geoData = {
            query: rawGeo.ipAddress || 'Unknown',
            city: rawGeo.cityName || 'Unknown',
            regionName: rawGeo.regionName || 'Unknown',
            country: rawGeo.countryName || 'Unknown',
            countryCode: rawGeo.countryCode || '??',
            isp: rawGeo.asName || 'Unknown',
            lat: rawGeo.latitude || 0,
            lon: rawGeo.longitude || 0,
            timezone: rawGeo.timeZone || 'UTC'
        };

        // Post to your own Postgres Backend
        const trackRes = await fetch(API_TRACK_LOCAL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ siteLabel, ...geoData, ...metadata })
        });

        return await trackRes.json();
    } catch (error) {
        console.warn('Backend tracking failed, using local fallback:', error);

        const fallbackEntry = {
            id: Date.now(),
            site: siteLabel,
            site_label: siteLabel,
            timestamp: new Date().toISOString(),
            query: geoData.query || 'Unknown',
            ...geoData,
            ...metadata
        };
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
