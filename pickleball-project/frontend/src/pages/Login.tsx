import { useState, type FormEvent } from 'react';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }) // state username, password của form
            });

            if (res.ok) {
                const data = await res.json();
                // ❌ KHÔNG LƯU isLoggedIn = true nữa
                // ✅ LƯU TẤM VÉ THẬT VÀO HÒM:
                localStorage.setItem('admin_token', data.token);

                alert("Đăng nhập thành công!");
                window.location.href = '/admin';
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } catch (error) {
            alert("Lỗi kết nối server!");
        }
    };

    return (
        <div style={{ padding: '50px', maxWidth: '400px', margin: '50px auto', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
            <h2 style={{ color: '#2c3e50' }}>🔐 Đăng nhập Quản Trị</h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                <input type="text" placeholder="Tên đăng nhập" required value={username} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                <input type="password" placeholder="Mật khẩu" required value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                <button type="submit" style={{ padding: '10px', backgroundColor: '#3498db', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>Đăng Nhập</button>
            </form>
        </div>
    );
}

export default Login;