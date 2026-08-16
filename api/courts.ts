import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import { verifyAdmin } from './auth-middleware';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // ==========================================
    // 1. Xử lý GET /api/courts (Khách hàng và Admin đều xem được)
    // ==========================================
    if (req.method === 'GET') {
        try {
            const courts = await prisma.court.findMany({
                include: {
                    reviews: true // 👉 Bổ sung dòng này: Kéo theo toàn bộ bài đánh giá để Frontend tự tính trung bình sao
                }
            });
            return res.status(200).json(courts);
        } catch (error) {
            return res.status(500).json({ error: 'Có lỗi xảy ra khi lấy danh sách sân' });
        }
    }

    // ==========================================
    // 2. Xử lý POST /api/courts (Chỉ Admin mới được thêm sân)
    // ==========================================
    if (req.method === 'POST') {
        // 🚨 GỌI TRẠM GÁC: Nếu không có vé Admin, đuổi về ngay!
        if (!verifyAdmin(req, res)) return;

        try {
            // 👉 Lấy thêm 3 thông số giờ vàng từ body
            const { name, location, pricePerHour, imageUrl, goldenHourStart, goldenHourEnd, goldenDiscount } = req.body;

            const newCourt = await prisma.court.create({
                data: {
                    name, location, pricePerHour: Number(pricePerHour), imageUrl: imageUrl || null,
                    goldenHourStart: goldenHourStart || null,
                    goldenHourEnd: goldenHourEnd || null,
                    goldenDiscount: Number(goldenDiscount) || 0
                }
            });
            return res.status(200).json(newCourt);
        } catch (error) {
            return res.status(500).json({ error: 'Không thể tạo sân mới' });
        }
    }

    // ==========================================
    // 3. Xử lý DELETE /api/courts (Chỉ Admin mới được xóa sân)
    // ==========================================
    if (req.method === 'DELETE') {
        // 🚨 GỌI TRẠM GÁC: Không có vé Admin là không cho xóa
        if (!verifyAdmin(req, res)) return;

        try {
            // Lấy ID sân từ đường link (Ví dụ: /api/courts?id=5)
            const { id } = req.query;

            if (!id) {
                return res.status(400).json({ error: 'Thiếu ID sân cần xóa' });
            }

            // Gọi Database xóa sân có ID tương ứng
            await prisma.court.delete({
                where: { id: Number(id) }
            });

            return res.status(200).json({ message: 'Đã xóa sân thành công!' });
        } catch (error) {
            // 💡 Senior Tip: Prisma sẽ tự động văng lỗi (catch) nếu em cố gắng xóa
            // một cái Sân mà sân đó ĐANG CÓ LỊCH ĐẶT (ràng buộc khóa ngoại Database).
            return res.status(500).json({ error: 'Không thể xóa! Sân này đang có khách đặt lịch.' });
        }
    }

    // Nếu dùng phương thức lạ (như PUT, PATCH) thì báo lỗi


    // 4. PUT: Chỉnh sửa thông tin sân (Dành cho Admin)
    if (req.method === 'PUT') {
        if (!verifyAdmin(req, res)) return;
        try {
            const { id, name, location, pricePerHour, imageUrl, goldenHourStart, goldenHourEnd, goldenDiscount } = req.body;
            const updatedCourt = await prisma.court.update({
                where: { id: Number(id) },
                data: {
                    name, location, pricePerHour: Number(pricePerHour), imageUrl: imageUrl || null,
                    goldenHourStart: goldenHourStart || null,
                    goldenHourEnd: goldenHourEnd || null,
                    goldenDiscount: Number(goldenDiscount) || 0
                }
            });
            return res.status(200).json(updatedCourt);
        } catch (error) {
            return res.status(400).json({ error: 'Không thể cập nhật sân' });
        }
    }
    return res.status(405).json({ error: 'Method not allowed' });
}