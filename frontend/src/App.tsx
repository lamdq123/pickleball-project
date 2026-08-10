import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Home as HomeIcon, LayoutDashboard, LogIn } from 'lucide-react';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Login from './pages/Login';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const hasToken = localStorage.getItem('admin_token');
  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Floating switcher to demo the 3 distinct views
function DemoSwitcher() {
  const location = useLocation();
  const navigate = useNavigate();

  const views = [
    { path: '/', label: 'Khách hàng', icon: HomeIcon },
    { path: '/admin', label: 'Quản trị', icon: LayoutDashboard },
    { path: '/login', label: 'Đăng nhập', icon: LogIn },
  ];

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100]">
      <div className="flex items-center gap-1 bg-slate-900/95 backdrop-blur border border-slate-700 rounded-full p-1.5 shadow-2xl shadow-slate-900/40">
        <span className="hidden sm:inline text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3">
          Demo
        </span>
        {views.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
      <DemoSwitcher />
    </BrowserRouter>
  );
}

export default App;
