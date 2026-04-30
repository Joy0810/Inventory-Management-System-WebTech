import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [pageLoadError, setPageLoadError] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  
  const [formError, setFormError] = useState('');
  const [pageError, setPageError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    phone: '',
    address: ''
  });

  const fetchSuppliers = async () => {
    setLoading(true);
    setPageLoadError(false);
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data);
    } catch (err) {
      setPageLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const openAddModal = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      contactEmail: '',
      phone: '',
      address: ''
    });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name || '',
      contactEmail: supplier.contactEmail || '',
      phone: supplier.phone || '',
      address: supplier.address || ''
    });
    setFormError('');
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingSupplier(null);
  };

  const handleFormChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier._id}`, formData);
      } else {
        await api.post('/suppliers', formData);
      }
      handleModalClose();
      fetchSuppliers();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setFormError(err.response.data.error);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    }
  };

  const handleDelete = async (supplier) => {
    setPageError('');
    if (window.confirm(`Are you sure you want to delete ${supplier.name}?`)) {
      try {
        await api.delete(`/suppliers/${supplier._id}`);
        fetchSuppliers();
      } catch (err) {
        if (err.response && err.response.data && err.response.data.error) {
          setPageError(err.response.data.error);
        } else {
          setPageError('Failed to delete supplier.');
        }
      }
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
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
        
        <div style={styles.headerContainer}>
          <div>
            <h1 style={styles.pageTitle}>Suppliers</h1>
            <p style={styles.pageSubtitle}>Manage your supplier contacts and relationships.</p>
          </div>
          <button style={styles.addBtn}>+ Add Supplier</button>
        </div>

        <div style={styles.card}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #f9fafb', gap: '20px' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="shimmer-block" style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0 }} />
                  <div className="shimmer-block" style={{ height: '16px', width: '120px', borderRadius: '4px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="shimmer-block" style={{ height: '16px', width: '150px', borderRadius: '4px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="shimmer-block" style={{ height: '16px', width: '100px', borderRadius: '4px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="shimmer-block" style={{ height: '16px', width: '180px', borderRadius: '4px' }} />
                </div>
                <div style={{ width: '140px' }}>
                  <div className="shimmer-block" style={{ height: '16px', width: '100%', borderRadius: '4px' }} />
                </div>
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
        <p style={{ color: '#dc2626' }}>Failed to load suppliers.</p>
        <button onClick={fetchSuppliers} style={styles.editBtn}>Retry</button>
      </div>
    );
  }

  return (
    <div style={styles.pageBody}>
      <div style={styles.headerContainer}>
        <div>
          <h1 style={styles.pageTitle}>Suppliers</h1>
          <p style={styles.pageSubtitle}>Manage your supplier contacts and relationships.</p>
        </div>
        <button onClick={openAddModal} style={styles.addBtn}>+ Add Supplier</button>
      </div>

      {pageError && <p style={{ color: '#dc2626', marginBottom: '16px' }}>{pageError}</p>}

      <div style={styles.card}>
        {suppliers.length === 0 ? (
          <div style={styles.emptyState}>No suppliers added yet.</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>NAME</th>
                <th style={styles.th}>EMAIL</th>
                <th style={styles.th}>PHONE</th>
                <th style={styles.th}>ADDRESS</th>
                <th style={styles.th}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map(s => (
                <tr key={s._id}>
                  <td style={styles.td}>
                    <div style={styles.nameCell}>
                      <div style={styles.avatar}>{getInitials(s.name)}</div>
                      <span style={styles.nameText}>{s.name}</span>
                    </div>
                  </td>
                  <td style={{...styles.td, color: '#2563eb'}}>{s.contactEmail || '—'}</td>
                  <td style={{...styles.td, color: '#6b7280'}}>{s.phone || '—'}</td>
                  <td style={styles.td}>
                    <div style={styles.addressText}>{s.address || '—'}</div>
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => openEditModal(s)} style={styles.editBtn}>Edit</button>
                    <button onClick={() => handleDelete(s)} style={styles.deleteBtn}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</h3>
            {formError && <p style={{ color: 'red', marginBottom: '10px' }}>{formError}</p>}
            
            <form onSubmit={handleFormSubmit} style={styles.form}>
              <label style={styles.label}>
                Name *
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  style={styles.input}
                />
              </label>

              <label style={styles.label}>
                Contact Email
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleFormChange}
                  style={styles.input}
                />
              </label>

              <label style={styles.label}>
                Phone
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  style={styles.input}
                />
              </label>

              <label style={styles.label}>
                Address
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  style={styles.input}
                />
              </label>

              <div style={styles.modalActions}>
                <button type="button" onClick={handleModalClose} style={{ marginRight: '10px' }}>Cancel</button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  pageBody: {
    padding: '28px',
    backgroundColor: '#f4f5f7',
    minHeight: '100%'
  },
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
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
  addBtn: {
    backgroundColor: '#e53935',
    color: '#fff',
    borderRadius: '8px',
    padding: '10px 20px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    overflow: 'hidden'
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
    padding: '12px 20px',
    borderBottom: '1px solid #f3f4f6'
  },
  td: {
    padding: '14px 20px',
    fontSize: '14px',
    color: '#374151',
    borderBottom: '1px solid #f9fafb'
  },
  nameCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  nameText: {
    fontWeight: 600,
    color: '#111'
  },
  addressText: {
    color: '#6b7280',
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  editBtn: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    color: '#374151',
    borderRadius: '6px',
    padding: '6px 14px',
    fontSize: '13px',
    cursor: 'pointer',
    marginRight: '8px'
  },
  deleteBtn: {
    backgroundColor: '#fff',
    border: '1px solid #fca5a5',
    color: '#dc2626',
    borderRadius: '6px',
    padding: '6px 14px',
    fontSize: '13px',
    cursor: 'pointer'
  },
  emptyState: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '14px',
    padding: '40px'
  },
  /* Modal Styles (Unchanged) */
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
    padding: '20px',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '400px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    fontWeight: 'bold'
  },
  input: {
    marginTop: '5px',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '10px'
  }
};
