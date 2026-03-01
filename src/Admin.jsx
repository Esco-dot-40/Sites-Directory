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
import { getHubAnalytics, getFlagEmoji } from './analytics';
import './Admin.css';

const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : ''; // Use relative paths for proxy/production

const COLORS = ['#5b8cff', '#ff5b8c', '#5bff8c', '#8c5bff', '#ffa500'];

const AdminDashboard = () => {
    const [liveHits, setLiveHits] = useState([]);
    const [trafficStats, setTrafficStats] = useState([]);
    const [distribution, setDistribution] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({ total: 0, unique: 0, live: 0, campaigns: 0 });
    const [isOffline, setIsOffline] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Tab Management
    const [activeTab, setActiveTab] = useState('dashboard');
    const [hubLogs, setHubLogs] = useState([]);

    const fetchData = async () => {
        try {
            const hRes_raw = await fetch(`${API_BASE}/api/hits`);
            if (!hRes_raw.ok) throw new Error('API Unreachable');
            const hRes = await hRes_raw.json();

            const cRes_raw = await fetch(`${API_BASE}/api/campaigns`);
            const cRes = cRes_raw.ok ? await cRes_raw.json() : [];

            setIsOffline(false);

            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const stats = days.map(d => ({ name: d, visits: 0, unique: 0 }));
            const uniqueIps = new Set();
            const now = new Date();
            let liveCount = 0;

            hRes.forEach(hit => {
                const date = new Date(hit.timestamp);
                const dayName = days[date.getDay()];
                const stat = stats.find(s => s.name === dayName);
                const visitorIp = hit.ip || hit.query || '0.0.0.0';

                if (stat) {
                    stat.visits++;
                    if (!uniqueIps.has(visitorIp)) {
                        uniqueIps.add(visitorIp);
                        stat.unique++;
                    }
                }
                if ((now - date) < 300000) liveCount++;
            });

            setTrafficStats(stats);
            setSummary({
                total: hRes.length,
                unique: uniqueIps.size,
                live: liveCount,
                campaigns: cRes.length
            });

            const domainsMap = {};
            hRes.forEach(hit => {
                let domain = hit.site_label || hit.campaign_id || 'Main Hub';
                domainsMap[domain] = (domainsMap[domain] || 0) + 1;
            });
            const distData = Object.entries(domainsMap)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 5);
            setDistribution(distData);

            const feed = hRes.slice(0, 10).map(h => ({
                id: h.id,
                name: h.site_label || h.campaign_id || 'Internal',
                domain: h.referrer || 'Direct Entry',
                ip: h.ip || h.query || 'Unknown',
                location: `${h.city || 'Edge Node'}, ${h.country || '??'}`,
                status: (new Date() - new Date(h.timestamp)) < 300000 ? 'Online' : 'Recent'
            }));
            setLiveHits(feed);
        } catch (error) {
            console.error('Data Sync Error:', error.message);
            setIsOffline(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = "Rule, Find, Bind / veroe.fun";
        fetchData();
        const refreshLogs = async () => {
            const logs = await getHubAnalytics();
            setHubLogs(logs);
        };
        refreshLogs();
        const interval = setInterval(() => {
            fetchData();
            refreshLogs();
        }, 15000);
        return () => {
            clearInterval(interval);
        };
    }, []);



    if (loading) return (
        <div className="admin-loading">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                ESTABLISHING NEURAL LINK...
            </motion.div>
            <div className="loading-bar-container"><div className="loading-bar"></div></div>
        </div>
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
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
                                    <span className="stat-label">Unique Hits</span>
                                    <div className="stat-value">{summary.unique}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon"><Cpu size={20} /></div>
                                    <span className="stat-label">Nodes</span>
                                    <div className="stat-value">{summary.campaigns}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon"><Activity size={20} /></div>
                                    <span className="stat-label">Active Signal</span>
                                    <div className="stat-value" style={{ color: '#5bff8c' }}>{summary.live}</div>
                                </div>
                            </section>

                            <div className="admin-grid">
                                <div className="card">
                                    <h2 className="card-title">Activity Flow</h2>
                                    <div style={{ height: 300 }}>
                                        <ResponsiveContainer>
                                            <AreaChart data={trafficStats}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" />
                                                <Tooltip contentStyle={{ background: '#0a0c14', border: '1px solid #333' }} />
                                                <Area type="monotone" dataKey="visits" stroke="#5b8cff" fill="rgba(91, 140, 255, 0.2)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="card">
                                    <h2 className="card-title">Node Distribution</h2>
                                    <div style={{ height: 300 }}>
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie data={distribution} innerRadius={60} outerRadius={80} dataKey="value">
                                                    {distribution.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'logs' && (
                        <motion.div key="logs" className="analytics-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
                                {hubLogs.length === 0 ? (
                                    <div className="no-logs">ESTABLISHING GLOBAL SYNC...</div>
                                ) : (
                                    hubLogs.map(log => (
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

