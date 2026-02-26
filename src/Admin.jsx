import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import {
    Users, Eye, MousePointer2, Clock, Globe, Shield,
    Activity, ArrowUpRight, ArrowDownRight, Search
} from 'lucide-react';
import './Admin.css';

const trafficData = [
    { name: 'Mon', visits: 4000, unique: 2400 },
    { name: 'Tue', visits: 3000, unique: 1398 },
    { name: 'Wed', visits: 2000, unique: 9800 },
    { name: 'Thu', visits: 2780, unique: 3908 },
    { name: 'Fri', visits: 1890, unique: 4800 },
    { name: 'Sat', visits: 2390, unique: 3800 },
    { name: 'Sun', visits: 3490, unique: 4300 },
];

const domainDistribution = [
    { name: 'veroe.fun', value: 4500 },
    { name: 'velarixsolutions.nl', value: 3100 },
    { name: 'veroe.space', value: 1200 },
];

const COLORS = ['#5b8cff', '#ff5b8c', '#5bff8c'];

const liveUsers = [
    { id: 1, name: 'Alex K.', domain: 'farkle.velarixsolutions.nl', ip: '192.168.1.1', location: 'USA', status: 'Online' },
    { id: 2, name: 'Sara M.', domain: 'dirty.veroe.fun', ip: '172.16.0.42', location: 'UK', status: 'Online' },
    { id: 3, name: 'David L.', domain: 'me.veroe.fun', ip: '10.0.0.15', location: 'Canada', status: 'Online' },
    { id: 4, name: 'Elena R.', domain: 'crypto.velarixsolutions.nl', ip: '192.168.1.8', location: 'Germany', status: 'Offline' },
    { id: 5, name: 'John D.', domain: 'veroe.space', ip: '172.16.5.12', location: 'Netherlands', status: 'Online' },
];

const AdminDashboard = () => {
    return (
        <div className="admin-container">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-logo">Esco Admin</div>
                <nav className="sidebar-nav">
                    <div className="nav-item active"><Activity size={20} /> Dashboard</div>
                    <div className="nav-item"><Users size={20} /> Traffic Metrics</div>
                    <div className="nav-item"><Globe size={20} /> Geo Analysis</div>
                    <div className="nav-item"><Shield size={20} /> Security Logs</div>
                    <div className="nav-item"><Clock size={20} /> Real-time Feed</div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <h1>Network Overview</h1>
                    <div className="admin-search">
                        <Search size={18} className="search-icon" />
                        <input type="text" placeholder="Search activities..." />
                    </div>
                </header>

                {/* Stats Grid */}
                <section className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-label">Total Visitors</span>
                        <div className="stat-value">245.8k</div>
                        <div className="stat-trend up">
                            <ArrowUpRight size={14} /> +12.5%
                        </div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Unique Sessions</span>
                        <div className="stat-value">98.2k</div>
                        <div className="stat-trend up">
                            <ArrowUpRight size={14} /> +8.2%
                        </div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Avg. Engagement</span>
                        <div className="stat-value">4.2m</div>
                        <div className="stat-trend down">
                            <ArrowDownRight size={14} /> -2.4%
                        </div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Live Connections</span>
                        <div className="stat-value">542</div>
                        <div className="stat-trend up">
                            <ArrowUpRight size={14} /> Live
                        </div>
                    </div>
                </section>

                {/* Charts & Lists Grid */}
                <div className="admin-grid">
                    {/* Main Traffic Chart */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Network Traffic (7D)</h2>
                        </div>
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <AreaChart data={trafficData}>
                                    <defs>
                                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#5b8cff" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#5b8cff" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" />
                                    <YAxis stroke="rgba(255,255,255,0.3)" />
                                    <Tooltip
                                        contentStyle={{ background: '#0a0c14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="visits" stroke="#5b8cff" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Domain Distribution Chart */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Domain Distribution</h2>
                        </div>
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={domainDistribution}
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {domainDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: '#0a0c14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="pie-legend">
                                {domainDistribution.map((entry, index) => (
                                    <div key={entry.name} className="legend-item">
                                        <span className="dot" style={{ backgroundColor: COLORS[index] }}></span>
                                        <span className="legend-name">{entry.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Real-time Activity Table */}
                    <div className="card" style={{ gridColumn: 'span 2' }}>
                        <div className="card-header">
                            <h2 className="card-title">Live Traffic Feed</h2>
                        </div>
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>User / Visitor</th>
                                        <th>Current Domain</th>
                                        <th>IP Address</th>
                                        <th>Location</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {liveUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td className="user-cell">
                                                <div className="user-avatar">{user.name.charAt(0)}</div>
                                                <span>{user.name}</span>
                                            </td>
                                            <td>{user.domain}</td>
                                            <td style={{ opacity: 0.5 }}>{user.ip}</td>
                                            <td>{user.location}</td>
                                            <td>
                                                <span className={`status-badge ${user.status === 'Online' ? 'status-online' : 'status-offline'}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
