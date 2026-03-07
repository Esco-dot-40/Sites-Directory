import express from 'express';
import pkg from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const { Pool } = pkg;

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

// Database Pool
let connectionString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;

// Validation for Railway placeholders
if (connectionString && connectionString.includes('${{')) {
    console.warn('⚠️ Placeholder DATABASE_PUBLIC_URL detected, falling back to DATABASE_URL');
    connectionString = process.env.DATABASE_URL;
}

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
});

// Initialize and Migrate Database
const initDb = async () => {
    console.log('📡 Initializing database connection...');
    if (!connectionString) {
        console.error('❌ ERROR: No database connection string found. Check DATABASE_URL/DATABASE_PUBLIC_URL.');
        return;
    }
    try {
        // Test connection
        const client = await pool.connect();
        console.log('✅ Database connection established via pool');
        client.release();

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
        console.log('✅ Database schema verified and migrated successfully');
    } catch (err) {
        console.error('❌ Database initialization error:', err.message);
        if (err.message.includes('ENOTFOUND')) {
            console.error('💡 TIP: It looks like the database host cannot be reached. Check your DATABASE_URL/DATABASE_PUBLIC_URL.');
        }
    }
};

initDb();

// Track Visit
// Track Visit (v1)
app.post('/api/v1/track', async (req, res) => {
    const {
        siteLabel, query, city, regionName, country, countryCode, isp, lat, lon, timezone,
        userAgent, screenRes, referrer, language
    } = req.body;
    try {
        if (!pool) throw new Error('Database pool not initialized');
        
        const queryText = `
            INSERT INTO visitor_logs (
                site_label, ip, city, region, country, country_code, isp, lat, lon, timezone,
                user_agent, screen_res, referrer, language
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *;
        `;
        const values = [
            siteLabel || 'Unknown Hub', 
            query || '0.0.0.0', 
            city || 'Unknown', 
            regionName || 'Unknown', 
            country || 'Unknown', 
            countryCode || '??', 
            isp || 'Unknown', 
            parseFloat(lat) || 0, 
            parseFloat(lon) || 0, 
            timezone || 'UTC',
            userAgent || 'Unknown', 
            screenRes || 'Unknown', 
            referrer || 'Direct', 
            language || 'en'
        ];
        
        console.log(`[${new Date().toLocaleTimeString()}] 🚀 Tracking: ${siteLabel} | Client: ${query} | ${city}, ${countryCode}`);
        const { rows } = await pool.query(queryText, values);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(`[${new Date().toLocaleTimeString()}] ❌ Track error:`, err.message);
        res.status(500).json({ error: 'Failed to log visit', details: err.message });
    }
});

// Get Hits (v1)
app.get('/api/v1/hits', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM visitor_logs ORDER BY timestamp DESC LIMIT 500;');
        res.json(rows);
    } catch (err) {
        console.error('❌ Hits fetch error:', err.message);
        res.status(500).json({ error: 'Failed to fetch signal data', details: err.message });
    }
});

// Redirect old routes to v1
app.post('/api/track', (req, res) => res.redirect(307, '/api/v1/track'));
app.get('/api/hits', (req, res) => res.redirect(301, '/api/v1/hits'));

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

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date(), db: pool ? 'connected' : 'none' });
});

// Serve Frontend in Production
app.use(express.static(distPath));

// Handle React Routing - Use regex to match all paths (Express 5 compatibility)
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
        if (err) {
            res.status(500).send("Frontend build not found. Run 'npm run build' first.");
        }
    });
});

app.listen(port, () => {
    console.log(`🚀 Hub Backend active on port ${port}`);
});
