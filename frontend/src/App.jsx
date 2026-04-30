import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Transactions from './pages/Transactions';
import Suppliers from './pages/Suppliers';

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setIsCollapsed(prev => !prev);
  };

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar isCollapsed={isCollapsed} toggleCollapsed={toggleCollapsed} />
        <main style={{ 
          marginLeft: isCollapsed ? '64px' : '220px', 
          flex: 1, 
          backgroundColor: '#f4f5f7',
          transition: 'margin-left 0.2s ease'
        }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/suppliers" element={<Suppliers />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
