import express from 'express';

export function createUsersRouter(prisma: any) {
  const router = express.Router();

  router.get('/', async (_req: any, res: any) => {
    try {
      const users = await prisma.user.findMany();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Có lỗi xảy ra khi lấy dữ liệu' });
    }
  });

  router.post('/', async (req: any, res: any) => {
    try {
      const { name, email, phone } = req.body;
      const newUser = await prisma.user.create({
        data: { name, email, phone },
      });

      res.json(newUser);
    } catch (error) {
      res.status(500).json({ error: 'Không thể tạo người dùng' });
    }
  });

  return router;
}
