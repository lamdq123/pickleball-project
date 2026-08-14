import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'cai_nay_la_bi_mat_quoc_gia';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { action } = req.query;

    // 1. ĐĂNG KÝ
    if (action === 'register') {
        try {
            const { name, email, phone, password } = req.body;
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) return res.status(400).json({ error: 'Email đã được sử dụng!' });

            const newUser = await prisma.user.create({
                data: { name, email, phone, password }
            });
            return res.status(200).json({ message: 'Đăng ký thành công', user: newUser });
        } catch (error) {
            return res.status(500).json({ error: 'Lỗi server khi đăng ký' });
        }
    }

    // 2. ĐĂNG NHẬP
    if (action === 'login') {
        try {
            const { email, password } = req.body;
            const user = await prisma.user.findUnique({ where: { email } });

            if (!user || user.password !== password) {
                return res.status(400).json({ error: 'Email hoặc mật khẩu không đúng' });
            }

            // 👉 SỬ DỤNG MÁY IN VÉ JWT THẬT Ở ĐÂY
            const token = jwt.sign(
                { id: user.id, role: user.role }, 
                JWT_SECRET, 
                { expiresIn: '24h' }
            );

            return res.status(200).json({
                message: 'Đăng nhập thành công',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                }
            });
        } catch (error) {
            return res.status(500).json({ error: 'Lỗi server khi đăng nhập' });
        }
    }

    return res.status(400).json({ error: 'Action không hợp lệ' });
}