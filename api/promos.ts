import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import { verifyAdmin } from './auth-middleware';
const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // GET: Nếu có code thì tìm 1 mã (cho Khách), không có thì lấy tất cả (cho Admin)
    if (req.method === 'GET') {
        try {
            const code = req.query.code as string;
            if (code) {
                const promo = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase() } });
                if (!promo || !promo.isActive) return res.status(400).json({ error: 'Mã không hợp lệ hoặc đã hết hạn' });
                return res.status(200).json(promo);
            } else {
                const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
                return res.status(200).json(promos);
            }
        } catch (error) { return res.status(500).json({ error: 'Lỗi server' }); }
    }

    // POST: Admin tạo mã mới
    if (req.method === 'POST') {
        if (!verifyAdmin(req, res)) return;
        try {
            const { code, discount, isPercent } = req.body;
            const newPromo = await prisma.promoCode.create({
                data: { code: code.toUpperCase(), discount: Number(discount), isPercent: Boolean(isPercent) }
            });
            return res.status(200).json(newPromo);
        } catch (error) { return res.status(400).json({ error: 'Mã này đã tồn tại!' }); }
    }

    // DELETE: Admin xóa mã
    if (req.method === 'DELETE') {
        if (!verifyAdmin(req, res)) return;
        try {
            const id = Number(req.query.id);
            await prisma.promoCode.delete({ where: { id } });
            return res.status(200).json({ message: 'Xóa thành công' });
        } catch (error) { return res.status(400).json({ error: 'Lỗi khi xóa' }); }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}