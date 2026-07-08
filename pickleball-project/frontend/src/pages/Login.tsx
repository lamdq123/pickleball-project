import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: FormEvent) => {
        e.preventDefault();

        // Kiểm tra tài khoản. Nếu đúng, cấp "chìa khóa" lưu vào bộ nhớ trình duyệt
        if (username === 'admin' && password === '123456') {
            localStorage.setItem('isLoggedIn', 'true');
            alert('Đăng nhập thành công!');
            navigate('/admin'); // Mở cửa cho vào trang Quản trị
        } else {
            alert('Sai tài khoản hoặc mật khẩu!');
        }
    };

    return (
        <div style={{ padding: '50px', maxWidth: '400px', margin: '50px auto', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
            <h2 style={{ color: '#2c3e50' }}>🔐 Đăng nhập Quản Trị</h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                <input type="text" placeholder="Tên đăng nhập" required value={username} onChange={e => setUsername(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                <input type="password" placeholder="Mật khẩu" required value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                <button type="submit" style={{ padding: '10px', backgroundColor: '#3498db', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>Đăng Nhập</button>
            </form>
        </div>
    );
}

export default Login;