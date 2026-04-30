<!DOCTYPE html>
<html>
<head>
  <title>Stock Valuation Report</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    th { background-color: #f0f0f0; }
    .total-row { font-weight: bold; background-color: #f9f9f9; }
    .no-print { margin-bottom: 20px; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <h2>Stock Valuation Report</h2>
  <div class="no-print">
    <button onclick="window.print()">Print / Save as PDF</button>
  </div>
  <div id="report-content"></div>
  <p id="loading-msg">Loading report data...</p>

  <script>
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(products => {
        document.getElementById('loading-msg').style.display = 'none';

        if (!products.length) {
          document.getElementById('report-content').innerHTML = '<p>No products found.</p>';
          return;
        }

        let totalValue = 0;
        let rows = '';
        products.forEach(p => {
          const lineTotal = p.quantity * p.unitPrice;
          totalValue += lineTotal;
          rows += `<tr>
            <td>${p.sku}</td>
            <td>${p.name}</td>
            <td>${p.category || '—'}</td>
            <td>${p.quantity}</td>
            <td>${p.unitPrice.toFixed(2)}</td>
            <td>${lineTotal.toFixed(2)}</td>
          </tr>`;
        });

        document.getElementById('report-content').innerHTML = `
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>SKU</th><th>Product Name</th><th>Category</th>
                <th>Qty in Stock</th><th>Unit Price</th><th>Total Value</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="5">Total Stock Value</td>
                <td>${totalValue.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>`;
      })
      .catch(err => {
        document.getElementById('loading-msg').textContent = 'Failed to load report data. Make sure the backend server is running on port 5000.';
        console.error(err);
      });
  </script>
</body>
</html>
