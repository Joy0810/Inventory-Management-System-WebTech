import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [formError, setFormError] = useState('');
  const [pageError, setPageError] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [pageLoadError, setPageLoadError] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: '',
    reorderLevel: 10,
    supplierId: ''
  });

  const fetchData = async () => {
    setLoading(true);
    setPageLoadError(false);
    try {
      const [productsRes, suppliersRes] = await Promise.all([
        api.get('/products'),
        api.get('/suppliers')
      ]);
      setProducts(productsRes.data);
      setSuppliers(suppliersRes.data);
    } catch (err) {
      setPageLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      category: '',
      unitPrice: '',
      reorderLevel: 10,
      supplierId: ''
    });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      sku: product.sku || '',
      category: product.category || '',
      unitPrice: product.unitPrice !== undefined ? product.unitPrice : '',
      reorderLevel: product.reorderLevel !== undefined ? product.reorderLevel : 10,
      supplierId: product.supplierId ? (typeof product.supplierId === 'object' ? product.supplierId._id : product.supplierId) : ''
    });
    setFormError('');
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'sku') {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const payload = { ...formData };
    if (!payload.supplierId) {
      payload.supplierId = null; 
    }
    
    payload.unitPrice = Number(payload.unitPrice);
    payload.reorderLevel = Number(payload.reorderLevel);

    try {
      if (editingProduct) {
        const { sku, ...editPayload } = payload;
        await api.put(`/products/${editingProduct._id}`, editPayload);
      } else {
        await api.post('/products', payload);
      }
      handleModalClose();
      fetchData();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setFormError(err.response.data.error);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    }
  };

  const handleDelete = async (product) => {
    setPageError('');
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      try {
        await api.delete(`/products/${product._id}`);
        fetchData();
      } catch (err) {
        if (err.response && err.response.data && err.response.data.error) {
          setPageError(err.response.data.error);
        } else {
          setPageError('Failed to delete product.');
        }
      }
    }
  };

  if (pageLoadError) {
    return (
      <div style={{ padding: '40px' }}>
        <p style={{ color: 'red' }}>Failed to load data. Please check your connection.</p>
        <button onClick={fetchData} style={styles.retryBtn}>Retry</button>
      </div>
    );
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryStyle = (cat) => {
    const c = (cat || '').toLowerCase();
    if (c === 'electronics') return { background: '#eff6ff', color: '#3b82f6' };
    if (c === 'peripherals') return { background: '#f0fdf4', color: '#22c55e' };
    if (c === 'audio') return { background: '#fdf4ff', color: '#a855f7' };
    if (c === 'furniture') return { background: '#fff7ed', color: '#f97316' };
    if (c === 'accessories') return { background: '#fefce8', color: '#eab308' };
    return { background: '#f4f5f7', color: '#6b7280' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Topbar */}
      <div style={styles.topbar}>
        <div />
        <button onClick={openAddModal} style={styles.addBtn}>+ Add Product</button>
      </div>

      <div style={styles.pageBody}>
        <h2 style={styles.pageTitle}>Products</h2>

        {pageError && <p style={{ color: '#e53935', marginBottom: '20px' }}>{pageError}</p>}

        <div style={styles.tableCard}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="skeleton" style={{ height: '24px', width: '100%' }} />
              <div className="skeleton" style={{ height: '40px', width: '100%' }} />
              <div className="skeleton" style={{ height: '40px', width: '100%' }} />
              <div className="skeleton" style={{ height: '40px', width: '100%' }} />
              <div className="skeleton" style={{ height: '40px', width: '100%' }} />
            </div>
          ) : products.length === 0 ? (
            <div style={styles.emptyState}>No products found</div>
          ) : filtered.length === 0 ? (
            <div style={styles.emptyState}>No products match your search</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>NAME</th>
                  <th style={styles.th}>SKU</th>
                  <th style={styles.th}>CATEGORY</th>
                  <th style={styles.th}>QTY</th>
                  <th style={styles.th}>REORDER LEVEL</th>
                  <th style={styles.th}>UNIT PRICE</th>
                  <th style={styles.th}>SUPPLIER</th>
                  <th style={styles.th}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => {
                  const catStyle = getCategoryStyle(product.category);
                  const isLowStock = product.quantity <= product.reorderLevel && product.reorderLevel > 0;

                  return (
                    <tr key={product._id} style={{ borderBottom: '1px solid #f4f5f7' }}>
                      <td style={styles.td}>{product.name}</td>
                      <td style={styles.td}>{product.sku}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.pill,
                          backgroundColor: catStyle.background,
                          color: catStyle.color
                        }}>
                          {product.category || 'Other'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {isLowStock ? (
                          <span style={styles.qtyBadge}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                              <line x1="12" y1="9" x2="12" y2="13"></line>
                              <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                            {product.quantity}
                          </span>
                        ) : (
                          <span style={{ color: '#1a1a1a' }}>{product.quantity}</span>
                        )}
                      </td>
                      <td style={styles.td}>{product.reorderLevel}</td>
                      <td style={styles.td}>{Number(product.unitPrice).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                      <td style={styles.td}>{product.supplierId && product.supplierId.name ? product.supplierId.name : '—'}</td>
                      <td style={styles.td}>
                        <button onClick={() => openEditModal(product)} style={styles.editBtn}>Edit</button>
                        <button onClick={() => handleDelete(product)} style={styles.deleteBtn}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={styles.modalTitle}>{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={handleModalClose} style={styles.closeBtn}>&times;</button>
            </div>
            
            {formError && <p style={{ color: '#e53935', marginBottom: '16px' }}>{formError}</p>}
            
            <form onSubmit={handleFormSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>SKU *</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleFormChange}
                  required
                  disabled={!!editingProduct}
                  style={styles.input}
                />
                <span style={styles.hint}>Uppercase letters and numbers only, max 20 characters</span>
              </div>

              <div style={styles.grid2}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Quantity</label>
                  <input
                    type="number"
                    value={editingProduct ? editingProduct.quantity : 0}
                    disabled
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.grid2}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Reorder Level *</label>
                  <input
                    type="number"
                    name="reorderLevel"
                    value={formData.reorderLevel}
                    onChange={handleFormChange}
                    required
                    min="0"
                    style={styles.input}
                  />
                  <span style={styles.hint}>Set to 0 to disable alerts</span>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Unit Price *</label>
                  <input
                    type="number"
                    name="unitPrice"
                    value={formData.unitPrice}
                    onChange={handleFormChange}
                    required
                    min="0"
                    step="0.01"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Supplier</label>
                <select
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleFormChange}
                  style={styles.input}
                >
                  <option value="">-- No Supplier --</option>
                  {suppliers.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.modalButtons}>
                <button type="button" onClick={handleModalClose} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.saveBtn}>{editingProduct ? 'Save Changes' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  topbar: {
    backgroundColor: '#fff',
    padding: '14px 28px',
    borderBottom: '1px solid #eaeaea',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f4f5f7',
    padding: '8px 16px',
    borderRadius: '8px',
    width: '320px',
    gap: '10px'
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    width: '100%',
    fontSize: '14px',
    fontFamily: 'inherit'
  },
  addBtn: {
    backgroundColor: '#e53935',
    color: '#fff',
    borderRadius: '8px',
    padding: '10px 20px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer'
  },
  pageBody: {
    backgroundColor: '#f4f5f7',
    padding: '28px',
    flex: 1
  },
  pageTitle: {
    fontWeight: 'bold',
    fontSize: '24px',
    color: '#1a1a1a',
    margin: '0 0 20px 0'
  },
  tableCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  th: {
    textTransform: 'uppercase',
    fontSize: '11px',
    color: '#9a9a9a',
    fontWeight: 600,
    letterSpacing: '0.05em',
    borderBottom: '1px solid #eaeaea',
    padding: '0 0 12px 0'
  },
  td: {
    padding: '14px 8px',
    fontSize: '14px',
    color: '#1a1a1a'
  },
  pill: {
    borderRadius: '999px',
    padding: '3px 10px',
    fontSize: '12px',
    fontWeight: 600
  },
  qtyBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    color: '#e53935',
    borderRadius: '999px',
    padding: '3px 10px',
    fontSize: '13px',
    fontWeight: 600
  },
  editBtn: {
    backgroundColor: '#f4f5f7',
    color: '#1a1a1a',
    borderRadius: '6px',
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    marginRight: '8px'
  },
  deleteBtn: {
    backgroundColor: '#fef2f2',
    color: '#e53935',
    borderRadius: '6px',
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '32px',
    width: '480px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.16)'
  },
  modalTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 700,
    color: '#1a1a1a'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#9a9a9a'
  },
  formGroup: {
    marginBottom: '16px'
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#555',
    marginBottom: '6px',
    display: 'block'
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    outline: 'none'
  },
  hint: {
    display: 'block',
    fontSize: '11px',
    color: '#9a9a9a',
    marginTop: '4px'
  },
  modalButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px'
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#f4f5f7',
    color: '#1a1a1a',
    padding: '11px',
    borderRadius: '8px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer'
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#e53935',
    color: '#fff',
    padding: '11px',
    borderRadius: '8px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer'
  },
  emptyState: {
    textAlign: 'center',
    color: '#9a9a9a',
    fontSize: '14px',
    padding: '40px 0'
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
