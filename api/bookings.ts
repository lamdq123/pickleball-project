import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import { verifyAdmin, verifyUser } from './auth-middleware';

const prisma = new PrismaClient();

// Cấu hình trạm bưu điện gửi mail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;

  // ==========================================
  // 1. GET: Lấy danh sách (Chỉ Admin được xem)
  // ==========================================
  if (method === 'GET') {
    const user = verifyUser(req, res);
    if (!user) return;

    try {
      const bookings = await prisma.booking.findMany({
        where: user.role === 'ADMIN' ? undefined : { userId: Number(user.id) },
        include: { user: true, court: true },
      });
      return res.status(200).json(bookings);
    } catch (error) {
      return res.status(500).json({ error: 'Lỗi khi lấy danh sách đặt sân' });
    }
  }

  // ==========================================
  // 2. POST: Đặt sân (CỦA KHÁCH -> MỞ CỬA TỰ DO)
  // ==========================================
  if (method === 'POST') {
    // ❌ KHÔNG GỌI verifyAdmin Ở ĐÂY NỮA
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

      // 📨 GỬI EMAIL TỰ ĐỘNG SAU KHI LƯU DATABASE THÀNH CÔNG
      try {
        await transporter.sendMail({
          from: `"Pickleball Court" <${process.env.EMAIL_USER}>`,
          to: newBooking.user.email,
          subject: '🎾 Xác nhận đặt sân thành công! 🎉',
          html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #27ae60;">Xác nhận lịch đặt sân</h2>
                <p>Xin chào <strong>${newBooking.user.name || 'khách hàng'}</strong>,</p>
                <p>Chúng tôi đã ghi nhận lịch đặt sân của bạn thành công. Thông tin chi tiết:</p>
                <ul>
                  <li><strong>Sân:</strong> ${newBooking.court.name || 'Không xác định'}</li>
                  <li><strong>Ngày chơi:</strong> ${newBooking.bookDate}</li>
                  <li><strong>Thời gian:</strong> ${newBooking.timeSlot}</li>
                </ul>
                <p style="color: #555;">Chúc bạn có những trận đấu thật tuyệt vời! ❤️</p>
              </div>
            `,
        });
      } catch (emailError) {
        console.log("Đặt sân ok nhưng gửi email lỗi:", emailError);
      }

      return res.status(200).json(newBooking);
    } catch (error) {
      return res.status(500).json({ error: 'Không thể đặt sân' });
    }
  }

  // ==========================================
  // 3. DELETE: Hủy sân (CỦA ADMIN -> BẮT BUỘC TRÌNH VÉ)
  // ==========================================
  if (method === 'DELETE') {
    const user = verifyUser(req, res);
    if (!user) return;
    const id = req.query.id as string;
    const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: Number(id) },
        include: { user: true, court: true },
      });
      if (!booking) return res.status(404).json({ error: 'Không tìm thấy lịch đặt.' });
      if (user.role !== 'ADMIN' && booking.userId !== Number(user.id)) {
        return res.status(403).json({ error: 'Bạn không có quyền hủy lịch đặt này.' });
      }
      if (user.role === 'ADMIN' && !reason) {
        return res.status(400).json({ error: 'Vui lòng nhập lý do hủy lịch.' });
      }

      await prisma.booking.delete({ where: { id: Number(id) } });

      try {
        const cancellationReason = user.role === 'ADMIN'
          ? reason
          : 'Khách hàng đã tự hủy lịch đặt sân.';
        await transporter.sendMail({
          from: `"Pickleball Court" <${process.env.EMAIL_USER}>`,
          to: booking.user.email,
          subject: user.role === 'ADMIN'
            ? 'Thông báo: Lịch đặt sân đã bị hủy'
            : 'Xác nhận: Bạn đã hủy lịch đặt sân',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              <h2 style="color: #dc2626;">Thông báo hủy lịch đặt sân</h2>
              <p>Xin chào <strong>${booking.user.name || 'khách hàng'}</strong>,</p>
              <p>Lịch đặt sân của bạn đã được hủy với thông tin:</p>
              <ul>
                <li><strong>Sân:</strong> ${booking.court.name}</li>
                <li><strong>Ngày chơi:</strong> ${booking.bookDate}</li>
                <li><strong>Thời gian:</strong> ${booking.timeSlot}</li>
              </ul>
              <p><strong>Lý do:</strong> ${cancellationReason}</p>
              <p style="color: #555;">Nếu cần hỗ trợ, vui lòng liên hệ Pickleball Club.</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.log("Hủy lịch ok nhưng gửi email lỗi:", emailError);
      }

      return res.status(200).json({ message: 'Xóa thành công!' });
    } catch (error) {
      return res.status(500).json({ error: 'Không thể hủy lịch.' });
    }
  }
  // 4. PUT: Sửa lịch đặt (CỦA ADMIN)
  if (method === 'PUT') {
    if (!verifyAdmin(req, res)) return;
    try {
      const { id, courtId, bookDate, timeSlot } = req.body;

      // Kiểm tra xem giờ mới có bị người khác đặt mất chưa (loại trừ chính nó)
      const isExist = await prisma.booking.findFirst({
        where: { courtId: Number(courtId), bookDate, timeSlot, id: { not: Number(id) } }
      });
      if (isExist) return res.status(400).json({ error: 'Giờ này đã có người đặt rồi!' });

      const updated = await prisma.booking.update({
        where: { id: Number(id) },
        data: { courtId: Number(courtId), bookDate, timeSlot }
      });
      return res.status(200).json(updated);
    } catch (error) {
      return res.status(500).json({ error: 'Không thể sửa lịch' });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
}