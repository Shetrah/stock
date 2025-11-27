class StockFlowAPI {
    constructor() {
        this.baseURL = 'https://stock-management-production-a320.up.railway.app/api';
        this.isOnline = false;
    }

    async checkConnection() {
        try {
            console.log('🔍 Checking connection to:', this.baseURL);
            const response = await fetch(`${this.baseURL}/health`);
            this.isOnline = response.ok;
            console.log('✅ Connection status:', this.isOnline);
            return this.isOnline;
        } catch (error) {
            console.error('❌ Connection failed:', error);
            this.isOnline = false;
            return false;
        }
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        console.log('📡 API Request:', url, options);
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            console.log('📨 API Response Status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error Response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ API Success Response:', data);
            return data;
        } catch (error) {
            console.error(`❌ API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // Materials API
    async getMaterials(search = '') {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        return this.request(`/materials?${params}`);
    }

    async getMaterial(id) {
        return this.request(`/materials/${id}`);
    }

    async createMaterial(materialData) {
        console.log('📦 Creating material:', materialData);
        return this.request('/materials', {
            method: 'POST',
            body: JSON.stringify(materialData)
        });
    }

    // Transactions API
    async recordTransaction(transactionData) {
        return this.request('/transactions', {
            method: 'POST',
            body: JSON.stringify(transactionData)
        });
    }

    async recordDailyUsage(usageData) {
        return this.request('/daily-usage', {
            method: 'POST',
            body: JSON.stringify(usageData)
        });
    }

    // Dashboard API
    async getDashboardStats() {
        return this.request('/dashboard/stats');
    }

    // Alerts API
    async getAlerts() {
        return this.request('/alerts');
    }
}

// Global API instance
const stockAPI = new StockFlowAPI();
window.stockAPI = stockAPI;