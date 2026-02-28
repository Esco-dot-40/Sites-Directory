import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import {
    Users, Eye, MousePointer2, Clock, Globe, Shield,
    Activity, ArrowUpRight, ArrowDownRight, Search,
    Cpu, Zap, Radio, Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Admin.css';

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

    const API_BASE = 'https://pixel-tracker-production-2f84.up.railway.app';


    const fetchData = async () => {
        try {
            const hRes_raw = await fetch(`${API_BASE}/api/hits`);
            if (!hRes_raw.ok) throw new Error('API Unreachable');
            const hRes = await hRes_raw.json();

            const cRes_raw = await fetch(`${API_BASE}/api/campaigns`);
            const cRes = cRes_raw.ok ? await cRes_raw.json() : [];

            setIsOffline(false);

            // Process Traffic Data (Last 7 Days)
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const stats = days.map(d => ({ name: d, visits: 0, unique: 0 }));
            const uniqueIps = new Set();
            const now = new Date();
            let liveCount = 0;

            hRes.forEach(hit => {
                const date = new Date(hit.timestamp);
                const dayName = days[date.getDay()];
                const stat = stats.find(s => s.name === dayName);

                if (stat) {
                    stat.visits++;
                    if (!uniqueIps.has(hit.ip)) {
                        uniqueIps.add(hit.ip);
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

            // Process Domain Distribution
            const domainsMap = {};
            hRes.forEach(hit => {
                let domain = 'Direct';
                try {
                    if (hit.meta?.target_url) domain = new URL(hit.meta.target_url).hostname;
                    else if (hit.campaign_id === 'domain-hub') domain = 'domain-hub';
                } catch (e) { }
                domainsMap[domain] = (domainsMap[domain] || 0) + 1;
            });
            const distData = Object.entries(domainsMap)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 5);
            setDistribution(distData);

            // Live Feed (Last 10)
            const feed = hRes.slice(0, 10).map(h => ({
                id: h.id,
                name: h.campaign_id,
                domain: h.meta?.target_url ? new URL(h.meta.target_url).hostname : 'Tracker / direct',
                ip: h.ip,
                location: `${h.city || 'Unknown'}, ${h.country || 'Unknown'}`,
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
        document.title = "Tweaking System, One Sec";
        fetchData();
        const interval = setInterval(fetchData, 15000);
        return () => {
            clearInterval(interval);
            document.title = "Rule, Find, Bind / veroe.fun";
        };
    }, []);

    useEffect(() => {
        if (!loading) {
            document.title = "Rule, Find, Bind / veroe.fun";
        } else {
            document.title = "Tweaking System, One Sec";
        }
    }, [loading]);

    if (loading) return (
        <div className="admin-loading">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                ESTABLISHING NEURAL LINK...
            </motion.div>
            <div className="loading-bar-container">
                <div className="loading-bar"></div>
            </div>
        </div>
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
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
                <motion.div
                    className="auth-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="auth-header">
                        <div className="logo-icon"><Shield size={24} /></div>
                        <h2>SECURE ACCESS</h2>
                        <p>SYMMETRIC ENCRYPTION ACTIVE</p>
                    </div>
                    <form onSubmit={handleLogin}>
                        <div className="input-group">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="ENTER SYSTEM KEY"
                                autoFocus
                            />
                            <div className="input-line"></div>
                        </div>
                        {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="auth-error">{error}</motion.p>}
                        <button type="submit" className="auth-submit">
                            INITIALIZE LINK
                        </button>
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

            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon"><Zap size={20} fill="currentColor" /></div>
                    ESCO_SYS
                </div>
                <nav className="sidebar-nav">
                    <div className="nav-item active"><Activity size={18} /> Dashboard</div>
                    <div className="nav-item"><Globe size={18} /> Geo Metrics</div>
                    <div className="nav-item"><Shield size={18} /> Security</div>
                    <div className="nav-item"><Terminal size={18} /> Nodes</div>
                    <div className="nav-item"><Radio size={18} /> Live Ops</div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <motion.h1
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                    >
                        Network Overview
                    </motion.h1>
                    <div className="header-status">
                        <div className={isOffline ? "" : "status-dot-active"}></div>
                        {isOffline ? "RESTRICTED MODE (LOCAL)" : "SYMMETRIC SYNC ACTIVE"}
                    </div>
                </header>

                {/* Stats Grid */}
                <motion.section
                    className="stats-grid"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div className="stat-card" variants={itemVariants}>
                        <div className="stat-icon"><Users size={20} /></div>
                        <span className="stat-label">Total Volume</span>
                        <div className="stat-value">
                            {summary.total > 1000 ? `${(summary.total / 1000).toFixed(1)}k` : summary.total}
                        </div>
                    </motion.div>
                    <motion.div className="stat-card" variants={itemVariants}>
                        <div className="stat-icon"><Eye size={20} /></div>
                        <span className="stat-label">Unique Hits</span>
                        <div className="stat-value">
                            {summary.unique > 1000 ? `${(summary.unique / 1000).toFixed(1)}k` : summary.unique}
                        </div>
                    </motion.div>
                    <motion.div className="stat-card" variants={itemVariants}>
                        <div className="stat-icon"><Cpu size={20} /></div>
                        <span className="stat-label">Campaign Nodes</span>
                        <div className="stat-value">{summary.campaigns}</div>
                    </motion.div>
                    <motion.div className="stat-card" variants={itemVariants}>
                        <div className="stat-icon"><Activity size={20} /></div>
                        <span className="stat-label">Active Signal</span>
                        <div className="stat-value" style={{ color: '#5bff8c' }}>{summary.live}</div>
                    </motion.div>
                </motion.section>

                {/* Charts Grid */}
                <div className="admin-grid">
                    <motion.div
                        className="card"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="card-header">
                            <h2 className="card-title">Network Activity Flow</h2>
                        </div>
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <AreaChart data={trafficStats}>
                                    <defs>
                                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#5b8cff" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#5b8cff" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: '#0a0c14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                                    />
                                    <Area type="monotone" dataKey="visits" stroke="#5b8cff" strokeWidth={4} fillOpacity={1} fill="url(#colorVisits)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <motion.div
                        className="card"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="card-header">
                            <h2 className="card-title">Node Distribution</h2>
                        </div>
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={distribution}
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {distribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: '#0a0c14', border: 'none', borderRadius: '12px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <motion.div
                        className="card"
                        style={{ gridColumn: 'span 2' }}
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="card-header">
                            <h2 className="card-title">Live Signal Feed</h2>
                        </div>
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Source Node</th>
                                        <th>Relay Domain</th>
                                        <th>Network ID</th>
                                        <th>Geo Location</th>
                                        <th>Signal Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {liveHits.map((user, idx) => (
                                            <motion.tr
                                                key={user.id}
                                                initial={{ x: -10, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.1 * idx }}
                                            >
                                                <td className="user-cell">
                                                    <div className="user-avatar">{user.name?.charAt(0) || '?'}</div>
                                                    <span style={{ fontWeight: 600 }}>{user.name}</span>
                                                </td>
                                                <td style={{ opacity: 0.7 }}>{user.domain}</td>
                                                <td style={{ fontFamily: 'monospace', opacity: 0.4 }}>{user.ip}</td>
                                                <td>{user.location}</td>
                                                <td>
                                                    <span className={`badge ${user.status === 'Online' ? 'badge-online' : 'badge-recent'}`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;

