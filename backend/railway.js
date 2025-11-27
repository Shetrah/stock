const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000', 'https://your-vercel-app.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// SQLite Database - Railway provides persistent storage
const db = new sqlite3.Database('./stockflow.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database on Railway');
        initializeDatabase();
    }
});

// Use your existing initializeDatabase() function here
function initializeDatabase() {
    // Copy your entire initializeDatabase function from server.js
    db.serialize(() => {
        // Create tables (your existing code)
        db.run(`CREATE TABLE IF NOT EXISTS materials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            code TEXT UNIQUE NOT NULL,
            description TEXT,
            category TEXT,
            unit TEXT NOT NULL,
            current_quantity REAL DEFAULT 0,
            min_stock_level REAL DEFAULT 0,
            reorder_level REAL DEFAULT 0,
            max_stock_level REAL DEFAULT 0,
            current_cost REAL DEFAULT 0,
            supplier TEXT,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // ... rest of your table creation and sample data code
    });
}

// Copy all your API routes from server.js
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        database: 'sqlite',
        message: 'StockFlow API is running on Railway!',
        timestamp: new Date().toISOString()
    });
});

// ... Copy ALL your other routes (materials, transactions, etc.)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 StockFlow Server running on port ${PORT}`);
    console.log('📊 API available at:', `http://localhost:${PORT}/api`);
});