<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stock Valuation Report</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f9fafb;
            color: #111827;
            margin: 0;
            padding: 40px 20px;
        }
        .report-card {
            background: white;
            max-width: 960px;
            margin: auto;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .report-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #eaeaea;
        }
        .brand {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .brand-icon {
            width: 32px;
            height: 32px;
            background-color: #e53935;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .brand-text {
            font-size: 18px;
            font-weight: 700;
            color: #111827;
        }
        .title-section {
            text-align: right;
        }
        .title {
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 4px 0;
            color: #111827;
        }
        .date {
            font-size: 14px;
            color: #6b7280;
            margin: 0;
        }
        .no-print {
            margin-bottom: 20px;
            text-align: right;
        }
        .btn-print {
            background-color: #e53935;
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            font-family: 'Inter', sans-serif;
            transition: background-color 0.2s;
        }
        .btn-print:hover {
            background-color: #d32f2f;
        }
        #loading-state, #error-state {
            text-align: center;
            padding: 40px 0;
            font-size: 16px;
        }
        #error-state {
            color: #e53935;
            display: none;
        }
        #report-table-container {
            display: none;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th {
            text-transform: uppercase;
            font-size: 11px;
            color: #9a9a9a;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #eaeaea;
            padding: 10px 0;
            text-align: left;
            font-weight: 600;
        }
        th.text-right {
            text-align: right;
        }
        td {
            border-bottom: 1px solid #f4f5f7;
            padding: 14px 0;
            font-size: 14px;
            color: #374151;
        }
        td.text-right {
            text-align: right;
        }
        .category-badge {
            background: #f4f5f7;
            color: #6b7280;
            border-radius: 999px;
            padding: 3px 10px;
            font-size: 12px;
            font-weight: 500;
            display: inline-block;
        }
        .grand-total-row td {
            border-bottom: none;
            padding-top: 20px;
        }
        .grand-total-label {
            text-align: right;
            font-weight: 600;
            padding-right: 20px;
            color: #111827;
        }
        .grand-total-value {
            color: #e53935;
            font-weight: bold;
            font-size: 16px;
            text-align: right;
        }
        .footer {
            font-size: 12px;
            color: #9a9a9a;
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eaeaea;
        }
        
        @media print {
            body {
                background-color: white;
                padding: 20px;
            }
            .no-print {
                display: none !important;
            }
            .report-card {
                box-shadow: none;
                border-radius: 0;
                padding: 0;
                margin: 0;
                max-width: 100%;
            }
            td {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
            tr:hover td {
                background-color: transparent !important;
            }
        }
    </style>
</head>
<body>
    <div class="report-card">
        <div class="no-print">
            <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
        </div>
        
        <div class="report-header">
            <div class="brand">
                <div class="brand-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                </div>
                <div class="brand-text">Inventory Manager</div>
            </div>
            <div class="title-section">
                <h1 class="title">Stock Valuation Report</h1>
                <p class="date" id="report-date"></p>
            </div>
        </div>

        <div id="loading-state">Loading report data...</div>
        <div id="error-state">Failed to load data. Make sure your backend server is running on port 5000.</div>

        <div id="report-table-container">
            <table>
                <thead>
                    <tr>
                        <th>SKU</th>
                        <th>PRODUCT NAME</th>
                        <th>CATEGORY</th>
                        <th class="text-right">QTY IN STOCK</th>
                        <th class="text-right">UNIT PRICE</th>
                        <th class="text-right">TOTAL VALUE</th>
                    </tr>
                </thead>
                <tbody id="report-body">
                    <!-- Data will be populated here -->
                </tbody>
                <tfoot>
                    <tr class="grand-total-row">
                        <td colspan="5" class="grand-total-label">Grand Total Stock Value</td>
                        <td class="grand-total-value" id="grand-total"></td>
                    </tr>
                </tfoot>
            </table>
            
            <div class="footer">
                This report reflects current stock valuation as of the date above.
            </div>
        </div>
    </div>

    <script>
        function formatINR(amount) {
            return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        document.addEventListener('DOMContentLoaded', () => {
            const dateElement = document.getElementById('report-date');
            const now = new Date();
            dateElement.textContent = now.toLocaleString('en-IN');

            const loadingState = document.getElementById('loading-state');
            const errorState = document.getElementById('error-state');
            const tableContainer = document.getElementById('report-table-container');
            const reportBody = document.getElementById('report-body');
            const grandTotalElement = document.getElementById('grand-total');

            fetch('http://localhost:5000/api/products')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(products => {
                    loadingState.style.display = 'none';
                    tableContainer.style.display = 'block';

                    let grandTotal = 0;

                    products.forEach(p => {
                        const qty = p.quantity !== undefined ? p.quantity : 0;
                        const price = p.unitPrice !== undefined ? p.unitPrice : 0;
                        const category = p.category ? p.category : '—';
                        const totalValue = qty * price;
                        
                        grandTotal += totalValue;

                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>\${p.sku || '—'}</td>
                            <td>\${p.name || '—'}</td>
                            <td><span class="category-badge">\${category}</span></td>
                            <td class="text-right">\${qty}</td>
                            <td class="text-right">\${formatINR(price)}</td>
                            <td class="text-right">\${formatINR(totalValue)}</td>
                        `;
                        reportBody.appendChild(tr);
                    });

                    grandTotalElement.textContent = formatINR(grandTotal);
                })
                .catch(error => {
                    console.error('Error fetching products:', error);
                    loadingState.style.display = 'none';
                    errorState.style.display = 'block';
                });
        });
    </script>
</body>
</html>
