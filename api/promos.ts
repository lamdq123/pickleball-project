import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req: any, res: any) {
    if (req.method === 'GET') {
        const { code } = req.query;
        // 1. Nếu khách hàng nhập mã để kiểm tra
        if (code) {
            const promo = await prisma.promo.findUnique({ where: { code: String(code).toUpperCase() } });
            if (!promo) return res.status(404).json({ error: 'Mã ưu đãi không tồn tại!' });

            // 💡 KIỂM TRA NGÀY SỬ DỤNG
            const today = new Date().toISOString().split('T')[0]; // Lấy ngày hôm nay dạng YYYY-MM-DD

            if (promo.validFrom && today < promo.validFrom) {
                return res.status(400).json({ error: `Mã này chỉ bắt đầu dùng được từ ngày ${promo.validFrom}` });
            }
            if (promo.validTo && today > promo.validTo) {
                return res.status(400).json({ error: 'Mã ưu đãi này đã hết hạn sử dụng!' });
            }

            return res.status(200).json(promo);
        }

        // 2. Lấy danh sách toàn bộ mã
        const promos = await prisma.promo.findMany({ orderBy: { id: 'desc' } });
        return res.status(200).json(promos);
    }

    if (req.method === 'POST') {
        const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        try {
            const newPromo = await prisma.promo.create({
                data: {
                    code: data.code.toUpperCase(),
                    discount: Number(data.discount),
                    description: data.description || null,
                    validFrom: data.validFrom || null,
                    validTo: data.validTo || null
                }
            });
            return res.status(200).json(newPromo);
        } catch (e) {
            return res.status(400).json({ error: 'Mã code này đã tồn tại, vui lòng chọn tên khác!' });
        }
    }

    if (req.method === 'DELETE') {
        const { id } = req.query;
        await prisma.promo.delete({ where: { id: Number(id) } });
        return res.status(200).json({ success: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
}