import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Login from './pages/Login';

// ==========================================
// COMPONENT TRẠM GÁC (Bảo vệ trang Admin)
// ==========================================
// Trong file frontend/src/App.tsx

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {

  // ✅ Ổ KHÓA MỚI (Kiểm tra xem trong túi có tấm vé admin_token hợp lệ không):
  const hasToken = localStorage.getItem('admin_token');

  // ✅ Đổi thành điều kiện check mới:
  if (!hasToken) {
    // Nếu không có vé JWT, bắt quay xe về trang login
    return <Navigate to="/login" replace />;
  }

  // Nếu có vé, cho phép đi qua trạm gác để vào trang Admin
  return <>{children}</>;
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