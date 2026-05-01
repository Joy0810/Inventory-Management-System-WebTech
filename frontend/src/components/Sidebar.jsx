import { NavLink } from 'react-router-dom';

export default function Sidebar({ isCollapsed, toggleCollapsed }) {
  const links = [
    { name: 'Dashboard', path: '/', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> },
    { name: 'Products', path: '/products', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> },
    { name: 'Transactions', path: '/transactions', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 17 12 21 16 17"></polyline><line x1="12" y1="12" x2="12" y2="21"></line><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"></path></svg> },
    { name: 'Suppliers', path: '/suppliers', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> }
  ];

  return (
    <div style={{
      ...styles.sidebar,
      width: isCollapsed ? '64px' : '220px'
    }}>
      <div style={{
        ...styles.brand,
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        padding: isCollapsed ? '24px 0' : '24px'
      }}>
        <div style={styles.logoBox}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
        </div>
        {!isCollapsed && <span style={styles.brandText}>InvTrack Pro</span>}
      </div>

      <button onClick={toggleCollapsed} style={styles.toggleBtn}>
        {isCollapsed ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        )}
      </button>

      <nav style={styles.nav}>
        {links.map(link => (
          <NavLink
            key={link.name}
            to={link.path}
            style={({ isActive }) => ({
              ...styles.link,
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              padding: isCollapsed ? '12px 0' : '12px 24px',
              backgroundColor: isActive && !isCollapsed ? '#2a2a2a' : 'transparent',
              borderLeft: isActive ? '3px solid #e53935' : '3px solid transparent',
              color: isActive ? '#fff' : '#9a9a9a'
            })}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: isCollapsed ? '100%' : 'auto' }}>
              {link.icon}
            </div>
            {!isCollapsed && <span style={{ marginLeft: '12px', fontWeight: 500 }}>{link.name}</span>}
          </NavLink>
        ))}
        <a
          href="http://localhost:8080/reports/stockReport.jsp"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...styles.link,
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            padding: isCollapsed ? '10px 0' : '10px 16px',
            backgroundColor: 'transparent',
            borderLeft: '3px solid transparent',
            color: '#9a9a9a',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: isCollapsed ? '100%' : 'auto' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          {!isCollapsed && <span style={{ fontWeight: 500 }}>Reports</span>}
        </a>
      </nav>
    </div>
  );
}

const styles = {
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    backgroundColor: '#1a1a1a',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    transition: 'width 0.2s ease',
    overflow: 'visible'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease'
  },
  logoBox: {
    width: '32px',
    height: '32px',
    backgroundColor: '#e53935',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  brandText: {
    color: '#fff',
    fontSize: '18px',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap'
  },
  toggleBtn: {
    position: 'absolute',
    right: '-12px',
    top: '32px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#e53935',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    padding: 0
  },
  nav: {
    display: 'flex',
    flexDirection: 'column'
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box'
  }
};
