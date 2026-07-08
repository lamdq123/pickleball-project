// file: src/index.ts
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import { createUsersRouter } from '../../api/users';
import { createCourtsRouter } from '../../api/courts';
import { createBookingsRouter } from '../../api/bookings';

const app = express();
const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dtlam20905@gmail.com',
    pass: 'caxzcjwucpfsgsec',
  },
});

app.use(cors());
app.use(express.json());

app.use('/api/users', createUsersRouter(prisma));
app.use('/api/courts', createCourtsRouter(prisma));
app.use('/api/bookings', createBookingsRouter(prisma, transporter));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 API Server đang chạy tại: http://localhost:${PORT}`);
});