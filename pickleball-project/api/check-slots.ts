import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // API này chỉ cho phép gọi bằng phương thức GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Lấy ID sân và Ngày do Frontend gửi lên từ URL (ví dụ: /api/check-slots?courtId=1&date=2026-07-10)
    const { courtId, date } = req.query;

    if (!courtId || !date) {
        return res.status(400).json({ error: 'Vui lòng cung cấp đủ courtId và date' });
    }

    try {
        // Vào Database tìm TẤT CẢ booking của sân đó trong ngày đó
        const bookings = await prisma.booking.findMany({
            where: {
                courtId: Number(courtId),
                bookDate: String(date)
            },
            // Select này giúp tối ưu, chỉ lấy ra đúng cột timeSlot thay vì lấy toàn bộ thông tin
            select: {
                timeSlot: true
            }
        });

        // Lúc này biến bookings đang là dạng mảng Object: [{ timeSlot: '17:00 - 18:00' }, { timeSlot: '19:00 - 20:00' }]
        // Ta dùng lệnh map để biến nó thành mảng chuỗi cho Frontend dễ xài: ['17:00 - 18:00', '19:00 - 20:00']
        const bookedSlots = bookings.map((b: { timeSlot: string }) => b.timeSlot);

        // Trả mảng chuỗi đó về cho Frontend
        return res.status(200).json(bookedSlots);
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi server khi kiểm tra lịch' });
    }
}