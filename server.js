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

// Database Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Initialize and Migrate Database
const initDb = async () => {
    try {
        // Base Table
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
                timezone TEXT,
                user_agent TEXT,
                screen_res TEXT,
                referrer TEXT,
                language TEXT
            );
        `);

        // Migration for existing tables
        const migrateQuery = `
            ALTER TABLE visitor_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;
            ALTER TABLE visitor_logs ADD COLUMN IF NOT EXISTS screen_res TEXT;
            ALTER TABLE visitor_logs ADD COLUMN IF NOT EXISTS referrer TEXT;
            ALTER TABLE visitor_logs ADD COLUMN IF NOT EXISTS language TEXT;
        `;
        await pool.query(migrateQuery);
        console.log('✅ Database initialized and migrated successfully');
    } catch (err) {
        console.error('❌ Database initialization error:', err.message);
    }
};

initDb();

// Track Visit
app.post('/api/track', async (req, res) => {
    const {
        siteLabel, query, city, regionName, country, countryCode, isp, lat, lon, timezone,
        userAgent, screenRes, referrer, language
    } = req.body;
    try {
        const queryText = `
            INSERT INTO visitor_logs (
                site_label, ip, city, region, country, country_code, isp, lat, lon, timezone,
                user_agent, screen_res, referrer, language
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *;
        `;
        const values = [
            siteLabel, query, city, regionName, country, countryCode, isp, lat, lon, timezone,
            userAgent, screenRes, referrer, language
        ];
        const { rows } = await pool.query(queryText, values);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Track error:', err.message);
        res.status(500).json({ error: 'Failed to log visit' });
    }
});

// Get Hits
app.get('/api/hits', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM visitor_logs ORDER BY timestamp DESC LIMIT 500;');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch signal data' });
    }
});

// Get Campaigns/Nodes
app.get('/api/campaigns', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT DISTINCT site_label as id FROM visitor_logs;');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch nodes' });
    }
});

// Legacy Endpoint
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
