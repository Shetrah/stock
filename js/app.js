// Main Application Controller
class StockManagementApp {
    constructor() {
        this.currentView = 'dashboardView';
        this.isInitialized = false;
        this.useBackend = true; // Use SQLite backend
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing StockManagementApp...');
            this.setupEventListeners();
            this.updateDate();
            await this.loadDashboardData();
            await this.loadMaterials();
            this.isInitialized = true;
            
            console.log('✅ App initialized successfully');
            this.showToast('StockFlow is ready!', 'success');
        } catch (error) {
            console.error('App initialization error:', error);
            this.showToast('Failed to initialize app', 'error');
        }
    }

    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');
        
        // Usage form submission
        const usageForm = document.getElementById('usageForm');
        if (usageForm) {
            usageForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.recordUsage();
            });
        }

        // Add stock form submission
        const addStockForm = document.getElementById('addStockForm');
        if (addStockForm) {
            addStockForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addNewMaterial();
            });
        }

        // Material search
        const materialSearch = document.getElementById('materialSearch');
        if (materialSearch) {
            materialSearch.addEventListener('input', (e) => {
                this.searchMaterials(e.target.value);
            });
        }

        // Settings form handlers
        const autoReorder = document.getElementById('autoReorder');
        if (autoReorder) {
            autoReorder.addEventListener('change', (e) => {
                this.updateSetting('autoReorder', e.target.checked);
            });
        }
    }

    updateDate() {
        const now = new Date();
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    async loadDashboardData() {
        try {
            console.log('📊 Loading dashboard data...');
            
            if (this.useBackend && stockAPI) {
                // Use SQLite backend
                const response = await stockAPI.getDashboardStats();
                const alertsResponse = await stockAPI.getAlerts();
                
                if (response.success) {
                    const stats = response.data;
                    const alerts = alertsResponse.success ? alertsResponse.data : [];

                    document.getElementById('totalMaterials').textContent = stats.total_materials;
                    document.getElementById('inStock').textContent = stats.in_stock;
                    document.getElementById('lowStock').textContent = stats.low_stock;
                    document.getElementById('outOfStock').textContent = stats.out_of_stock;
                    document.getElementById('alertCount').textContent = stats.active_alerts;

                    this.loadAlerts(alerts);
                } else {
                    throw new Error('Failed to load dashboard data');
                }
            } else {
                // Fallback to sample data
                document.getElementById('totalMaterials').textContent = '4';
                document.getElementById('inStock').textContent = '1';
                document.getElementById('lowStock').textContent = '2';
                document.getElementById('outOfStock').textContent = '1';
                document.getElementById('alertCount').textContent = '3';

                this.loadAlerts([
                    {
                        material_name: 'Steel Plates',
                        alert_type: 'WARNING',
                        alert_message: 'Low stock! Only 5 units remaining.',
                        actionRequired: 'Reorder 20 units'
                    },
                    {
                        material_name: 'PVC Pipes',
                        alert_type: 'CRITICAL',
                        alert_message: 'Out of stock!',
                        actionRequired: 'Order immediately'
                    }
                ]);
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            // Fallback to sample data
            document.getElementById('totalMaterials').textContent = '4';
            document.getElementById('inStock').textContent = '1';
            document.getElementById('lowStock').textContent = '2';
            document.getElementById('outOfStock').textContent = '1';
            document.getElementById('alertCount').textContent = '3';
            
            this.showToast('Using sample data - backend not available', 'warning');
        }
    }

    loadAlerts(alerts) {
        const container = document.getElementById('alertsContainer');
        if (!container) return;

        container.innerHTML = '';

        if (alerts.length === 0) {
            container.innerHTML = '<div class="alert-item alert-info">No active alerts</div>';
            return;
        }

        alerts.forEach(alert => {
            const alertEl = document.createElement('div');
            const isCritical = alert.alert_type === 'CRITICAL' || alert.alertType === 'CRITICAL';
            alertEl.className = `alert-item ${isCritical ? 'alert-critical' : 'alert-warning'}`;
            
            const materialName = alert.material_name || alert.materialName;
            const alertMessage = alert.alert_message || alert.alertMessage;
            const actionRequired = alert.actionRequired || 'Check stock levels';
            
            alertEl.innerHTML = `
                <div class="alert-header">
                    <div class="alert-title">${materialName}</div>
                    <div class="alert-badge ${isCritical ? 'badge-critical' : 'badge-warning'}">
                        ${isCritical ? 'CRITICAL' : 'WARNING'}
                    </div>
                </div>
                <div class="alert-message">${alertMessage}</div>
                <div class="alert-action">${actionRequired}</div>
            `;

            container.appendChild(alertEl);
        });
    }

    async loadMaterials() {
        try {
            console.log('📦 Loading materials...');
            const select = document.getElementById('materialSelect');
            const list = document.getElementById('materialsList');

            if (!select || !list) return;

            // Clear existing options
            select.innerHTML = '<option value="">Select Material</option>';
            list.innerHTML = '';

            let materials = [];

            if (this.useBackend && stockAPI) {
                // Load from SQLite backend
                const response = await stockAPI.getMaterials();
                if (response.success) {
                    materials = response.data;
                } else {
                    throw new Error('Failed to load materials from backend');
                }
            } else {
                // Fallback to sample data
                materials = [
                    { id: 1, name: 'Steel Plates', code: 'STL-001', current_quantity: 5, min_stock_level: 20, unit: 'units' },
                    { id: 2, name: 'Electrical Wire', code: 'EW-100', current_quantity: 15, min_stock_level: 50, unit: 'meters' },
                    { id: 3, name: 'PVC Pipes', code: 'PVC-50', current_quantity: 0, min_stock_level: 10, unit: 'units' },
                    { id: 4, name: 'Bolts', code: 'BLT-10', current_quantity: 45, min_stock_level: 50, unit: 'units' }
                ];
            }

            materials.forEach(material => {
                // Add to select dropdown
                const option = document.createElement('option');
                option.value = material.id;
                const currentQuantity = material.current_quantity || material.currentQuantity;
                const unit = material.unit_of_measure || material.unit;
                option.textContent = `${material.name} (${material.code}) - ${currentQuantity} ${unit}`;
                select.appendChild(option);

                // Add to materials list
                const materialEl = document.createElement('div');
                materialEl.className = `material-item ${this.getStockStatusClass(material)}`;
                
                const statusText = this.getStockStatusText(material);
                const minStockLevel = material.min_stock_level || material.minStockLevel;
                
                materialEl.innerHTML = `
                    <div class="material-header">
                        <div>
                            <div class="material-name">${material.name}</div>
                            <div class="material-code">${material.code}</div>
                        </div>
                        <div class="material-stock ${this.getStockStatusClass(material)}">
                            ${currentQuantity} ${unit}
                        </div>
                    </div>
                    <div class="material-details">
                        <span>Min: ${minStockLevel} ${unit}</span>
                        <span>Location: Main Warehouse</span>
                    </div>
                    <div class="material-status">
                        <span class="status-badge ${this.getStockStatusClass(material)}">${statusText}</span>
                    </div>
                `;

                list.appendChild(materialEl);
            });
        } catch (error) {
            console.error('Error loading materials:', error);
            this.showToast('Error loading materials', 'error');
        }
    }

    getStockStatusClass(material) {
        const currentQuantity = material.current_quantity || material.currentQuantity;
        const minStockLevel = material.min_stock_level || material.minStockLevel;
        
        if (currentQuantity <= 0) return 'stock-critical';
        if (currentQuantity <= minStockLevel) return 'stock-low';
        return 'stock-healthy';
    }

    getStockStatusText(material) {
        const currentQuantity = material.current_quantity || material.currentQuantity;
        const minStockLevel = material.min_stock_level || material.minStockLevel;
        
        if (currentQuantity <= 0) return 'Out of Stock';
        if (currentQuantity <= minStockLevel) return 'Low Stock';
        return 'Healthy';
    }

    async recordUsage() {
        try {
            const formData = new FormData(document.getElementById('usageForm'));
            const materialId = parseInt(formData.get('materialSelect'));
            const quantity = parseFloat(formData.get('quantity'));
            const department = formData.get('department');
            const project = formData.get('project');
            const notes = formData.get('notes');

            if (!materialId || !quantity) {
                this.showToast('Please select a material and enter quantity', 'error');
                return;
            }

            if (this.useBackend && stockAPI) {
                // Record usage in SQLite backend
                await stockAPI.recordDailyUsage({
                    material_id: materialId,
                    quantity_used: quantity,
                    project_code: project,
                    department: department,
                    recorded_by: 'Nexa',
                    notes: notes
                });

                this.showToast(`Usage recorded: ${quantity} units`, 'success');
            } else {
                // Local fallback
                this.showToast(`Usage recorded locally: ${quantity} units`, 'success');
            }

            // Reset form and refresh data
            document.getElementById('usageForm').reset();
            await this.loadDashboardData();
            await this.loadMaterials();
            showView('dashboardView');

        } catch (error) {
            console.error('Error recording usage:', error);
            this.showToast('Error recording usage', 'error');
        }
    }

    async addNewMaterial() {
        try {
            console.log('📝 Starting material addition...');
            
            // Get form elements directly (more reliable than FormData)
            const nameInput = document.getElementById('newMaterialName');
            const codeInput = document.getElementById('materialCode');
            const categorySelect = document.getElementById('category');
            const unitSelect = document.getElementById('unit');
            const quantityInput = document.getElementById('initialQuantity');
            const minStockInput = document.getElementById('minStock');

            console.log('🔍 Form elements:', {
                nameInput, codeInput, categorySelect, unitSelect, quantityInput, minStockInput
            });

            // Check if elements exist
            if (!nameInput || !codeInput || !categorySelect || !unitSelect || !quantityInput || !minStockInput) {
                console.error('❌ Missing form elements');
                this.showToast('Form elements not found. Please refresh the page.', 'error');
                return;
            }

            // Get values with null checks
            const name = nameInput.value?.trim() || '';
            const code = codeInput.value?.trim() || '';
            const category = categorySelect.value || 'raw';
            const unit = unitSelect.value || 'units';
            const initialQuantity = parseFloat(quantityInput.value) || 0;
            const minStock = parseFloat(minStockInput.value) || 0;

            console.log('📋 Form values:', {
                name, code, category, unit, initialQuantity, minStock
            });

            // Validation
            if (!name) {
                this.showToast('Please enter material name', 'error');
                nameInput.focus();
                return;
            }

            if (!code) {
                this.showToast('Please enter material code', 'error');
                codeInput.focus();
                return;
            }

            if (!unit) {
                this.showToast('Please select unit of measure', 'error');
                unitSelect.focus();
                return;
            }

            if (!minStock || minStock <= 0) {
                this.showToast('Please enter a valid minimum stock level', 'error');
                minStockInput.focus();
                return;
            }

            if (this.useBackend && stockAPI) {
                console.log('🚀 Sending to backend...');
                
                // Add to SQLite backend
                const result = await stockAPI.createMaterial({
                    name: name,
                    code: code,
                    description: '', // Optional
                    category: category,
                    unit: unit,
                    initial_quantity: initialQuantity,
                    min_stock_level: minStock,
                    current_cost: 0, // Default value
                    supplier: 'General Supplies' // Default value
                });

                if (result.success) {
                    this.showToast(`Material "${name}" added successfully!`, 'success');
                    console.log('✅ Material added successfully:', result);
                } else {
                    throw new Error(result.error || 'Failed to add material');
                }
            } else {
                // Local fallback
                this.showToast(`Material "${name}" added locally!`, 'success');
            }

            // Reset form and refresh data
            document.getElementById('addStockForm').reset();
            await this.loadDashboardData();
            await this.loadMaterials();
            showView('dashboardView');

        } catch (error) {
            console.error('❌ Error adding material:', error);
            this.showToast('Error adding material: ' + error.message, 'error');
        }
    }

    searchMaterials(query) {
        const materials = document.querySelectorAll('.material-item');
        const searchTerm = query.toLowerCase().trim();

        materials.forEach(material => {
            const materialName = material.querySelector('.material-name').textContent.toLowerCase();
            const materialCode = material.querySelector('.material-code').textContent.toLowerCase();
            
            if (materialName.includes(searchTerm) || materialCode.includes(searchTerm)) {
                material.style.display = 'block';
            } else {
                material.style.display = 'none';
            }
        });
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = `toast ${type} show`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    updateSetting(key, value) {
        console.log(`Updating setting: ${key} = ${value}`);
        // Save to localStorage or send to backend
        localStorage.setItem(`stockflow_${key}`, value);
        this.showToast(`Setting updated: ${key}`, 'success');
    }

    async exportData() {
        try {
            if (this.useBackend && stockAPI) {
                const materials = await stockAPI.getMaterials();
                const stats = await stockAPI.getDashboardStats();
                
                const data = {
                    materials: materials.data,
                    stats: stats.data,
                    exportDate: new Date().toISOString()
                };

                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `stockflow-export-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                this.showToast('Data exported successfully!', 'success');
            } else {
                this.showToast('Export requires backend connection', 'error');
            }
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showToast('Error exporting data', 'error');
        }
    }

    async resetData() {
        if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
            try {
                // Clear localStorage
                localStorage.clear();
                this.showToast('Data reset successfully', 'success');
                
                // Reload the app
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } catch (error) {
                console.error('Error resetting data:', error);
                this.showToast('Error resetting data', 'error');
            }
        }
    }
}

// View Management
function showView(viewName) {
    console.log('Switching to view:', viewName);
    
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    // Show selected view
    const targetView = document.getElementById(viewName);
    if (targetView) {
        targetView.classList.add('active');
    }

    // Update bottom nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Update current view in app
    if (window.app && window.app.currentView) {
        window.app.currentView = viewName;
    }
}

// Settings functions
function updateSetting(key, value) {
    if (window.app) {
        window.app.updateSetting(key, value);
    }
}

function exportData() {
    if (window.app) {
        window.app.exportData();
    }
}

function resetData() {
    if (window.app) {
        window.app.resetData();
    }
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, initializing app...');
    app = new StockManagementApp();
    window.app = app; // Make it globally available
    window.showView = showView; // Make it globally available
    
    // Show dashboard by default
    showView('dashboardView');
});

// Make functions globally available
window.StockManagementApp = StockManagementApp;
window.updateSetting = updateSetting;
window.exportData = exportData;
window.resetData = resetData;