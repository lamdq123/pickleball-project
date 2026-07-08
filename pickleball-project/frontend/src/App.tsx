import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Login from './pages/Login'; // Import trang đăng nhập mới

// ==========================================
// COMPONENT TRẠM GÁC (Bảo vệ trang Admin)
// ==========================================
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  // Kiểm tra xem trong túi (localStorage) của người dùng có chìa khóa chưa
  const hasKey = localStorage.getItem('isLoggedIn') === 'true';

  // Nếu có chìa khóa -> Cho phép vào (render children). Nếu không -> Đuổi về trang Login
  return hasKey ? children : <Navigate to="/login" replace />;
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