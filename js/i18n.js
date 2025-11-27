// Internationalization (i18n) Support
class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('preferredLang') || 'en';
        this.translations = {
            en: {
                // App
                'app.name': 'StockFlow',
                'welcome.message': 'Welcome to StockFlow!',
                
                // Dashboard
                'dashboard.title': 'Dashboard',
                'dashboard.totalMaterials': 'Total Materials',
                'dashboard.inStock': 'In Stock',
                'dashboard.lowStock': 'Low Stock',
                'dashboard.outOfStock': 'Out of Stock',
                'dashboard.criticalAlerts': 'Critical Alerts',
                'dashboard.noAlerts': 'No active alerts',
                'dashboard.quickActions': 'Quick Actions',
                
                // Actions
                'actions.scanMaterial': 'Scan Material',
                'actions.recordUsage': 'Record Usage',
                'actions.checkStock': 'Check Stock',
                'actions.addStock': 'Add Stock',
                
                // Scan
                'scan.title': 'Scan Material',
                'scan.barcodeScanner': 'Barcode Scanner',
                'scan.simulateScan': 'Simulate Scan',
                'scan.materialNotFound': 'Material not found with code: {code}',
                
                // Usage
                'usage.title': 'Record Material Usage',
                'usage.department': 'Department',
                'usage.selectDepartment': 'Select Department',
                'usage.projectCode': 'Project Code',
                'usage.projectPlaceholder': 'e.g., PROJ-ALPHA',
                'usage.material': 'Material',
                'usage.selectMaterial': 'Select Material',
                'usage.quantity': 'Quantity Used',
                'usage.notes': 'Notes',
                'usage.notesPlaceholder': 'What was this used for?',
                'usage.recordUsage': 'Record Usage',
                'usage.recordSuccess': 'Usage recorded successfully! {quantity} {unit} used',
                'usage.insufficientStock': 'Insufficient stock. Only {quantity} {unit} available',
                
                // Add Stock
                'addStock.title': 'Add New Stock',
                'addStock.materialName': 'Material Name',
                'addStock.materialCode': 'Material Code',
                'addStock.category': 'Category',
                'addStock.unit': 'Unit of Measure',
                'addStock.initialQuantity': 'Initial Quantity',
                'addStock.minStock': 'Minimum Stock Level',
                'addStock.addMaterial': 'Add Material',
                'addStock.success': 'Material {name} added successfully!',
                'addStock.initialStock': 'Initial stock',
                
                // Materials
                'materials.title': 'All Materials',
                'materials.searchPlaceholder': 'Search materials...',
                'materials.minStock': 'Min: {quantity} {unit}',
                'materials.location': 'Location: Main Warehouse',
                'materials.noMaterials': 'No materials found',
                'materials.noTransactions': 'No transactions yet',
                
                // Departments
                'departments.electrical': 'Electrical',
                'departments.production': 'Production',
                'departments.maintenance': 'Maintenance',
                'departments.quality': 'Quality Control',
                
                // Categories
                'categories.raw': 'Raw Material',
                'categories.electrical': 'Electrical',
                'categories.mechanical': 'Mechanical',
                'categories.packaging': 'Packaging',
                
                // Units
                'units.units': 'Units',
                'units.kg': 'Kilograms',
                'units.meters': 'Meters',
                'units.liters': 'Liters',
                
                // Navigation
                'navigation.dashboard': 'Dashboard',
                'navigation.scan': 'Scan',
                'navigation.usage': 'Usage',
                'navigation.stock': 'Stock',
                
                // Status
                'status.healthy': 'Healthy',
                'status.low': 'Low',
                'status.critical': 'Critical',
                'status.outOfStock': 'Out of Stock',
                
                // Alerts
                'alerts.lowStock': 'Low stock! Only {quantity} {unit} remaining.',
                'alerts.outOfStock': 'Out of stock! Immediate action required.',
                'alerts.reorder': 'Order {quantity} {unit} immediately',
                'alerts.reorderLow': 'Reorder {quantity} {unit}',
                
// Export
'export.success': 'Data exported successfully',

// Settings
'actions.settings': 'Settings',
'navigation.settings': 'Settings',
'settings.title': 'Settings',
'settings.general': 'General Settings',
'settings.autoReorder': 'Auto Reorder',
'settings.enableCategories': 'Enable Categories',
'settings.enableSuppliers': 'Enable Suppliers',
'settings.dataManagement': 'Data Management',
'settings.exportData': 'Export Data',
'settings.resetData': 'Reset to Defaults'
            },
            zh: {
                // App
                'app.name': '库存通',
                'welcome.message': '欢迎使用库存通！',
                
                // Dashboard
                'dashboard.title': '仪表板',
                'dashboard.totalMaterials': '总物料',
                'dashboard.inStock': '库存充足',
                'dashboard.lowStock': '库存不足',
                'dashboard.outOfStock': '缺货',
                'dashboard.criticalAlerts': '紧急警报',
                'dashboard.noAlerts': '暂无警报',
                'dashboard.quickActions': '快捷操作',
                
                // Actions
                'actions.scanMaterial': '扫描物料',
                'actions.recordUsage': '记录使用',
                'actions.checkStock': '检查库存',
                'actions.addStock': '添加库存',
                
                // Scan
                'scan.title': '扫描物料',
                'scan.barcodeScanner': '条码扫描器',
                'scan.simulateScan': '模拟扫描',
                'scan.materialNotFound': '未找到物料代码: {code}',
                
                // Usage
                'usage.title': '记录物料使用',
                'usage.department': '部门',
                'usage.selectDepartment': '选择部门',
                'usage.projectCode': '项目代码',
                'usage.projectPlaceholder': '例如：PROJ-ALPHA',
                'usage.material': '物料',
                'usage.selectMaterial': '选择物料',
                'usage.quantity': '使用数量',
                'usage.notes': '备注',
                'usage.notesPlaceholder': '用于什么用途？',
                'usage.recordUsage': '记录使用',
                'usage.recordSuccess': '使用记录成功！使用了 {quantity} {unit}',
                'usage.insufficientStock': '库存不足。仅剩 {quantity} {unit}',
                
                // Add Stock
                'addStock.title': '添加新库存',
                'addStock.materialName': '物料名称',
                'addStock.materialCode': '物料代码',
                'addStock.category': '类别',
                'addStock.unit': '计量单位',
                'addStock.initialQuantity': '初始数量',
                'addStock.minStock': '最低库存水平',
                'addStock.addMaterial': '添加物料',
                'addStock.success': '物料 {name} 添加成功！',
                'addStock.initialStock': '初始库存',
                
                // Materials
                'materials.title': '所有物料',
                'materials.searchPlaceholder': '搜索物料...',
                'materials.minStock': '最低: {quantity} {unit}',
                'materials.location': '位置: 主仓库',
                'materials.noMaterials': '未找到物料',
                'materials.noTransactions': '暂无交易记录',
                
                // Departments
                'departments.electrical': '电气部门',
                'departments.production': '生产部门',
                'departments.maintenance': '维护部门',
                'departments.quality': '质量控制',
                
                // Categories
                'categories.raw': '原材料',
                'categories.electrical': '电气',
                'categories.mechanical': '机械',
                'categories.packaging': '包装',
                
                // Units
                'units.units': '个',
                'units.kg': '公斤',
                'units.meters': '米',
                'units.liters': '升',
                
                // Navigation
                'navigation.dashboard': '仪表板',
                'navigation.scan': '扫描',
                'navigation.usage': '使用记录',
                'navigation.stock': '库存',
                
                // Status
                'status.healthy': '充足',
                'status.low': '不足',
                'status.critical': '紧急',
                'status.outOfStock': '缺货',
                
                // Alerts
                'alerts.lowStock': '库存不足！仅剩 {quantity} {unit}。',
                'alerts.outOfStock': '缺货！需要立即处理。',
                'alerts.reorder': '立即订购 {quantity} {unit}',
                'alerts.reorderLow': '重新订购 {quantity} {unit}',
                
                // Export
                'export.success': '数据导出成功',

                // Settings
                'actions.settings': '设置',
                'navigation.settings': '设置',
                'settings.title': '设置',
                'settings.general': '常规设置',
                'settings.autoReorder': '自动重新订购',
                'settings.enableCategories': '启用类别',
                'settings.enableSuppliers': '启用供应商',
                'settings.dataManagement': '数据管理',
                'settings.exportData': '导出数据',
                'settings.resetData': '重置为默认值'
            }
        };
    }

    t(key, params = {}) {
        let translation = this.translations[this.currentLang][key] || this.translations['en'][key] || key;
        
        // Replace parameters
        Object.keys(params).forEach(param => {
            translation = translation.replace(`{${param}}`, params[param]);
        });
        
        return translation;
    }

    changeLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('preferredLang', lang);
            this.updatePage();
            
            // Dispatch event for app to refresh
            document.dispatchEvent(new CustomEvent('languageChanged'));
            return true;
        }
        return false;
    }

    updatePage() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });

        // Update placeholder texts
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.setAttribute('placeholder', this.t(key));
        });

        // Update language switcher
        document.getElementById('langCode').textContent = this.currentLang.toUpperCase();

        // Update RTL/LTR if needed
        document.documentElement.dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = this.currentLang;

        // Update dates and numbers based on locale
        this.updateLocalizedContent();
    }

    updateLocalizedContent() {
    // Update date format based on language
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        const locale = this.currentLang === 'zh' ? 'zh-CN' : 'en-US';
        dateElement.textContent = now.toLocaleDateString(locale, options);
    }

    }

    getCurrentLanguage() {
        return this.currentLang;
    }

    getAvailableLanguages() {
        return Object.keys(this.translations);
    }
}

// Global i18n instance
const i18n = new I18n();

// Language toggle function
function toggleLanguage() {
    const currentLang = i18n.getCurrentLanguage();
    const newLang = currentLang === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(newLang);
    
    // Show language change confirmation
    const message = newLang === 'zh' ? '语言已切换到中文' : 'Language switched to English';
    if (window.app) {
        app.showToast(message, 'success');
    }
}

// Initialize i18n when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    i18n.updatePage();
});