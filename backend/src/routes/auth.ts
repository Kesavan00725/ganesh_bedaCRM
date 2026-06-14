import express from 'express';
import { register, login, logout, refreshToken } from '../controllers/auth';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.post('/refresh', authMiddleware, refreshToken);

export default router;
