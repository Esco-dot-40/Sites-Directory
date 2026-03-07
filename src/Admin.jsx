import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import {
    Users, Eye, MousePointer2, Clock, Globe, Shield,
    Activity, ArrowUpRight, ArrowDownRight, Search,
    Cpu, Zap, Radio, Terminal, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Loader from './Loader';
import { getHubAnalytics, getFlagEmoji } from './analytics';
import './Admin.css';

const COLORS = ['#5b8cff', '#ff5b8c', '#5bff8c', '#8c5bff', '#ffa500', '#00d4ff'];

const AdminDashboard = ({ audioControls }) => {
    const [liveHits, setLiveHits] = useState([]);
    const [trafficStats, setTrafficStats] = useState([]);
    const [distribution, setDistribution] = useState([]);
    const [topSites, setTopSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isVideoActive, setIsVideoActive] = useState(true);
    const [summary, setSummary] = useState({ total: 0, unique: 0, live: 0, campaigns: 0, avgPerDay: 0 });
    const [isOffline, setIsOffline] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const [activeTab, setActiveTab] = useState('dashboard');
    const [hubLogs, setHubLogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        try {
            const logs = await getHubAnalytics();
            setIsOffline(false);

            const statsMap = {};
            const uniqueIps = new Set();
            const now = new Date();
            let liveCount = 0;

            logs.forEach(hit => {
                const date = new Date(hit.timestamp);
                const dateKey = date.toLocaleDateString('en-US', { weekday: 'short' });

                if (!statsMap[dateKey]) statsMap[dateKey] = { name: dateKey, visits: 0, unique: 0 };
                statsMap[dateKey].visits++;

                const visitorIp = hit.ip || hit.query || '0.0.0.0';
                if (!uniqueIps.has(visitorIp)) {
                    uniqueIps.add(visitorIp);
                    statsMap[dateKey].unique++;
                }

                if ((now - date) < 300000) liveCount++;
            });

            const daysOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const sortedStats = daysOrder.map(d => statsMap[d] || { name: d, visits: 0, unique: 0 });

            setTrafficStats(sortedStats);
            setSummary({
                total: logs.length,
                unique: uniqueIps.size,
                live: liveCount,
                campaigns: new Set(logs.map(l => l.site_label)).size,
                avgPerDay: Math.round(logs.length / Math.max(1, new Set(logs.map(l => new Date(l.timestamp).toDateString())).size))
            });

            // Top Sites Distribution
            const domainsMap = {};
            logs.forEach(hit => {
                let domain = hit.site_label || 'Main Hub';
                domainsMap[domain] = (domainsMap[domain] || 0) + 1;
            });
            const distData = Object.entries(domainsMap)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);
            setTopSites(distData.slice(0, 8));

            // Referrer Breakdown
            const referMap = {};
            logs.forEach(hit => {
                let ref = hit.referrer || 'Direct';
                if (ref.includes('://')) ref = ref.split('/')[2];
                referMap[ref] = (referMap[ref] || 0) + 1;
            });
            const referrerData = Object.entries(referMap)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 5);
            setDistribution(referrerData);

            setLiveHits(logs.slice(0, 15));
            setHubLogs(logs);
        } catch (error) {
            console.error('Admin Fetch Error:', error);
            setIsOffline(true);
        } finally {
            setLoading(false);
        }
    };

    const handleVideoEnd = () => {
        setIsVideoActive(false);
    };

    useEffect(() => {
        document.title = "Management Console / Signal Hub";
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="admin-loading" style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#05070a', zIndex: 10000 }}>
            <div className="ambient-background" style={{ opacity: 0.4 }}>
                <video
                    className="bg-video"
                    src="/bg-video.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                />
            </div>
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <Loader />
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{ marginTop: '2rem', fontSize: '0.8rem', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)' }}
                >
                    INITIALIZING SIGNAL_CORE v4.2
                </motion.div>
            </div>
        </div>
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'Poncholove20!!') {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('ACCESS DENIED: INVALID CREDENTIALS');
            setPassword('');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="admin-auth-container">
                <div className="admin-bg-blobs">
                    <div className="blob blob-1"></div>
                    <div className="blob blob-2"></div>
                </div>
                <motion.div className="auth-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="auth-header">
                        <div className="logo-icon"><Shield size={24} /></div>
                        <h2>SECURE ACCESS</h2>
                        <p>SYMMETRIC ENCRYPTION ACTIVE</p>
                    </div>
                    <form onSubmit={handleLogin}>
                        <div className="input-group">
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="ENTER SYSTEM KEY" autoFocus />
                            <div className="input-line"></div>
                        </div>
                        {error && <p className="auth-error">{error}</p>}
                        <button type="submit" className="auth-submit">INITIALIZE LINK</button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-bg-blobs">
                <AnimatePresence>
                    {isVideoActive && (
                        <motion.div
                            className="video-bg-container"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 2 }}
                        >
                            <video
                                className="bg-video"
                                src="/bg-video.mp4"
                                autoPlay
                                muted
                                playsInline
                                onEnded={handleVideoEnd}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            <aside className="admin-sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon"><Zap size={20} fill="currentColor" /></div>
                    ESCO_SYS
                </div>
                <nav className="sidebar-nav">
                    <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                        <Activity size={18} /> Dashboard
                    </div>
                    <div className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
                        <Globe size={18} /> Detailed Logs
                    </div>
                    <div className={`nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
                        <Shield size={18} /> Security
                    </div>
                    <div className={`nav-item ${activeTab === 'nodes' ? 'active' : ''}`} onClick={() => setActiveTab('nodes')}>
                        <Terminal size={18} /> Nodes
                    </div>
                    <div className={`nav-item ${activeTab === 'live' ? 'active' : ''}`} onClick={() => setActiveTab('live')}>
                        <Radio size={18} /> Live Ops
                    </div>
                </nav>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <motion.h1 key={activeTab} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                        {activeTab === 'dashboard' && 'Network Overview'}
                        {activeTab === 'logs' && 'Detailed Traffic Logs'}
                        {activeTab === 'security' && 'Security Protection Layer'}
                        {activeTab === 'nodes' && 'Global Node Architecture'}
                        {activeTab === 'live' && 'Real-Time Signal Ops'}
                    </motion.h1>
                    <div className="header-status">
                        <div className={isOffline ? "" : "status-dot-active"}></div>
                        {isOffline ? "RESTRICTED MODE (LOCAL)" : "SYMMETRIC SYNC ACTIVE"}
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'dashboard' && (
                        <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <section className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon"><Users size={20} /></div>
                                    <span className="stat-label">Total Volume</span>
                                    <div className="stat-value">{summary.total}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon"><Eye size={20} /></div>
                                    <span className="stat-label">Unique Clients</span>
                                    <div className="stat-value">{summary.unique}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon"><BarChart size={20} /></div>
                                    <span className="stat-label">Daily Average</span>
                                    <div className="stat-value">{summary.avgPerDay}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon"><Activity size={20} /></div>
                                    <span className="stat-label">Live Signal</span>
                                    <div className="stat-value" style={{ color: '#5bff8c' }}>{summary.live}</div>
                                </div>
                            </section>

                            <div className="admin-grid">
                                <div className="card">
                                    <h2 className="card-title">Weekly Traffic Flow</h2>
                                    <div style={{ height: 300 }}>
                                        <ResponsiveContainer>
                                            <AreaChart data={trafficStats}>
                                                <defs>
                                                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#5b8cff" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#5b8cff" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" />
                                                <YAxis stroke="rgba(255,255,255,0.3)" />
                                                <Tooltip contentStyle={{ background: '#0a0c14', border: '1px solid #333', borderRadius: '12px' }} />
                                                <Area type="monotone" dataKey="visits" stroke="#5b8cff" fillOpacity={1} fill="url(#colorVisits)" />
                                                <Area type="monotone" dataKey="unique" stroke="#ff5b8c" fill="transparent" strokeDasharray="5 5" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="admin-grid" style={{ marginTop: '2rem' }}>
                                    <div className="card">
                                        <h2 className="card-title">Referrer Breakdown</h2>
                                        <div style={{ height: 300 }}>
                                            <ResponsiveContainer>
                                                <PieChart>
                                                    <Pie
                                                        data={distribution}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {distribution.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip contentStyle={{ background: '#0a0c14', border: '1px solid #333' }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    <div className="card">
                                        <h2 className="card-title">Signal Health</h2>
                                        <div className="terminal-style-list">
                                            <div className="terminal-item">
                                                <span className="t-label">[DB] CONNECTION</span>
                                                <span className="t-value" style={{ color: isOffline ? '#ff5b8c' : '#5bff8c' }}>{isOffline ? 'OFFLINE' : 'ESTABLISHED'}</span>
                                            </div>
                                            <div className="terminal-item">
                                                <span className="t-label">[API] LATENCY</span>
                                                <span className="t-value">24ms</span>
                                            </div>
                                            <div className="terminal-item">
                                                <span className="t-label">[GEO] PROVIDER</span>
                                                <span className="t-value">FREEIPAPI_SECURE</span>
                                            </div>
                                            <div className="terminal-item">
                                                <span className="t-label">[SYS] UPTIME</span>
                                                <span className="t-value">99.98%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'logs' && (
                        <motion.div key="logs" className="analytics-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="analytics-filters" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                                <div className="search-wrap" style={{ flex: 1, position: 'relative' }}>
                                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                                    <input
                                        type="text"
                                        placeholder="SEARCH BY IP, CITY, COUNTRY, OR SITE..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '1rem 1rem 1rem 3rem',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '16px',
                                            color: '#fff',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="heatmap-section" style={{ height: '400px', padding: 0, overflow: 'hidden' }}>
                                <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }} zoomControl={false} dragging={true}>
                                    <TileLayer
                                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                    />
                                    {hubLogs.map(log => (
                                        log.lat && log.lon && (
                                            <CircleMarker
                                                key={log.id}
                                                center={[log.lat, log.lon]}
                                                radius={8}
                                                fillColor="#5b8cff"
                                                color="#fff"
                                                weight={1}
                                                fillOpacity={0.6}
                                            >
                                                <Popup className="dark-popup">
                                                    <div style={{ color: '#fff', background: '#0a0c10', padding: '0.5rem' }}>
                                                        <strong>{log.city}, {log.country}</strong><br />
                                                        IP: {log.query}<br />
                                                        Time: {new Date(log.timestamp).toLocaleTimeString()}
                                                    </div>
                                                </Popup>
                                            </CircleMarker>
                                        )
                                    ))}
                                </MapContainer>
                            </div>

                            <div className="analytics-list">
                                {hubLogs
                                    .filter(log => {
                                        const s = searchTerm.toLowerCase();
                                        return (
                                            log.query?.toLowerCase().includes(s) ||
                                            log.city?.toLowerCase().includes(s) ||
                                            log.country?.toLowerCase().includes(s) ||
                                            log.site?.toLowerCase().includes(s)
                                        );
                                    })
                                    .length === 0 ? (
                                    <div className="no-logs">NO MATCHING ENTRIES FOUND</div>
                                ) : (
                                    hubLogs
                                        .filter(log => {
                                            const s = searchTerm.toLowerCase();
                                            return (
                                                log.query?.toLowerCase().includes(s) ||
                                                log.city?.toLowerCase().includes(s) ||
                                                log.country?.toLowerCase().includes(s) ||
                                                log.site?.toLowerCase().includes(s)
                                            );
                                        })
                                        .map(log => (
                                            <div key={log.id} className="log-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2rem' }}>
                                                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div className="log-main">
                                                        <div className="log-icon-wrap">{getFlagEmoji(log.countryCode)}</div>
                                                        <div className="log-content">
                                                            <h3>{log.site || 'Main Hub'} / {log.city || 'Edge Node'}</h3>
                                                            <p>{log.country}, {log.region}</p>
                                                            <small>{new Date(log.timestamp).toLocaleString()}</small>
                                                        </div>
                                                    </div>
                                                    <div className="log-details">
                                                        <div className="detail-item">
                                                            <span className="label">Public IP</span>
                                                            <span className="value" style={{ color: '#5b8cff' }}>{log.query}</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <span className="label">ISP / Org</span>
                                                            <span className="value">{log.isp}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="in-depth-meta" style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                                    width: '100%',
                                                    padding: '1.5rem',
                                                    background: 'rgba(0,0,0,0.2)',
                                                    borderRadius: '16px',
                                                    border: '1px solid rgba(255,255,255,0.05)',
                                                    gap: '1rem'
                                                }}>
                                                    <div className="detail-item">
                                                        <span className="label">OS / Device</span>
                                                        <span className="value" style={{ fontSize: '0.7rem', opacity: 0.8 }}>{log.user_agent?.split(')')[0]?.split('(')[1]?.slice(0, 30) || 'Unknown'}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="label">Resolution</span>
                                                        <span className="value">{log.screen_res || '??'}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="label">Referrer</span>
                                                        <span className="value" style={{ fontSize: '0.75rem', color: '#ff5b8c' }}>{log.referrer?.slice(0, 20) || 'Direct'}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="label">Language</span>
                                                        <span className="value uppercase">{log.language || 'EN'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'security' && (
                        <motion.div key="sec" className="security-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon"><Shield size={20} /></div>
                                    <span className="stat-label">Firewall Status</span>
                                    <div className="stat-value" style={{ color: '#5bff8c' }}>ACTIVE</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon"><Lock size={20} /></div>
                                    <span className="stat-label">Encryption</span>
                                    <div className="stat-value">AES-256</div>
                                </div>
                            </div>
                            <div className="card">
                                <h2 className="card-title">Live Threat Intelligence</h2>
                                <div className="security-list">
                                    <div className="sec-item"><Shield size={20} className="active" /> <span>Intrusion Prevention System (IPS): MONITORING</span></div>
                                    <div className="sec-item"><Zap size={20} style={{ color: '#ffa500' }} /> <span>Heuristic Analysis: SCANNING PACKETS</span></div>
                                    <div className="sec-item"><Activity size={20} className="active" /> <span>Global Sync: OPERATIONAL</span></div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'nodes' && (
                        <motion.div key="nodes" className="nodes-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="node-map-sim">
                                {/* Randomly placed dots for "nodes" effect */}
                                {Array.from({ length: 15 }).map((_, i) => (
                                    <div key={i} className={`node-point ${i < 3 ? 'active' : ''}`} style={{
                                        top: `${20 + Math.random() * 60}%`,
                                        left: `${10 + Math.random() * 80}%`,
                                        opacity: 0.3 + Math.random() * 0.7
                                    }}></div>
                                ))}
                                <div className="node-overlay-text">
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '0.3em', margin: 0 }}>CORE-V4 ARCHITECTURE</h2>
                                    <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>MAPPING ACTIVE SIGNALS ACROSS GLOBAL ENDPOINTS</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'live' && (
                        <motion.div key="live" className="live-ops-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="terminal-log">
                                <div style={{ color: 'white', marginBottom: '1rem', opacity: 0.5 }}>// SYSTEM INITIALIZED / {new Date().toLocaleDateString()}</div>
                                <div style={{ fontWeight: 800 }}>[SYS] KERNEL_ESTABLISHED ... OK</div>
                                <div style={{ fontWeight: 800 }}>[NET] SEARCHING FOR PEERS ... DONE ({hubLogs.length} DETECTED)</div>
                                {hubLogs.slice(0, 8).map(l => (
                                    <div key={l.id} style={{ display: 'flex', gap: '1rem' }}>
                                        <span style={{ color: 'var(--text-dim)' }}>[{new Date(l.timestamp).toLocaleTimeString()}]</span>
                                        <span style={{ color: '#5b8cff' }}>HUB_SIG_INCOMING</span>
                                        <span>FROM {l.city?.toUpperCase() || 'ENCRYPTED_NODE'} / {l.countryCode || '??'}</span>
                                    </div>
                                ))}
                                <div className="cursor-line">_</div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default AdminDashboard;

