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

const API_BASE_LOCAL = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : ''; // Use relative paths in production to match Railway domain

const API_TRACK_LOCAL = `${API_BASE_LOCAL}/api/track`;
const API_ANALYTICS_LOCAL = `${API_BASE_LOCAL}/api/hits`; // Pull hits for fullest data

export const trackVisit = async (siteLabel = 'Main Hub', force = false) => {
    // Prevent double-logging on refreshes if not forced
    const sessionKey = `tracked_${siteLabel}`;
    if (!force && sessionStorage.getItem(sessionKey)) return;

    // Check if user is an admin to exclude from logs
    if (localStorage.getItem('admin_authenticated') === 'true' && !force) {
        console.log('Admin session detected: Skipping analytics log');
        return;
    }

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
        geoData = await responseGeo.json();

        if (geoData.status !== 'success') return;

        // Post to your own Postgres Backend with deep metadata
        const trackRes = await fetch(API_TRACK_LOCAL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ siteLabel, ...geoData, ...metadata })
        });

        sessionStorage.setItem(sessionKey, 'true');
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
            ...geoData,
            ...metadata
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
