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

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : '';

const API_TRACK = `${API_BASE_URL}/api/track`;
const API_HITS = `${API_BASE_URL}/api/hits`;

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
        const responseGeo = await fetch(API_ENDPOINT).catch(() => {
            console.warn('Geo API unreachable, falling back to basic tracking');
            return null;
        });

        if (responseGeo && responseGeo.ok) {
            const rawGeo = await responseGeo.json();
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
        } else {
            geoData = {
                query: 'Fallback (Geo Failed)',
                city: 'Unknown',
                regionName: 'Unknown',
                country: 'Unknown',
                countryCode: '??',
                isp: 'Unknown',
                lat: 0,
                lon: 0,
                timezone: 'UTC'
            };
        }

        const trackRes = await fetch(API_TRACK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ siteLabel, ...geoData, ...metadata })
        });

        if (!trackRes.ok) throw new Error(`Backend tracking failed: ${trackRes.status}`);
        return await trackRes.json();
    } catch (error) {
        console.warn('Analytics track error:', error.message);
        return { error: true, message: error.message };
    }
};

export const getHubAnalytics = async () => {
    try {
        const res = await fetch(API_HITS);
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const data = await res.json();
        return data.map(log => ({
            ...log,
            site: log.site_label,
            query: log.ip, // Map 'ip' from DB to 'query' for frontend compatibility
            countryCode: log.country_code
        }));
    } catch (error) {
        console.error('Analytics fetch error:', error);
        throw error;
    }
};
