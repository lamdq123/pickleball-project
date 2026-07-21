import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

// Tạo sẵn một tài khoản Admin cứng (Hoặc em có thể giấu vào .env nhé)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password123'; // Thay bằng pass của em

const JWT_SECRET = process.env.JWT_SECRET || 'cai_nay_la_bi_mat_quoc_gia';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, password } = req.body;

    // Kiểm tra tài khoản mật khẩu
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Nếu đúng, "in vé" JWT, vé này có hạn dùng trong 1 ngày (24h)
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });

        // Trả vé về cho Frontend
        return res.status(200).json({ token });
    }

    // Nếu sai, đuổi thẳng cổ
    return res.status(401).json({ error: 'Tài khoản hoặc mật khẩu không chính xác!' });
}