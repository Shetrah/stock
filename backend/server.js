const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware - Updated CORS for deployment
app.use(cors({
    origin: [
        'http://localhost:5500', 
        'http://127.0.0.1:5500', 
        'http://localhost:3000',
        'https://stock-management-production-a320.up.railway.app',
        'https://your-vercel-app.vercel.app', // Your Vercel frontend
        'https://*.vercel.app', // All Vercel subdomains
        '*' // Allow all origins for testing
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// SQLite Database
const db = new sqlite3.Database('./stockflow.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database
function initializeDatabase() {
    db.serialize(() => {
        // Create tables
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

        db.run(`CREATE TABLE IF NOT EXISTS stock_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            material_id INTEGER NOT NULL,
            transaction_type TEXT NOT NULL,
            quantity REAL NOT NULL,
            balance_after_transaction REAL,
            reference_number TEXT,
            project_code TEXT,
            department TEXT,
            notes TEXT,
            created_by TEXT DEFAULT 'System',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(material_id) REFERENCES materials(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS daily_usage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            material_id INTEGER NOT NULL,
            usage_date DATE NOT NULL,
            quantity_used REAL NOT NULL DEFAULT 0,
            project_code TEXT,
            department TEXT,
            recorded_by TEXT,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(material_id) REFERENCES materials(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS stock_alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            material_id INTEGER NOT NULL,
            alert_type TEXT NOT NULL,
            current_quantity REAL,
            threshold_quantity REAL,
            alert_message TEXT,
            is_resolved BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(material_id) REFERENCES materials(id)
        )`);

        // Insert sample data
        db.get("SELECT COUNT(*) as count FROM materials", (err, row) => {
            if (row.count === 0) {
                console.log('📦 Inserting sample data...');
                
                const sampleMaterials = [
                    ['Steel Plates', 'STL-001', 'Raw materials for construction', 'Raw Material', 'units', 5, 20, 30, 60, 45.50, 'General Supplies Inc.'],
                    ['Electrical Wire', 'EW-100', 'Copper electrical wiring', 'Electrical', 'meters', 15, 50, 75, 150, 2.30, 'Electrical Components Ltd.'],
                    ['PVC Pipes', 'PVC-50', 'Plastic piping for construction', 'Raw Material', 'units', 0, 10, 15, 30, 8.75, 'General Supplies Inc.'],
                    ['Bolts', 'BLT-10', 'Assorted bolts and nuts', 'Mechanical', 'units', 45, 50, 75, 150, 0.25, 'General Supplies Inc.']
                ];

                const stmt = db.prepare(`INSERT INTO materials 
                    (name, code, description, category, unit, current_quantity, min_stock_level, reorder_level, max_stock_level, current_cost, supplier) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                
                sampleMaterials.forEach(material => {
                    stmt.run(material);
                });
                stmt.finalize();
                
                console.log('✅ Sample data inserted successfully');
            }
        });
    });
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        database: 'sqlite',
        message: 'StockFlow API is running!',
        timestamp: new Date().toISOString(),
        cors: 'enabled'
    });
});

// Get all materials
app.get('/api/materials', (req, res) => {
    const search = req.query.search || '';
    
    let query = `SELECT * FROM materials WHERE is_active = 1`;
    let params = [];

    if (search) {
        query += ` AND (name LIKE ? OR code LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY name`;

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Error fetching materials:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, data: rows });
    });
});

// Get material by ID
app.get('/api/materials/:id', (req, res) => {
    db.get("SELECT * FROM materials WHERE id = ? AND is_active = 1", [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        if (!row) {
            return res.status(404).json({ success: false, error: 'Material not found' });
        }

        // Get transactions
        db.all("SELECT * FROM stock_transactions WHERE material_id = ? ORDER BY created_at DESC LIMIT 50", 
               [req.params.id], (err, transactions) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json({
                success: true,
                data: {
                    ...row,
                    transactions: transactions || []
                }
            });
        });
    });
});

// Create new material - FIXED VERSION
app.post('/api/materials', (req, res) => {
    console.log('📥 Received material data:', req.body);
    
    const { 
        name, 
        code, 
        description = '', 
        category = 'Raw Material', 
        unit, 
        initial_quantity = 0, 
        min_stock_level, 
        current_cost = 0, 
        supplier = 'General Supplies' 
    } = req.body;

    // Validation
    if (!name || !code || !unit || !min_stock_level) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields: name, code, unit, min_stock_level are required' 
        });
    }

    db.serialize(() => {
        const stmt = db.prepare(`INSERT INTO materials 
            (name, code, description, category, unit, current_quantity, min_stock_level, reorder_level, max_stock_level, current_cost, supplier) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        
        stmt.run([
            name, 
            code, 
            description, 
            category, 
            unit, 
            initial_quantity, 
            min_stock_level, 
            min_stock_level * 1.5,  // reorder_level
            min_stock_level * 3,    // max_stock_level
            current_cost, 
            supplier
        ], function(err) {
            if (err) {
                console.error('❌ Database error:', err.message);
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ 
                        success: false, 
                        error: `Material code '${code}' already exists` 
                    });
                }
                return res.status(500).json({ 
                    success: false, 
                    error: 'Database error: ' + err.message 
                });
            }
            
            const materialId = this.lastID;
            console.log('✅ Material created with ID:', materialId);
            
            // Record initial transaction if quantity provided
            if (initial_quantity > 0) {
                db.run(`INSERT INTO stock_transactions 
                    (material_id, transaction_type, quantity, balance_after_transaction, reference_number, notes, created_by)
                    VALUES (?, 'PURCHASE_IN', ?, ?, ?, ?, ?)`,
                    [
                        materialId, 
                        initial_quantity, 
                        initial_quantity, 
                        `INIT-${code}-${Date.now()}`,
                        'Initial stock', 
                        'System'
                    ], function(transErr) {
                        if (transErr) {
                            console.error('❌ Transaction error:', transErr.message);
                        } else {
                            console.log('✅ Initial transaction recorded');
                        }
                    });
            }
            
            res.json({
                success: true,
                data: { id: materialId },
                message: `Material '${name}' created successfully`
            });
        });
        
        stmt.finalize();
    });
});

// Record transaction
app.post('/api/transactions', (req, res) => {
    const { material_id, transaction_type, quantity, reference_number, project_code, department, notes, created_by } = req.body;

    db.serialize(() => {
        // Get current quantity
        db.get("SELECT current_quantity FROM materials WHERE id = ?", [material_id], (err, row) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }

            const currentQuantity = row.current_quantity;
            const newQuantity = currentQuantity + quantity;

            // Update material quantity
            db.run("UPDATE materials SET current_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                [newQuantity, material_id], function(err) {
                    if (err) {
                        return res.status(500).json({ success: false, error: err.message });
                    }
                    
                    // Record transaction
                    db.run(`INSERT INTO stock_transactions 
                        (material_id, transaction_type, quantity, balance_after_transaction, reference_number, project_code, department, notes, created_by)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [material_id, transaction_type, quantity, newQuantity, reference_number, project_code, department, notes, created_by || 'System'],
                        function(err) {
                            if (err) {
                                return res.status(500).json({ success: false, error: err.message });
                            }
                            res.json({
                                success: true,
                                data: { id: this.lastID },
                                message: 'Transaction recorded successfully'
                            });
                        });
                });
        });
    });
});

// Record daily usage
app.post('/api/daily-usage', (req, res) => {
    const { material_id, quantity_used, project_code, department, recorded_by, notes } = req.body;

    db.serialize(() => {
        // Get current quantity
        db.get("SELECT current_quantity FROM materials WHERE id = ?", [material_id], (err, row) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }

            const currentQuantity = row.current_quantity;
            const newQuantity = currentQuantity - quantity_used;

            // Update material quantity
            db.run("UPDATE materials SET current_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                [newQuantity, material_id], function(err) {
                    if (err) {
                        return res.status(500).json({ success: false, error: err.message });
                    }
                    
                    // Record usage
                    db.run(`INSERT INTO daily_usage 
                        (material_id, usage_date, quantity_used, project_code, department, recorded_by, notes)
                        VALUES (?, date('now'), ?, ?, ?, ?, ?)`,
                        [material_id, quantity_used, project_code, department, recorded_by || 'System', notes],
                        function(err) {
                            if (err) {
                                return res.status(500).json({ success: false, error: err.message });
                            }
                            
                            // Record transaction
                            db.run(`INSERT INTO stock_transactions 
                                (material_id, transaction_type, quantity, balance_after_transaction, reference_number, project_code, department, notes, created_by)
                                VALUES (?, 'DAILY_USAGE', ?, ?, 'USAGE-${Date.now()}', ?, ?, ?, ?)`,
                                [material_id, -quantity_used, newQuantity, project_code, department, notes, recorded_by || 'System']);
                            
                            res.json({
                                success: true,
                                data: { id: this.lastID },
                                message: 'Usage recorded successfully'
                            });
                        });
                });
        });
    });
});

// Get dashboard stats
app.get('/api/dashboard/stats', (req, res) => {
    db.get(`SELECT 
        (SELECT COUNT(*) FROM materials WHERE is_active = 1) as total_materials,
        (SELECT COUNT(*) FROM materials WHERE is_active = 1 AND current_quantity > min_stock_level) as in_stock,
        (SELECT COUNT(*) FROM materials WHERE is_active = 1 AND current_quantity <= min_stock_level AND current_quantity > 0) as low_stock,
        (SELECT COUNT(*) FROM materials WHERE is_active = 1 AND current_quantity <= 0) as out_of_stock,
        (SELECT COUNT(*) FROM stock_alerts WHERE is_resolved = 0) as active_alerts,
        (SELECT COALESCE(SUM(quantity_used), 0) FROM daily_usage WHERE usage_date = date('now')) as today_usage`,
    (err, row) => {
        if (err) {
            console.error('Error fetching stats:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, data: row });
    });
});

// Get stock alerts
app.get('/api/alerts', (req, res) => {
    db.all(`SELECT sa.*, m.name as material_name, m.code as material_code, m.unit
            FROM stock_alerts sa
            JOIN materials m ON sa.material_id = m.id
            WHERE sa.is_resolved = 0
            ORDER BY sa.created_at DESC`, (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, data: rows });
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('🚀 StockFlow SQLite Server running on port 3000');
    console.log('📊 API available at http://localhost:3000/api');
    console.log('❤️  Health check: http://localhost:3000/api/health');
    console.log('💾 Using SQLite database: stockflow.db');
    console.log('🌐 CORS enabled for all origins');
});