import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 1. Khách hàng nhập mã để kiểm tra
    if (req.method === 'GET') {
        try {
            const code = req.query.code as string;
            if (!code) return res.status(400).json({ error: 'Vui lòng nhập mã' });

            const promo = await prisma.promoCode.findUnique({
                where: { code: code.toUpperCase() }
            });

            if (!promo || !promo.isActive) {
                return res.status(400).json({ error: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
            }

            return res.status(200).json(promo);
        } catch (error) {
            return res.status(500).json({ error: 'Lỗi server' });
        }
    }

    // 2. Dành cho Admin (hoặc em) tạo mã giảm giá nhanh để test
    if (req.method === 'POST') {
        try {
            const { code, discount, isPercent } = req.body;
            const newPromo = await prisma.promoCode.create({
                data: {
                    code: code.toUpperCase(),
                    discount: Number(discount),
                    isPercent: Boolean(isPercent)
                }
            });
            return res.status(200).json(newPromo);
        } catch (error) {
            return res.status(400).json({ error: 'Mã này đã tồn tại!' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}