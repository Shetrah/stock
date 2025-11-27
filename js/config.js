// Configuration Manager for Customization
class StockConfig {
    constructor() {
        this.defaultConfig = {
            // Stock Management
            autoReorder: true,
            lowStockThreshold: 0.2,
            criticalStockThreshold: 0,
            enableStockAlerts: true,
            
            // Locations
            defaultLocationId: 1,
            multiLocationSupport: false,
            
            // Features
            enableBarcode: true,
            enableCategories: true,
            enableSuppliers: true,
            enableDepartments: true,
            enableCostTracking: false,
            
            // UI/UX
            language: 'en',
            theme: 'light',
            dateFormat: 'YYYY-MM-DD',
            currency: 'USD',
            
            // Notifications
            enablePushNotifications: true,
            emailAlerts: false,
            alertFrequency: 'daily',
            
            // Data Management
            autoBackup: true,
            backupFrequency: 'weekly',
            dataRetention: 365 // days
        };
        
        this.loadConfig();
    }

    loadConfig() {
        const savedConfig = localStorage.getItem('stockConfig');
        if (savedConfig) {
            this.config = { ...this.defaultConfig, ...JSON.parse(savedConfig) };
        } else {
            this.config = { ...this.defaultConfig };
            this.saveConfig();
        }
        return this.config;
    }

    saveConfig() {
        localStorage.setItem('stockConfig', JSON.stringify(this.config));
    }

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.saveConfig();
        this.notifyConfigChange();
    }

    get(key) {
        return this.config[key];
    }

    set(key, value) {
        this.config[key] = value;
        this.saveConfig();
        this.notifyConfigChange();
    }

    notifyConfigChange() {
        document.dispatchEvent(new CustomEvent('configChanged', { 
            detail: { config: this.config } 
        }));
    }

    resetToDefaults() {
        this.config = { ...this.defaultConfig };
        this.saveConfig();
        this.notifyConfigChange();
    }

    // Feature flags
    isFeatureEnabled(feature) {
        const featureFlags = {
            categories: this.config.enableCategories,
            suppliers: this.config.enableSuppliers,
            departments: this.config.enableDepartments,
            barcode: this.config.enableBarcode,
            costTracking: this.config.enableCostTracking,
            multiLocation: this.config.multiLocationSupport
        };
        
        return featureFlags[feature] || false;
    }
}

// Global configuration instance
const stockConfig = new StockConfig();
window.stockConfig = stockConfig;