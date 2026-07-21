import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const method = req.method;

    // 1. GET: Lấy danh sách người dùng
    if (method === 'GET') {
        try {
            const users = await prisma.user.findMany();
            return res.status(200).json(users);
        } catch (error) {
            return res.status(500).json({ error: 'Có lỗi xảy ra khi lấy dữ liệu người dùng' });
        }
    }

    // 2. POST: Tạo người dùng mới
    if (method === 'POST') {
        try {
            const { name, email, phone } = req.body;
            const newUser = await prisma.user.create({
                data: { name, email, phone },
            });
            return res.status(200).json(newUser);
        } catch (error) {
            return res.status(500).json({ error: 'Không thể tạo người dùng' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}