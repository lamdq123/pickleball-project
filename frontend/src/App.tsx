import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import Pricing from './pages/Pricing';
import Guide from './pages/Guide';
import MyCourts from './pages/MyCourts';
import Promos from './pages/Promos';
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
      <Toaster position="top-right" reverseOrder={false} />
      <div style={{ fontFamily: 'Arial, sans-serif' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-courts" element={<MyCourts />} />
          <Route path="/promos" element={<Promos />} />





          
          <Route path="/admin" element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } />
          {/* Cổng Admin có tham số động (Ví dụ: /admin/courts) */}
          <Route path="/admin/:tab" element={<Admin />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/guide" element={<Guide />} />
        </Routes>

      </div>
    </BrowserRouter>
  );
}

export default App;