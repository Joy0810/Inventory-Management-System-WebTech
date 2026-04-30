import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [productsRes, lowStockRes] = await Promise.all([
        api.get('/products'),
        api.get('/products/low-stock')
      ]);
      setProducts(productsRes.data);
      setLowStockProducts(lowStockRes.data);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (error) {
    return (
      <div style={{ padding: '40px' }}>
        <p style={{ color: 'red' }}>Failed to load data. Please check your connection.</p>
        <button onClick={fetchDashboardData} style={styles.retryBtn}>Retry</button>
      </div>
    );
  }

  // Calculate stats
  const totalProducts = products.length;
  const lowStockCount = lowStockProducts.length;
  const outOfStockCount = products.filter(p => p.quantity === 0).length;
  const healthyCount = Math.max(0, totalProducts - lowStockCount - outOfStockCount);
  
  const totalStockValue = products.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);

  // Donut chart logic
  const total = totalProducts === 0 ? 1 : totalProducts;
  const healthyPct = (healthyCount / total) * 100;
  const lowPct = (lowStockCount / total) * 100;
  const outPct = (outOfStockCount / total) * 100;
  
  const cHealthy = `${healthyPct} ${100 - healthyPct}`;
  const cLow = `${lowPct} ${100 - lowPct}`;
  const cOut = `${outPct} ${100 - outPct}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      <div style={styles.content}>
        {/* Summary Cards */}
        <div style={styles.cardsGrid}>
          {/* Card 1 */}
          <div style={styles.card}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9a9a9a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            {loading ? <div className="skeleton" style={{ height: '40px', width: '60px', marginTop: '16px' }} /> : <div style={styles.cardValue}>{totalProducts}</div>}
            <div style={styles.cardLabel}>TOTAL PRODUCTS</div>
          </div>

          {/* Card 2 */}
          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9a9a9a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              <span style={styles.attentionPill}>ATTENTION</span>
            </div>
            {loading ? <div className="skeleton" style={{ height: '40px', width: '60px', marginTop: '16px' }} /> : <div style={{ ...styles.cardValue, color: '#e53935' }}>{lowStockCount}</div>}
            <div style={styles.cardLabel}>LOW STOCK ITEMS</div>
          </div>

          {/* Card 3 */}
          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '20px', color: '#9a9a9a', fontWeight: 600 }}>₹</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#9a9a9a' }}>INR</span>
            </div>
            {loading ? <div className="skeleton" style={{ height: '40px', width: '120px', marginTop: '16px' }} /> : <div style={styles.cardValue}>
              {totalStockValue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
            </div>}
            <div style={styles.cardLabel}>TOTAL STOCK VALUE</div>
          </div>
        </div>

        {/* Bottom Row */}
        <div style={styles.bottomRow}>
          {/* Left Panel */}
          <div style={styles.healthPanel}>
            <h3 style={{ color: '#fff', margin: '0 0 24px 0', fontSize: '18px', fontWeight: 600 }}>Stock Health</h3>
            
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="skeleton" style={{ width: '160px', height: '160px', borderRadius: '50%', marginBottom: '30px' }} />
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="skeleton" style={{ height: '20px', width: '100%' }} />
                  <div className="skeleton" style={{ height: '20px', width: '100%' }} />
                  <div className="skeleton" style={{ height: '20px', width: '100%' }} />
                </div>
              </div>
            ) : (
              <>
                <div style={styles.donutContainer}>
                  <svg width="160" height="160" viewBox="0 0 42 42" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#2a2a2a" strokeWidth="6"></circle>
                    {totalProducts > 0 && (
                      <>
                        <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#22c55e" strokeWidth="6" strokeDasharray={cHealthy} strokeDashoffset="0"></circle>
                        <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#e53935" strokeWidth="6" strokeDasharray={cLow} strokeDashoffset={100 - healthyPct}></circle>
                        <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#3a3a3a" strokeWidth="6" strokeDasharray={cOut} strokeDashoffset={100 - healthyPct - lowPct}></circle>
                      </>
                    )}
                  </svg>
                  <div style={styles.donutCenterText}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>
                      {totalProducts === 0 ? '0%' : Math.round(healthyPct)}%
                    </div>
                    <div style={{ fontSize: '10px', color: '#9a9a9a', letterSpacing: '1px' }}>HEALTHY</div>
                  </div>
                </div>

                <div style={styles.legend}>
                  <div style={styles.legendItem}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
                      <span style={{ color: '#fff', fontSize: '14px' }}>Healthy</span>
                    </div>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{healthyCount}</span>
                  </div>
                  <div style={styles.legendItem}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#e53935' }}></div>
                      <span style={{ color: '#fff', fontSize: '14px' }}>Low Stock</span>
                    </div>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{lowStockCount}</span>
                  </div>
                  <div style={styles.legendItem}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3a3a3a' }}></div>
                      <span style={{ color: '#fff', fontSize: '14px' }}>Out of Stock</span>
                    </div>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{outOfStockCount}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Panel */}
          <div style={styles.tablePanel}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 600 }}>Low Stock Alerts</h3>
            
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="skeleton" style={{ height: '30px', width: '100%' }} />
                <div className="skeleton" style={{ height: '40px', width: '100%' }} />
                <div className="skeleton" style={{ height: '40px', width: '100%' }} />
                <div className="skeleton" style={{ height: '40px', width: '100%' }} />
              </div>
            ) : lowStockProducts.length === 0 ? (
              <div style={styles.emptyState}>All products are well-stocked ✓</div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>PRODUCT NAME</th>
                    <th style={styles.th}>SKU</th>
                    <th style={styles.th}>CURRENT QTY</th>
                    <th style={styles.th}>REORDER LEVEL</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map(p => (
                    <tr key={p._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={styles.td}>{p.name}</td>
                      <td style={styles.td}><span style={{ color: '#666' }}>{p.sku}</span></td>
                      <td style={styles.td}>
                        <span style={styles.qtyBadge}>{p.quantity}</span>
                      </td>
                      <td style={styles.td}>{p.reorderLevel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {

  content: {
    padding: '30px',
    boxSizing: 'border-box',
    flex: 1
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '20px'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  attentionPill: {
    backgroundColor: '#fef2f2',
    color: '#e53935',
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '4px 8px',
    borderRadius: '100px',
    letterSpacing: '0.5px'
  },
  cardValue: {
    fontSize: '36px',
    fontWeight: 700,
    color: '#1a1a1a',
    marginTop: '16px',
    marginBottom: '8px',
    lineHeight: 1
  },
  cardLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#9a9a9a',
    letterSpacing: '0.5px'
  },
  bottomRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.6fr',
    gap: '20px'
  },
  healthPanel: {
    backgroundColor: '#1e1e1e',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  donutContainer: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '30px'
  },
  donutCenterText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center'
  },
  legend: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  legendItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '12px',
    borderBottom: '1px solid #333'
  },
  tablePanel: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '340px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  th: {
    color: '#9a9a9a',
    fontSize: '11px',
    fontWeight: 600,
    paddingBottom: '16px',
    borderBottom: '1px solid #eaeaea',
    letterSpacing: '0.5px'
  },
  td: {
    padding: '16px 0',
    fontSize: '14px',
    color: '#1a1a1a',
    fontWeight: 500
  },
  qtyBadge: {
    backgroundColor: '#fef2f2',
    color: '#e53935',
    padding: '4px 10px',
    borderRadius: '100px',
    fontWeight: 'bold',
    fontSize: '13px'
  },
  emptyState: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#9a9a9a',
    fontSize: '14px',
    fontStyle: 'italic'
  },
  retryBtn: {
    marginTop: '10px',
    padding: '8px 16px',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};
