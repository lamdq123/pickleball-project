import express from 'express';

export function createCourtsRouter(prisma: any) {
  const router = express.Router();

  router.get('/', async (_req: any, res: any) => {
    try {
      const courts = await prisma.court.findMany();
      res.json(courts);
    } catch (error) {
      res.status(500).json({ error: 'Có lỗi xảy ra khi lấy danh sách sân' });
    }
  });

  router.post('/', async (req: any, res: any) => {
    try {
      const { name, location, pricePerHour } = req.body;
      const newCourt = await prisma.court.create({
        data: { name, location, pricePerHour },
      });

      res.json(newCourt);
    } catch (error) {
      res.status(500).json({ error: 'Không thể tạo sân mới' });
    }
  });

  router.delete('/:id', async (req: any, res: any) => {
    try {
      const { id } = req.params;

      await prisma.court.delete({
        where: { id: Number(id) },
      });

      res.json({ message: 'Xóa sân thành công!' });
    } catch (error) {
      res.status(400).json({ error: 'Không thể xóa sân này vì đang có khách đặt lịch. Vui lòng hủy các lịch đặt của sân này trước!' });
    }
  });

  return router;
}
