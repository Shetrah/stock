// Barcode Scanner Simulation
class BarcodeScanner {
    constructor() {
        this.isScanning = false;
    }

    simulateScan() {
        const materials = [
            { code: 'STL-001', name: 'Steel Plates' },
            { code: 'EW-100', name: 'Electrical Wire' },
            { code: 'PVC-50', name: 'PVC Pipes' },
            { code: 'BLT-10', name: 'Bolts' }
        ];

        const randomMaterial = materials[Math.floor(Math.random() * materials.length)];
        this.displayScanResult(randomMaterial);
    }

    async displayScanResult(material) {
        const resultDiv = document.getElementById('scanResult');
        const dbMaterial = await db.materials.where('code').equals(material.code).first();

        if (!dbMaterial) {
            resultDiv.innerHTML = `
                <div class="alert-item alert-critical">
                    <div class="alert-header">
                        <div class="alert-title">Material Not Found</div>
                    </div>
                    <div class="alert-message">No material found with code: ${material.code}</div>
                </div>
            `;
        } else {
            const stockStatus = app.getStockStatusClass(dbMaterial);
            const statusText = stockStatus === 'stock-critical' ? 'CRITICAL' : 
                             stockStatus === 'stock-low' ? 'LOW' : 'HEALTHY';

            resultDiv.innerHTML = `
                <div class="material-item ${stockStatus}">
                    <div class="material-header">
                        <div>
                            <div class="material-name">${dbMaterial.name}</div>
                            <div class="material-code">${dbMaterial.code}</div>
                        </div>
                        <div class="material-stock ${stockStatus}">
                            ${dbMaterial.currentQuantity} ${dbMaterial.unit}
                        </div>
                    </div>
                    <div class="material-details">
                        <span>Status: ${statusText}</span>
                        <span>Min Stock: ${dbMaterial.minStockLevel} ${dbMaterial.unit}</span>
                    </div>
                    <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                        <button class="btn btn-primary" onclick="quickUseMaterial(${dbMaterial.id})">
                            <i class="fas fa-clipboard-list"></i> Record Usage
                        </button>
                        <button class="btn" onclick="viewMaterialHistory(${dbMaterial.id})" style="background: var(--secondary); color: white;">
                            <i class="fas fa-history"></i> History
                        </button>
                    </div>
                </div>
            `;
        }

        resultDiv.style.display = 'block';
    }
}

// Global scanner instance
const scanner = new BarcodeScanner();

// Global functions for button clicks
function simulateScan() {
    scanner.simulateScan();
}

async function quickUseMaterial(materialId) {
    showView('usageView');
    document.getElementById('materialSelect').value = materialId;
    document.getElementById('quantity').focus();
}

function viewMaterialHistory(materialId) {
    // Implementation for viewing material history
    app.showToast('History feature coming soon!', 'warning');
}