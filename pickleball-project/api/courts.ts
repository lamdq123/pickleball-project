import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Xử lý GET /api/courts
    if (req.method === 'GET') {
        try {
            const courts = await prisma.court.findMany();
            return res.status(200).json(courts);
        } catch (error) {
            return res.status(500).json({ error: 'Có lỗi xảy ra khi lấy danh sách sân' });
        }
    }

    // Xử lý POST /api/courts
    if (req.method === 'POST') {
        try {
            const { name, location, pricePerHour } = req.body;
            const newCourt = await prisma.court.create({
                data: { name, location, pricePerHour: Number(pricePerHour) },
            });
            return res.status(200).json(newCourt);
        } catch (error) {
            return res.status(500).json({ error: 'Không thể tạo sân mới' });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}