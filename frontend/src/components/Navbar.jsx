import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <h2>Inventory Manager</h2>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Dashboard</Link>
        <Link to="/products" style={styles.link}>Products</Link>
        <Link to="/transactions" style={styles.link}>Transactions</Link>
        <Link to="/suppliers" style={styles.link}>Suppliers</Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#333',
    color: '#fff'
  },
  links: {
    display: 'flex',
    gap: '15px'
  },
  link: {
    color: '#fff',
    textDecoration: 'none'
  }
};
