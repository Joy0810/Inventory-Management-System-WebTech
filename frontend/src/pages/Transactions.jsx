import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [pageLoadError, setPageLoadError] = useState(false);
  
  const [formError, setFormError] = useState('');
  const [availableStock, setAvailableStock] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({ productId: '', from: '', to: '' });
  const [form, setForm] = useState({ productId: '', type: 'stock-in', quantity: '', note: '' });

  const fetchInitialData = async () => {
    setLoading(true);
    setPageLoadError(false);
    try {
      const [productsRes, transactionsRes] = await Promise.all([
        api.get('/products'),
        api.get('/transactions')
      ]);
      setProducts(productsRes.data);
      setTransactions(transactionsRes.data);
    } catch (err) {
      setPageLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (queryParams = {}) => {
    try {
      const params = new URLSearchParams();
      if (queryParams.productId) params.append('productId', queryParams.productId);
      if (queryParams.from) params.append('from', queryParams.from);
      if (queryParams.to) params.append('to', queryParams.to);
      
      const res = await api.get(`/transactions?${params.toString()}`);
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleFormChange = (e) => {
    setFormError('');
    setAvailableStock(null);
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setAvailableStock(null);

    const { productId, type, quantity, note } = form;
    const parsedQty = parseInt(quantity, 10);

    if (!productId) {
      setFormError('Product must be selected');
      return;
    }
    if (isNaN(parsedQty) || parsedQty < 1) {
      setFormError('Quantity must be >= 1');
      return;
    }

    try {
      await api.post('/transactions', {
        productId,
        type,
        quantity: parsedQty,
        note
      });

      // Success
      setForm({ productId: '', type: 'stock-in', quantity: '', note: '' });
      fetchTransactions(filter);
    } catch (err) {
      if (err.response && err.response.status === 400 && err.response.data.error) {
        if (err.response.data.error === 'Insufficient stock') {
          setFormError(`Insufficient stock — Only ${err.response.data.available} units available`);
          setAvailableStock(err.response.data.available);
        } else {
          setFormError(err.response.data.error);
        }
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    }
  };

  const handleFilterChange = (e) => {
    setFilter(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const applyFilter = () => {
    fetchTransactions(filter);
  };

  const clearFilter = () => {
    setSearchTerm('');
    setFilter({ productId: '', from: '', to: '' });
    fetchTransactions({});
  };

  if (loading) {
    return (
      <div style={styles.pageBody}>
        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          .shimmer-block {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite linear;
          }
        `}</style>
        
        <h1 style={styles.pageTitle}>Transactions</h1>
        <p style={styles.pageSubtitle}>Manage stock inflow and outflow movements.</p>

        <div style={styles.card}>
          <h3 style={styles.cardHeading}>Record Transaction</h3>
          <div style={styles.recordGrid}>
            <div className="shimmer-block" style={{ height: '38px', borderRadius: '8px' }} />
            <div className="shimmer-block" style={{ height: '38px', borderRadius: '8px' }} />
            <div className="shimmer-block" style={{ height: '38px', borderRadius: '8px' }} />
            <div className="shimmer-block" style={{ height: '38px', borderRadius: '8px' }} />
          </div>
        </div>

        <div style={styles.filterBar}>
          <div className="shimmer-block" style={{ height: '38px', width: '160px', borderRadius: '8px' }} />
          <div className="shimmer-block" style={{ height: '38px', width: '140px', borderRadius: '8px' }} />
          <div className="shimmer-block" style={{ height: '38px', width: '140px', borderRadius: '8px' }} />
        </div>

        <div style={styles.card}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
                <div className="shimmer-block" style={{ height: '20px', borderRadius: '4px' }} />
                <div className="shimmer-block" style={{ height: '20px', borderRadius: '4px' }} />
                <div className="shimmer-block" style={{ height: '20px', borderRadius: '4px' }} />
                <div className="shimmer-block" style={{ height: '20px', borderRadius: '4px' }} />
                <div className="shimmer-block" style={{ height: '20px', borderRadius: '4px' }} />
                <div className="shimmer-block" style={{ height: '20px', borderRadius: '4px' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (pageLoadError) {
    return (
      <div style={styles.pageBody}>
        <p style={{ color: '#dc2626' }}>Failed to load transactions.</p>
        <button onClick={fetchInitialData} style={styles.filterBtn}>Retry</button>
      </div>
    );
  }

  const filteredTransactions = transactions.filter(t => {
    let match = true;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = t.productId?.name?.toLowerCase().includes(term);
      const matchSku = t.productId?.sku?.toLowerCase().includes(term);
      if (!matchName && !matchSku) match = false;
    }
    if (filter.productId && t.productId?._id !== filter.productId && t.productId !== filter.productId) {
      match = false;
    }
    if (filter.from && new Date(t.createdAt) < new Date(filter.from + 'T00:00:00.000Z')) {
      match = false;
    }
    if (filter.to && new Date(t.createdAt) > new Date(filter.to + 'T23:59:59.999Z')) {
      match = false;
    }
    return match;
  });

  return (
    <div style={styles.pageBody}>
      <h1 style={styles.pageTitle}>Transactions</h1>
      <p style={styles.pageSubtitle}>Manage stock inflow and outflow movements.</p>

      <input
        type="text"
        placeholder="Search by product name or SKU..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: '100%', maxWidth: '400px', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', backgroundColor: '#fff', marginBottom: '20px', boxSizing: 'border-box' }}
      />

      {/* Record Transaction Card */}
      <div style={styles.card}>
        <h3 style={styles.cardHeading}>Record Transaction</h3>
        <form onSubmit={handleFormSubmit}>
          <div style={styles.recordGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Select Product</label>
              <select name="productId" value={form.productId} onChange={handleFormChange} style={styles.input}>
                <option value="" disabled>-- Select Product --</option>
                {products.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Transaction Type</label>
              <select name="type" value={form.type} onChange={handleFormChange} style={styles.input}>
                <option value="stock-in">Stock In</option>
                <option value="stock-out">Stock Out</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Quantity</label>
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={form.quantity}
                onChange={handleFormChange}
                min="1"
                step="1"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Optional Note</label>
              <input
                type="text"
                name="note"
                placeholder="Optional note"
                value={form.note}
                onChange={handleFormChange}
                style={styles.input}
              />
            </div>
          </div>
          
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center' }}>
            <button type="submit" style={styles.recordBtn}>Record Transaction</button>
            {formError && <span style={{ color: '#dc2626', marginLeft: '16px', fontSize: '14px', fontWeight: 500 }}>{formError}</span>}
            {availableStock !== null && (
              <span style={{ color: '#eab308', marginLeft: '16px', fontSize: '14px', fontWeight: 500 }}>Only {availableStock} units available</span>
            )}
          </div>
        </form>
      </div>

      {/* Filter Bar */}
      <div style={styles.filterBar}>
        <select name="productId" value={filter.productId} onChange={handleFilterChange} style={{...styles.input, minWidth: '160px', width: 'auto'}}>
          <option value="">All Products</option>
          {products.map(p => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>From</span>
          <input type="date" name="from" value={filter.from} onChange={handleFilterChange} style={{...styles.input, width: 'auto'}} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>To</span>
          <input type="date" name="to" value={filter.to} onChange={handleFilterChange} style={{...styles.input, width: 'auto'}} />
        </div>
        
        <button onClick={applyFilter} style={styles.filterBtn}>Filter</button>
        <button onClick={clearFilter} style={styles.clearBtn}>Clear</button>
      </div>

      {/* Table Section */}
      <div style={styles.card}>
        {filteredTransactions.length === 0 ? (
          <p style={styles.emptyState}>No transactions found.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>DATE</th>
                <th style={styles.th}>PRODUCT NAME</th>
                <th style={styles.th}>SKU</th>
                <th style={styles.th}>TYPE</th>
                <th style={styles.th}>QTY</th>
                <th style={styles.th}>NOTE</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(t => {
                const isStockIn = t.type === 'stock-in';
                return (
                  <tr key={t._id}>
                    <td style={styles.td}>
                      {new Date(t.createdAt).toLocaleString('en-GB', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td style={styles.td}>{t.productId?.name}</td>
                    <td style={styles.td}>
                      <span style={styles.skuPill}>{t.productId?.sku}</span>
                    </td>
                    <td style={styles.td}>
                      {isStockIn ? (
                        <span style={styles.typePillIn}>Stock In</span>
                      ) : (
                        <span style={styles.typePillOut}>Stock Out</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {isStockIn ? (
                        <span style={styles.qtyIn}>+{t.quantity}</span>
                      ) : (
                        <span style={styles.qtyOut}>-{t.quantity}</span>
                      )}
                    </td>
                    <td style={{...styles.td, color: '#9ca3af', fontStyle: 'italic'}}>
                      {t.note || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageBody: {
    padding: '28px',
    backgroundColor: '#f4f5f7',
    minHeight: '100%'
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#111',
    margin: '0 0 4px 0'
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 24px 0'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    marginBottom: '24px'
  },
  cardHeading: {
    fontSize: '16px',
    fontWeight: 600,
    margin: '0 0 16px 0',
    color: '#111827'
  },
  recordGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 2fr',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#6b7280',
    marginBottom: '4px',
    display: 'block'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: '#fff',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    outline: 'none'
  },
  recordBtn: {
    backgroundColor: '#e53935',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '11px 20px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  filterBar: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginBottom: '16px'
  },
  filterBtn: {
    backgroundColor: '#111827',
    color: '#fff',
    borderRadius: '8px',
    padding: '9px 18px',
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer'
  },
  clearBtn: {
    backgroundColor: '#fff',
    color: '#374151',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '9px 18px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  th: {
    textTransform: 'uppercase',
    fontSize: '11px',
    fontWeight: 600,
    color: '#9ca3af',
    letterSpacing: '0.05em',
    padding: '10px 16px',
    borderBottom: '1px solid #f3f4f6'
  },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#111827',
    borderBottom: '1px solid #f9fafb'
  },
  skuPill: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    fontFamily: 'monospace',
    fontSize: '12px',
    padding: '3px 8px',
    borderRadius: '4px'
  },
  typePillIn: {
    backgroundColor: '#dcfce7',
    color: '#16a34a',
    fontSize: '12px',
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: '20px'
  },
  typePillOut: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    fontSize: '12px',
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: '20px'
  },
  qtyIn: {
    color: '#16a34a',
    fontWeight: 600
  },
  qtyOut: {
    color: '#dc2626',
    fontWeight: 600
  },
  emptyState: {
    textAlign: 'center',
    color: '#9ca3af',
    padding: '20px 0',
    fontStyle: 'italic'
  }
};
