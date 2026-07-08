import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Login from './pages/Login';

// ==========================================
// COMPONENT TRẠM GÁC (Bảo vệ trang Admin)
// ==========================================
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const hasKey = localStorage.getItem('isLoggedIn') === 'true';

  return hasKey ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <div style={{ fontFamily: 'Arial, sans-serif' }}>

        <nav style={{ backgroundColor: '#2c3e50', padding: '15px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Trang Chủ</Link>
          <Link to="/admin" style={{ color: '#f1c40f', textDecoration: 'none', fontWeight: 'bold' }}>Trang Quản Trị</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Bao bọc trang Admin bằng Trạm gác ProtectedRoute */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } />
        </Routes>

      </div>
    </BrowserRouter>
  );
}

export default App;