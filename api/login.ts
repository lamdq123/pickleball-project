import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'cai_nay_la_bi_mat_quoc_gia';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Lấy thông tin từ form gửi lên (Hỗ trợ cả trường hợp form gửi 'username' hoặc 'email')
    const { username, email, password } = req.body;
    const loginEmail = email || username;

    if (!loginEmail || !password) {
        return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin!' });
    }

    try {
        // 1. Tìm tài khoản dưới Database
        const user = await prisma.user.findUnique({
            where: { email: loginEmail }
        });

        // 2. Kiểm tra tồn tại và sai mật khẩu
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Tài khoản hoặc mật khẩu không chính xác!' });
        }

        // 3. Kiểm tra xem có phải Admin không
        if (user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Bạn không có quyền truy cập trang quản trị!' });
        }

        // 4. Ký vé JWT
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

        // 5. Trả vé và thông tin user về cho Frontend
        return res.status(200).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        return res.status(500).json({ error: 'Lỗi server' });
    }
}