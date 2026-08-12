import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 1. Khách hàng gửi đánh giá mới
    if (req.method === 'POST') {
        try {
            const { rating, comment, courtId, userId } = req.body;
            const newReview = await prisma.review.create({
                data: {
                    rating: Number(rating),
                    comment: comment || '',
                    courtId: Number(courtId),
                    userId: Number(userId)
                }
            });
            return res.status(200).json(newReview);
        } catch (error) {
            return res.status(400).json({ error: 'Không thể gửi đánh giá' });
        }
    }

    // 2. Lấy danh sách đánh giá của 1 sân cụ thể (Kéo theo tên người đánh giá)
    if (req.method === 'GET') {
        try {
            const courtId = Number(req.query.courtId);
            const reviews = await prisma.review.findMany({
                where: { courtId },
                include: { user: { select: { name: true } } },
                orderBy: { createdAt: 'desc' }
            });
            return res.status(200).json(reviews);
        } catch (error) {
            return res.status(500).json({ error: 'Lỗi server' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}