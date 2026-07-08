// file: src/index.ts
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
const app = express();
const prisma = new PrismaClient();
// Cấu hình tài khoản email sẽ dùng để gửi thư cho khách
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dtlam20905@gmail.com', // Thay bằng email của bạn
    pass: 'caxzcjwucpfsgsec'    // Lát nữa mình sẽ hướng dẫn lấy mã này
  }
});
// Cấu hình cơ bản
app.use(cors()); // Cho phép Frontend gọi API
app.use(express.json()); // Giúp server hiểu được dữ liệu JSON gửi lên

// ==========================================
// ĐỊNH NGHĨA CÁC API TẠI ĐÂY
// ==========================================

// API 1: Lấy danh sách tất cả người dùng
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    // Trả về dữ liệu cho trình duyệt/frontend dưới dạng JSON
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Có lỗi xảy ra khi lấy dữ liệu" });
  }
});

// API 2: Tạo người dùng mới
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, phone } = req.body; // Nhận dữ liệu từ Frontend gửi lên

    const newUser = await prisma.user.create({
      data: { name, email, phone },
    });

    res.json(newUser);
  } catch (error) {
    res.status(500).json({ error: "Không thể tạo người dùng" });
  }
});
// ==========================================
// API QUẢN LÝ Sân (Courts)
// ==========================================

// API 3: Lấy danh sách tất cả các sân
app.get('/api/courts', async (req, res) => {
  try {
    const courts = await prisma.court.findMany();
    res.json(courts);
  } catch (error) {
    res.status(500).json({ error: "Có lỗi xảy ra khi lấy danh sách sân" });
  }
});

// API 4: Thêm một sân Pickleball mới
app.post('/api/courts', async (req, res) => {
  try {
    const { name, location, pricePerHour } = req.body;

    const newCourt = await prisma.court.create({
      data: { name, location, pricePerHour },
    });

    res.json(newCourt);
  } catch (error) {
    res.status(500).json({ error: "Không thể tạo sân mới" });
  }
});
// ==========================================
// API QUẢN LÝ ĐẶT SÂN (Bookings)
// ==========================================

// API 5: Lấy danh sách lịch đặt sân 
app.get('/api/bookings', async (req, res) => {
  try {
    // Sự kỳ diệu của Prisma: Lấy lịch đặt, đồng thời kéo theo cả thông tin User và Court
    const bookings = await prisma.booking.findMany({
      include: {
        user: true,   // Gộp luôn tên, email của người đặt
        court: true,  // Gộp luôn tên sân, vị trí
      }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách đặt sân" });
  }
});

// API 6: Tạo lượt đặt sân mới & GỬI EMAIL XÁC NHẬN TỰ ĐỘNG
app.post('/api/bookings', async (req, res) => {
  try {
    const { userId, courtId, bookDate, timeSlot } = req.body;

    // 1. Kiểm tra trùng lịch
    const existingBooking = await prisma.booking.findFirst({
      where: { courtId: Number(courtId), bookDate, timeSlot },
    });

    if (existingBooking) {
      return res.status(400).json({ error: "Rất tiếc! Sân vào khung giờ này đã có người đặt." });
    }

    // 2. Tạo lịch mới và DÙNG PRISMA LẤY LUÔN THÔNG TIN KHÁCH + SÂN
    const newBooking = await prisma.booking.create({
      data: { userId: Number(userId), courtId: Number(courtId), bookDate, timeSlot },
      include: { user: true, court: true } // Lấy tên khách, email khách và tên sân
    });

    // 3. Soạn và Gửi Email cho khách hàng
    const mailOptions = {
      from: 'Hệ Thống Đặt Sân Pickleball <TEN_EMAIL_CUA_BAN@gmail.com>',
      to: newBooking.user.email, // Gửi thẳng vào email của khách vừa đặt
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
      `
    };

    // Lệnh thực thi gửi thư (chạy ngầm, không làm khách phải chờ lâu)
    transporter.sendMail(mailOptions).catch(err => console.error("Lỗi gửi mail:", err));

    res.json(newBooking);
  } catch (error) {
    console.error("Lỗi đặt sân:", error);
    res.status(500).json({ error: "Không thể đặt sân" });
  }
});

// API 7: Hủy một lượt đặt sân (Xóa khỏi Database)
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params; // Lấy mã ID lịch đặt từ đường dẫn (URL)

    await prisma.booking.delete({
      where: {
        id: Number(id),
      },
    });

    res.json({ message: "Xóa lịch đặt sân thành công!" });
  } catch (error) {
    console.error("Lỗi khi xóa lịch đặt:", error);
    res.status(500).json({ error: "Không thể hủy lịch đặt này." });
  }
});
// API 8: Xóa một Sân Pickleball
app.delete('/api/courts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.court.delete({
      where: {
        id: Number(id),
      },
    });

    res.json({ message: "Xóa sân thành công!" });
  } catch (error) {
    // Lưu ý: Nếu sân đã có người đặt lịch, database sẽ chặn không cho xóa để bảo vệ dữ liệu!
    res.status(400).json({ error: "Không thể xóa sân này vì đang có khách đặt lịch. Vui lòng hủy các lịch đặt của sân này trước!" });
  }
});
// ==========================================
// KHỞI ĐỘNG SERVER
// ==========================================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 API Server đang chạy tại: http://localhost:${PORT}`);
});