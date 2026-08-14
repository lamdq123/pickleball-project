import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cai_nay_la_bi_mat_quoc_gia';

// Hàm này dùng để kiểm tra xem request gửi lên có kèm Vé (Token) hợp lệ và đúng chuẩn ADMIN không
export function verifyAdmin(req: VercelRequest, res: VercelResponse): boolean {
    try {
        // 1. Lấy token từ header "Authorization: Bearer <token>"
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Truy cập bị từ chối! Bạn không có quyền.' });
            return false;
        }

        const token = authHeader.split(' ')[1];

        // 2. Xác thực tấm vé này và dịch thông tin bên trong ra
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        // 3. KIỂM TRA QUYỀN LỰC: Có đúng là Admin không?
        if (decoded.role !== 'admin') {
            res.status(403).json({ error: 'Lệnh cấm! Bạn không có đặc quyền của Admin.' });
            return false;
        }

        return true; // Vé hợp lệ VÀ ĐÚNG LÀ ADMIN!
    } catch (error) {
        res.status(401).json({ error: 'Phiên đăng nhập hết hạn hoặc vé giả mạo!' });
        return false;
    }
}