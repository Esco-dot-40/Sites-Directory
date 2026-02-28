import express from 'express';
import pkg from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pkg;

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Pool (Public URL preferred for local dev, Internal for Railway)
const pool = new Pool({
    connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for most public cloud DB connections
});

// Initialize Database Table
const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS visitor_logs (
                id SERIAL PRIMARY KEY,
                timestamp TIMESTAMPTZ DEFAULT NOW(),
                site_label TEXT,
                ip TEXT,
                city TEXT,
                region TEXT,
                country TEXT,
                country_code TEXT,
                isp TEXT,
                lat FLOAT,
                lon FLOAT,
                timezone TEXT
            );
        `);
        console.log('✅ Database initialized successfully');
    } catch (err) {
        console.error('❌ Database initialization error:', err.message);
    }
};

initDb();

// Track Visit
app.post('/api/track', async (req, res) => {
    const { siteLabel, query, city, regionName, country, countryCode, isp, lat, lon, timezone } = req.body;
    try {
        const queryText = `
            INSERT INTO visitor_logs (site_label, ip, city, region, country, country_code, isp, lat, lon, timezone)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *;
        `;
        const values = [siteLabel, query, city, regionName, country, countryCode, isp, lat, lon, timezone];
        const { rows } = await pool.query(queryText, values);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Track error:', err.message);
        res.status(500).json({ error: 'Failed to log visit' });
    }
});

// Get Analytics
app.get('/api/analytics', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM visitor_logs ORDER BY timestamp DESC LIMIT 200;');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

app.listen(port, () => {
    console.log(`🚀 Hub Backend active on port ${port}`);
});
