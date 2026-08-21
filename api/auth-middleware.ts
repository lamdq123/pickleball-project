import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cai_nay_la_bi_mat_quoc_gia';

export function verifyUser(req: VercelRequest, res: VercelResponse): any | null {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Truy cập bị từ chối! Bạn chưa đăng nhập.' });
            return null;
        }

        return jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as any;
    } catch (error) {
        res.status(401).json({ error: 'Phiên đăng nhập hết hạn hoặc vé giả mạo!' });
        return null;
    }
}

export function verifyAdmin(req: VercelRequest, res: VercelResponse): boolean {
    const decoded = verifyUser(req, res);
    if (!decoded) return false;

    // Phân quyền: Kiểm tra xem có đúng là Admin không
        if (decoded.role !== 'ADMIN') {
            res.status(403).json({ error: 'Lệnh cấm! Bạn không có đặc quyền của Admin.' });
            return false;
        }

    return true;
}