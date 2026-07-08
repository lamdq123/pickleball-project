import express from 'express';

export function createBookingsRouter(prisma: any, transporter: any) {
  const router = express.Router();

  router.get('/', async (_req: any, res: any) => {
    try {
      const bookings = await prisma.booking.findMany({
        include: {
          user: true,
          court: true,
        },
      });
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi lấy danh sách đặt sân' });
    }
  });

  router.post('/', async (req: any, res: any) => {
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

      const mailOptions = {
        from: 'Hệ Thống Đặt Sân Pickleball <TEN_EMAIL_CUA_BAN@gmail.com>',
        to: newBooking.user.email,
        subject: '🎾 Xác nhận đặt sân thành công!',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #4CAF50; border-radius: 10px;">
            <h2 style="color: #4CAF50;">Xin chào ${newBooking.user.name},</h2>
            <p>Cảm ơn bạn đã sử dụng dịch vụ. Dưới đây là thông tin đặt sân của bạn:</p>
            <ul>
              <li><strong>Mã đặt sân:</strong> #${newBooking.id}</li>
              <li><strong>Sân:</strong> ${newBooking.court.name} (${newBooking.court.location})</li>
              <li><strong>Ngày chơi:</strong> ${newBooking.bookDate}</li>
              <li><strong>Khung giờ:</strong> ${newBooking.timeSlot}</li>
              <li><strong>Giá tiền:</strong> ${newBooking.court.pricePerHour.toLocaleString('vi-VN')} đ/giờ</li>
            </ul>
            <p>Chúc bạn có những giờ phút thể thao vui vẻ!</p>
          </div>
        `,
      };

      transporter.sendMail(mailOptions).catch((err: Error) => console.error('Lỗi gửi mail:', err));
      res.json(newBooking);
    } catch (error) {
      console.error('Lỗi đặt sân:', error);
      res.status(500).json({ error: 'Không thể đặt sân' });
    }
  });

  router.delete('/:id', async (req: any, res: any) => {
    try {
      const { id } = req.params;

      await prisma.booking.delete({
        where: { id: Number(id) },
      });

      res.json({ message: 'Xóa lịch đặt sân thành công!' });
    } catch (error) {
      console.error('Lỗi khi xóa lịch đặt:', error);
      res.status(500).json({ error: 'Không thể hủy lịch đặt này.' });
    }
  });

  return router;
}
