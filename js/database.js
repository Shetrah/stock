// Complete Database Schema Integration
const db = new Dexie('StockManagementDB');

// Define complete database schema
db.version(2).stores({
    // Main tables from our schema design
    materials: '++id, name, code, category, unit, currentQuantity, minStockLevel, reorderLevel, currentCost, supplierId, isActive, createdAt, updatedAt',
    categories: '++id, name, parentCategoryId, description',
    locations: '++id, name, code, address, isWarehouse, isActive',
    stockLevels: '++id, materialId, locationId, currentQuantity, lastUpdated',
    stockTransactions: '++id, materialId, locationId, transactionType, quantity, referenceNumber, notes, createdBy, createdAt',
    suppliers: '++id, name, contactPerson, email, phone, address, isActive',
    users: '++id, username, email, fullName, isActive',
    dailyUsage: '++id, materialId, locationId, usageDate, quantityUsed, projectCode, departmentId, recordedBy, notes, createdAt',
    departments: '++id, name, costCenter, isActive',
    stockAlerts: '++id, materialId, locationId, alertType, currentQuantity, thresholdQuantity, alertMessage, isResolved, resolvedBy, resolvedAt, createdAt'
});

// Database relationships and indexes
db.version(3).stores({
    materials: '++id, name, code, categoryId, unit, currentQuantity, minStockLevel, reorderLevel, maxStockLevel, currentCost, supplierId, isActive, createdAt, &code',
    categories: '++id, name, parentCategoryId, description, &name',
    locations: '++id, name, code, address, isWarehouse, isActive, &code',
    stockLevels: '++id, materialId, locationId, currentQuantity, lastUpdated, [materialId+locationId]',
    stockTransactions: '++id, materialId, locationId, transactionType, quantity, referenceNumber, projectCode, departmentId, notes, createdBy, createdAt, [materialId+createdAt]',
    suppliers: '++id, name, contactPerson, email, phone, address, isActive',
    users: '++id, username, email, fullName, isActive, &username',
    dailyUsage: '++id, materialId, locationId, usageDate, quantityUsed, projectCode, departmentId, recordedBy, notes, createdAt, [materialId+usageDate]',
    departments: '++id, name, costCenter, isActive',
    stockAlerts: '++id, materialId, locationId, alertType, currentQuantity, thresholdQuantity, alertMessage, isResolved, resolvedBy, resolvedAt, createdAt, [materialId+isResolved]'
}).upgrade(tx => {
    // Migration code for existing users
    return tx.table('materials').toCollection().modify(material => {
        material.categoryId = material.category || 1;
        material.reorderLevel = material.minStockLevel * 1.5;
        material.maxStockLevel = material.minStockLevel * 3;
        material.currentCost = material.currentCost || 0;
        material.supplierId = material.supplierId || 1;
        material.isActive = true;
    });
});

// Database configuration with default settings
db.configure = {
    // Stock settings - customizable
    settings: {
        autoReorder: true,
        lowStockThreshold: 0.2, // 20% below min stock
        criticalStockThreshold: 0, // 0 means out of stock
        defaultLocationId: 1,
        currency: 'USD',
        dateFormat: 'YYYY-MM-DD',
        enableBarcode: true,
        enableNotifications: true
    }
};

// Customizable database methods
db.customMethods = {
    // Get material with full details
    async getMaterialDetails(materialId) {
        const material = await db.materials.get(materialId);
        const stockLevels = await db.stockLevels.where('materialId').equals(materialId).toArray();
        const supplier = material.supplierId ? await db.suppliers.get(material.supplierId) : null;
        const category = material.categoryId ? await db.categories.get(material.categoryId) : null;
        
        return {
            ...material,
            stockLevels,
            supplier,
            category
        };
    },

    // Get current stock level for a material at a location
    async getCurrentStock(materialId, locationId = 1) {
        return await db.stockLevels
            .where('[materialId+locationId]')
            .equals([materialId, locationId])
            .first();
    },

    // Record stock transaction and update stock levels
    async recordTransaction(transactionData) {
        const { materialId, locationId, transactionType, quantity, referenceNumber, notes, createdBy } = transactionData;
        
        return await db.transaction('rw', db.stockTransactions, db.stockLevels, db.materials, async () => {
            // Add transaction
            const transactionId = await db.stockTransactions.add({
                materialId,
                locationId,
                transactionType,
                quantity,
                referenceNumber,
                notes,
                createdBy: createdBy || 'System',
                createdAt: new Date()
            });

            // Update stock level
            const currentStock = await db.getCurrentStock(materialId, locationId);
            const newQuantity = (currentStock?.currentQuantity || 0) + quantity;
            
            await db.stockLevels.put({
                id: currentStock?.id,
                materialId,
                locationId,
                currentQuantity: newQuantity,
                lastUpdated: new Date()
            });

            // Update material current quantity (for quick access)
            const material = await db.materials.get(materialId);
            if (material) {
                await db.materials.update(materialId, {
                    currentQuantity: newQuantity,
                    updatedAt: new Date()
                });
            }

            return transactionId;
        });
    },

    // Get dashboard statistics
    async getDashboardStats() {
        const [
            totalMaterials,
            totalTransactions,
            lowStockItems,
            criticalAlerts,
            todayUsage
        ] = await Promise.all([
            db.materials.where('isActive').equals(1).count(),
            db.stockTransactions.count(),
            db.materials.where('isActive').equals(1).filter(m => 
                m.currentQuantity <= m.minStockLevel && m.currentQuantity > 0
            ).count(),
            db.materials.where('isActive').equals(1).filter(m => 
                m.currentQuantity <= 0
            ).count(),
            db.dailyUsage.where('usageDate').equals(new Date().toISOString().split('T')[0]).toArray()
        ]);

        const totalUsageToday = todayUsage.reduce((sum, usage) => sum + usage.quantityUsed, 0);

        return {
            totalMaterials,
            totalTransactions,
            lowStockItems,
            criticalAlerts,
            totalUsageToday,
            totalValue: 0 // Can be calculated if cost data is available
        };
    },

    // Search materials with filters
    async searchMaterials(query, filters = {}) {
        let collection = db.materials.where('isActive').equals(1);
        
        if (query) {
            collection = collection.filter(material => 
                material.name.toLowerCase().includes(query.toLowerCase()) ||
                material.code.toLowerCase().includes(query.toLowerCase())
            );
        }

        if (filters.categoryId) {
            collection = collection.and(material => material.categoryId === filters.categoryId);
        }

        if (filters.supplierId) {
            collection = collection.and(material => material.supplierId === filters.supplierId);
        }

        if (filters.stockStatus) {
            switch (filters.stockStatus) {
                case 'low':
                    collection = collection.and(m => m.currentQuantity <= m.minStockLevel && m.currentQuantity > 0);
                    break;
                case 'critical':
                    collection = collection.and(m => m.currentQuantity <= 0);
                    break;
                case 'healthy':
                    collection = collection.and(m => m.currentQuantity > m.minStockLevel);
                    break;
            }
        }

        return await collection.toArray();
    }
};

// Export database instance with custom methods
Object.assign(db, db.customMethods);
window.db = db;