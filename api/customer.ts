import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
// Chìa khóa mã hóa (Giống hệt chìa khóa của Admin)
const SECRET = process.env.JWT_SECRET || 'pickleball_bi_mat_sieu_cap_vu_tru_2026';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { method } = req;
    const action = req.query.action; // Bắt hành động từ URL (?action=...)

    // ==========================================
    // 1. KHÁCH HÀNG ĐĂNG KÝ
    // ==========================================
    if (method === 'POST' && action === 'register') {
        try {
            const { name, email, phone, password } = req.body;

            const exists = await prisma.user.findUnique({ where: { email } });
            if (exists) return res.status(400).json({ error: 'Email này đã được sử dụng!' });

            await prisma.user.create({
                data: { name, email, phone, password }
            });

            return res.status(200).json({ message: 'Đăng ký thành công! Hãy đăng nhập.' });
        } catch (error) {
            return res.status(500).json({ error: 'Lỗi server khi đăng ký' });
        }
    }

    // ==========================================
    // 2. KHÁCH HÀNG ĐĂNG NHẬP
    // ==========================================
    if (method === 'POST' && action === 'login') {
        try {
            const { email, password } = req.body;

            const user = await prisma.user.findUnique({ where: { email } });

            // (Thực tế đi làm sẽ dùng thư viện bcrypt để so sánh mã hóa, nhưng ở dự án này mình đối chiếu thẳng cho nhanh gọn)
            if (!user || user.password !== password) {
                return res.status(400).json({ error: 'Sai email hoặc mật khẩu!' });
            }

            // Cấp vé (Token) cho khách hàng (Hạn vé là 7 ngày)
            const token = jwt.sign(
                { id: user.id, email: user.email, name: user.name },
                SECRET,
                { expiresIn: '7d' }
            );

            return res.status(200).json({
                message: 'Đăng nhập thành công',
                token,
                user: { id: user.id, name: user.name, email: user.email }
            });
        } catch (error) {
            return res.status(500).json({ error: 'Lỗi server khi đăng nhập' });
        }
    }

    // ==========================================
    // 3. LẤY LỊCH SỬ ĐẶT SÂN CỦA KHÁCH
    // ==========================================
    if (method === 'GET' && action === 'history') {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'Bạn chưa đăng nhập!' });

        const token = authHeader.split(' ')[1];
        try {
            // Giải mã vé xem khách hàng này là ai
            const decoded: any = jwt.verify(token, SECRET);

            // Lấy toàn bộ lịch đặt có chứa ID của vị khách đó
            const history = await prisma.booking.findMany({
                where: { userId: decoded.id },
                include: { court: true },
                orderBy: { createdAt: 'desc' } // Ưu tiên xếp lịch mới nhất lên đầu
            });

            return res.status(200).json(history);
        } catch (err) {
            return res.status(401).json({ error: 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}