import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Cấu hình transporter (tương tự như bạn đã làm ở backend cũ)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;

  // 1. GET: Lấy danh sách
  if (method === 'GET') {
    try {
      const bookings = await prisma.booking.findMany({
        include: { user: true, court: true },
      });
      return res.status(200).json(bookings);
    } catch (error) {
      return res.status(500).json({ error: 'Lỗi khi lấy danh sách đặt sân' });
    }
  }

  // 2. POST: Đặt sân
  if (method === 'POST') {
    try {
      const { userId, courtId, bookDate, timeSlot } = req.body;

      const existingBooking = await prisma.booking.findFirst({
        where: { courtId: Number(courtId), bookDate, timeSlot },
      });

      if (existingBooking) {
        return res.status(400).json({ error: 'Rất tiếc! Sân vào khung giờ này đã có người đặt.' });
      }

      const newBooking = await prisma.booking.create({
        data: { userId: Number(userId), courtId: Number(courtId), bookDate, timeSlot },
        include: { user: true, court: true },
      });

      // Gửi email
      await transporter.sendMail({
        from: `"Hệ Thống Đặt Sân" <${process.env.EMAIL_USER}>`,
        to: newBooking.user.email,
        subject: '🎾 Xác nhận đặt sân thành công!',
        html: `<div>...Nội dung email của bạn...</div>` 
      });

      return res.status(200).json(newBooking);
    } catch (error) {
      return res.status(500).json({ error: 'Không thể đặt sân' });
    }
  }

  // 3. DELETE: Hủy sân
  if (method === 'DELETE') {
    // Lưu ý: Lấy ID từ URL trên Vercel hơi khác, nếu bạn dùng /api/bookings?id=123
    const id = req.query.id as string;
    try {
      await prisma.booking.delete({ where: { id: Number(id) } });
      return res.status(200).json({ message: 'Xóa thành công!' });
    } catch (error) {
      return res.status(500).json({ error: 'Không thể hủy lịch.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}