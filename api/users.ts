import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import { verifyAdmin } from './auth-middleware';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 1. Lấy danh sách thành viên
    if (req.method === 'GET') {
        try {
            const users = await prisma.user.findMany({
                orderBy: { id: 'desc' }
            });
            return res.status(200).json(users);
        } catch (error) {
            return res.status(500).json({ error: 'Lỗi khi lấy danh sách user' });
        }
    }

    // 2. Thêm thành viên mới
    if (req.method === 'POST') {
        if (!verifyAdmin(req, res)) return; // Trạm gác Admin
        try {
            const { name, email, phone } = req.body;
            const newUser = await prisma.user.create({
                data: { name, email, phone }
            });
            return res.status(200).json(newUser);
        } catch (error) {
            return res.status(400).json({ error: 'Email này có thể đã tồn tại!' });
        }
    }

    // 3. Xóa thành viên (TÍNH NĂNG MỚI)
    if (req.method === 'DELETE') {
        if (!verifyAdmin(req, res)) return; // Trạm gác Admin
        try {
            const id = Number(req.query.id);
            await prisma.user.delete({ where: { id } });
            return res.status(200).json({ message: 'Đã xóa thành viên thành công' });
        } catch (error) {
            // Lỗi này xảy ra khi User đang có lịch đặt sân mà admin đòi xóa
            return res.status(400).json({ error: 'Không thể xóa! Khách hàng này đang có lịch đặt sân trong hệ thống.' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}