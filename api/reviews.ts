import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'POST') {
        try {
            const { rating, comment, courtId, userId } = req.body;
            const newReview = await prisma.review.create({
                data: { rating: Number(rating), comment: comment || '', courtId: Number(courtId), userId: Number(userId) }
            });
            return res.status(200).json(newReview);
        } catch (error) { return res.status(400).json({ error: 'Không thể gửi đánh giá' }); }
    }

    // GET: Lấy đánh giá. Có courtId -> lấy của 1 sân. Không có -> lấy tất cả cho Admin.
    if (req.method === 'GET') {
        try {
            const courtId = Number(req.query.courtId);
            if (courtId) {
                const reviews = await prisma.review.findMany({ where: { courtId }, include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } });
                return res.status(200).json(reviews);
            } else {
                const allReviews = await prisma.review.findMany({ include: { user: { select: { name: true } }, court: { select: { name: true } } }, orderBy: { createdAt: 'desc' } });
                return res.status(200).json(allReviews);
            }
        } catch (error) { return res.status(500).json({ error: 'Lỗi server' }); }
    }

    // DELETE: Admin xóa đánh giá xấu/spam
    if (req.method === 'DELETE') {
        try {
            const id = Number(req.query.id);
            await prisma.review.delete({ where: { id } });
            return res.status(200).json({ message: 'Xóa thành công' });
        } catch (error) { return res.status(400).json({ error: 'Lỗi khi xóa' }); }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}